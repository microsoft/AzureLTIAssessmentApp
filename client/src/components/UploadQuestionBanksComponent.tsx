import {DefaultButton, Dialog, DialogFooter, DialogType, PrimaryButton, Spinner} from "@fluentui/react";
import * as React from "react";
import {useMemo, useState} from "react";
import {RepositoryContext} from "../context/RepositoryContext";
import { Dropdown, IDropdown } from '@fluentui/react/lib/Dropdown';
import { IStackTokens, Stack } from '@fluentui/react/lib/Stack';

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
            console.log("Printing raw bank here"); 
            console.log(rawBank);
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
            const rawData = JSON.parse(text.toString());
            switch(selectedOption.key) { 
                case "A": { 
                    // opensource curriculum
                    openSourceCurriculumJson(rawData); 
                   break; 
                } 
                case "B": { 
                   //statements; 
                   assessmentAppJson(rawData); 
                   break; 
                } 
                case "C": { 
                   //statements; 
                   break; 
                } 
                default: {
                    console.log("Option has not been coded out yet"); 
                }
             } 
            onFinish(true);
            setInProgress(false);
        }
        reader.readAsText(selectedFile);
    };

    const dropdownRef = React.createRef<IDropdown>();
    const onSetFocus = () => dropdownRef.current!.focus(true);
    const stackTokens: IStackTokens = { childrenGap: 20 };
    const uploadOptions = [
        { key: 'A', text: 'Microsoft Open Source Curriculum JSON'},
        { key: 'B', text: 'Assessment App JSON' },
        { key: 'C', text: 'Moodle Export'},
        { key: 'D', text: 'Canvas Export' },
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