using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Assessment.App.Database;
using Assessment.App.Database.Model;
using Assessment.App.Functions.Teacher.Dto;
using Assessment.App.Lti;
using Assessment.App.Utils.Http;
using LtiAdvantage.Lti;
using LtiAdvantage.NamesRoleProvisioningService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using Microsoft.Azure.Documents.Linq;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace Assessment.App.Functions.Teacher
{
    /// <summary>
    /// Azure Functions used by the Educator Interface of the Assessment App.
    /// </summary>
    public class TeacherApi
    {
        private readonly DatabaseClient _databaseClient;
        private readonly LtiAssessmentClient.Factory _ltiAssessmentClientFactory;

        public TeacherApi(DatabaseClient databaseClient, LtiAssessmentClient.Factory ltiAssessmentClientFactory)
        {
            _databaseClient = databaseClient;
            _ltiAssessmentClientFactory = ltiAssessmentClientFactory;
        }

        [FunctionName(nameof(ListAssessments))]
        public async Task<IActionResult> ListAssessments(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "list-assessments")]
            HttpRequest req,
            [CosmosDB(
                "assessment-app-db",
                "Assessments",
                ConnectionStringSetting = "ReadPlatformData")]
            IDocumentClient assessmentsClient
        )
        {
            var assessmentsUri = UriFactory.CreateDocumentCollectionUri("assessment-app-db", "Assessments");
            var query = assessmentsClient
                .CreateDocumentQuery<AssessmentItem>(assessmentsUri, "SELECT * FROM a",
                    new FeedOptions() {EnableCrossPartitionQuery = true})
                .AsDocumentQuery();
            var response = new ListAssessmentsResponse();
            while (query.HasMoreResults)
            {
                foreach (AssessmentItem item in await query.ExecuteNextAsync())
                {
                    response.Assessments.Add(AssessmentDto.CreateFromItem(item));
                }
            }

            return new OkObjectResult(response);
        }

        [FunctionName(nameof(ListQuestionBanks))]
        public async Task<IActionResult> ListQuestionBanks(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "list-question-banks")]
            HttpRequest req,
            [CosmosDB(
                "assessment-app-db",
                "QuestionBanks",
                ConnectionStringSetting = "ReadPlatformData")]
            IDocumentClient questionBanksClient
        )
        {
            var questionBanksUri = UriFactory.CreateDocumentCollectionUri("assessment-app-db", "QuestionBanks");
            var query = questionBanksClient
                .CreateDocumentQuery<QuestionBankItem>(questionBanksUri, "SELECT * FROM q",
                    new FeedOptions() {EnableCrossPartitionQuery = true})
                .AsDocumentQuery();
            var response = new ListQuestionBanksResponse();
            while (query.HasMoreResults)
            {
                foreach (QuestionBankItem item in await query.ExecuteNextAsync())
                {
                    response.QuestionBanks.Add(item);
                }
            }

            return new OkObjectResult(response);
        }

        [FunctionName(nameof(GetQuestionBank))]
        public async Task<IActionResult> GetQuestionBank(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "get-question-bank/{id}")]
            HttpRequest req,
            [CosmosDB(
                "assessment-app-db",
                "QuestionBanks",
                ConnectionStringSetting = "ReadPlatformData",
                Id = "{id}",
                PartitionKey = "{id}")]
            QuestionBankItem questionBankItem
        )
        {
            var response = new GetQuestionBankResponse
            {
                QuestionBank = questionBankItem,
                Questions = await _databaseClient.GetQuestions(questionBankItem.QuestionIds)
            };

            return new OkObjectResult(response);
        }

        [FunctionName(nameof(GetAssessment))]
        public async Task<IActionResult> GetAssessment(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "get-assessment/{id}")]
            HttpRequest req,
            [CosmosDB(
                "assessment-app-db",
                "Assessments",
                ConnectionStringSetting = "ReadPlatformData",
                Id = "{id}",
                PartitionKey = "{id}")]
            AssessmentItem assessmentItem
        )
        {
            var response = new GetAssessmentResponse
            {
                Assessment = AssessmentDto.CreateFromItem(assessmentItem),
                Questions = await _databaseClient.GetQuestions(assessmentItem.QuestionIds)
            };

            return new OkObjectResult(response);
        }

        [FunctionName(nameof(GetQuestion))]
        public async Task<IActionResult> GetQuestion(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "get-question/{id}")]
            HttpRequest req,
            [CosmosDB(
                "assessment-app-db",
                "Questions",
                ConnectionStringSetting = "ReadPlatformData",
                Id = "{id}",
                PartitionKey = "{id}")]
            QuestionItem questionItem
        )
        {
            return new OkObjectResult(questionItem);
        }

        [FunctionName(nameof(CreateQuestion))]
        public async Task<IActionResult> CreateQuestion(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "create-question")]
            HttpRequest req,
            [CosmosDB(
                "assessment-app-db",
                "Questions",
                ConnectionStringSetting = "ReadWritePlatformData")]
            IAsyncCollector<QuestionItem> questionItemCollector
        )
        {
            var id = Guid.NewGuid().ToString();
            string requestBody;
            using (var streamReader = new StreamReader(req.Body))
            {
                requestBody = await streamReader.ReadToEndAsync();
            }

            var questionItem = JsonConvert.DeserializeObject<QuestionItem>(requestBody);
            await questionItemCollector.AddAsync(new QuestionItem()
            {
                Id = id,
                Answer = questionItem.Answer,
                Description = questionItem.Description,
                Name = questionItem.Name,
                Options = questionItem.Options,
                LastModified = DateTime.UtcNow,
                TextType = questionItem.TextType

            });
            return new OkObjectResult(new CreateQuestionResponse() {Id = id});
        }

        [FunctionName(nameof(UpdateQuestion))]
        public async Task<IActionResult> UpdateQuestion(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "update-question")]
            HttpRequest req,
            [CosmosDB(
                "assessment-app-db",
                "Questions",
                ConnectionStringSetting = "ReadWritePlatformData")]
            IAsyncCollector<QuestionItem> questionItemCollector
        )
        {
            string requestBody;
            using (var streamReader = new StreamReader(req.Body))
            {
                requestBody = await streamReader.ReadToEndAsync();
            }

            var questionItem = JsonConvert.DeserializeObject<QuestionItem>(requestBody);

            await questionItemCollector.AddAsync(new QuestionItem()
            {
                Id = questionItem.Id,
                Answer = questionItem.Answer,
                Description = questionItem.Description,
                Name = questionItem.Name,
                Options = questionItem.Options,
                LastModified = DateTime.UtcNow,
            });
            return new OkResult();
        }

        [FunctionName(nameof(CreateQuestionBank))]
        public async Task<IActionResult> CreateQuestionBank(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "create-question-bank")]
            HttpRequest req,
            [CosmosDB(
                "assessment-app-db",
                "QuestionBanks",
                ConnectionStringSetting = "ReadWritePlatformData")]
            IAsyncCollector<QuestionBankItem> questionBankItemCollector
        )
        {
            var id = Guid.NewGuid().ToString();
            string requestBody;
            using (var streamReader = new StreamReader(req.Body))
            {
                requestBody = await streamReader.ReadToEndAsync();
            }

            var questionBankItem = JsonConvert.DeserializeObject<QuestionBankItem>(requestBody);
            await questionBankItemCollector.AddAsync(new QuestionBankItem()
            {
                Id = id,
                AssessmentType = questionBankItem.AssessmentType,
                Description = questionBankItem.Description,
                LastModified = DateTime.UtcNow,
                Name = questionBankItem.Name,
                QuestionIds = questionBankItem.QuestionIds,
            });
            return new OkObjectResult(new CreateQuestionBankResponse() {Id = id});
        }

        [FunctionName(nameof(UpdateQuestionBank))]
        public async Task<IActionResult> UpdateQuestionBank(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "update-question-bank")]
            HttpRequest req,
            [CosmosDB(
                "assessment-app-db",
                "QuestionBanks",
                ConnectionStringSetting = "ReadWritePlatformData")]
            IAsyncCollector<QuestionBankItem> questionBankItemCollector
        )
        {
            string requestBody;
            using (var streamReader = new StreamReader(req.Body))
            {
                requestBody = await streamReader.ReadToEndAsync();
            }

            var questionBankItem = JsonConvert.DeserializeObject<QuestionBankItem>(requestBody);

            await questionBankItemCollector.AddAsync(new QuestionBankItem()
            {
                Id = questionBankItem.Id,
                AssessmentType = questionBankItem.AssessmentType,
                Description = questionBankItem.Description,
                LastModified = DateTime.UtcNow,
                Name = questionBankItem.Name,
                QuestionIds = questionBankItem.QuestionIds,
            });
            return new OkResult();
        }

        [FunctionName(nameof(UpdateAssessment))]
        public async Task<IActionResult> UpdateAssessment(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "update-assessment")]
            HttpRequest req,
            [CosmosDB(
                "assessment-app-db",
                "Assessments",
                ConnectionStringSetting = "ReadPlatformData")]
            IDocumentClient assessmentsClient
        )
        {
            string requestBody;
            using (var streamReader = new StreamReader(req.Body))
            {
                requestBody = await streamReader.ReadToEndAsync();
            }

            var assessmentDto = JsonConvert.DeserializeObject<AssessmentDto>(requestBody);

            var documentUri = UriFactory.CreateDocumentUri("assessment-app-db", "Assessments", assessmentDto.Id);
            var options = new RequestOptions() {PartitionKey = new PartitionKey(assessmentDto.Id)};
            var documentResponse = await assessmentsClient.ReadDocumentAsync<AssessmentItem>(
                documentUri, options);
            await assessmentsClient.UpsertDocumentAsync(
                UriFactory.CreateDocumentCollectionUri("assessment-app-db", "Assessments"), new AssessmentItem()
                {
                    Id = assessmentDto.Id,
                    LmsContextId = documentResponse.Document.LmsContextId,
                    LmsResourceLinkId = documentResponse.Document.LmsResourceLinkId,
                    ContextMembershipUrl = documentResponse.Document.ContextMembershipUrl,
                    AssessmentType = assessmentDto.AssessmentType,
                    Description = assessmentDto.Description,
                    LastModified = DateTime.UtcNow,
                    Deadline = assessmentDto.Deadline,
                    Duration = TimeSpan.FromSeconds(assessmentDto.DurationSeconds),
                    Name = assessmentDto.Name,
                    Status = assessmentDto.Status,
                    QuestionIds = assessmentDto.QuestionIds,
                    StudentIds = assessmentDto.StudentIds,
                }
            );
            return new OkResult();
        }

        [FunctionName(nameof(GetStudents))]
        public async Task<IActionResult> GetStudents(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "get-students/{assessmentId}")]
            HttpRequest req,
            [CosmosDB(
                "assessment-app-db",
                "Assessments",
                ConnectionStringSetting = "ReadPlatformData",
                Id = "{assessmentId}",
                PartitionKey = "{assessmentId}")]
            AssessmentItem assessmentItem,
            [CosmosDB(
                databaseName: "assessment-app-db",
                collectionName: "platform-registration-container",
                ConnectionStringSetting = "ReadPlatformData",
                Id = "main",
                PartitionKey = "main")]
            PlatformInfoItem platformInfoItem,
            ILogger log
        )
        {
            var ltiAssessmentClient = _ltiAssessmentClientFactory.Create(platformInfoItem, assessmentItem);
            var members = await ltiAssessmentClient.GetMembers();
            var students = new List<MemberDto>();
            foreach (var m in members)
            {
                if (!IsStudent(m))
                {
                    continue;
                }

                var picture = "";
                if (m.Picture != null)
                {
                    picture = m.Picture.ToString();
                }

                students.Add(new MemberDto()
                {
                    Id = m.UserId,
                    Email = m.Email,
                    FamilyName = m.FamilyName,
                    GivenName = m.GivenName,
                    Picture = picture,
                });
            }

            return new OkObjectResult(new GetStudentsResponse() {Students = students});
        }

        [FunctionName(nameof(DeleteQuestions))]
        public async Task<IActionResult> DeleteQuestions(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "delete-questions")]
            HttpRequest req
        )
        {
            var requestData = await req.ReadJsonBody<DeleteQuestionsRequest>();
            await _databaseClient.DeleteQuestions(requestData.QuestionIds);
            return new OkResult();
        }
        
        [FunctionName(nameof(DeleteQuestionBanks))]
        public async Task<IActionResult> DeleteQuestionBanks(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "delete-question-banks")]
            HttpRequest req
        )
        {
            var requestData = await req.ReadJsonBody<DeleteQuestionBanksRequest>();
            await _databaseClient.DeleteQuestionBanks(requestData.QuestionBankIds);
            return new OkResult();
        }
        
        [FunctionName(nameof(GetAssessmentStats))]
        public async Task<IActionResult> GetAssessmentStats(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "get-assessment-stats/{assessmentId}")]
            HttpRequest req, string assessmentId)
        {
            var responses = await _databaseClient.GetAssessmentResponses(assessmentId);
            return new OkObjectResult(new AssessmentStatsResponse()
            {
                StudentResponses = responses.Select(StudentResultDto.CreateFromItem).ToList(),
            });
        }
        
        public static bool IsStudent(Member m)
        {
            return m.Roles.Contains(Role.ContextLearner) || m.Roles.Contains(Role.InstitutionLearner);
        }
    }
    

}