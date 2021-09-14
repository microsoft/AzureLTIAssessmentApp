#nullable enable
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Assessment.App.Database.Model;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;

namespace Assessment.App.Database
{
    /// <summary>
    /// Performs communication of the Assessment App with Cosmos DB.
    /// </summary>
    public class DatabaseClient
    {
        private const string PlatformItemId = "main";

        private readonly ILogger<DatabaseClient> _log;
        private readonly Container _platformContainer;
        private readonly Container _questionsContainer;
        private readonly Container _studentResponsesContainer;
        private readonly Container _assessmentsContainer;
        private readonly Container _questionBanksContainer;

        public DatabaseClient(CosmosClient cosmosClient, ILogger<DatabaseClient> log)
        {
            _log = log;

            var database = cosmosClient.GetDatabase("assessment-app-db");
            _platformContainer = database.GetContainer("platform-registration-container");
            _questionsContainer = database.GetContainer("Questions");
            _studentResponsesContainer = database.GetContainer("StudentResponses");
            _assessmentsContainer = database.GetContainer("Assessments");
            _questionBanksContainer = database.GetContainer("QuestionBanks");
        }
        
        /// <summary>
        /// Returns parameters used on Platform Registration Page
        /// to configure the Assessment App and LMS using LTI.
        /// If the database does not yet contain the parameters,
        /// a new empty set of parameters is saved in the database and returned.
        /// </summary>
        public async Task<PlatformInfoItem> GetPlatformInfo()
        {
            try
            {
                return await _platformContainer.ReadItemAsync<PlatformInfoItem>(PlatformItemId,
                    new PartitionKey(PlatformItemId));
            }
            catch (CosmosException e)
            {
                if (e.StatusCode == HttpStatusCode.NotFound)
                {
                    return await _platformContainer.UpsertItemAsync(new PlatformInfoItem()
                    {
                        Id = PlatformItemId,
                        DisplayName = "",
                        Issuer = "",
                        JwkSetUrl = "",
                        AccessTokenUrl = "",
                        AuthorizationUrl = "",
                        ClientId = "",
                        InstitutionName = "",
                        LogoUrl = "",
                    });
                }

                throw;
            }
        }
        
        /// <summary>
        /// Returns Question Bank with the given ID.
        /// </summary>
        /// <param name="questionBankId">ID of the question bank.</param>
        public async Task<QuestionBankItem> GetQuestionBank(string questionBankId)
        {
            return await _questionBanksContainer.ReadItemAsync<QuestionBankItem>(questionBankId,
                new PartitionKey(questionBankId));
        }
        
        /// <summary>
        /// Returns a list of questions with the given question IDs.
        /// </summary>
        public async Task<List<QuestionItem>> GetQuestions(List<string> questionIds)
        {
            var idsAndKeys = questionIds.ConvertAll(s => (s, new PartitionKey(s)));
            var result = await _questionsContainer
                .ReadManyItemsAsync<QuestionItem>(idsAndKeys);
            return result.ToList();
        }
        
        /// <summary>
        /// Returns the student's response for the given assessment.
        /// Returns null if no responses found.
        /// Throws an exception if found more than one.
        /// </summary>
        public async Task<StudentResponseItem?> GetStudentResponse(string assessmentId, string studentId)
        {
            StudentResponseItem? result = null;
            var queryDefinition = new QueryDefinition(
                    "SELECT * FROM r WHERE r.AssessmentId = @assessmentId AND r.StudentId = @studentId")
                .WithParameter("@assessmentId", assessmentId)
                .WithParameter("@studentId", studentId);
            using var feedIterator =
                _studentResponsesContainer.GetItemQueryIterator<StudentResponseItem>(queryDefinition);
            while (feedIterator.HasMoreResults)
            {
                foreach (var item in await feedIterator.ReadNextAsync())
                {
                    if (result != null)
                    {
                        throw new ApplicationException("Found more than one student response");
                    }

                    result = item;
                }
            }

            return result;
        }
        
