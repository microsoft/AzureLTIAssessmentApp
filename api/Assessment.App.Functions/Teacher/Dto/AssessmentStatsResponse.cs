using System.Collections.Generic;
using Assessment.App.Database.Model;

namespace Assessment.App.Functions.Teacher.Dto
{
    public class AssessmentStatsResponse
    {
        public List<StudentResultDto> StudentResponses { get; set; } = new List<StudentResultDto>();
    }
}