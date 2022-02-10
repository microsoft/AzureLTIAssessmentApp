import { XMLParser} from "fast-xml-parser";
import { ParsedQuestionBank } from "./ParsedQuestionBank";
import { AssessmentAppParser } from "./Parser";
import { Question } from "../Question";

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
            var questionTitle = currQuestion['@_title']; 
            var qMetaDataField = currQuestion['itemmetadata']['qtimetadata']['qtimetadatafield']; 
            var metaData = qMetaDataField[0]; // 0 position contains question type
            if (metaData['fieldentry'] != 'multiple_choice_question'){
                continue; // As we currently only support MCQs
            }
            var questionText = currQuestion['presentation']['material']['mattext']['#text']; 
            questionText = questionText.split('\n')[1];

            // Get all options 
            var responseLabels = currQuestion['presentation']['response_lid']['render_choice']['response_label']; 
            var answerTexts = Array(); 
            var correctAnswer = currQuestion['resprocessing']['respcondition']['conditionvar']['varequal']['#text']
            for (let responseId in responseLabels){
                var response = responseLabels[responseId]; 
                if (correctAnswer == response['@_ident']){
                    correctAnswer = responseId; 
                }
                answerTexts.push(this.removeTags(response['material']['mattext']['#text']))
            }
            // Finally creating the question 
            const question:Question = {
                            id: "",
                            name: questionTitle,
                            description: questionText,
                            lastModified: new Date (),
                            options: answerTexts,
                            answer: correctAnswer,
                            textType:currQuestion['presentation']['material']['mattext']['@_texttype'], 
                        }
            questions.push(question); 

        }

        var qb: ParsedQuestionBank = {
            questionBankTitle: questionBankTitle, 
            questions:questions    
        };
        this.questionbanks.push(qb); 

    }


}

