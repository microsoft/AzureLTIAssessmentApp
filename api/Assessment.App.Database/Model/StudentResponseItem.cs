using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Assessment.App.Database.Model
{
    public class StudentResponseItem
    {
        [JsonProperty("id")] public string Id { get; set; }
        
        public string AssessmentId { get; set; }
        
        public string StudentId { get; set; }

        [JsonConverter(typeof(StringEnumConverter))]
        public StudentResponseStatus Status { get; set; } = StudentResponseStatus.NotStarted;
        public DateTime StartTime { get; set; } = DateTime.MaxValue;
        
        public DateTime EndTime { get; set; } = DateTime.MaxValue;

        public double Score { get; set; } = 0;

        public Dictionary<string, QuestionResponseInfo> Responses { get; set; } =
            new Dictionary<string, QuestionResponseInfo>();
    }
}