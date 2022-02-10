import { ParsedQuestionBank } from "./ParsedQuestionBank";
import {  AssessmentAppParser } from "./Parser";
import { Question } from "../Question";

// Currently only parses in MCQs and TFs
export class MicrosoftOSCParser extends AssessmentAppParser{

    public parse(): void {

        const rawData = JSON.parse(this.raw);

        for (let rawBank of rawData){
           
            for (let rawQuestion of rawBank.quizzes) {
                var questions:Question[] = [];
                    for (let question of rawQuestion.quiz){
                        var answerTexts = Array(); 
                        var correctAnswer = 0;
                        var counter = 0;
                        for (let option of question.answerOptions){
                            answerTexts.push(option.answerText)
                            if (option.isCorrect == "true"){
                                correctAnswer = counter ;
                            }
                            counter = counter + 1;
        
                        }
    
                        const questionToSave: Question = {
                            id: "",
                            name:  question.questionText,
                            description: question.questionText,
                            lastModified: new Date (),
                            options: answerTexts,
                            answer: correctAnswer,
                            textType:"text"
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
}