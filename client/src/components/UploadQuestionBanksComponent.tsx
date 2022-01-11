import {DefaultButton, Dialog, DialogFooter, DialogType, PrimaryButton, Spinner} from "@fluentui/react";
import * as React from "react";
import {useMemo, useState} from "react";
import {RepositoryContext} from "../context/RepositoryContext";
import { Dropdown, IDropdown } from '@fluentui/react/lib/Dropdown';
import { IStackTokens, Stack } from '@fluentui/react/lib/Stack';
import { parse, GIFTQuestion, TextChoice, TextFormat } from "gift-pegjs";
import { arrayBuffer } from "stream/consumers";
import { XMLParser} from "fast-xml-parser";
import { addConsoleHandler } from "selenium-webdriver/lib/logging";

const dropdownStyles = { dropdown: { width: 300 } };
const modalPropsStyles = { main: { maxWidth: 600 } };

interface UploadQuestionBanksComponentProps {
    hidden: boolean,
    onFinish: (done: boolean) => void,
}

const dialogContentProps = {
    type: DialogType.normal,
    title: 'Upload question banks',
}

export const UploadQuestionBanksComponent = (
    {hidden, onFinish}: UploadQuestionBanksComponentProps
) => {
    const [selectedFile, setSelectedFile] = useState<Blob | null>(null);
    const [selectedOption, setSelectedOption] = useState<any|null>(null); 
    const [inProgress, setInProgress] = useState(false);
    const repositoryContext = React.useContext(RepositoryContext);
    const dialogModalProps = useMemo(() => ({
        isBlocking: true,
        styles: modalPropsStyles,
    }), []);

    if (repositoryContext == null) {
        return <></>;
    }

    const changeHandler = (event: any) => {
        setSelectedFile(event.target.files[0]);
    };

    const assessmentAppJson = async (rawData:any) => {
        for (let rawBank of rawData) {
            const bank = await repositoryContext.createNewQuestionBank({
                id: "",
                name: rawBank.name,
                description: rawBank.description,
                lastModified: new Date(),
                questionIds: [],
                assessmentType: rawBank.assessmentType,
            });
            for (let rawQuestion of rawBank.questions) {
                await repositoryContext.saveNewQuestion(bank.id, {
                    id: "",
                    name: rawQuestion.name,
                    description: rawQuestion.description,
                    lastModified: new Date(),
                    options: rawQuestion.options,
                    answer: rawQuestion.answer,
                })
            }
        }
        return true; 

    }


    const openSourceCurriculumJson = async (rawData: any) => {
        for (let rawBank of rawData){
            const bank = await repositoryContext.createNewQuestionBank({
                id: "",
                name: rawBank.title,
                description: "",
                lastModified: new Date(),
                questionIds: [],
                assessmentType: "",
            });
            console.log("Created a new question bank"); 
            for (let rawQuestion of rawBank.quizzes) {
                for (let question of rawQuestion.quiz){
                    var answerTexts = Array(); 
                    var correctAnswer = 0;
                    var counter = 0;
                    console.log("Read a new question"); 
                    console.log(question.questionText);
                    for (let option of question.answerOptions){
                        answerTexts.push(option.answerText)
                        if (option.isCorrect == "true"){
                            correctAnswer = counter ;
                        }
                        counter = counter + 1;
    
                    }
                    await repositoryContext.saveNewQuestion(bank.id, {
                        id: "",
                        name: question.questionText,
                        description: rawQuestion.title,
                        lastModified: new Date (),
                        options: answerTexts,
                        answer: correctAnswer,
                    })
    
                }
                console.log("Done with one quiz");  
            }
        }
        return true; 
    }
    function removeTags(str:string) {
        if ((str===null) || (str===''))
            return '';
        else
            str = str.toString();
            str = str.replace( /(<([^>]+)>)/ig, '')
            str = str.replaceAll('\\n','')
        return str;
    }

    const giftFormat = async (rawData:any) => {
        // Only MCQ questions for now
        // ::title:: -> Question title
        // text -> Question text 
        // [format] -> [html], [plain], [markdown]
        const quiz: GIFTQuestion[] = parse(rawData)
        console.log(quiz); 
        const bank = await repositoryContext.createNewQuestionBank({
            id: "",
            name: "GIFT Question Bank", // We update the name later
            description: "",
            lastModified: new Date(),
            questionIds: [],
            assessmentType: "",
        });
        console.log("Created a new question bank"); 


        for (let question in quiz){ 
            var q: GIFTQuestion = quiz[question]
            if (q.type === "Category"){
                await repositoryContext.updateQuestionBankWithName(bank.id, q.title)
            }
            if (q.type === "MC"){ // multiple choice 

                var choices:TextChoice[] = q.choices; 
                var answerTexts = Array(); 
                var correctAnswer = 0;  
                for (var choice in choices){
                    var details:TextChoice  = choices[choice];
                    answerTexts.push(removeTags(details.text['text'])); 
                    if (details.isCorrect){
                        correctAnswer = +choice;  // plus operator converts to number
                    }
                }
                var stem:TextFormat  = q.stem;

                await repositoryContext.saveNewQuestion(bank.id, {
                    id: "",
                    name: removeTags(stem.text),
                    description: removeTags(stem.text),
                    lastModified: new Date (),
                    options: answerTexts,
                    answer: correctAnswer,
                })

            }

            if (q.type === "TF"){
                var stem:TextFormat  = q.stem;
                var isTrue:boolean = q.isTrue; 
                await repositoryContext.saveNewQuestion(bank.id, {
                    id: "",
                    name: removeTags(stem.text),
                    description: removeTags(stem.text),
                    lastModified: new Date (),
                    options: ["True", "False"],
                    answer: isTrue?0:1,
                })
                
            }
            
        }

        return true; 


    }


    const canvasFormat = async (rawData:any) => {
        const options = {
            ignoreAttributes:false
        }; 
        const parser: XMLParser = new XMLParser(options)
        var parsedInput = parser.parse(rawData); 
        console.log(parsedInput); 
        var assessment = parsedInput['questestinterop']['assessment']; 
        const bank = await repositoryContext.createNewQuestionBank({
            id: "",
            name: assessment['@_title'], // We update the name later
            description: "",
            lastModified: new Date(),
            questionIds: [],
            assessmentType: "",
        });
        console.log("Created a new question bank"); 
        var questions = assessment['section']['item']
        for (let questionId in questions){
            var question = questions[questionId]; 
            var questionTitle = question['@_title']; 
            var qMetaDataField = question['itemmetadata']['qtimetadata']['qtimetadatafield']; 
            var metaData = qMetaDataField[0]; // 0 position contains question type
            if (metaData['fieldentry'] != 'multiple_choice_question'){
                continue; // As we currently only support MCQs
            }
            var questionText = question['presentation']['material']['mattext']['#text']; 
            questionText = removeTags(questionText); // Clean any html tags
            questionText = questionText.split('\n')[1];

            // Get all options 
            var responseLabels = question['presentation']['response_lid']['render_choice']['response_label']; 
            var answerTexts = Array(); 
            var correctAnswer = question['resprocessing']['respcondition']['conditionvar']['varequal']['#text']
            for (let responseId in responseLabels){
                var response = responseLabels[responseId]; 
                if (correctAnswer == response['@_ident']){
                    correctAnswer = responseId; 
                }
                answerTexts.push(removeTags(response['material']['mattext']['#text']))
            }
            // Finally creating the question 
            await repositoryContext.saveNewQuestion(bank.id, {
                            id: "",
                            name: questionTitle,
                            description: questionText,
                            lastModified: new Date (),
                            options: answerTexts,
                            answer: correctAnswer,
                        })

        }

        // for (let question in quiz){ 
        //     var q: GIFTQuestion = quiz[question]
        //     if (q.type === "Category"){
        //         await repositoryContext.updateQuestionBankWithName(bank.id, q.title)
        //     }
        //     if (q.type === "MC"){ // multiple choice 

        //         var choices:TextChoice[] = q.choices; 
        //         var answerTexts = Array(); 
        //         var correctAnswer = 0;  
        //         for (var choice in choices){
        //             var details:TextChoice  = choices[choice];
        //             answerTexts.push(removeTags(details.text['text'])); 
        //             if (details.isCorrect){
        //                 correctAnswer = +choice;  // plus operator converts to number
        //             }
        //         }
        //         var stem:TextFormat  = q.stem;

        //         await repositoryContext.saveNewQuestion(bank.id, {
        //             id: "",
        //             name: removeTags(stem.text),
        //             description: removeTags(stem.text),
        //             lastModified: new Date (),
        //             options: answerTexts,
        //             answer: correctAnswer,
        //         })

        //     }

        //     if (q.type === "TF"){
        //         var stem:TextFormat  = q.stem;
        //         var isTrue:boolean = q.isTrue; 
        //         await repositoryContext.saveNewQuestion(bank.id, {
        //             id: "",
        //             name: removeTags(stem.text),
        //             description: removeTags(stem.text),
        //             lastModified: new Date (),
        //             options: ["True", "False"],
        //             answer: isTrue?0:1,
        //         })
                
        //     }
            
        // }

        return true; 


    }

    const doUpload = async () => {
        if (selectedFile === null || selectedOption === null) {
            return;
        }
        setSelectedOption(null)
        setInProgress(true);
        setSelectedFile(null);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result;
            if (!text) {
                return;
            }
            
            switch(selectedOption.key) { 
                case "A": { 
                    // opensource curriculum
                    const rawData = JSON.parse(text.toString());
                    await openSourceCurriculumJson(rawData); 
                   break; 
                } 
                case "B": { 
                   //statements;
                   const rawData = JSON.parse(text.toString()); 
                   await assessmentAppJson(rawData); 
                   break; 
                } 
                case "C": { 
                    await giftFormat(text.toString());  
                   break; 
                } 
                case "D": {
                    await canvasFormat(text.toString()); 
                    break;
                }
             } 
            onFinish(true);
            setInProgress(false);
        }
        reader.readAsText(selectedFile);
    };

    const dropdownRef = React.createRef<IDropdown>();
    const uploadOptions = [
        { key: 'A', text: 'Microsoft Open Source Curriculum JSON'},
        { key: 'B', text: 'Assessment App JSON' },
        { key: 'C', text: 'GIFT Export'},
        { key: 'D', text: 'QTI Zip Export' },
    ];

    return(
        <Dialog
            hidden={hidden}
            onDismiss={() => onFinish(false)}
            dialogContentProps={dialogContentProps}
            modalProps={dialogModalProps}
        >
             <Dropdown
                placeholder="Choose import format"
                ariaLabel="Required dropdown example"
                options={uploadOptions}
                required={true}
                styles={dropdownStyles}
                onChange={(e, selectedOption) => {
                    console.log("Selected action is");
                    console.log(selectedOption)
                    setSelectedOption(selectedOption);
                }}
            />
            <br></br>
            <input type="file" name="file" onChange={changeHandler} />
            <DialogFooter>
                {inProgress && <Spinner
                    label="Uploading..."
                />}
                <PrimaryButton text="Upload" disabled={selectedFile === null} onClick={doUpload}/>
                <DefaultButton text="Cancel" onClick={() => onFinish(false)}/>
            </DialogFooter>
        </Dialog>
    )
}