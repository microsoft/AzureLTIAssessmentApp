namespace Assessment.App.Functions.Platform.Dto
{
    public class PlatformResponse
    {
        public string DisplayName { get; set; }
        public string Issuer { get; set; }
        public string JwkSetUrl { get; set; }
        public string AccessTokenUrl { get; set; }
        public string AuthorizationUrl { get; set; }
        public string LoginUrl { get; set; }
        public string LaunchUrl { get; set; }
        public string DomainUrl { get; set; }
        public string ClientId { get; set; }
        public string PublicKey { get; set; }
        public string PublicJwk { get; set; }
        public string PublicJwkSetUrl { get; set; }
        public string InstitutionName { get; set; }
        public string LogoUrl { get; set; }
    }
}