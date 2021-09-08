using System;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;

namespace Assessment.App.Utils.Http
{
    public static class HttpExtensions
    {
        public static async Task<T> ReadJsonBody<T>(this HttpRequest request)
        {
            return await ReadJsonFromStream<T>(request.Body);
        }
        
        public static async Task<T> ReadJsonBody<T>(this HttpResponse response)
        {
            return await ReadJsonFromStream<T>(response.Body);
        }

        public static async Task<T> ReadJsonBody<T>(this HttpResponseMessage response)
        {
            return await ReadJsonFromStream<T>(await response.Content.ReadAsStreamAsync());
        }

        private static async Task<T> ReadJsonFromStream<T>(Stream s)
        {
            using var streamReader = new StreamReader(s);
            var requestBody = await streamReader.ReadToEndAsync();
            return JsonConvert.DeserializeObject<T>(requestBody);
        }

        public static string GetUserEmail(this HttpRequest request)
        {
            // var accessToken = GetAccessToken(req);
            // var tokenHandler = new JwtSecurityTokenHandler();
            // var jwtToken = tokenHandler.ReadJwtToken(accessToken);
            // // jwtToken.
            // foreach (var claim in jwtToken.Claims)
            // {
            //     log.LogInformation($"Claim {claim.Type}: {claim.Value}");
            // }
            // var validationParameters = new TokenValidationParameters
            // {
            //     // // App Id URI and AppId of this service application are both valid audiences.
            //     // ValidAudiences = new[] { audience, clientID },
            //     //
            //     // // Support Azure AD V1 and V2 endpoints.
            //     // ValidIssuers = validIssuers,
            //     // IssuerSigningKeys = config.SigningKeys
            // };
            // SecurityToken securityToken;
            // var claimsPrincipal = tokenHandler.ValidateToken(accessToken, validationParameters, out securityToken);
            // log.LogInformation(claimsPrincipal.Identity.Name);
            // return new OkResult();
            var accessToken = GetAccessToken(request);
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(accessToken);
            return GetEmailFromToken(jwtToken);
        }

        private static string GetAccessToken(HttpRequest req)
        {
            var authorizationHeader = req.Headers?["Authorization"];
            var parts = authorizationHeader?.ToString().Split(null) ?? new string[0];
            if (parts.Length == 2 && parts[0].Equals("Bearer"))
            {
                return parts[1];
            }

            return null;
        }
        
        private static string GetEmailFromToken(JwtSecurityToken jwtToken)
        {
            foreach (var claim in jwtToken.Claims)
            {
                if (claim.Type == "unique_name")
                {
                    return claim.Value;
                }
            }

            return "";
        }
    }
}