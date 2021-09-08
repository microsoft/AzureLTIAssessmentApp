using System.Collections.Generic;

namespace Assessment.App.Functions.Teacher.Dto
{
    public class ListAssessmentsResponse
    {
        public List<AssessmentDto> Assessments { get; set; } = new List<AssessmentDto>();
    }
}