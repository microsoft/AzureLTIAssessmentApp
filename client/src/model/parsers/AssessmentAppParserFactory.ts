import { GiftParser } from "./GiftParser";
import { MicrosoftOSCParser } from "./MicrosoftOSCParser";
import { OriginalAppParser } from "./OriginalParser";
import { AssessmentAppParser } from "./Parser";
import { QTIParser } from "./QTIParser";

export class AssessmentAppParserFactory{
    // parser!: AssessmentAppParser;  

    raw:string; 
    parser!: AssessmentAppParser;  

    constructor( raw:string, key:string) {
        this.raw = raw; 

        switch(key) { 
            case "A": { 
                // Assessment app native json format
                this.parser = new OriginalAppParser(raw)
               break; 
            } 
            case "B": { 
               // Microsoft open source curriculum json format
               this.parser = new MicrosoftOSCParser(raw)
               break; 
            } 
            case "C": { 
                // Moodle export format 
                this.parser = new GiftParser(raw)
               break; 
            } 
            default : {
                // Canvas export format
                this.parser = new QTIParser(raw)
                break;
            }
        }
    } 


}

