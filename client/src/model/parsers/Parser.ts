import { ParsedQuestionBank } from "./ParsedQuestionBank";

export class AssessmentAppParser {
    raw:string; 
    questionbanks:ParsedQuestionBank[]; 

    constructor( raw:string) {
        this.raw = raw; 
        this.questionbanks = []; 
    } 

   // This method gets overwritten by individual parsers
   public parse() {
   }

   public removeTags(str:string) {
    if ((str===null) || (str===''))
        return '';
    else
        str = str.toString();
        str = str.replace( /(<([^>]+)>)/ig, '')
        str = str.replaceAll('\\n','')
    return str;}

}

