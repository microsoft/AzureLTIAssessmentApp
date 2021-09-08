using Newtonsoft.Json;

namespace Assessment.App.Functions.Teacher.Dto
{
    public class MemberDto
    {
        [JsonProperty("id")] public string Id { get; set; }
        
        public string Email { get; set; }
        
        public string FamilyName { get; set; }
        
        public string GivenName { get; set; }
        
        public string Picture { get; set; }
    }
}