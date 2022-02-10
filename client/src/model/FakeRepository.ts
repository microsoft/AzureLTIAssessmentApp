import {IRepository} from "./IRepository";
import {Assessment} from "./Assessment";
import {QuestionBank} from "./QuestionBank";
import {Question} from "./Question";
import {AssessmentStatus} from "./AssessmentStatus";
import { Member } from "./Member";
import { StudentQuestion } from "./StudentQuestion";
import {StudentAssessment} from "./StudentAssessment";
import {StudentAssessmentQuestions} from "./StudentAssessmentQuestions";
import {AssessmentStatistics} from "./AssessmentStatistics";

export class FakeRepository implements IRepository {
    assessments: { [id: string]: Assessment };
    questionBanks: { [id: string]: QuestionBank };
    questions: { [id: string]: Question };
    members: { [id: string]: Member };

    constructor() {
        this.members = {
            '0': {
                id: '0',
                email: 'ivanivanov@ucl.ac.uk',
                familyName: 'Ivanov',
                givenName: 'Ivan',
                picture: '',
            },
            '1': {
                id: '1',
                email: 'svetaivanova@ucl.ac.uk',
                familyName: 'Ivanova',
                givenName: 'Sveta',
                picture: '',
            },
            '2': {
                id: '2',
                email: 'mashaivanova@ucl.ac.uk',
                familyName: 'Ivanova',
                givenName: 'Masha',
                picture: '',
            }
        }
        this.assessments = {
            '0': {
                id: '0',
                name: "Introductory Programming",
                description: "",
                lastModified: new Date(),
                deadline: new Date(),
                durationSeconds: 60 * 60,
                assessmentType: "Quiz",
                status: AssessmentStatus.Draft,
                questionIds: ['6', '5', '2', '3', '4'],
                studentIds: ['1', '2'],
            },
            '1': {
                id: '1',
                name: "Functional Programming",
                description: "",
                lastModified: new Date(),
                deadline: new Date(),
                durationSeconds: 60 * 60,
                assessmentType: "Quiz",
                status: AssessmentStatus.Complete,
                questionIds: ['0', '1', '5', '3', '7'],
                studentIds: ['0', '1', '2'],
            },
            '2': {
                id: '2',
                name: "Databases",
                description: "",
                lastModified: new Date(),
                deadline: new Date(),
                durationSeconds: 60 * 60,
                assessmentType: "Quiz",
                status: AssessmentStatus.InitialSetup,
                questionIds: ['5', '1', '2', '6', '4'],
                studentIds: ['0', '1', '2'],
            },
            '3': {
                id: '3',
                name: "Machine Learning for Domain Specialists",
                description: "",
                lastModified: new Date(),
                deadline: new Date(),
                durationSeconds: 60 * 60,
                assessmentType: "Quiz",
                status: AssessmentStatus.Ongoing,
                questionIds: ['0', '5', '2', '6', '4'],
                studentIds: ['0', '1', '2'],
            },
            '4': {
                id: '4',
                name: "Software Engineering",
                description: "",
                lastModified: new Date(),
                deadline: new Date(),
                durationSeconds: 60 * 60,
                assessmentType: "Quiz",
                status: AssessmentStatus.Published,
                questionIds: ['6', '5', '4', '3', '2'],
                studentIds: ['0', '1'],
            },
            '5': {
                id: '5',
                name: "Architecture and Hardware",
                description: "",
                lastModified: new Date(),
                deadline: new Date(),
                durationSeconds: 60 * 60,
                assessmentType: "Quiz",
                status: AssessmentStatus.Draft,
                questionIds: ['5', '1', '7', '3', '2'],
                studentIds: ['1', '2'],
            },
            '6': {
                id: '6',
                name: "App Engineering",
                description: "",
                lastModified: new Date(),
                deadline: new Date(),
                durationSeconds: 60 * 60,
                assessmentType: "Quiz",
                status: AssessmentStatus.Draft,
                questionIds: ['5', '7', '2', '6', '4'],
                studentIds: ['0', '1', '2'],
            },
            '7': {
                id: '7',
                name: "Algorithmics",
                description: "",
                lastModified: new Date(),
                deadline: new Date(),
                durationSeconds: 60 * 60,
                assessmentType: "Quiz",
                status: AssessmentStatus.InitialSetup,
                questionIds: ['5', '6', '2', '3', '7'],
                studentIds: ['0', '2'],
            },
        }

        this.questionBanks = {
            '0': {
                id: '0',
                name: "Introduction to Machine Learning: Pre-Lecture Quiz",
                description: "",
                lastModified: new Date(),
                questionIds: ['0', '1', '2'],
                assessmentType: "Quiz",
            },
            '1': {
                id: '1',
                name: "Software Engineering MCQ",
                description: "",
                lastModified: new Date(),
                questionIds: ['3', '4', '5', '6', '7', '8'],
                assessmentType: "Quiz",
            },
            '2': {
                id: '2',
                name: "COMP0066",
                description: "",
                lastModified: new Date(),
                questionIds: [],
                assessmentType: "Quiz",
            },
            '3': {
                id: '3',
                name: "COMP0068",
                description: "",
                lastModified: new Date(),
                questionIds: [],
                assessmentType: "Quiz",
            },
            '4': {
                id: '4',
                name: "COMP0147",
                description: "",
                lastModified: new Date(),
                questionIds: [],
                assessmentType: "Quiz",
            },
        }
        this.questions = {
            '0': {
                id: '0',
                name: "Applications of machine learning",
                description: "Applications of machine learning are all around us",
                lastModified: new Date(),
                options: ["True", "False"],
                answer: 0,
                textType:"text",
            },
            '1': {
                id: '1',
                name: "Technical difference between classical ML and deep learning",
                description: "What is the technical difference between classical ML and deep learning?",
                lastModified: new Date(),
                options: [
                    "Classical ML was invented first",
                    "The use of neural networks",
                    "Deep learning is used in robots",
                ],
                answer: 1,
                textType:"text"
            },
            '2': {
                id: '2',
                name: "Why might a business want to use ML strategies?",
                description: "Why might a business want to use ML strategies?",
                lastModified: new Date(),
                options: [
                    "To automate the solving of multi-dimensional problems",
                    "To customise a shopping experience based on the type of the customer",
                    "Both of the above",
                ],
                answer: 2,
                textType:"text"
            },
            '3': {
                id: '3',
                name: "Software is considered to be collection of:",
                description: "Software is considered to be collection of:",
                lastModified: new Date(),
                options: [
                    "Programming code",
                    "Associated libraries",
                    "Documentations",
                    "All of the above",
                ],
                answer: 3,
                textType:"text"
            },
            '4': {
                id: '4',
                name: "The process of developing a software product",
                description: "The process of developing a software product using software engineering principles and methods is referred to as:",
                lastModified: new Date(),
                options: [
                    "Software Engineering",
                    "Software Evolution",
                    "System Models",
                    "Software Models",
                ],
                answer: 1,
                textType:"text"
            },
            '5': {
                id: '5',
                name: "Software evolution",
                description: "Lehman has given laws for software evolution and he divided the software into ___ different categories",
                lastModified: new Date(),
                options: [
                    "6",
                    "2",
                    "3",
                    "5",
                ],
                answer: 2,
                textType:"text"
            },
            '6': {
                id: '6',
                name: "E-Type software evolution",
                description: "Which of the following is not consider laws for E-Type software evolution?",
                lastModified: new Date(),
                options: [
                    "Continuing quality",
                    "Continuing change",
                    "Increasing complexity",
                    "Self-regulation",
                ],
                answer: 0,
                textType:"text"
            },
            '7': {
                id: '7',
                name: "Characteristics of good software",
                description: "Which of the following is the Characteristics of good software?",
                lastModified: new Date(),
                options: [
                    "Transitional",
                    "Operational",
                    "Maintenance",
                    "All of the above",
                ],
                answer: 3,
                textType:"text"
            },
            '8': {
                id: '8',
                name: "Need of Software Engineering",
                description: "Where there is a need of Software Engineering?",
                lastModified: new Date(),
                options: [
                    "For Large Software",
                    "To reduce Cost",
                    "Software Quality Management",
                    "All of the above",
                ],
                answer: 3,
                textType:"text"
            },
        }
    }

