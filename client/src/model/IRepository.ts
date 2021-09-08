import {Assessment} from "./Assessment";
import {QuestionBank} from "./QuestionBank";
import {Question} from "./Question";
import { Member } from "./Member";
import {StudentAssessment} from "./StudentAssessment";
import {StudentAssessmentQuestions} from "./StudentAssessmentQuestions";
import {AssessmentStatistics} from "./AssessmentStatistics";

export interface IRepository {
    getAssessments(): Promise<Assessment[]>;
    getAssessmentById(id: string): Promise<Assessment>;
    getQuestionBanks(): Promise<QuestionBank[]>;
    getQuestionBankById(id: string): Promise<QuestionBank>;
    getQuestionsFromQuestionBank(bankId: string): Promise<Question[]>;
    getQuestionById(id: string): Promise<Question>;
    updateAssessment(a: Assessment): void;
    updateQuestion(q: Question): void;
    updateQuestionBank(b: QuestionBank): void;
    saveNewQuestion(bankId: string, q: Question): Promise<Question>;
    createNewQuestionBank(bank: QuestionBank): Promise<QuestionBank>;
    getStudents(assessmentId: string): Promise<Member[]>;
    getAssessmentStats(assessmentId: string): Promise<AssessmentStatistics>;
    getStudentAssessment(assessmentId: string): Promise<StudentAssessment>;
    getStudentQuestions(assessmentId: string): Promise<StudentAssessmentQuestions>;
    submitStudentAssessment(assessmentId: string, chosenOptions: { [id: string]: number }): void;
    deleteQuestions(questionIds: string[]): void;
    deleteQuestionBanks(questionBankIds: string[]): void;
    isReady(): boolean;
}
