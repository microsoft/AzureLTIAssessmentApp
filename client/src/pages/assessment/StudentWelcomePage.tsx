import {getTheme, Label, PrimaryButton, Spinner} from '@fluentui/react';
import React, {useContext, useEffect, useState} from 'react';
import {Header} from '../../components/Header';
import {useHistory, useParams} from 'react-router-dom';
import {RepositoryContext} from "../../context/RepositoryContext";
import {StudentAssessment} from "../../model/StudentAssessment";
import {StudentResponseStatus} from "../../model/StudentResponseStatus";

interface StudentWelcomePageParams {
    id: string,
}

export const StudentWelcomePage = () => {
    const {id} = useParams<StudentWelcomePageParams>();
    const repositoryContext = useContext(RepositoryContext);
    const [studentAssessment, setStudentAssessment] = useState<StudentAssessment>();
    const history = useHistory();
    useEffect(() => {
        const fetchStudentAssessment = async () => {
            if (repositoryContext == null) {
                return;
            }
            const assessmentData = await repositoryContext.getStudentAssessment(id);
            setStudentAssessment(assessmentData);
        }
        fetchStudentAssessment();
    }, [id, repositoryContext]);
    const redirectToAssessment = () =>{
        let path = `/spa/student-quiz/${id}`;
        history.push(path);
    }
    const theme = getTheme();
    if (repositoryContext === null || studentAssessment === undefined) {
        return <>
            <Header mainHeader="Assessment App" secondaryHeader="Quiz"/>
            <br/>
            <Spinner
                label="Loading assessment data..."
            />
        </>
    }

    const timeIsOver = () => {
        const now = Date.now();
        if (studentAssessment.deadline.getTime() < now) {
            return true;
        }
        const durationLeft = studentAssessment.durationSeconds - (now - studentAssessment.startTime.getTime()) / 1000;
        return durationLeft <= 0;
    }

    const durationHours = Math.floor(studentAssessment.durationSeconds / (60 * 60));
    const durationMinutes = Math.floor(studentAssessment.durationSeconds / 60) % 60;

    const basicInfo = <>
        <p><b>Module:</b> {studentAssessment.courseName}</p>
        <p><b>Assessment name:</b> {studentAssessment.name}</p>
        <p><b>Assessment type:</b> {studentAssessment.assessmentType}</p>
        <p><b>Questions:</b> {studentAssessment.numberOfQuestions}</p>
        <p><b>Status:</b> {studentAssessment.status}</p>
    </>
    let infoComponent = <h1>Unknown assessment status.</h1>
    if (studentAssessment.status === StudentResponseStatus.Complete) {
        infoComponent = (<>
            <div style={{margin: '40px', textAlign: 'left'}}>
                {basicInfo}
            </div>
        </>)
    } else if (timeIsOver()) {
        infoComponent = (<>
            <div style={{margin: '40px', textAlign: 'left'}}>
                <p><b>Module:</b> {studentAssessment.courseName}</p>
                <p><b>Assessment name:</b> {studentAssessment.name}</p>
                <p><b>Assessment type:</b> {studentAssessment.assessmentType}</p>
                <p><b>Questions:</b> {studentAssessment.numberOfQuestions}</p>
                <p><b>Status:</b> Time is over</p>
            </div>
        </>)
    } else if (studentAssessment.status === StudentResponseStatus.NotStarted) {
        infoComponent = (<>
            <div style={{margin: '40px', textAlign: 'left'}}>
                {basicInfo}
                <p><b>Deadline:</b> {studentAssessment.deadline.toLocaleDateString()} {studentAssessment.deadline.toLocaleTimeString()}</p>
                <p><b>Duration:</b> {durationHours} hours, {durationMinutes} minutes</p>
            </div>
            <PrimaryButton
                text='Start'
                onClick={redirectToAssessment}
            />
        </>)
    } else if (studentAssessment.status === StudentResponseStatus.InProgress) {
        infoComponent = (<>
            <div style={{margin: '40px', textAlign: 'left'}}>
                {basicInfo}
                <p><b>Deadline:</b> {studentAssessment.deadline.toLocaleDateString()} {studentAssessment.deadline.toLocaleTimeString()}</p>
                <p><b>Duration:</b> {durationHours} hours, {durationMinutes} minutes</p>
            </div>
            <PrimaryButton
                text='Continue'
                onClick={redirectToAssessment}
            />
        </>)
    }
    return (
        <>
            <Header mainHeader="Assessment App" secondaryHeader="Quiz"/>
            <br/>
            <div style={{
                backgroundColor: '#faf9f8',
                width: '60%',
                margin: 'auto',
                padding: '10px',
                boxShadow: theme.effects.elevation8
            }}>
                <Label style={{fontSize: '25px'}}>Welcome to Assessment App!</Label>
                {infoComponent}
            </div>
        </>
    )
}
