import {Header} from '../../components/Header';
import {AssessmentPageTitle} from "./AssessmentPageTitle";
import React, {useContext, useEffect, useState} from 'react';
import {RepositoryContext} from '../../context/RepositoryContext';
import {useParams} from "react-router-dom";
import {Assessment} from '../../model/Assessment';
import {AssessmentStatus} from '../../model/AssessmentStatus';
import {InitialAssessmentSetupComponent} from '../../components/InitialAssessmentSetupComponent';
import {QuizzAssessmentComponent} from '../../components/QuizzAssessmentComponent';
import {Spinner} from "@fluentui/react";

type AssessmentPageParams = {
    id: string;
};

export const AssessmentPage = () => {
    const {id} = useParams<AssessmentPageParams>();
    const repositoryContext = useContext(RepositoryContext);
    const [savedAssessment, setSavedAssessment] = useState<Assessment>({
        id: "",
        name: "",
        description: "",
        lastModified: new Date(),
        deadline: new Date(),
        durationSeconds: 0,
        assessmentType: "",
        status: AssessmentStatus.InitialSetup,
        questionIds: [],
        studentIds: [],
    });
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
        const fetchAssessmentData = async () => {
            if (repositoryContext == null) {
                return;
            }
            const assessmentData = await repositoryContext.getAssessmentById(id);
            setSavedAssessment(assessmentData);
            setIsLoaded(true);
        }
        fetchAssessmentData();
    }, [id, repositoryContext]);
    if (repositoryContext == null) {
        return <p>Assessment cannot be found</p>
    }
    let internalComponent = (<h1>Unknown state</h1>);
    if (!isLoaded) {
        internalComponent = (<Spinner
            label="Loading assessment data..."
        />)
    } else if (savedAssessment.status === AssessmentStatus.InitialSetup) {
        internalComponent = (
            <InitialAssessmentSetupComponent
                id={id}
                savedAssessment={savedAssessment}
                setSavedAssessment={setSavedAssessment}
            />
        );
    } else if (savedAssessment.assessmentType === "Quiz") {
        internalComponent = (<QuizzAssessmentComponent
            id={id}
            savedAssessment={savedAssessment}
            setSavedAssessment={setSavedAssessment}
        />);
    }
    return (
        <>
            <AssessmentPageTitle/>
            <Header
                mainHeader="Assessment App"
                secondaryHeader={`${savedAssessment.name}`}
            />
            {internalComponent}
        </>
    );
}
