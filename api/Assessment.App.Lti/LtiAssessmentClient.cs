using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Assessment.App.Database.Model;
using Assessment.App.Utils.Http;
using IdentityModel.Client;
using LtiAdvantage;
using LtiAdvantage.AssignmentGradeServices;
using LtiAdvantage.NamesRoleProvisioningService;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace Assessment.App.Lti
{
    public class LtiAssessmentClient
    {
        private readonly AssessmentItem _assessmentItem;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<LtiAssessmentClient> _log;

        public LtiPlatformClient PlatformClient { get; }

        public class Factory
        {
            private readonly IHttpClientFactory _httpClientFactory;
            private readonly ILogger<LtiAssessmentClient> _log;
            private readonly LtiPlatformClient.Factory _platformClientFactory;

            public Factory(IHttpClientFactory httpClientFactory, ILogger<LtiAssessmentClient> log,
                LtiPlatformClient.Factory platformClientFactory)
            {
                _httpClientFactory = httpClientFactory;
                _log = log;
                _platformClientFactory = platformClientFactory;
            }

            public LtiAssessmentClient Create(PlatformInfoItem platformInfo, AssessmentItem assessmentItem)
            {
                return new LtiAssessmentClient(
                    assessmentItem, _httpClientFactory, _log, _platformClientFactory.Create(platformInfo)
                );
            }
        }

        private LtiAssessmentClient(
            AssessmentItem assessmentItem, IHttpClientFactory httpClientFactory, ILogger<LtiAssessmentClient> log,
            LtiPlatformClient platformClient)
        {
            _assessmentItem = assessmentItem;
            _httpClientFactory = httpClientFactory;
            _log = log;
            PlatformClient = platformClient;
        }

        public async Task<IEnumerable<Member>> GetMembers()
        {
            var httpClient = await CreateHttpClientWithAccessToken(Constants.LtiScopes.Nrps.MembershipReadonly);

            httpClient.DefaultRequestHeaders.Accept.Clear();
            httpClient.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue(Constants.MediaTypes.MembershipContainer));

            _log.LogInformation("Getting members.");
            using var response = await httpClient.GetAsync(_assessmentItem.ContextMembershipUrl);

            if (!response.IsSuccessStatusCode)
            {
                _log.LogError("Could not get members.");
                throw new Exception(response.ReasonPhrase);
            }

            var membership = await response.ReadJsonBody<MembershipContainer>();

            return membership.Members
                .OrderBy(m => m.FamilyName)
                .ThenBy(m => m.GivenName);
        }

        public async Task<Member> GetMemberByEmail(IEnumerable<string> userEmails)
        {
            // Looks like LTI 1.3 doesn't support querying by member identifiers
            var allMembers = await GetMembers();

            return allMembers.FirstOrDefault(member => userEmails.Any(userEmail =>
                (member.Email ?? string.Empty).Equals(userEmail, StringComparison.OrdinalIgnoreCase)));
        }

        public async Task<Member> GetMemberById(string userId)
        {
            // Looks like LTI 1.3 doesn't support querying by member identifiers
            var allMembers = (await GetMembers()).ToList();

            return allMembers.FirstOrDefault(member => member.UserId.Equals(userId));
        }

        public async Task SubmitScore(Score score)
        {
            var httpClient = await CreateHttpClientWithAccessToken(Constants.LtiScopes.Ags.Score);
            httpClient.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue(Constants.MediaTypes.Score));

            var scoreResponse = await httpClient.PostAsync(
                _assessmentItem.LineItemUrl + "/scores",
                new StringContent(JsonConvert.SerializeObject(score), Encoding.UTF8, Constants.MediaTypes.Score));
            if (scoreResponse.IsSuccessStatusCode)
            {
                return;
            }

            var scoreResponseBody = await scoreResponse.Content.ReadAsStringAsync();

            throw new Exception($"Unable to publish user score: {scoreResponse.StatusCode}, {scoreResponseBody}");
        }

        private async Task<HttpClient> CreateHttpClientWithAccessToken(string scope)
        {
            var accessTokenResponse =
                await PlatformClient.GetAccessTokenAsync(scope);
            if (accessTokenResponse.IsError)
            {
                throw accessTokenResponse.Exception ??
                      new Exception(
                          $"Internal exception in the authentication flow to LMS: {accessTokenResponse.Error}");
            }

            var httpClient = _httpClientFactory.CreateClient();
            httpClient.SetBearerToken(accessTokenResponse.AccessToken);
            return httpClient;
        }
    }
}