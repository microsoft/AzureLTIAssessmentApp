import {DefaultButton, PrimaryButton} from "@fluentui/react";
import React, {useEffect, useState} from "react";
import {Header} from "../../components/Header";
import {QuestionPageTitle} from "./QuestionPageTitle";
import {useHistory, useParams} from "react-router-dom";
import {RepositoryContext} from "../../context/RepositoryContext";
import {Question} from "../../model/Question";
import {EditQuestionComponent} from "../../components/EditQuestionComponent";
import {getTheme} from '@fluentui/react';
import {Col, Container, Row} from "react-grid-system";

type QuestionPageParams = {
    id: string;
};

export const QuestionPage = () => {
    const theme = getTheme();
    const history = useHistory();
    const [question, setQuestion] = useState<Question>({
        id: "",
        name: "",
        description: "",
        lastModified: new Date(),
        options: ['', ''],
        answer: -1,
    });
    const [savedQuestion, setSavedQuestion] = useState<Question>({
        id: "",
        name: "",
        description: "",
        lastModified: new Date(),
        options: ['', ''],
        answer: -1,
    })
    const {id} = useParams<QuestionPageParams>();
    const repositoryContext = React.useContext(RepositoryContext);
    useEffect(() => {
        const fetchQuestion = async () => {
            if (repositoryContext == null) {
                return;
            }
            const questionData = await repositoryContext.getQuestionById(id);
            setQuestion(questionData);
            setSavedQuestion(questionData);
        }
        fetchQuestion();
    }, [id, repositoryContext]);

    if (repositoryContext == null) {
        return <p>Question cannot be found</p>
    }
    const saveQuestion = async () => {
        await repositoryContext.updateQuestion(question);
        setSavedQuestion(question);
        console.log(question);
    };
    return (
        <>
            <Header
                mainHeader="Assessment App"
                secondaryHeader="Question Settings"
            />
            <QuestionPageTitle/>
            <br/>
            <div style={{
                backgroundColor: '#faf9f8',
                width: '70%',
                margin: 'auto',
                padding: '10px',
                boxShadow: theme.effects.elevation8
            }}>
                <EditQuestionComponent question={question} setQuestion={setQuestion}/>
                <Container style={{margin: '30px', position: 'relative'}}>
                    <Row>
                        <Col md={2}/>
                        <Col md={1}>
                            <DefaultButton text="Back"
                                           allowDisabledFocus
                                           onClick={() => history.goBack()}

                            />
                        </Col>
                        <Col md={1}>
                            <PrimaryButton
                                text="Save"
                                allowDisabledFocus
                                onClick={saveQuestion}
                                disabled={JSON.stringify(question) === JSON.stringify(savedQuestion)}/>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    )
}
