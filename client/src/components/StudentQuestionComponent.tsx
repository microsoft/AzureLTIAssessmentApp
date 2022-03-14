import React from "react";
import {StudentQuestion} from '../model/StudentQuestion';
import { IChoiceGroupOption} from '@fluentui/react/lib/ChoiceGroup';
import { Checkbox, ICheckboxProps, Label, TextField } from "@fluentui/react";
import { getTheme } from '@fluentui/react';
import parse from 'html-react-parser';

interface StudentQuestionComponentProps {
    question: StudentQuestion;
    selectedOption: string[];
    setSelectedOption: (choice: string[]) => void;
}
var parseDisplay = (x:string, texttype:string)=> {   
    if (texttype === "html" || texttype === "text/html" || texttype === "HTML"){
        x = x.replaceAll('\\n','<br>')
        return parse(x)
    } 
    // Need to handle case where texttype is markdown
    return x
 }
 
export const StudentQuestionComponent = (
    {question, selectedOption, setSelectedOption}: StudentQuestionComponentProps
) => {
    const theme = getTheme();

    const shouldCheckBoxBeChecked = (index:number):boolean => {
        if (index in selectedOption){
            return true;
        }
        else{
            return false;
        }
    }

    const createOptions = (): ICheckboxProps[] => {
        const createOneOption = (optionId: number): ICheckboxProps => {
            return {
                id: optionId.toString().concat(question.id) ,
                defaultChecked: shouldCheckBoxBeChecked(optionId), 
                onChange:  (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
                    var previousArray:string[] = Object.assign([], selectedOption)
                    if (ev?.currentTarget.id !== undefined){
                        if (checked){
                            if (previousArray.includes(optionId.toString()) === false){
                                previousArray.push(optionId.toString())
                            } 
                        }
                        else{
                            const index = previousArray.indexOf(optionId.toString(), 0);
                            if (index > -1) {
                                previousArray.splice(index, 1);
                            }
                        }
                    }
                    setSelectedOption(previousArray)   
                },
                label:question.options[optionId]
            };
        };
        return question.options.map((_: any, index: number) => createOneOption(index));
    };

    function displayMCQOrTF(){
        return <div style={{margin: '30px', textAlign: 'left'}}>
        <Label style={{textAlign: 'left', fontSize: '25px'}}>Question</Label>
        <p>
            {parseDisplay(question.description, question.textType)}
        </p>
        <p> 
            {
            createOptions().map((value:ICheckboxProps , index: number) => 
            <>
                <Checkbox {...value}/>
                <br/>
            </>)}
        </p> 
        </div>
    }

    function displayQA(){
        return <div style={{margin: '30px', textAlign: 'left'}}>
        <Label style={{textAlign: 'left', fontSize: '25px'}}>Question</Label>
        <p>{parseDisplay(question.description, question.textType)}</p>
        <TextField
                        id="LA-input"
                        onChange={(_: any, newValue?: string) =>
                            setSelectedOption([newValue|| ''])}
                        
        />
        </div>

    }

    if (question.questionType == "QA") {
        return  <>
            <br />
            <div style={{backgroundColor: '#faf9f8', width: '50%',margin: 'auto', padding: '10px', boxShadow: theme.effects.elevation8}}>
                <br />
                {displayQA()}
            </div> 
            </>
    }
    else{
        return (
            <> 
                <br/>
                <div style={{
                    backgroundColor: '#faf9f8',
                    width: '50%',
                    margin: 'auto',
                    padding: '10px',
                    boxShadow: theme.effects.elevation8
                }}>
                    <br/>
                    {displayMCQOrTF()}
                </div>
            </>
        )
    }
   

}
