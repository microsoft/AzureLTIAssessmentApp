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
                // opensource curriculum
                this.parser = new OriginalAppParser(raw)
               break; 
            } 
            case "B": { 
               //statements;
               this.parser = new MicrosoftOSCParser(raw)
               break; 
            } 
            case "C": { 
                this.parser = new GiftParser(raw)
               break; 
            } 
            default : {
                this.parser = new QTIParser(raw)
                break;
            }
        }
    } 


}

