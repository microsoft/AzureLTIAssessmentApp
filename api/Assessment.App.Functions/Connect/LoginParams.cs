using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Assessment.App.Functions.Connect
{
    public class LoginParams
    {
        public string TargetLinkUri { get; set; }
        public string LoginHint { get; set; }
        public string LtiMessageHint { get; set; }

        public static async Task<LoginParams> CreateFromRequest(HttpRequest httpRequest)
        {
            if (httpRequest.HasFormContentType)
            {
                var form = await (httpRequest?.ReadFormAsync() ?? Task.FromResult<IFormCollection>(null));
                if (form == null)
                    throw new NullReferenceException("The HTTP form could not be fetched.");

                return new LoginParams
                {
                    TargetLinkUri = form["target_link_uri"].ToString(),
                    LoginHint = form["login_hint"].ToString(),
                    LtiMessageHint = form["lti_message_hint"]
                };
            }
            else
            {
                var query = httpRequest?.Query;
                if (query == null)
                    throw new NullReferenceException("The HTTP Query could not be fetched.");
                return new LoginParams
                {
                    TargetLinkUri = query["target_link_uri"].ToString(),
                    LoginHint = query["login_hint"].ToString(),
                    LtiMessageHint = query["lti_message_hint"].ToString()
                };
            }
        }
    }
}