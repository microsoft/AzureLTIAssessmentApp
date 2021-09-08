export interface QuestionBank {
    id: string,
    name: string,
    description: string,
    lastModified: Date,
    questionIds: string[],
    assessmentType: string,
}
