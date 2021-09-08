import {StudentResponseStatus} from "./StudentResponseStatus";
import {QuestionResponseInfo} from "./QuestionResponseInfo";

export interface StudentResult {
    studentId: string,
    status: StudentResponseStatus,
    startTime: Date,
    endTime: Date,
    score: number,
    responses: { [id: string]: QuestionResponseInfo },
}