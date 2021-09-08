using System;
using Assessment.App.Database.Model;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Assessment.App.Functions.Student.Dto
{
    public class StudentAssessmentDto
    {
        [JsonProperty("id")] public string Id { get; set; }

        public string CourseName { get; set; } = "";
        public string Name { get; set; } = "";

        public string Description { get; set; } = "";

        public string AssessmentType { get; set; } = "";
        
        public DateTime Deadline { get; set; } = DateTime.UtcNow.AddDays(1);

        [JsonConverter(typeof(StringEnumConverter))]
        public StudentResponseStatus Status { get; set; } = StudentResponseStatus.NotStarted;
        
        public DateTime StartTime { get; set; } = DateTime.MaxValue;
        public double DurationSeconds { get; set; } = TimeSpan.FromHours(1).TotalSeconds;
        public int NumberOfQuestions { get; set; } = 0;

        public static StudentAssessmentDto CreateFromItem(AssessmentItem item)
        {
            return new StudentAssessmentDto()
            {
                Id = item.Id,
                CourseName = item.CourseName,
                Name = item.Name,
                Description = item.Description,
                AssessmentType = item.AssessmentType,
                Deadline = item.Deadline,
                DurationSeconds = item.Duration.TotalSeconds,
                NumberOfQuestions = item.QuestionIds.Count,
            };
        }
    }
}