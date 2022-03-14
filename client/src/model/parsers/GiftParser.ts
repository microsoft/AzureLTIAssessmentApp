import { parse, GIFTQuestion, TextChoice, TextFormat, NumericalChoice, NumericalFormat } from "gift-pegjs";
import { ParsedQuestionBank } from "./ParsedQuestionBank";
import {  AssessmentAppParser } from "./Parser";
import { Question } from "../Question";
import { questionTypeSpecificParse } from "./ParserHelper";

// Currently only parses in MCQs and TFs
export class GiftParser extends AssessmentAppParser{

    public parse(): void {
        var questionBankTitle:string = "Not defined yet"; 
        var questions:Question[] = [];

        const quiz: GIFTQuestion[] = parse(this.raw)
        for (let question in quiz){ 
            var q: GIFTQuestion = quiz[question]
            console.log(q);
            if (q.type === "Category"){
                questionBankTitle =  q.title; 
            }
            else{
                var stem:TextFormat  = q.stem;
                var answerTexts:string[] = []; 
                var correctAnswers:string[] = [] 
                var questionType:string = '';
                var results:questionTypeSpecificParse = {options:[], correctAnswer:[]}

                if (q.type === "MC"){
                    questionType = "MCQ"; 
                    results = this.getMCQ(q); 
                   
                }
                else if(q.type === "TF"){
                    questionType = "MCQ"; 
                    results = this.getTF(q); 

                }
                else if (q.type === "Short"){
                    questionType = "QA"; 
                    results = this.getShort(q); 
                }
                else if (q.type === "Numerical"){
                    questionType = "QA"; 
                    results = this.getNumerical(q); 
                }
                else{
                    continue;
                }
                correctAnswers = results.correctAnswer; 
                answerTexts = results.options;

                const question: Question = {
                    id: "",
                    name: this.removeTags(stem.text),
                    description: this.removeTags(stem.text),
                    lastModified: new Date (),
                    options: answerTexts,
                    answer: correctAnswers,
                    textType:stem.format,
                    questionType: questionType,
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


    public getMCQ(q:GIFTQuestion){
        var answerTexts:string[] = Array(); 
        var correctAnswer:string[] = [];  
        if (q.type === "MC"){
            var choices:TextChoice[] = q.choices; 
            for (var choice in choices){
                var details:TextChoice  = choices[choice];
                answerTexts.push(this.removeTags(details.text['text'])); 
                var weight = details.weight
                if ((weight != null && weight > 0) || details.isCorrect == true){
                    correctAnswer.push(choice.toString());  // plus operator converts to number
                }
            }

        }
        return {options:answerTexts, correctAnswer:correctAnswer}
    }

    public getTF(q:GIFTQuestion){
        var ans:Boolean = false; 
        if (q.type === "TF"){
            ans = q.isTrue;
        }
        return {options:["True", "False"], correctAnswer:ans? ['0']:['1'] }
    }

    public getShort(q:GIFTQuestion){
        var answerTexts:string[] = Array(); 
        var correctAnswer:string[] = [];  
        if (q.type === "Short"){
            var choices: TextChoice[] = q.choices;
            for (var choice in choices){
                var details:TextChoice  = choices[choice];
                var weight = details.weight
                if (weight != null && weight > 0){
                    correctAnswer.push(details.text.text);  // plus operator converts to number
                }
            } 

        }
        return {options:answerTexts, correctAnswer:correctAnswer}

    }

    public getNumerical(q:GIFTQuestion){

        var correctAnswer = []; 
        if (q.type === "Numerical"){
            var numChoices:any = q.choices; 
            for (var c in numChoices){
                var choiceDetails:NumericalChoice = numChoices[c]
                var weight = choiceDetails.weight 
                if (weight != null && weight > 0){
                    if (choiceDetails.text.number){
                        correctAnswer.push(choiceDetails.text.number.toString());
                    }
    
                }
            }
        }
        return {options:[], correctAnswer:correctAnswer}
    }

}