    public async getAssessments(): Promise<Assessment[]> {
        return Object.values(this.assessments);
    }

    public async getAssessmentById(id: string): Promise<Assessment> {
        return this.assessments[id];
    }
    public async getQuestionBanks(): Promise<QuestionBank[]> {
        return Object.values(this.questionBanks);
    }
    public async getQuestionBankById(id: string): Promise<QuestionBank> {
        return this.questionBanks[id];
    }
    public async getQuestionsFromQuestionBank(bankId: string): Promise<Question[]> {
        return this.questionBanks[bankId].questionIds.map((id) => this.questions[id]);
    }
    public async getQuestionById(id: string): Promise<Question> {
        return this.questions[id];
    }
    public async  updateAssessment(a: Assessment) {
        this.assessments[a.id] = {...a};
    }
    public async updateQuestion(q: Question) {
        this.questions[q.id] = {...q};
    }
    public async updateQuestionBank(b: QuestionBank) {
        this.questionBanks[b.id] = {...b}
    }
    public async saveNewQuestion(bankId: string, q: Question): Promise<Question> {
        const nextQuestionId = Object.keys(this.questions).length.toString();
        const questionToSave = {...q, id: nextQuestionId};
        this.questions[nextQuestionId] = questionToSave;
        this.questionBanks[bankId].questionIds.push(nextQuestionId);
        return questionToSave;
    }
    public async createNewQuestionBank(bank: QuestionBank): Promise<QuestionBank> {
        const nextQuestionBankId = Object.keys(this.questionBanks).length.toString();
        const newQuestionBank = {
            ...bank,
            id: nextQuestionBankId,
        }
        this.questionBanks[nextQuestionBankId] = newQuestionBank;
        return newQuestionBank;
    }
    public async getStudents(id: string): Promise<Member[]> {
        return Object.values(this.members);
    }

    public async getAssessmentStats(assessmentId: string): Promise<AssessmentStatistics> {
        throw new Error("Not implemented");
    }

    public async getStudentAssessment(assessmentId:string): Promise<StudentAssessment> {
        throw new Error("Not implemented");
    }

    public async getStudentQuestions(assessmentId: string): Promise<StudentAssessmentQuestions> {
        throw new Error("Not implemented");
    }

    public async submitStudentAssessment(assessmentId: string, chosenOptions: { [id: string]: number }) {}

    public isReady(): boolean {
        return true;
    }

    public async deleteQuestions(questionIds: string[]) {
        throw new Error("Not implemented");
    }

    public async deleteQuestionBanks(questionBankIds: string[]) {
        throw new Error("Not implemented");
    }
}
