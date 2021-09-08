using System.Collections.Generic;
using Assessment.App.Database.Model;

namespace Assessment.App.Functions.Teacher.Dto
{
    public class GetQuestionBankResponse
    {
        public QuestionBankItem QuestionBank { get; set; }

        public List<QuestionItem> Questions { get; set; } = new List<QuestionItem>();
    }
}