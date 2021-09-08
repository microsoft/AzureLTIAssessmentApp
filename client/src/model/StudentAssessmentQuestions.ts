import {StudentAssessment} from "./StudentAssessment";
import {StudentQuestion} from "./StudentQuestion";

export interface StudentAssessmentQuestions {
    assessment: StudentAssessment,
    questions: StudentQuestion[],
}