import {Assessment} from "./Assessment";
import {QuestionBank} from "./QuestionBank";
import {Question} from "./Question";
import axios from "axios";
import {IRepository} from "./IRepository";
import {Member} from "./Member";
import {StudentAssessment} from "./StudentAssessment";
import {
    IPublicClientApplication,
    AccountInfo,
    InteractionRequiredAuthError,
    InteractionStatus
} from "@azure/msal-browser";
import {StudentAssessmentQuestions} from "./StudentAssessmentQuestions";
import {QuestionResponseInfo} from "./QuestionResponseInfo";
import {AssessmentStatistics} from "./AssessmentStatistics";

interface ListAssessmentsResponse {
    assessments: Assessment[],
}

interface ListQuestionBanksResponse {
    questionBanks: QuestionBank[],
}

interface GetAssessmentResponse {
    assessment: Assessment,
    questions: Question[],
}

interface GetQuestionBankResponse {
    questionBank: QuestionBank,
    questions: Question[],
}

interface CreateQuestionResponse {
    id: string,
}

interface CreateQuestionBankResponse {
    id: string,
}

interface GetStudentsResponse {
    students: Member[],
}

interface SubmitStudentAssessmentRequest {
    responses: { [id: string]: QuestionResponseInfo },
}

// For more details see
// https://stackoverflow.com/questions/65692061/casting-dates-properly-from-an-api-response-in-typescript
const isoDateFormat = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/;

function isIsoDateString(value: any): boolean {
    return value && typeof value === "string" && isoDateFormat.test(value);
}

export function handleDates(body: any) {
    if (body === null || body === undefined || typeof body !== "object") {
        return body;
    }

    for (const key of Object.keys(body)) {
        const value = body[key];
        if (isIsoDateString(value)) {
            body[key] = new Date(value);
        } else if (typeof value === "object") {
            handleDates(value);
        }
    }
}

axios.interceptors.response.use(originalResponse => {
    handleDates(originalResponse.data);
    return originalResponse;
});

export class Repository implements IRepository {
    msalInstance: IPublicClientApplication;
    accounts: AccountInfo[];
    inProgress: InteractionStatus;
    assessments?: { [id: string]: Assessment };
    questionBanks?: { [id: string]: QuestionBank };
    students: { [id: string]: Member[] } = {};
    questions: { [id: string]: Question } = {};

    constructor(msalInstance: IPublicClientApplication, accounts: AccountInfo[], inProgress: InteractionStatus) {
        this.msalInstance = msalInstance;
        this.accounts = accounts;
        this.inProgress = inProgress;
    }

    private async getAssessmentsDict(): Promise<{ [id: string]: Assessment }> {
        const response = await axios.get<ListAssessmentsResponse>("/api/list-assessments");
        console.log(response)
        this.assessments = response.data.assessments.reduce((a, e) => ({...a, [e.id]: e}), {});
        return this.assessments;
    }

    private cacheQuestions(questionsToCache: Question[]) {
        for (const q of questionsToCache) {
            this.questions[q.id] = q;
        }
    }

    public async getAssessments(): Promise<Assessment[]> {
        return Object.values(await this.getAssessmentsDict());
    }

    public async getAssessmentById(id: string): Promise<Assessment> {
        const assessments = await this.getAssessmentsDict();
        const response = await axios.get<GetAssessmentResponse>(`/api/get-assessment/${id}`);
        assessments[response.data.assessment.id] = response.data.assessment;
        this.cacheQuestions(response.data.questions);
        return assessments[id];
    }

    private async getQuestionBanksDict(): Promise<{ [id: string]: QuestionBank }> {
        const response = await axios.get<ListQuestionBanksResponse>("/api/list-question-banks");
        this.questionBanks = response.data.questionBanks.reduce((a, e) => ({...a, [e.id]: e}), {});
        return this.questionBanks;
    }

    public async getQuestionBanks(): Promise<QuestionBank[]> {
        return Object.values(await this.getQuestionBanksDict());
    }

    public async getQuestionBankById(id: string): Promise<QuestionBank> {
        const questionBanks = await this.getQuestionBanksDict();
        const response = await axios.get<GetQuestionBankResponse>(`/api/get-question-bank/${id}`);
        questionBanks[response.data.questionBank.id] = response.data.questionBank;
        this.cacheQuestions(response.data.questions);
        return questionBanks[id];
    }

