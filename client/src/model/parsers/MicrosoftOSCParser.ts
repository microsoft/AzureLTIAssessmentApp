import { ParsedQuestionBank } from "./ParsedQuestionBank";
import {  AssessmentAppParser } from "./Parser";
import { Question } from "../Question";

// Currently only parses in MCQs and TFs
export class MicrosoftOSCParser extends AssessmentAppParser{

    public parse(): void {

        try{
            const rawData = JSON.parse(this.raw);

            for (let rawBank of rawData){
            
                for (let rawQuestion of rawBank.quizzes) {
                    var questions:Question[] = [];
                        for (let question of rawQuestion.quiz){
                            var answerTexts = Array(); 
                            var correctAnswer = [];
                            var counter = 0;
                            for (let option of question.answerOptions){
                                answerTexts.push(option.answerText)
                                if (option.isCorrect == "true"){
                                    correctAnswer.push(counter.toString());
                                }
                                counter = counter + 1;
            
                            }
        
                            const questionToSave: Question = {
                                id: "",
                                name: question.questionText,
                                description: question.questionText,
                                lastModified: new Date(),
                                options: answerTexts,
                                answer: correctAnswer,
                                textType: "text",
                                questionType: "MCQ"
                            }
                            questions.push(questionToSave); 
                        }

                    
                        var qb: ParsedQuestionBank = {
                            questionBankTitle: rawQuestion.title, 
                            questions:questions    
                        };
                        this.questionbanks.push(qb); 
                        
                        
                }
                

            

            }
        }
        catch (err){
            if (err instanceof Error){
                throw new Error(err.message);
            }
            else{
                throw new Error("Invalid JSON format");
            }
        }

    }
}