using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using LtiAdvantage.Lti;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;

namespace Assessment.App.Functions.Connect
{
    public static class LtiAdvantageExtensions
    {
        public static async Task<LtiResourceLinkRequest> GetLtiResourceLinkRequest(
            this HttpRequest request, 
            IHttpClientFactory httpClientFactory,
            string jwkSetUrl, string clientId, string issuer)
        {
            ClaimsPrincipal claimsPrincipal = await request.GetValidatedLtiLaunchClaims(
                httpClientFactory, jwkSetUrl, clientId, issuer);

            return new LtiResourceLinkRequest(claimsPrincipal.Claims);
        }
        
        public static async Task<ClaimsPrincipal> GetValidatedLtiLaunchClaims(
            this HttpRequest request, 
            IHttpClientFactory httpClientFactory,
            string jwkSetUrl, 
            string clientId, 
            string issuer)
        {
            if (!request.Form.TryGetValue("id_token", out var idTokenValue))
                throw new NullReferenceException("No ID token is presented in the http request.");

            HttpClient client = httpClientFactory.CreateClient();
            string certsJsonString = await client.GetStringAsync(jwkSetUrl);
            JObject certsJObject = JObject.Parse(certsJsonString);
            JArray keysJToken = certsJObject["keys"] as JArray;
            IEnumerable<JsonWebKey> keys = keysJToken?
                                               .Select(key => key.ToString())
                                               .Select(s => new JsonWebKey(s))
                                           ?? Enumerable.Empty<JsonWebKey>();

            TokenValidationParameters validationParameters = new TokenValidationParameters
            {
                ValidAudience = clientId,
                ValidIssuer = issuer,
                IssuerSigningKeys = keys
            };

            JwtSecurityTokenHandler jwtSecurityTokenHandler = new JwtSecurityTokenHandler { InboundClaimTypeMap = { ["sub"] = "sub" } };

            return jwtSecurityTokenHandler.ValidateToken(idTokenValue.ToString(), validationParameters, out _);
        }
    }
}