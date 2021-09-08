using System;
using System.Collections.Generic;
using Assessment.App.Database.Model;
using Newtonsoft.Json;

namespace Assessment.App.Functions.Teacher.Dto
{
    public class AssessmentDto
    {
        [JsonProperty("id")] public string Id { get; set; }

        public string Name { get; set; } = "";

        public string Description { get; set; } = "";
        
        public DateTime LastModified { get; set; } = DateTime.UtcNow;

        public string AssessmentType { get; set; } = "";

        public string Status { get; set; } = "";
        
        public DateTime Deadline { get; set; } = DateTime.UtcNow.AddDays(1);
        
        public double DurationSeconds { get; set; } = TimeSpan.FromHours(1).TotalSeconds;
        public List<string> QuestionIds { get; set; } = new List<string>();

        public List<string> StudentIds { get; set; } = new List<string>();

        public static AssessmentDto CreateFromItem(AssessmentItem item)
        {
            return new AssessmentDto()
            {
                Id = item.Id,
                Name = item.Name,
                Description = item.Description,
                LastModified = item.LastModified,
                AssessmentType = item.AssessmentType,
                Status = item.Status,
                Deadline = item.Deadline,
                DurationSeconds = item.Duration.TotalSeconds,
                QuestionIds = item.QuestionIds,
                StudentIds = item.StudentIds,
            };
        }
    }
}