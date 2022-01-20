import {
    Text,
    DefaultButton,
    DetailsList,
    DetailsListLayoutMode,
    Dialog,
    DialogFooter,
    DialogType, Label, MessageBar, MessageBarType, PrimaryButton,
    Selection,
    SelectionMode, Separator
} from '@fluentui/react';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Link, useHistory, useParams} from 'react-router-dom';
import {Header} from '../../components/Header';
import {RepositoryContext} from '../../context/RepositoryContext';
import {QuestionBank} from "../../model/QuestionBank";
import {IColumn} from "@fluentui/react/lib/DetailsList";
import {CommandBar, ICommandBarItemProps} from "@fluentui/react/lib/CommandBar";
import {IButtonProps} from "@fluentui/react/lib/Button";
import {Col, Container, Row} from "react-grid-system";

const overflowProps: IButtonProps = { ariaLabel: 'More commands' };

const COLUMNS: IColumn[] = [
    {
        key: "name",
        name: "Name",
        fieldName: "name",
        minWidth: 100,
        maxWidth: 700,
        isResizable: true,
        onRender: item => (
            <Link to={`/spa/question/${item.key}`} style={{
                color: "black"
            }}>
                {item.name}
            </Link>
        )
    },
    {key: "modified", name: "Modified", fieldName: "modified", minWidth: 100, maxWidth: 300, isResizable: true},
];

type QuestionBankPageParams = {
    id: string;
};

interface QuestionListItem {
    key: string,
    name: string,
    modified: string,
}

const modalPropsStyles = { main: { maxWidth: 450 } };

const deleteDialogContentProps = {
    type: DialogType.normal,
    title: 'Deleting questions',
    subText: 'Are you sure you want to delete the selected questions?'
}

export const QuestionBankPage = () => {
    const history = useHistory();
    const {id} = useParams<QuestionBankPageParams>();
    const descRef = useRef<HTMLDivElement>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const deleteDialogModalProps = useMemo(() => ({
        isBlocking: true,
        styles: modalPropsStyles,
    }), []);
    const repositoryContext = React.useContext(RepositoryContext);
    const [questionBankName, setQuestionBankName] = useState<string> ("")
    const [questionBank, setQuestionBank] = useState<QuestionBank>({
        id: "",
        name: questionBankName,
        description: "",
        lastModified: new Date(),
        questionIds: [],
        assessmentType: "Quiz",
    })
   
    const [questions, setQuestions] = useState<QuestionListItem[]>([]);
    const [selectionCount, setSelectionCount] = useState(0);
    const [selection] = useState(new Selection({
        onSelectionChanged: () => {
            setSelectionCount(selection.getSelectedCount());
        }
    }));
    const [showDeleteMsg, setShowDeleteMsg] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            if (repositoryContext == null) {
                return;
            }
            const fetchedQuestionBank = await repositoryContext.getQuestionBankById(id);
            const fetchedQuestions = await repositoryContext.getQuestionsFromQuestionBank(id);
            setQuestionBank(fetchedQuestionBank);
            setQuestions(fetchedQuestions.map(
                q => ({
                    key: q.id,
                    name: q.name,
                    modified: q.lastModified.toDateString(),
                })
            ));
        }
        fetchData();
    }, [id, repositoryContext])
    if (repositoryContext == null) {
        return <p>Question Bank cannot be found</p>
    }
    const redirectToNewQuestion = () => {
        history.push(`/spa/new-question/bank=${id}`);
    }
    const _items: ICommandBarItemProps[] = [
        {
            key: 'newQuestion',
            text: 'New Question',
            cacheKey: 'myCacheKey', // changing this key will invalidate this item's cache
            iconProps: { iconName: 'Add' },
            className: 'new-question-button',
            onClick: () => {redirectToNewQuestion()},
        },
        {
            key: 'delete',
            text: 'Delete',
            disabled: selectionCount === 0,
            onClick: () => {
                setShowDeleteMsg(false);
                setShowDeleteDialog(true);
            },
            iconProps: { iconName: 'Delete' }
        },
    ];

    const deleteSelectedQuestions = async () => {
        const selectedKeys = selection.getSelection()
            .map(item => item.key)
            .filter(key => key !== undefined && key !== null)
            .map(key => key || "")
            .map(key => key.toString());
        await repositoryContext.deleteQuestions(selectedKeys);
        setShowDeleteDialog(false);
        const fetchedQuestionBank = await repositoryContext.getQuestionBankById(id);
        const fetchedQuestions = await repositoryContext.getQuestionsFromQuestionBank(id);
        setQuestionBank(fetchedQuestionBank);
        setQuestions(fetchedQuestions.map(
            q => ({
                key: q.id,
                name: q.name,
                modified: q.lastModified.toDateString(),
            })
        ));
        setShowDeleteMsg(true);
    }
    return (
        <>
            <Header
                mainHeader="Assessment App"
                secondaryHeader={`${questionBank.name}`}
            />
            {showDeleteMsg && <MessageBar
                messageBarType={MessageBarType.success}
                onDismiss={() => setShowDeleteMsg(false)}
                isMultiline={false}
            >
                Questions were deleted successfully!
            </MessageBar>}
            <br/>
            <CommandBar
                items={_items}
                overflowButtonProps={overflowProps}
                ariaLabel="Use left and right arrow keys to navigate between commands"
            />
            <Dialog
                hidden={!showDeleteDialog}
                onDismiss={() => setShowDeleteDialog(false)}
                dialogContentProps={deleteDialogContentProps}
                modalProps={deleteDialogModalProps}
            >
                <DialogFooter>
                    <PrimaryButton onClick={deleteSelectedQuestions} text="Delete"/>
                    <DefaultButton onClick={() => setShowDeleteDialog(false)} text="Cancel"/>
                </DialogFooter>
            </Dialog>
            <Separator/>
            <Container style={{margin: '30px', position: 'relative'}} fluid>
                <Row justify='inherit'>
                    <Col md='content'>
                        <Label style={{
                            textAlign: 'left',
                            width: descRef.current ? descRef.current.offsetWidth : 50
                        }}>Name</Label>
                    </Col>
                    <Col  style={{textAlign: 'left'}}>
                        <Text id="question-bank-name">{questionBank.name}</Text>
                    </Col>
                </Row>
                <br/>
                <Row justify='start'>
                    <Col md='content'>
                        <div ref={descRef}>
                            <Label style={{textAlign: 'left'}}>Description</Label>
                        </div>
                    </Col>
                    <Col style={{textAlign: 'left'}}>
                        <Text id="question-bank-description">{questionBank.description}</Text>
                    </Col>
                </Row>
                <br/>
            </Container>
            <div style={{
                width: '90%',
                margin: 'auto',
                padding: '10px',
            }}>

                <DetailsList
                    items={questions}
                    columns={COLUMNS}
                    selectionMode={SelectionMode.multiple}
                    selection={selection}
                    layoutMode={DetailsListLayoutMode.justified}
                />
            </div>
        </>
    )
}
