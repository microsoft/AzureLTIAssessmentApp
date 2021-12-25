import {
    DefaultButton,
    Label,
    PrimaryButton,
    TextField
} from '@fluentui/react';
import React, {useState} from 'react';
import {Col, Container, Row} from 'react-grid-system';
import {useHistory} from 'react-router-dom';
import {Header} from '../../components/Header';
import {RepositoryContext} from "../../context/RepositoryContext";
import {getTheme} from '@fluentui/react';

export interface IButtonExampleProps {
    disabled?: boolean;
    checked?: boolean;
}

export const ImportQuestionBank: React.FunctionComponent<IButtonExampleProps> = props => {
    const theme = getTheme();
    const {disabled, checked} = props;
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    let history = useHistory();
    const redirectBack = () => {
        history.push('/')
    };
    const repositoryContext = React.useContext(RepositoryContext);
    if (repositoryContext == null) {
        return <p>No question bank found</p>
    }
    const createQuestionBank = async () => {
        const createdBank = await repositoryContext.createNewQuestionBank({
            id: "",
            name: name,
            description: description,
            lastModified: new Date(),
            questionIds: [],
            assessmentType: "Quiz",
        });
        history.push(`/spa/question-bank/${createdBank.id}`);
    };

    return (
        <>
            <Header
                mainHeader="Assessment App"
                secondaryHeader="Create Question Bank"
            />
            <br/>
            <div
                style={{
                    backgroundColor: '#faf9f8',
                    width: '70%',
                    margin: 'auto',
                    padding: '10px',
                    boxShadow: theme.effects.elevation8
                }}
            >
                <Container
                    id="new-question-bank-container"
                    style={{margin: '30px', position: 'relative'}}
                >
                    <Row>
                        <Col md={2}>
                            <Label style={{textAlign: 'left'}}>Name</Label>
                        </Col>
                        <Col md={6}>
                            <TextField
                                id="input-question-bank-name"
                                value={name}
                                onChange={(_: any, newValue?: string) => setName(newValue || "")}
                            />
                        </Col>
                    </Row>
                    <br/>
                    <Row>
                        <Col md={2}>
                            <Label style={{textAlign: 'left'}}>Description</Label>
                        </Col>
                        <Col md={6}>
                            <TextField
                                id="input-question-bank-description"
                                multiline rows={2}
                                value={description}
                                onChange={(_: any, newValue?: string) => setDescription(newValue || "")}
                            />
                        </Col>
                    </Row>
                    <br/>
                    <Row>
                        <Col md={2}/>
                        <Col md={1}>
                            <DefaultButton text="Back" onClick={redirectBack} allowDisabledFocus disabled={disabled}
                                           checked={checked}/>
                        </Col>
                        <Col md={1}>
                            <PrimaryButton
                                id="create-question-bank-button"
                                text="Create HEHE"
                                onClick={createQuestionBank}
                                allowDisabledFocus
                                disabled={disabled}
                                checked={checked}
                            />
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    )
}
