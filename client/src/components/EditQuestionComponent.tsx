import {
    ChoiceGroup,
    IChoiceGroupOption,
    IconButton,
    ITextFieldStyles,
    Label,
    mergeStyles,
    PrimaryButton,
    TextField, 
    Dropdown,
    ICheckboxProps,
    Checkbox,
} from "@fluentui/react";
import {Col, Container, Row} from "react-grid-system";

const optionRootClass = mergeStyles({display: 'flex', alignItems: 'baseline'});
const textFieldStyles: Partial<ITextFieldStyles> = {fieldGroup: {width: 350}};

interface EditQuestionComponentProps {
    question: any;
    setQuestion: (f: (oldValue: any ) => any) => void;
}


export const EditQuestionComponent = (
    {question, setQuestion}: EditQuestionComponentProps
) => { 

    const shouldCheckBoxBeChecked = (index:number):boolean => {
        if (question.answer.find((x: string) => x === index.toString())){
            return true;
        }
        else{
            return false;
        }
    }

    const createOptions = (): ICheckboxProps[] => {
        const createOneOption = (optionId: number): ICheckboxProps => {
            return {
                id: `check-box-${optionId.toString()}`,
                onRenderLabel: (props, render) => {
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
                },
                onChange:  (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
                    var previousArray:string[] = Object.assign([], question.answer)
                    if (ev?.currentTarget.id !== undefined){
                        if (checked){
                            if (previousArray.includes(ev?.currentTarget.id) === false){
                                previousArray.push(ev?.currentTarget.id)
                            } 
                        }
                        else{
                            const index = previousArray.indexOf(ev?.currentTarget.id, 0);
                            if (index > -1) {
                                previousArray.splice(index, 1);
                            }
                        }
                    }
                    setQuestion({...question, answer:previousArray})   
                },
                defaultChecked: shouldCheckBoxBeChecked(optionId)
            };
        };
        return question.options.map((_: any, index: number) => createOneOption(index));
    };
    const updateCorrectAnswer = (_: any, option?: IChoiceGroupOption) => {
        var answer: string[];
        if (option == null) {
            answer = [];
        } else {
            answer = [option.key.toString()];
        }
        setQuestion(q => ({...q, answer: answer}))
    }

    function mcqDisplay(isOn:boolean){
        if (isOn){
            return <> <Row>
            <Col md={2}>
                <Label style={{ textAlign: "left" }}>Options</Label>
            </Col>
            <Col md={6}>
                {createOptions().map((value:ICheckboxProps , index: number) =>  <Checkbox {...value} id={'checkbox'+ index.toString()}/>)}
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
    }


    function tfDisplay(isOn:Boolean){
        if (isOn){
            return <> <Row>
            <Col md={2}>
                <Label style={{ textAlign: "left" }}>Options</Label>
            </Col>
            <Col md={6}>
                <ChoiceGroup
                    id={"tf"}
                    options={[{key:'0', text:'True'}, { key:'1', text:'False'}]}
                    required={true}
                    selectedKey={`${question.answer}`} 
                    onChange={updateCorrectAnswer}/>
            </Col>
            </Row></>
        }
        return <></>
    }

    function qaDisplay(isOn:boolean){ 
        if (isOn){
            return <>
            <Row>
                <Col md={2}>
                    <Label style={{textAlign: "left"}}>Correct answer/s</Label>
                </Col>
                <Col md={6}>
                    {question.answer.map((_: any, index: number) => (  <>  
                    <div className={optionRootClass}>
                    <TextField
                        id={`question-answer-${index}`}
                        styles={textFieldStyles}
                        value={question.answer[index]}
                        onChange={(_: any, newValue?: string) => setQuestion(q => {
                            var result = { ...q, answer: [...q.answer] };
                            result.answer[index] = newValue || '';
                            return result;
                        })} /><IconButton
                            iconProps={{ iconName: "Delete" }}
                            onClick={() => {
                                setQuestion(q => {
                                    let result = { ...q, answer: [...q.answer] };
                                    result.answer.splice(index, 1);
                                    return result;
                                });
                            } }
                            disabled={question.answer.length <= 1} />
                    </div>
                    <br></br>
                            </>))}
                </Col>
            </Row>
            <Row>
                <Col md={2} />
                <Col md={6}>
                    <PrimaryButton text="Add answer" onClick={() => setQuestion(
                        q => ({ ...q, answer: [...q.answer, ''] })
                    )} />
                </Col>
            </Row>         
            </>  

        }
        return <></>
    }

    return (<Container style={{margin: '30px', position: 'relative'}}>
            <Row>
                <Col md={2}>
                    <Label style={{textAlign: "left"}}>Question Name</Label>
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
                    <Label style={{textAlign: "left"}}>Question Description</Label>
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
                {/* <Col md={2}>
                    <Label style={{textAlign: "left"}}>Question format</Label>
                </Col>
                <Col md = {6}>
                    <Dropdown 
                        id="question-format"
                        defaultSelectedKey={question.textType}
                        options={[{text:"Text", key: 'text'}, {text:"HTML", key:'html'}]}  
                        onChange={(_, key)=> setQuestion({...question, textType:key?.key})} />
                </Col> */}
            </Row>
            <br/>
            <Row>
                <Col md={2}>
                    <Label style={{textAlign: "left"}}>Question Type</Label>
                </Col>
                <Col md={6}>
                <Dropdown 
                        id="question-type-drop-down"
                        defaultSelectedKey={question.questionType}
                        options={[{text:"Multiple Choice", key: 'MCQ', id:"1"}, {text:"True/False", key:'TF', id:"2"}, {text:"Question/Answer", key:'QA', id:"3"}]}  
                        onChange={(_, key)=> setQuestion({...question, questionType: key?.key.toString() || '', answer:[], options:[]})} />
                </Col>
            </Row>
            <br/>
            {mcqDisplay(question.questionType === "MCQ")}
            {qaDisplay(question.questionType === "QA")}
            {tfDisplay(question.questionType === "TF")}
        </Container>
    );
}
