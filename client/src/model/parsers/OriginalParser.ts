import { ParsedQuestionBank } from "./ParsedQuestionBank";
import { AssessmentAppParser } from "./Parser";
import { Question } from "../Question";

export class OriginalAppParser  extends AssessmentAppParser{
   public parse() {
    const rawData = JSON.parse(this.raw);
    for (let rawBank of rawData) {
        var questions:Question[] = [];
        for (let rawQuestion of rawBank.questions) {

            const question: Question = {
                id: "",
                name: rawQuestion.name,
                description: rawQuestion.description,
                lastModified: new Date (),
                options: rawQuestion.options,
                answer: rawQuestion.answer,
                textType: rawQuestion.textType
            }
            questions.push(question); 
        }

        var qb: ParsedQuestionBank = {
            questionBankTitle: rawBank.name, 
            questions:questions    
        };
        this.questionbanks.push(qb); 
    }

   }

}