        /// <summary>
        /// Returns student responses for the given assessment.
        /// It is used for Assessment Analytics.
        /// </summary>
        public async Task<List<StudentResponseItem>> GetAssessmentResponses(string assessmentId)
        {
            var result = new List<StudentResponseItem>();
            var queryDefinition = new QueryDefinition(
                    "SELECT * FROM r WHERE r.AssessmentId = @assessmentId")
                .WithParameter("@assessmentId", assessmentId);
            using var feedIterator =
                _studentResponsesContainer.GetItemQueryIterator<StudentResponseItem>(queryDefinition);
            while (feedIterator.HasMoreResults)
            {
                foreach (var item in await feedIterator.ReadNextAsync())
                {
                    result.Add(item);
                }
            }

            return result;
        }
        
        /// <summary>
        /// Deletes the question banks with the given IDs.
        /// </summary>
        public async Task DeleteQuestionBanks(IEnumerable<string> questionBankIds)
        {
            foreach (var questionBankId in questionBankIds)
            {
                var questionBank = await GetQuestionBank(questionBankId);
                await DeleteQuestionsFromAssessments(questionBank.QuestionIds);
                await _questionBanksContainer.DeleteItemAsync<QuestionItem>(questionBankId,
                    new PartitionKey(questionBankId));
                await DeleteQuestionsItems(questionBank.QuestionIds);
            }
        }
        
        /// <summary>
        /// Deletes the questions with the given IDs.
        /// </summary>
        public async Task DeleteQuestions(List<string> questionIds)
        {
            await DeleteQuestionsFromAssessments(questionIds);
            await DeleteQuestionsFromQuestionBanks(questionIds);
            await DeleteQuestionsItems(questionIds);
        }
        
        /// <summary>
        /// Deletes the question from the Questions container.
        /// </summary>
        private async Task DeleteQuestionsItems(IEnumerable<string> questionIds)
        {
            foreach (var questionId in questionIds)
            {
                await _questionsContainer.DeleteItemAsync<QuestionItem>(questionId, new PartitionKey(questionId));
            }
        }
        
        /// <summary>
        /// Deletes the question from its question bank.
        /// </summary>
        private async Task DeleteQuestionsFromQuestionBanks(List<string> questionIds)
        {
            var questionBanks = new Dictionary<string, QuestionBankItem>();
            foreach (var questionId in questionIds)
            {
                var queryDefinition = new QueryDefinition(
                        "SELECT * FROM b WHERE ARRAY_CONTAINS(b.QuestionIds, @questionId)")
                    .WithParameter("@questionId", questionId);
                using var feedIterator =
                    _questionBanksContainer.GetItemQueryIterator<QuestionBankItem>(queryDefinition);
                while (feedIterator.HasMoreResults)
                {
                    foreach (var item in await feedIterator.ReadNextAsync())
                    {
                        questionBanks[item.Id] = item;
                    }
                }
            }

            foreach (var questionBank in questionBanks.Values)
            {
                foreach (var questionId in questionIds)
                {
                    questionBank.QuestionIds.Remove(questionId);
                }

                await _questionBanksContainer.UpsertItemAsync(questionBank);
            }
        }
        
        /// <summary>
        /// Deletes thr question from the assessments where it was used.
        /// </summary>
        private async Task DeleteQuestionsFromAssessments(List<string> questionIds)
        {
            var assessments = new Dictionary<string, AssessmentItem>();
            foreach (var questionId in questionIds)
            {
                var queryDefinition = new QueryDefinition(
                        "SELECT * FROM a WHERE ARRAY_CONTAINS(a.QuestionIds, @questionId)")
                    .WithParameter("@questionId", questionId);
                using var feedIterator =
                    _assessmentsContainer.GetItemQueryIterator<AssessmentItem>(queryDefinition);
                while (feedIterator.HasMoreResults)
                {
                    foreach (var item in await feedIterator.ReadNextAsync())
                    {
                        assessments[item.Id] = item;
                    }
                }
            }

            foreach (var assessment in assessments.Values)
            {
                foreach (var questionId in questionIds)
                {
                    assessment.QuestionIds.Remove(questionId);
                }

                await _assessmentsContainer.UpsertItemAsync(assessment);
            }
        }
        
        /// <summary>
        /// Updates or inserts the given student response.
        /// </summary>
        public async Task<StudentResponseItem> UpsertStudentResponse(StudentResponseItem item)
        {
            return await _studentResponsesContainer.UpsertItemAsync(item);
        }
    }
}