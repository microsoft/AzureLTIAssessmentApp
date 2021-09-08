using System;
using System.Collections.Generic;
using Assessment.App.Database.Model;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Assessment.App.Functions.Teacher.Dto
{
    public class StudentResultDto
    {
        public string StudentId { get; set; }

        [JsonConverter(typeof(StringEnumConverter))]
        public StudentResponseStatus Status { get; set; } = StudentResponseStatus.NotStarted;
        
        public DateTime StartTime { get; set; } = DateTime.MaxValue;
        
        public DateTime EndTime { get; set; } = DateTime.MaxValue;

        public double Score { get; set; } = 0;

        public Dictionary<string, QuestionResponseInfo> Responses { get; set; } =
            new Dictionary<string, QuestionResponseInfo>();

        public static StudentResultDto CreateFromItem(StudentResponseItem item)
        {
            return new StudentResultDto()
            {
                StudentId = item.StudentId,
                Status = item.Status,
                StartTime = item.StartTime,
                EndTime = item.EndTime,
                Score = item.Score,
                Responses = item.Responses,
            };
        }
    }
}