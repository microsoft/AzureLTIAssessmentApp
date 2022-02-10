export interface Question {
    id: string,
    name: string,
    description: string,
    lastModified: Date,
    options: string[],
    answer: number,
    textType:string, 
}
