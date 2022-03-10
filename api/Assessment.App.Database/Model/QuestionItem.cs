using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Assessment.App.Database.Model
{
    public class QuestionItem
    {
        [JsonProperty("id")] public string Id { get; set; }
        
        public string Name { get; set; }
        
        public string Description { get; set; }
        
        public DateTime LastModified { get; set; }
        
        public List<string> Options { get; set; }
        
        public List<string> Answer { get; set; }

        public string TextType{get;set;}

        public string QuestionType{get;set;}
    }
}