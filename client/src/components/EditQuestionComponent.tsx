import {
    ChoiceGroup,
    DefaultButton,
    IChoiceGroupOption,
    IconButton,
    ITextFieldStyles,
    Label,
    mergeStyles,
    PrimaryButton,
    TextField
} from "@fluentui/react";
import {Question} from "../model/Question";
import {Col, Container, Row} from "react-grid-system";
import { useState } from "react";

const optionRootClass = mergeStyles({display: 'flex', alignItems: 'baseline'});
const textFieldStyles: Partial<ITextFieldStyles> = {fieldGroup: {width: 350}};




interface EditQuestionComponentProps {
    question: Question;
    setQuestion: (f: (oldValue: Question) => Question) => void;
}


export const EditQuestionComponent = (
    {question, setQuestion}: EditQuestionComponentProps
) => {
    const [isMCQ, setMCQ] = useState<boolean>(false);
    const [isLA, setLA] = useState<boolean>(false);
    const createOptions = (): IChoiceGroupOption[] => {
        const createOneOption = (optionId: number): IChoiceGroupOption => {
            return {
                key: optionId.toString(),
                text: '',
                onRenderField: (props, render) => {
                    return (
                        <div className={optionRootClass}>
                            {render!(props)}
                            <TextField
                                id={`question-option-${optionId}`}
                                styles={textFieldStyles}
                                value={question.options[optionId]}
                                onChange={(_: any, newValue?: string) =>
                                    setQuestion(q => {
                                        var result = {...q, options: [...q.options]};
                                        result.options[optionId] = newValue || '';
                                        return result;
                                    })}
                            />
                            <IconButton
                                iconProps={{iconName: "Delete"}}
                                onClick={() => {
                                    setQuestion(q => {
                                        let result = {...q, options: [...q.options]};
                                        result.options.splice(optionId, 1);
                                        return result;
                                    });
                                }}
                                disabled={question.options.length <= 2}
                            />
                        </div>
                    )
                }
            };
        };
        return question.options.map((_: any, index: number) => createOneOption(index));
    };
    const updateCorrectAnswer = (_: any, option?: IChoiceGroupOption) => {
        var answer: number;
        if (option == null) {
            answer = -1;
        } else {
            answer = Number(option.key);
        }
        setQuestion(q => ({...q, answer: answer}))
    }

    function McqDisplay(isOn:boolean) {
        // setLA(false); 
        if (isOn){
            return <> <Row>
            <Col md={2}>
                <Label style={{ textAlign: "left" }}>Options</Label>
            </Col>
            <Col md={6}>
                <ChoiceGroup
                    options={createOptions()}
                    required={true}
                    selectedKey={`${question.answer}`}
                    onChange={updateCorrectAnswer} />
            </Col>
        </Row><br /><Row>
                <Col md={2} />
                <Col md={6}>
                    <PrimaryButton text="Add option" onClick={() => setQuestion(
                        q => ({ ...q, options: [...q.options, ''] })
                    )} />
                </Col>
            </Row></>
        }
        return <></>

    }

    function LaDisplay(isOn:boolean){ 
        if (isOn){
            return <Row>
                <Col md={2}>
                    <Label style={{textAlign: "left"}}>Answer</Label>
                </Col>
                <Col md={6}>
                    <TextField
                        id="question-name-input"
                        value={"Enter answer here"}
                        onChange={(_: any, newValue?: string) =>
                            setQuestion(q => ({...q, name: newValue || ''}))
                        }
                    />
                </Col>
            </Row>

        }
        return <></>
    }

    function handleStates(type:String){
        if (type === "MCQ" || type === "TF"){
            if (isLA === true){
                setLA((isLA) => !isLA);
            }
            if (isMCQ === true){
                setMCQ((isMCQ) => !isMCQ); 
            }
            setMCQ((isMCQ) => !isMCQ); 
        }
        else if (type === "LA" || type === "SA"){
            if (isMCQ === true){
                setMCQ((isMCQ) => !isMCQ); 
            }
            setLA((isLA) => !isLA);
        }
    }

    return (<Container style={{margin: '30px', position: 'relative'}}>
            <Row>
                <Col md={2}>
                    <Label style={{textAlign: "left"}}>Name</Label>
                </Col>
                <Col md={6}>
                    <TextField
                        id="question-name-input"
                        value={question.name}
                        onChange={(_: any, newValue?: string) =>
                            setQuestion(q => ({...q, name: newValue || ''}))
                        }
                    />
                </Col>
            </Row>
            <br/>
            <Row>
                <Col md={2}>
                    <Label style={{textAlign: "left"}}>Description</Label>
                </Col>
                <Col md={6}>
                    <TextField
                        id="question-description-input"
                        multiline
                        rows={2}
                        value={question.description}
                        onChange={(_: any, newValue?: string) =>
                            setQuestion(q => ({...q, description: newValue || ''}))
                        }
                    />

                </Col>
            </Row>
            <br/>
            <Row>
                <Col md={2}>
                    <Label style={{textAlign: "left"}}>Text format</Label>
                </Col>
                <Col md={6}>
                    <TextField
                        id="textType-input"
                        rows={1}
                        value={question.textType}
                        onChange={(_: any, newValue?: string) =>
                            setQuestion(q => ({...q, textType: newValue || ''}))
                        }
                    />
                </Col>
            </Row>
            <br/>
            <Row>
                <Col md={2}>
                    <Label style={{textAlign: "left"}}>Question Type</Label>
                </Col>
                <Col md={2}> 
                <DefaultButton target="_blank" onClick={() => handleStates("MCQ")} > Multiple Choice</DefaultButton>
                </Col> 
                <Col md={2}> 
                <DefaultButton target="_blank" onClick={() => handleStates("TF")} > True or False</DefaultButton>
                </Col> 
                <Col md={2}> 
                <DefaultButton target="_blank" onClick={() => handleStates("LA")}> Long/Short Answer</DefaultButton>
                </Col> 
            </Row>
            <br/>
            {McqDisplay(isMCQ)}
            {LaDisplay(isLA)}
        </Container>
    );
}
