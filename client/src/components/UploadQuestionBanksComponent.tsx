import {DefaultButton, Dialog, DialogFooter, DialogType, PrimaryButton, Spinner} from "@fluentui/react";
import * as React from "react";
import {useMemo, useState} from "react";
import {RepositoryContext} from "../context/RepositoryContext";

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
        if (selectedFile === null) {
            return;
        }
        setInProgress(true);
        setSelectedFile(null);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result;
            if (!text) {
                return;
            }
            const rawData = JSON.parse(text.toString());
            console.log("Printing raw data here");
            console.log(rawData);
            for (let rawBank of rawData) {
                console.log("Printing raw bank here"); 
                console.log(rawBank);
                // const bank = await repositoryContext.createNewQuestionBank({
                //     id: "",
                //     name: rawBank.name,
                //     description: rawBank.description,
                //     lastModified: new Date(),
                //     questionIds: [],
                //     assessmentType: rawBank.assessmentType,
                // });
                // for (let rawQuestion of rawBank.questions) {
                //     await repositoryContext.saveNewQuestion(bank.id, {
                //         id: "",
                //         name: rawQuestion.name,
                //         description: rawQuestion.description,
                //         lastModified: new Date(),
                //         options: rawQuestion.options,
                //         answer: rawQuestion.answer,
                //     })
                // }

                // start here 
        
                repositoryContext.openSourceCurriculumParser(rawBank);

            }
            onFinish(true);
            setInProgress(false);
        }
        reader.readAsText(selectedFile);
    };
    return(
        <Dialog
            hidden={hidden}
            onDismiss={() => onFinish(false)}
            dialogContentProps={dialogContentProps}
            modalProps={dialogModalProps}
        >
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