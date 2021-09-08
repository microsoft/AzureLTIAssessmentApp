namespace Assessment.App.Functions.Platform.Dto
{
    public class PlatformUpdateRequest
    {
        public string DisplayName { get; set; }
        public string Issuer { get; set; }
        public string JwkSetUrl { get; set; }
        public string AccessTokenUrl { get; set; }
        public string AuthorizationUrl { get; set; }
        public string ClientId { get; set; }
        public string InstitutionName { get; set; }
        public string LogoUrl { get; set; }
    }
}