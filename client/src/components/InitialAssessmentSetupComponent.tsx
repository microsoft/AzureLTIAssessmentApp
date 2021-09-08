import React, {useContext, useState} from 'react';
import {Dropdown, IDropdownOption, IDropdownStyles, Label, PrimaryButton, TextField} from "@fluentui/react";
import {Col, Container, Row} from "react-grid-system";
import {Assessment} from '../model/Assessment';
import {RepositoryContext} from '../context/RepositoryContext';
import {AssessmentStatus} from '../model/AssessmentStatus';

const dropdownStyles: Partial<IDropdownStyles> = {
    dropdown: {width: 250},
};

const options: IDropdownOption[] = [
    {key: 'quiz', text: 'Quiz'},
    {key: 'jupiter-notebook', text: 'Jupyter Notebook (coming soon)'},
];

interface InitialAssessmentSetupComponentProps {
    id: string;
    savedAssessment: Assessment;
    setSavedAssessment: (f: (oldValue: Assessment) => Assessment) => void;
}

export const InitialAssessmentSetupComponent = (
    {id, savedAssessment, setSavedAssessment}: InitialAssessmentSetupComponentProps
) => {
    const [description, setDescription] = useState<string>(savedAssessment.description);
    const [assessmentType, setAssessmentType] = useState<number>(0);
    const repositoryContext = useContext(RepositoryContext);
    if (repositoryContext == null) {
        return <p>Assessment cannot be found</p>
    }
    const updateAssessmentType = (_1: any, _2: any, index?: number) => {
        if (index == null) {
            return;
        }
        setAssessmentType(index);
    }
    const confirmSelection = async () => {
        if (repositoryContext == null) {
            return;
        }
        const newAssessment = {
            ...savedAssessment,
            description: description,
            assessmentType: options[assessmentType].text,
            status: AssessmentStatus.Draft,
        }
        await repositoryContext.updateAssessment(newAssessment);
        setSavedAssessment((_) => newAssessment);
    }
    return (
        <div style={{margin: '30px', textAlign: 'left'}}>
            <Container>
                <Row align='start'>
                    <Col md={2}><Label>Description</Label></Col>
                    <Col md={6}>
                        <TextField
                            multiline
                            rows={4}
                            value={description}
                            onChange={(_: any, newValue?: string) => setDescription(newValue || "")}
                        />
                    </Col>
                </Row>
                <br/>
                <Row align='start'>
                    <Col md={2}><Label>Assessment type</Label></Col>
                    <Col md={6}>
                        <Dropdown
                            placeholder="Select an Assessment type"
                            options={options}
                            styles={dropdownStyles}
                            selectedKey={options[assessmentType].key}
                            onChange={updateAssessmentType}
                        />
                    </Col>
                </Row>
                <br/>
                <PrimaryButton text="Confirm" allowDisabledFocus onClick={confirmSelection}/>
            </Container>
        </div>
    );
}
