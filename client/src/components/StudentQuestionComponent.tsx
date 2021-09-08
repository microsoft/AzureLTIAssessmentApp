import React from "react";
import {StudentQuestion} from '../model/StudentQuestion';
import {ChoiceGroup, IChoiceGroupOption} from '@fluentui/react/lib/ChoiceGroup';
import { Label } from "@fluentui/react";
import { getTheme } from '@fluentui/react';

interface StudentQuestionComponentProps {
    question: StudentQuestion;
    selectedOption: number;
    setSelectedOption: (choice: number) => void;
}

export const StudentQuestionComponent = (
    {question, selectedOption, setSelectedOption}: StudentQuestionComponentProps
) => {
    const theme = getTheme();
    const options: IChoiceGroupOption[] = question.options.map((value, index) => ({
        key: index.toString(),
        text: value,
    }));
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
                <div style={{margin: '30px', textAlign: 'left'}}>
                    <Label style={{textAlign: 'left', fontSize: '25px'}}>Question</Label>
                    <p>{question.description}</p>
                    <ChoiceGroup
                        selectedKey={selectedOption.toString()}
                        onChange={(_: any, option) => {
                            if (option) {
                                setSelectedOption(Number(option.key));
                            }
                        }}
                        options={options}
                    />
                </div>
                <br/>
                <br/>
            </div>
        </>
    )

}
