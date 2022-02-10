using System;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using Assessment.App.Database;
using Assessment.App.Database.Model;
using Assessment.App.Functions.Student.Dto;
using Assessment.App.Lti;
using Assessment.App.Utils.Http;
using LtiAdvantage;
using LtiAdvantage.AssignmentGradeServices;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace Assessment.App.Functions.Student
{
    /// <summary>
    /// Azure Functions used by the Student Interface of the Assessment App.
    /// </summary>
    public class StudentApi
    {
        private readonly DatabaseClient _databaseClient;
        private readonly LtiAssessmentClient.Factory _ltiAssessmentClientFactory;

        public StudentApi(DatabaseClient databaseClient, LtiAssessmentClient.Factory ltiAssessmentClientFactory)
        {
            _databaseClient = databaseClient;
            _ltiAssessmentClientFactory = ltiAssessmentClientFactory;
        }

        [FunctionName(nameof(GetStudentAssessment))]
        public async Task<IActionResult> GetStudentAssessment(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "get-student-assessment/{assessmentId}")]
            HttpRequest req,
            [CosmosDB(
                databaseName: "assessment-app-db",
                collectionName: "platform-registration-container",
                ConnectionStringSetting = "ReadPlatformData",
                Id = "main",
                PartitionKey = "main")]
            PlatformInfoItem platformInfoItem,
            [CosmosDB(
                "assessment-app-db",
                "Assessments",
                ConnectionStringSetting = "ReadPlatformData",
                Id = "{assessmentId}",
                PartitionKey = "{assessmentId}")]
            AssessmentItem assessmentItem
        )
        {
            var ltiAssessmentClient = _ltiAssessmentClientFactory.Create(platformInfoItem, assessmentItem);
            var member = await ltiAssessmentClient.GetMemberByEmail(new[] {req.GetUserEmail()});
            var studentResponse = await _databaseClient.GetStudentResponse(assessmentItem.Id, member.UserId);
            var result = CreateStudentAssessment(assessmentItem, studentResponse);
            return new OkObjectResult(result);
        }

        [FunctionName(nameof(GetStudentQuestions))]
        public async Task<IActionResult> GetStudentQuestions(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "get-student-questions/{assessmentId}")]
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
            var member = await ltiAssessmentClient.GetMemberByEmail(new[] {req.GetUserEmail()});

            var response = new StudentAssessmentQuestions();
            if (assessmentItem.QuestionIds.Count == 0)
            {
                log.LogInformation("No questions in the assessment.");
                return new OkObjectResult(response);
            }

            var studentResponse = await _databaseClient.GetStudentResponse(assessmentItem.Id, member.UserId);
            if (studentResponse == null)
            {
                studentResponse = await _databaseClient.UpsertStudentResponse(
                    new StudentResponseItem()
                    {
                        Id = Guid.NewGuid().ToString(),
                        AssessmentId = assessmentItem.Id,
                        StudentId = member.UserId,
                        StartTime = DateTime.UtcNow,
                        Status = StudentResponseStatus.InProgress,
                    });
            }

            response.Assessment = CreateStudentAssessment(assessmentItem, studentResponse);

            var questionItems =
                (await _databaseClient.GetQuestions(assessmentItem.QuestionIds)).ToDictionary(q => q.Id);

            foreach (var questionId in assessmentItem.QuestionIds)
            {
                var item = questionItems[questionId];
                var chosenOption = -1;
                if (studentResponse.Responses.TryGetValue(questionId, out var responseInfo))
                {
                    chosenOption = responseInfo.ChosenOption;
                }

                response.Questions.Add(new StudentQuestionDto()
                {
                    Id = questionId,
                    Name = item.Name,
                    Description = item.Description,
                    Options = item.Options,
                    ChosenOption = chosenOption,
                    TextType=item.TextType
                });
            }

            return new OkObjectResult(response);
        }

        [FunctionName(nameof(SubmitStudentAssessment))]
        public async Task<IActionResult> SubmitStudentAssessment(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "submit-student-assessment/{assessmentId}")]
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
            PlatformInfoItem platformInfoItem
        )
        {
            var ltiAssessmentClient = _ltiAssessmentClientFactory.Create(platformInfoItem, assessmentItem);
            var member = await ltiAssessmentClient.GetMemberByEmail(new[] {req.GetUserEmail()});

            var previousResponseItem = await _databaseClient.GetStudentResponse(assessmentItem.Id, member.UserId);
            if (previousResponseItem == null)
            {
                return new InternalServerErrorResult();
            }

            var requestData = await req.ReadJsonBody<SubmitStudentAssessmentRequest>();

            var questionItems =
                (await _databaseClient.GetQuestions(assessmentItem.QuestionIds)).ToDictionary(q => q.Id);

            var correctAnswers = 0;
            foreach (var questionId in assessmentItem.QuestionIds)
            {
                if (requestData.Responses.TryGetValue(questionId, out var responseInfo))
                {
                    if (responseInfo.ChosenOption == questionItems[questionId].Answer)
                    {
                        correctAnswers += 1;
                    }
                }
            }

            var score = new Score()
            {
                ActivityProgress = ActivityProgress.Completed,
                GradingProgress = GradingProgess.FullyGraded,
                ScoreGiven = 100.0 * correctAnswers / assessmentItem.QuestionIds.Count,
                ScoreMaximum = 100.0,
                TimeStamp = DateTime.UtcNow,
                UserId = member.UserId,
            };
            
            var updatedResponseItem = new StudentResponseItem()
            {
                Id = previousResponseItem.Id,
                AssessmentId = previousResponseItem.AssessmentId,
                StudentId = previousResponseItem.StudentId,
                StartTime = previousResponseItem.StartTime,
                EndTime = DateTime.UtcNow,
                Status = StudentResponseStatus.Complete,
                Score = score.ScoreGiven,
                Responses = requestData.Responses,
            };
            
            await _databaseClient.UpsertStudentResponse(updatedResponseItem);

            await ltiAssessmentClient.SubmitScore(score);

            return new OkResult();
        }

        private static StudentAssessmentDto CreateStudentAssessment(AssessmentItem assessmentItem,
            StudentResponseItem studentResponse)
        {
            var result = StudentAssessmentDto.CreateFromItem(assessmentItem);
            if (studentResponse != null)
            {
                result.Status = studentResponse.Status;
                result.StartTime = studentResponse.StartTime;
            }

            return result;
        }
    } 
}