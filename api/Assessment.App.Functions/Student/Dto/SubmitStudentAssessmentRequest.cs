using System.Collections.Generic;
using Assessment.App.Database.Model;

namespace Assessment.App.Functions.Student.Dto
{
    public class SubmitStudentAssessmentRequest
    {
        public Dictionary<string, QuestionResponseInfo> Responses { get; set; } =
            new Dictionary<string, QuestionResponseInfo>();
    }
}