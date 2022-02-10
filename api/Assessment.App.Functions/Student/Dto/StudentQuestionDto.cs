using System.Collections.Generic;
using Newtonsoft.Json;

namespace Assessment.App.Functions.Student.Dto
{
    public class StudentQuestionDto
    {
        [JsonProperty("id")] public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public List<string> Options { get; set; }
        public int ChosenOption { get; set; }
        
        public string TextType{get;set;}
    }
}