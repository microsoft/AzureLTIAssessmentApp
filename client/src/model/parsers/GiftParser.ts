import { parse, GIFTQuestion, TextChoice, TextFormat } from "gift-pegjs";
import { ParsedQuestionBank } from "./ParsedQuestionBank";
import {  AssessmentAppParser } from "./Parser";
import { Question } from "../Question";

// Currently only parses in MCQs and TFs
export class GiftParser extends AssessmentAppParser{

    public parse(): void {


        var questionBankTitle:string = "Not defined yet"; 
        var questions:Question[] = [];

        const quiz: GIFTQuestion[] = parse(this.raw)
        for (let question in quiz){ 
            var q: GIFTQuestion = quiz[question]
            if (q.type === "Category"){
                questionBankTitle =  q.title; 
            }

            if (q.type === "MC"){ // multiple choice 

                var choices:TextChoice[] = q.choices; 
                var answerTexts = Array(); 
                var correctAnswer = 0;  
                for (var choice in choices){
                    var details:TextChoice  = choices[choice];
                    answerTexts.push(this.removeTags(details.text['text'])); 
                    if (details.isCorrect){
                        correctAnswer = +choice;  // plus operator converts to number
                    }
                }
                var stem:TextFormat  = q.stem;
                const question: Question = {
                    id: "",
                    name: this.removeTags(stem.text),
                    description: this.removeTags(stem.text),
                    lastModified: new Date (),
                    options: answerTexts,
                    answer: correctAnswer,
                    textType:stem.format
                }
                questions.push(question); 

            }

            if (q.type === "TF"){
                var stem:TextFormat  = q.stem;
                var ans:Boolean = q.isTrue; 
                const question: Question = {
                    id: "",
                    name: this.removeTags(stem.text),
                    description: stem.text,
                    lastModified: new Date (),
                    options: ["True", "False"],
                    answer: ans? 0:1,
                    textType:stem.format
                }
                questions.push(question); 
            }


        }

        var qb: ParsedQuestionBank = {
            questionBankTitle: questionBankTitle, 
            questions:questions    
        };
        this.questionbanks.push(qb); 
    }

}