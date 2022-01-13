import { Question } from "../Question";

export type ParsedQuestionBank = {
    questionBankTitle:string; 
    questions: Question[]; 
}