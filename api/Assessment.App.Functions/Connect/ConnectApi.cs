using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Assessment.App.Database.Model;
using Assessment.App.Lti;
using Assessment.App.Utils.Lti;
using Azure.Identity;
using Azure.Security.KeyVault.Keys;
using IdentityModel;
using LtiAdvantage.Lti;
using LtiAdvantage.NamesRoleProvisioningService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using Microsoft.Azure.Documents.Linq;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.DurableTask;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using IMJsonWebKey = IdentityModel.Jwk.JsonWebKey;
using JsonWebAlgorithmsKeyTypes = IdentityModel.Jwk.JsonWebAlgorithmsKeyTypes;
using JsonWebKeySet = IdentityModel.Jwk.JsonWebKeySet;

namespace Assessment.App.Functions.Connect
{
    /// <summary>
    /// Handles redirects from LMS to the Assessment App.
    /// Based on the Learn LTI implementation: https://github.com/microsoft/Learn-LTI.
    /// </summary>
    public class ConnectApi
    {
        private static readonly string RedirectUrl = Environment.GetEnvironmentVariable("RedirectUrl").TrimEnd('/');
        private static readonly string KeyString = Environment.GetEnvironmentVariable("EdnaLiteDevKey");

        private readonly IHttpClientFactory _httpClientFactory;
        private readonly LtiAssessmentClient.Factory _ltiAssessmentClientFactory;
        private readonly ILogger<ConnectApi> _log;
        public ConnectApi(IHttpClientFactory httpClientFactory, LtiAssessmentClient.Factory ltiAssessmentClientFactory, ILogger<ConnectApi> log)
        {
            _httpClientFactory = httpClientFactory;
            _ltiAssessmentClientFactory = ltiAssessmentClientFactory;
            _log = log;
        }

