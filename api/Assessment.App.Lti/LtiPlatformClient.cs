using System;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using Assessment.App.Azure;
using Assessment.App.Database.Model;
using IdentityModel;
using IdentityModel.Client;
using LtiAdvantage.IdentityModel.Client;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace Assessment.App.Lti
{
    /// <summary>
    /// Performs communication with LMS, which is not related to any specific assessment.
    /// </summary>
    public class LtiPlatformClient
    {
        private readonly PlatformInfoItem _platformInfo;
        private readonly AppKeyVaultClient _keyVaultClient;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<LtiPlatformClient> _log;
    
        /// <summary>
        /// Creates LtiPlatformClient instances.
        /// </summary>
        public class Factory
        {
            private readonly AppKeyVaultClient _keyVaultClient;
            private readonly IHttpClientFactory _httpClientFactory;
            private readonly ILogger<LtiPlatformClient> _log;

            public Factory(
                AppKeyVaultClient keyVaultClient, IHttpClientFactory httpClientFactory, ILogger<LtiPlatformClient> log)
            {
                _keyVaultClient = keyVaultClient;
                _httpClientFactory = httpClientFactory;
                _log = log;
            }

            public LtiPlatformClient Create(PlatformInfoItem platformInfo)
            {
                return new LtiPlatformClient(platformInfo, _keyVaultClient, _httpClientFactory, _log);
            }
        }
        
        private LtiPlatformClient(
            PlatformInfoItem platformInfo, AppKeyVaultClient keyVaultClient, IHttpClientFactory httpClientFactory,
            ILogger<LtiPlatformClient> log)
        {
            _platformInfo = platformInfo;
            _keyVaultClient = keyVaultClient;
            _httpClientFactory = httpClientFactory;
            _log = log;
        }
        
        /// <summary>
        /// Requests an access token from LMS for the given scope.
        /// Based on the Learn LTI implementation: https://github.com/microsoft/Learn-LTI.
        /// </summary>
        /// <param name="scope">
        /// For example, we use two scopes:
        /// 1. Read Only scope for getting a list of Participants from LMS.
        /// 2. Write scope to update students' grades.
        /// </param>
        public async Task<TokenResponse> GetAccessTokenAsync(string scope)
        {
            // TokenResponse errorResponse = ValidateParameters((nameof(clientId), clientId), (nameof(accessTokenEndpoint), accessTokenEndpoint), (nameof(scope), scope), (nameof(keyVaultKeyString), keyVaultKeyString));
            // if (errorResponse != null)
            //     return errorResponse;

            // Use a signed JWT as client credentials.
            var payload = new JwtPayload();
            payload.AddClaim(new Claim(JwtRegisteredClaimNames.Iss, _platformInfo.ClientId));
            payload.AddClaim(new Claim(JwtRegisteredClaimNames.Sub, _platformInfo.ClientId));
            payload.AddClaim(new Claim(JwtRegisteredClaimNames.Aud, _platformInfo.AccessTokenUrl));
            payload.AddClaim(new Claim(JwtRegisteredClaimNames.Iat, EpochTime.GetIntDate(DateTime.UtcNow).ToString(),
                ClaimValueTypes.Integer64));
            payload.AddClaim(new Claim(JwtRegisteredClaimNames.Nbf,
                EpochTime.GetIntDate(DateTime.UtcNow.AddSeconds(-5)).ToString(), ClaimValueTypes.Integer64));
            payload.AddClaim(new Claim(JwtRegisteredClaimNames.Exp,
                EpochTime.GetIntDate(DateTime.UtcNow.AddMinutes(5)).ToString(), ClaimValueTypes.Integer64));
            payload.AddClaim(new Claim(JwtRegisteredClaimNames.Jti, CryptoRandom.CreateUniqueId()));

            var handler = new JwtSecurityTokenHandler();
            var credentials = _keyVaultClient.GetSigningCredentials();
            var jwt = handler.WriteToken(new JwtSecurityToken(new JwtHeader(credentials), payload));

            var request = new JwtClientCredentialsTokenRequest
            {
                Address = _platformInfo.AccessTokenUrl,
                ClientId = _platformInfo.ClientId,
                Jwt = jwt,
                Scope = scope,
            };

            return await _httpClientFactory
                .CreateClient()
                .RequestClientCredentialsTokenWithJwtAsync(request);
        }
    }
}