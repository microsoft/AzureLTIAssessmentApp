export interface StudentQuestion {
    id: string,
    name: string,
    description: string,
    options: string[],
    chosenOption: string[],
    textType:string, 
    questionType:string
}
