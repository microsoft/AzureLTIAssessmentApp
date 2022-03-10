import {DefaultButton, getTheme, PrimaryButton} from "@fluentui/react";
import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { EditQuestionComponent } from "../../components/EditQuestionComponent";
import {Header} from "../../components/Header";
import { RepositoryContext } from "../../context/RepositoryContext";
import { Question } from "../../model/Question";
import {Col, Container, Row} from "react-grid-system";

interface NewQuestionPageParams {
    bankId: string
}

export const NewQuestionPage = () => {
    const theme = getTheme();
    const history = useHistory();
    const [question, setQuestion] = useState<Question>({
        id: "",
        name: "",
        description: "",
        lastModified: new Date(),
        options: ['', ''],
        answer: [],
        textType:"",
        questionType:"MCQ",
    });
    const {bankId} = useParams<NewQuestionPageParams>();
    const repositoryContext = React.useContext(RepositoryContext);
    if (repositoryContext == null) {
        return <p>Cannot create a new question</p>
    }
    const createQuestion = async () => {
        await repositoryContext.saveNewQuestion(bankId, question);
        history.goBack();
    }
    return (
        <>
            <Header
                mainHeader="Assessment App"
                secondaryHeader="Create a new question"
            />
            <br/>
            <div style={{
                backgroundColor: '#faf9f8',
                width: '70%',
                margin: 'auto',
                padding: '10px',
                boxShadow: theme.effects.elevation8
            }}>
                <EditQuestionComponent question={question}  setQuestion={setQuestion}/>
                <Container style={{margin: '30px', position: 'relative'}}>
                    <Row>
                        <Col md={2}/>
                        <Col md={1}>
                            <DefaultButton text="Cancel" allowDisabledFocus onClick={() => history.goBack()}/>
                        </Col>
                        <Col md={1}>
                            <PrimaryButton text="Create" allowDisabledFocus onClick={createQuestion} id="create-question-button"/>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    )
}
