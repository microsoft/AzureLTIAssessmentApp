using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Assessment.App.Database.Model
{
    public class QuestionBankItem
    {
        [JsonProperty("id")] public string Id { get; set; }
        
        public string Name { get; set; }
        
        public string Description { get; set; }
        
        public DateTime LastModified { get; set; }
        
        public List<string> QuestionIds { get; set; }
        
        public string AssessmentType { get; set; }
    }
}