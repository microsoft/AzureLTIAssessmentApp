import {DefaultButton, Dialog, DialogFooter, DialogType, PrimaryButton, Spinner} from "@fluentui/react";
import * as React from "react";
import {useMemo, useState} from "react";
import {RepositoryContext} from "../context/RepositoryContext";
import { Dropdown, IDropdown } from '@fluentui/react/lib/Dropdown';
import { XMLParser} from "fast-xml-parser";
import { AssessmentAppParserFactory } from "../model/parsers/AssessmentAppParserFactory";
import { Question } from "../model/Question";
import { ParsedQuestionBank } from "../model/parsers/ParsedQuestionBank";

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
            var parserFactory = new AssessmentAppParserFactory(text.toString(), selectedOption.key); 
            var parser = parserFactory.parser; 
            parser.parse(); 
            var questionBanks: ParsedQuestionBank[] = parser.questionbanks;
            
            for (let qb_id in questionBanks){
                var questionBank:ParsedQuestionBank = questionBanks[qb_id]; 
                const bank = await repositoryContext.createNewQuestionBank({
                    id: "",
                    name: questionBank.questionBankTitle,
                    description: "",
                    lastModified: new Date(),
                    questionIds: [],
                    assessmentType: "",
                });
    
                const questions:Question[] = questionBank.questions; 
                for (let questionId in questions){
                    await repositoryContext.saveNewQuestion(bank.id, questions[questionId])
                }


            }

            onFinish(true);
            setInProgress(false);
        }
        reader.readAsText(selectedFile);
    };

    const dropdownRef = React.createRef<IDropdown>();
    const uploadOptions = [
        { key: 'A', text: 'Assessment App JSON'},
        { key: 'B', text: 'Microsoft Open Source Curriculum JSON ' },
        { key: 'C', text: 'GIFT Export'},
        { key: 'D', text: 'QTI Export' },
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