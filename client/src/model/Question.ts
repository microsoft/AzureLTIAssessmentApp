export abstract class Question {
    id: string;
    name: string;
    description: string;
    lastModified: Date;
    answer: string[];
    textType:string;
    questionType:string; 
    options:string[]
    
    constructor(id:string, name:string, description:string, lastModified:Date
        ,answer:any, textType:string, questionType:string){
            this.id= id; 
            this.name=name; 
            this.description=description;
            this.lastModified=lastModified; 
            this.textType="text";
            this.answer=[''];
            this.questionType=questionType
            this.options=['', '']
    }

}
