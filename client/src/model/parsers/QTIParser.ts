import { XMLParser} from "fast-xml-parser";
import { ParsedQuestionBank } from "./ParsedQuestionBank";
import { AssessmentAppParser } from "./Parser";
import { Question } from "../Question";


interface questionTypeSpecificParse  {
    correctAnswer:string[]
    options:string[]
};
export class QTIParser extends AssessmentAppParser{
    options = {
        ignoreAttributes:false
    }; 

    public parse() {
        var questionBankTitle:string = "Not defined yet"; 
        var questions:Question[] = [];

        const xmlParser: XMLParser = new XMLParser(this.options);
        var parsedInput = xmlParser.parse(this.raw); 
        var assessment = parsedInput['questestinterop']['assessment']; 
        questionBankTitle = assessment['@_title']; 
        var questionsSection = assessment['section']['item']

        for (let questionId in questionsSection){
            var currQuestion = questionsSection[questionId]; 
            console.log(currQuestion);
            // Get question title
            var questionTitle = currQuestion['@_title']; 

            // Get question type
            var qMetaDataField = currQuestion['itemmetadata']['qtimetadata']['qtimetadatafield']; 
            var metaData = qMetaDataField[0]; // 0 position contains question type
            var questionType = 'NA'; 

            // Get question description
            var questionText = currQuestion['presentation']['material']['mattext']['#text']; 

            // Get text type
            var cleanedTextType:string = 'text'
            if (currQuestion['presentation']['material']['mattext']['@_texttype'] === "text/html"){
                cleanedTextType = "html";
            }
            // Get answer and options

            var result:questionTypeSpecificParse = {options:[], correctAnswer:[]}
            if (metaData['fieldentry'] === 'multiple_choice_question' ){
                result = this.parseMCQ(currQuestion);
                questionType = "MCQ";
            }
            else if (metaData['fieldentry'] === 'true_false_question'){
                result = this.parseMCQ(currQuestion);
                questionType = "TF";
            }
            else if (metaData['fieldentry'] === 'multiple_answers_question'){
                result= this.parseMAQ(currQuestion);
                questionType = "MCQ";
            }
            else if (metaData['fieldentry'] === 'numerical_question'){
                result= this.parseQA(currQuestion); 
                questionType = "QA"
            }
            else{
                continue;
            }

            const question:Question = {
                id: "",
                name: questionTitle,
                description: questionText,
                lastModified: new Date(),
                options: result.options,
                answer: result.correctAnswer,
                textType: cleanedTextType,
                questionType: questionType
            }
            questions.push(question); 
        }
        var qb: ParsedQuestionBank = {
            questionBankTitle: questionBankTitle, 
            questions:questions    
        };
        this.questionbanks.push(qb); 

    }

    private parseMCQ(currQuestion:any){
        // Get all options 
        var responseLabels = currQuestion['presentation']['response_lid']['render_choice']['response_label']; 
        var answerTexts = Array(); 
        var correctAnswerId = currQuestion['resprocessing']['respcondition']['conditionvar']['varequal']['#text'].toString();
        var correctAnswer = ['-1'];
        for (let responseId in responseLabels){
            var response = responseLabels[responseId]; 
            if (correctAnswerId === response['@_ident'].toString()){
                correctAnswer = [responseId.toString()]; 
            }
            answerTexts.push(this.removeTags(response['material']['mattext']['#text']))
        }
        var result: questionTypeSpecificParse = {options:answerTexts, correctAnswer:correctAnswer} 
        return result
    }

    private parseMAQ(currQuestion:any){

        // Get all options 
        var responseLabels = currQuestion['presentation']['response_lid']['render_choice']['response_label']; 
        var answerTexts = Array(); 
        var correctAnswerQTIIds = currQuestion['resprocessing']['respcondition']['conditionvar']['and']['varequal']
        var correctAnsIds = new Set(); 
        
        for (let id in correctAnswerQTIIds){
            var answerId = correctAnswerQTIIds[id]['#text']; 
            correctAnsIds.add(answerId.toString());
        }  
        var correctAns:string[] = Array();  
        for (let responseId in responseLabels){
            var response = responseLabels[responseId]; 
            if (correctAnsIds.has(response['@_ident'].toString())){
                var correctAnswer = +responseId
                correctAns.push(correctAnswer.toString()) 
            }
            answerTexts.push(this.removeTags(response['material']['mattext']['#text']))
        }

        var result: questionTypeSpecificParse = {options:answerTexts, correctAnswer:correctAns} 
        return result
    }
    private parseQA(currQuestion:any){

        //Get all allowed answers
        var correctAnswerQTIIds = currQuestion['resprocessing']['respcondition']
        var correctAns = new Array(); 
        for (let index in correctAnswerQTIIds){
            var curr = correctAnswerQTIIds[index]['conditionvar']['or']['varequal']['#text'];
            correctAns.push(curr.toString());
        }
        var result: questionTypeSpecificParse = {options:[], correctAnswer:correctAns} 
        return result

    }



}

