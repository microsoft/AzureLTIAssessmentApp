import { StudentResponseStatus } from "./StudentResponseStatus";

export interface StudentAssessment {
    id: string,
    courseName: string,
    name: string,
    description: string,
    assessmentType: string,
    status: StudentResponseStatus,
    startTime: Date,
    deadline: Date,
    durationSeconds: number,
    numberOfQuestions: number,
}
