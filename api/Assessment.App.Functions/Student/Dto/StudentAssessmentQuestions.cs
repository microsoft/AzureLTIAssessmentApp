using System;
using System.Collections.Generic;

namespace Assessment.App.Functions.Student.Dto
{
    public class StudentAssessmentQuestions
    {
        public StudentAssessmentDto Assessment { get; set; }
        public List<StudentQuestionDto> Questions { get; set; } = new List<StudentQuestionDto>();
    }
}