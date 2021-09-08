using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Assessment.App.Database.Model
{
    public class AssessmentItem
    {
        [JsonProperty("id")] public string Id { get; set; }
        
        public string LmsContextId { get; set; }
        
        public string LmsResourceLinkId { get; set; }
        
        public string ContextMembershipUrl { get; set; }

        public string LineItemUrl { get; set; } = "";

        public string CourseName { get; set; } = "";
        public string Name { get; set; } = "";

        public string Description { get; set; } = "";

        public DateTime Deadline { get; set; } = DateTime.UtcNow.AddDays(1);
        
        public TimeSpan Duration { get; set; } = TimeSpan.FromHours(1);

        public DateTime LastModified { get; set; } = DateTime.UtcNow;

        public string AssessmentType { get; set; } = "";

        public string Status { get; set; } = "";
        public List<string> QuestionIds { get; set; } = new List<string>();

        public List<string> StudentIds { get; set; } = new List<string>();
    }
}