    public async getQuestionsFromQuestionBank(bankId: string): Promise<Question[]> {
        const questionBank = await this.getQuestionBankById(bankId);
        return questionBank.questionIds.map((id) => this.questions[id]);
    }

    public async getQuestionById(id: string): Promise<Question> {
        if (!(id in this.questions)) {
            const response = await axios.get<Question>(`/api/get-question/${id}`);
            this.questions[response.data.id] = response.data;
        }
        return this.questions[id];
    }

    public async updateAssessment(a: Assessment) {
        await axios.post(`/api/update-assessment`, a);
        if (this.assessments != null) {
            this.assessments[a.id] = {...a};
        }
    }

    public async updateQuestion(q: Question) {
        await axios.post(`/api/update-question`, q);
        this.questions[q.id] = {...q};
    }

    public async updateQuestionBank(b: QuestionBank) {
        await axios.post("/api/update-question-bank", b);
        if (this.questionBanks != null) {
            this.questionBanks[b.id] = {...b};
        }
    }

    public async saveNewQuestion(bankId: string, q: Question): Promise<Question> {
        const response = await axios.post<CreateQuestionResponse>("/api/create-question", q);
        const questionBank = await this.getQuestionBankById(bankId);
        questionBank.questionIds.push(response.data.id);
        await this.updateQuestionBank(questionBank);
        const result = {...q, id: response.data.id};
        this.questions[result.id] = result;
        return result;
    }

    public async createNewQuestionBank(bank: QuestionBank): Promise<QuestionBank> {
        const response = await axios.post<CreateQuestionBankResponse>("/api/create-question-bank", bank);
        const result = {...bank, id: response.data.id};
        if (this.questionBanks != null) {
            this.questionBanks[result.id] = result;
        }
        return result;
    }

    public async getStudents(assessmentId: string): Promise<Member[]> {
        if (!(assessmentId in this.students)) {
            const response = await axios.get<GetStudentsResponse>(`/api/get-students/${assessmentId}`);
            this.students[assessmentId] = response.data.students;
        }
        return this.students[assessmentId];
    }

    public async getAssessmentStats(assessmentId: string): Promise<AssessmentStatistics> {
        const response = await axios.get<AssessmentStatistics>(`/api/get-assessment-stats/${assessmentId}`);
        return response.data;
    }

    public async getStudentAssessment(assessmentId: string): Promise<StudentAssessment> {
        const accessToken = await this.getAccessToken();
        const response = await axios.get<StudentAssessment>(`/api/get-student-assessment/${assessmentId}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            }
        });
        return response.data;
    }

    public async getStudentQuestions(assessmentId: string): Promise<StudentAssessmentQuestions> {
        const accessToken = await this.getAccessToken();
        const response = await axios.get<StudentAssessmentQuestions>(`/api/get-student-questions/${assessmentId}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            }
        });
        return response.data;
    }


    public async submitStudentAssessment(assessmentId: string, chosenOptions: { [id: string]: number }) {
        const accessToken = await this.getAccessToken();
        const request: SubmitStudentAssessmentRequest = {
            responses: Object.entries(chosenOptions).reduce((a, item) => ({
                ...a,
                [item[0]]: { chosenOption: item[1] }
            }), {}),
        };
        await axios.post(`/api/submit-student-assessment/${assessmentId}`, request, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
        });
    }

    public async deleteQuestions(questionIds: string[]) {
        await axios.post("/api/delete-questions", {
            questionIds: questionIds,
        });
    }

    public async deleteQuestionBanks(questionBankIds: string[]) {
        await axios.post(`/api/delete-question-banks`, {
            questionBankIds: questionBankIds,
        });
    }

    public isReady(): boolean {
        return this.inProgress === "none" && this.accounts.length > 0;
    }

    private async getAccessToken(): Promise<string> {
        if (this.isReady()) {
            // Retrieve an access token
            const accessTokenRequest = {
                account: this.accounts[0],
                scopes: ["user.read"],
            };
            const response = await this.msalInstance.acquireTokenSilent(accessTokenRequest).catch((error) => {
                if (error instanceof InteractionRequiredAuthError) {
                    this.msalInstance.acquireTokenRedirect(accessTokenRequest);
                }
                console.log(error);
            });
            console.log(response)
            if (!response) {
                throw new Error("Unable to get access token.");
            }
            return response.accessToken;
        }
        console.log(`Inside repo: ${this.isReady()}`);
        throw new Error("Unable to get access token.");
    }
}
