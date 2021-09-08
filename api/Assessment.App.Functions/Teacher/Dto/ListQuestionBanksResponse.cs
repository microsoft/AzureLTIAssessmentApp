using System.Collections.Generic;
using Assessment.App.Database.Model;

namespace Assessment.App.Functions.Teacher.Dto
{
    public class ListQuestionBanksResponse
    {
        public List<QuestionBankItem> QuestionBanks { get; set; } = new List<QuestionBankItem>();
    }
}