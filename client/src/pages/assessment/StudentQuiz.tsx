import {PrimaryButton, Spinner} from '@fluentui/react';
import * as React from 'react';
import {useContext, useEffect, useState} from 'react';
import {StudentQuestionComponent} from '../../components/StudentQuestionComponent';
import {StudentQuestion} from '../../model/StudentQuestion';
import {Header} from '../../components/Header';
import {useHistory, useParams} from 'react-router-dom';
import {RepositoryContext} from "../../context/RepositoryContext";
import {StudentAssessment} from "../../model/StudentAssessment";
import {CountdownCircleTimer} from "react-countdown-circle-timer";

interface StudentQuizParams {
    id: string,
}

export const StudentQuiz = () => {
    const {id} = useParams<StudentQuizParams>();
    const repositoryContext = useContext(RepositoryContext);
    const [questions, setQuestions] = useState<StudentQuestion[]>([])
    const [chosenOptions, setChosenOptions] = useState<{ [id: string]: number }>({});
    const [isLoaded, setIsLoaded] = useState(false);
    const [studentAssessment, setStudentAssessment] = useState<StudentAssessment | null>(null);
    const history = useHistory();
    useEffect(() => {
        const fetchStudentAssessment = async () => {
            if (repositoryContext == null) {
                return;
            }
            const questionsData = await repositoryContext.getStudentQuestions(id);
            setChosenOptions(Object.assign({}, ...questionsData.questions.map(q => ({[q.id]: q.chosenOption}))));
            setQuestions(questionsData.questions);
            setStudentAssessment(questionsData.assessment);
            setIsLoaded(true);
        }
        fetchStudentAssessment();
    }, [id, repositoryContext]);

    if (repositoryContext === null || !isLoaded || studentAssessment === null) {
        return <>
            <Header mainHeader="Assessment App" secondaryHeader="Quiz"/>
            <br/>
            <Spinner
                label="Loading questions..."
            />
        </>
    }

    const finishAssessment = async () => {
        await repositoryContext.submitStudentAssessment(id, chosenOptions);
        history.push(`/spa/student-welcome-page/${id}`);
    }

    const now = Date.now();
    const durationLeft = studentAssessment.durationSeconds - (now - studentAssessment.startTime.getTime()) / 1000;
    const deadlineLeft = (studentAssessment.deadline.getTime() - now) / 1000;
    const timeLeft = Math.min(durationLeft, deadlineLeft);
    console.log(timeLeft)
    console.log(studentAssessment.durationSeconds);

    const createQuestionComponent = (q: StudentQuestion) => {
        return <StudentQuestionComponent
            key={q.id}
            question={q}
            selectedOption={chosenOptions[q.id]}
            setSelectedOption={option => setChosenOptions(prev => ({...prev, [q.id]: option}))}
        />
    }
    const questionComponents = questions.map(createQuestionComponent);
    return (
        <>
            <Header mainHeader="Assessment App" secondaryHeader="Quiz"/>
            {questionComponents}
            <PrimaryButton
                text="Submit"
                onClick={finishAssessment}
            />
            <div style={{
                position: 'sticky',
                bottom: 10,
                left: 0,
                margin: '10px',
            }}>
                <CountdownCircleTimer
                    isPlaying
                    onComplete={() => {
                        history.push("/spa/student-finished-assessment");
                    }}
                    duration={studentAssessment.durationSeconds}
                    initialRemainingTime={timeLeft}
                    colors="#218380"
                    size={120}
                    strokeWidth={6}
                    children={({remainingTime}) => {
                        if (remainingTime === undefined) {
                            return "unknown";
                        }
                        const hours = Math.floor(remainingTime / 3600);
                        const minutes = Math.floor((remainingTime % 3600) / 60);
                        const seconds = remainingTime % 60;
                        const minutesSeconds = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                        if (hours > 0) {
                            return `${hours}:${minutesSeconds}`
                        }
                        return minutesSeconds;
                    }}
                />
            </div>
        </>
    )
}