        [FunctionName(nameof(OidcLogin))]
        public async Task<IActionResult> OidcLogin(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = "oidc-login")]
            HttpRequest req,
            [CosmosDB(
                databaseName: "assessment-app-db",
                collectionName: "platform-registration-container",
                ConnectionStringSetting = "ReadPlatformData",
                Id = "main",
                PartitionKey = "main")]
            PlatformInfoItem platformInfoItem
            // [DurableClient] IDurableOrchestrationClient orchestrationClient
        )
        {
            _log.LogInformation("=========== entering oidc-login");
            var loginParams = await LoginParams.CreateFromRequest(req);
            _log.LogInformation("=========== parsed login params");

            var redirectQueryParams = GetRedirectQueryParams(platformInfoItem, loginParams);
            _log.LogInformation("============ built redirect query params");
            var nonce = Guid.NewGuid().ToString();
            var state = Guid.NewGuid().ToString();

            // string instanceId = await orchestrationClient.StartNewAsync(nameof(SaveState), (object)(nonce, state));
            // await orchestrationClient.WaitForCompletionOrCreateCheckStatusResponseAsync(req, instanceId);

            redirectQueryParams["nonce"] = nonce;
            redirectQueryParams["state"] = state;

            string queryParams = redirectQueryParams.ToString();

            string redirectUrl = $"{platformInfoItem.AuthorizationUrl}?{queryParams}";
            _log.LogInformation("================ build redirect url");
            return new RedirectResult(redirectUrl);
        }

        [FunctionName(nameof(SaveState))]
        public async Task SaveState([OrchestrationTrigger] IDurableOrchestrationContext context)
        {
            (string nonce, string state) = context.GetInput<(string, string)>();

            EntityId nonceEntityId = new EntityId(nameof(Nonce), nonce);
            await context.CallEntityAsync(nonceEntityId, nameof(Nonce.SetState), state);
        }

        [FunctionName(nameof(LtiAdvantageLaunch))]
        public async Task<IActionResult> LtiAdvantageLaunch(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "lti-advantage-launch")]
            HttpRequest req,
            // [DurableClient] IDurableEntityClient entityClient,
            [CosmosDB(
                databaseName: "assessment-app-db",
                collectionName: "platform-registration-container",
                ConnectionStringSetting = "ReadPlatformData",
                Id = "main",
                PartitionKey = "main")]
            PlatformInfoItem platformInfoItem,
            [CosmosDB(
                "assessment-app-db",
                "Assessments",
                ConnectionStringSetting = "ReadPlatformData")]
            IDocumentClient assessmentsClient,
            ILogger log)
        {
            LtiResourceLinkRequest ltiResourceLinkRequest = null;
            try
            {
                ltiResourceLinkRequest = await req.GetLtiResourceLinkRequest(
                    _httpClientFactory, platformInfoItem.JwkSetUrl, platformInfoItem.ClientId, platformInfoItem.Issuer);
            }
            catch (Exception e)
            {
                log.LogError($"Could not validate request.\n{e}");
            }

            if (ltiResourceLinkRequest == null)
            {
                return new BadRequestErrorMessageResult("Could not validate request.");
            }

            log.LogInformation(ltiResourceLinkRequest.ToString());

            string nonce = ltiResourceLinkRequest.Nonce;
            string state = req.Form["state"].ToString();

            // TODO: implement nonce validation
            // bool isNonceValid = await ValidateNonce(nonce, state, entityClient, log);
            // if (!isNonceValid)
            //     return new BadRequestErrorMessageResult("Could not validate nonce.");

            var assessmentsUri = UriFactory.CreateDocumentCollectionUri("assessment-app-db", "Assessments");
            var query = assessmentsClient.CreateDocumentQuery<AssessmentItem>(
                assessmentsUri, $"SELECT * FROM a WHERE a.LmsContextId = \"{ltiResourceLinkRequest.Context.Id}\" AND a.LmsResourceLinkId = \"{ltiResourceLinkRequest.ResourceLink.Id}\"",
                new FeedOptions() {EnableCrossPartitionQuery = true}).AsDocumentQuery();
            var matchedAssessments = new List<AssessmentItem>();
            while (query.HasMoreResults)
            {
                foreach (AssessmentItem item in await query.ExecuteNextAsync())
                {
                    matchedAssessments.Add(item);
                }
            }

            if (matchedAssessments.Count > 1)
            {
                return new BadRequestErrorMessageResult("Found more than one matching assessment.");
            }

            AssessmentItem assessmentItem;
            if (matchedAssessments.Count == 0)
            {
                assessmentItem = new AssessmentItem()
                {
                    Status = "Draft",
                    AssessmentType = "Quiz",
                };

            }
            else
            {
                assessmentItem = matchedAssessments[0];
            }
            // TODO: return an error if AssignmentGradeServices is not configured.
            var lineItemUri = new Uri(ltiResourceLinkRequest.AssignmentGradeServices.LineItemUrl);
            var lineItem = lineItemUri.GetLeftPart(UriPartial.Path).TrimEnd('/');

            assessmentItem.LmsContextId = ltiResourceLinkRequest.Context.Id;
            assessmentItem.LmsResourceLinkId = ltiResourceLinkRequest.ResourceLink.Id;
            assessmentItem.ContextMembershipUrl = ltiResourceLinkRequest.NamesRoleService.ContextMembershipUrl;
            assessmentItem.LineItemUrl = lineItem;
            assessmentItem.CourseName = ltiResourceLinkRequest.Context.Title;
            assessmentItem.Name = ltiResourceLinkRequest.ResourceLink.Title;
            
            var response = await assessmentsClient.UpsertDocumentAsync(assessmentsUri, assessmentItem);
            assessmentItem.Id = response.Resource.Id;
            
            var ltiAssessmentClient = _ltiAssessmentClientFactory.Create(platformInfoItem, assessmentItem);
            var member = await ltiAssessmentClient.GetMemberById(ltiResourceLinkRequest.UserId);
            log.LogInformation(member.Email);
            log.LogInformation(member.Roles.ToString());

            var urlWithParams = $"{RedirectUrl}/spa/assessment/{assessmentItem.Id}";
            if (member.IsStudent())
            {
                urlWithParams = $"{RedirectUrl}/spa/student-welcome-page/{assessmentItem.Id}";
            }
            log.LogInformation($"Redirect to {urlWithParams}");

            return new RedirectResult(urlWithParams);
        }

        [FunctionName(nameof(Jwks))]
        public async Task<IActionResult> Jwks(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "jwks")]
            HttpRequest req
            // [LtiAdvantage] LtiToolPublicKey publicKey
        )
        {
            var keyClient = new KeyClient(
                new Uri("https://assessment-app-kv.vault.azure.net/"),
                new DefaultAzureCredential());
            // new AzureCliCredential());

            KeyVaultKey key = await keyClient.GetKeyAsync("EdnaLiteDevKey");
            var jwks = new JsonWebKeySet();
            IMJsonWebKey publicKey = new IMJsonWebKey()
            {
                Kid = key.Key.Id,
                Kty = JsonWebAlgorithmsKeyTypes.RSA,
                Alg = Microsoft.IdentityModel.Tokens.SecurityAlgorithms.RsaSha256,
                Use = Microsoft.IdentityModel.Tokens.JsonWebKeyUseNames.Sig,
                E = Base64Url.Encode(key.Key.E),
                N = Base64Url.Encode(key.Key.N)
            };
            jwks.Keys.Add(publicKey);
            return new OkObjectResult(jwks);
        }

        private async Task<bool> ValidateNonce(string nonce, string state, IDurableEntityClient entityClient,
            ILogger log)
        {
            EntityId nonceEntityId = new EntityId(nameof(Nonce), nonce);

            EntityStateResponse<Nonce> nonceEntityResponse =
                await GetEntityStateWithRetries<Nonce>(nonceEntityId, entityClient);
            if (!nonceEntityResponse.EntityExists)
            {
                log.LogWarning($"Entity {nonceEntityId.EntityKey} does not exist.");
                return false;
            }

            if (state != nonceEntityResponse.EntityState.State)
            {
                log.LogWarning("The form state does not match the nonce.");
                return false;
            }

            await entityClient.SignalEntityAsync(nonceEntityId, nameof(Nonce.Delete));
            return true;
        }

        private async Task<EntityStateResponse<T>> GetEntityStateWithRetries<T>(EntityId entityId,
            IDurableEntityClient entityClient, int retriesNumber = 3)
        {
            EntityStateResponse<T> entityResponse = default;
            for (int i = 0; i < retriesNumber; i++)
            {
                entityResponse = await entityClient.ReadEntityStateAsync<T>(entityId);
                if (entityResponse.EntityExists)
                    break;

                await Task.Delay(500);
            }

            return entityResponse;
        }

        private NameValueCollection GetRedirectQueryParams(PlatformInfoItem platformInfo, LoginParams loginParams)
        {
            var loginQueryParams = new NameValueCollection
            {
                ["response_type"] = "id_token",
                ["response_mode"] = "form_post",
                ["redirect_uri"] = loginParams.TargetLinkUri,
                ["scope"] = "openid",
                ["login_hint"] = loginParams.LoginHint,
                ["prompt"] = "none",
                ["lti_message_hint"] = loginParams.LtiMessageHint
            };
            
            var httpCopiedValuesCollection = HttpUtility.ParseQueryString(string.Empty);
            httpCopiedValuesCollection.Add(loginQueryParams);
            httpCopiedValuesCollection["client_id"] = platformInfo.ClientId;

            return httpCopiedValuesCollection;
        }
    }
}