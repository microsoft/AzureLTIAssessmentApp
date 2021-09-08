import { AssessmentStatus } from "./AssessmentStatus";

export interface Assessment {
    id: string,
    name: string,
    description: string,
    lastModified: Date,
    deadline: Date,
    durationSeconds: number,
    assessmentType: string,
    status: AssessmentStatus,
    questionIds: string[],
    studentIds: string[],
}
