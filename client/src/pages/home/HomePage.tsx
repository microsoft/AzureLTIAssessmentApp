import * as React from 'react';
import {DetailsList, SelectionMode, DetailsListLayoutMode, IColumn} from '@fluentui/react/lib/DetailsList';
import {RepositoryContext} from '../../context/RepositoryContext';
import {Header} from '../../components/Header';
import {Link, useHistory} from "react-router-dom";
import {HomePageTitle} from "./HomePageTitle";
import {
    DefaultButton,
    Dialog,
    DialogFooter, DialogType,
    MarqueeSelection, MessageBar, MessageBarType,
    Pivot,
    PivotItem,
    PrimaryButton,
    Selection
} from '@fluentui/react';
import {useEffect, useMemo, useState} from "react";
import {AssessmentStatus} from "../../model/AssessmentStatus";
import {CommandBar, ICommandBarItemProps} from "@fluentui/react/lib/CommandBar";
import {IButtonProps} from "@fluentui/react/lib/Button";
import FileSaver from "file-saver";
import {UploadQuestionBanksComponent} from "../../components/UploadQuestionBanksComponent";

const COLUMNS_QUESTION_BANKS: IColumn[] = [
    {
        key: "name",
        name: "Name",
        fieldName: "name",
        minWidth: 100,
        maxWidth: 500,
        isResizable: true,
        onRender: item => (
            <Link to={`/spa/question-bank/${item.key}`} style={{
                color: "black"
            }}>
                {item.name}
            </Link>
        )
    },
    {
        key: "lastModified",
        name: "Modified",
        fieldName: "lastModified",
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: "assessmentType",
        name: "Type",
        fieldName: "assessmentType",
        minWidth: 10,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: "fileSize",
        name: "File Size",
        fieldName: "fileSize",
        minWidth: 10,
        maxWidth: 200,
        isResizable: true
    },
];

const COLUMNS_ASSESSMENTS: IColumn[] = [
    {
        key: "name",
        name: "Name",
        fieldName: "name",
        minWidth: 100,
        maxWidth: 500,
        isResizable: true,
        onRender: item => (
            <Link to={`/spa/assessment/${item.key}`} style={{
                color: "black"
            }}>
                {item.name}
            </Link>
        )
    },
    {
        key: "lastModified",
        name: "Modified",
        fieldName: "lastModified",
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: "assessmentType",
        name: "Type",
        fieldName: "assessmentType",
        minWidth: 10,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: "status",
        name: "Status",
        fieldName: "status",
        minWidth: 10,
        maxWidth: 200,
        isResizable: true
    }
];

const overflowProps: IButtonProps = { ariaLabel: 'More commands' };

const modalPropsStyles = { main: { maxWidth: 450 } };

const deleteDialogContentProps = {
    type: DialogType.normal,
    title: 'Deleting question banks',
    subText: 'Are you sure you want to delete the selected question banks?'
}

interface AssessmentListItem {
    key: string,
    name: string,
    lastModified: string,
    assessmentType: string,
    status: AssessmentStatus,
}

interface QuestionBankListItem {
    key: string,
    name: string
    lastModified: string,
    assessmentType: string,
}

enum TabKey {
    assessments = 'Assessments',
    questionBanks = 'Question Banks',
}

export const HomePage = () => {
    const history = useHistory();
    const [assessments, setAssessments] = useState<AssessmentListItem[]>([]);
    const [questionBanks, setQuestionBanks] = useState<QuestionBankListItem[]>([]);
    const [selectedTab, setSelectedTab] = useState<string>(TabKey.assessments);
    const [selectionCount, setSelectionCount] = useState(0);
    const [selection] = useState(new Selection({
        onSelectionChanged: () => {
            setSelectionCount(selection.getSelectedCount());
        }
    }));
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDeleteMsg, setShowDeleteMsg] = useState(false);
    const deleteDialogModalProps = useMemo(() => ({
        isBlocking: true,
        styles: modalPropsStyles,
    }), []);
    const [hiddenUploadDialog, setHiddenUploadDialog] = useState(true);
    const [showUploadSuccessMsg, setShowUploadSuccessMsg] = useState(false);
    const repositoryContext = React.useContext(RepositoryContext);
    useEffect(() => {
        const fetchState = async () => {
            if (repositoryContext == null) {
                return;
            }
            const fetchedAssessments = await repositoryContext.getAssessments();
            const fetchedQuestionBanks = await repositoryContext.getQuestionBanks();
            setAssessments(fetchedAssessments.map(
                a => ({
                    key: a.id,
                    name: a.name,
                    lastModified: a.lastModified.toDateString(),
                    assessmentType: a.assessmentType,
                    status: a.status,
                })
            ));
            setQuestionBanks(fetchedQuestionBanks.map(
                q => ({
                    key: q.id,
                    name: q.name,
                    lastModified: q.lastModified.toDateString(),
                    assessmentType: q.assessmentType,
                    fileSize: `${q.questionIds.length} items`,
                })
            ));
        }
        fetchState();
    }, [repositoryContext])
    if (repositoryContext == null) {
        return <p>No assignments so far</p>
    }

    const redirectToAssessment = (item: any) => {
        history.push(`/spa/assessment/${item.id}`)
    }

    const redirectToQuestionBank = (item: any) => {
        history.push(`/spa/question-bank/${item.id}`)
    }

    const redirectToNewQuestionBank = () => {
        history.push("/spa/new-question-bank")
    }

    const reloadData = async () => {
        const fetchedAssessments = await repositoryContext.getAssessments();
        const fetchedQuestionBanks = await repositoryContext.getQuestionBanks();
        setAssessments(fetchedAssessments.map(
            a => ({
                key: a.id,
                name: a.name,
                lastModified: a.lastModified.toDateString(),
                assessmentType: a.assessmentType,
                status: a.status,
            })
        ));
        setQuestionBanks(fetchedQuestionBanks.map(
            q => ({
                key: q.id,
                name: q.name,
                lastModified: q.lastModified.toDateString(),
                assessmentType: q.assessmentType,
                fileSize: `${q.questionIds.length} items`,
            })
        ));
    }

    const deleteSelectedQuestionBanks = async () => {
        const selectedKeys = selection.getSelection()
            .map(item => item.key)
            .filter(key => key !== undefined && key !== null)
            .map(key => key || "")
            .map(key => key.toString());
        await repositoryContext.deleteQuestionBanks(selectedKeys);
        setShowDeleteDialog(false);
        await reloadData();
        setShowDeleteMsg(true);
    }

    const downloadSelectedQuestionBanks = async () => {
        const questionBankIds = selection.getSelection().map(i => i.key?.toString());
        const result = [];
        for (let questionBankId of questionBankIds) {
            if (questionBankId) {
                const bank = await repositoryContext.getQuestionBankById(questionBankId);
                const questions = [];
                for (let questionId of bank.questionIds) {
                    const question = await repositoryContext.getQuestionById(questionId);
                    questions.push({
                        name: question.name,
                        description: question.description,
                        options: question.options,
                        answer: question.answer,
                    })
                }
                result.push({
                    name: bank.name,
                    description: bank.description,
                    questions: questions,
                    assessmentType: bank.assessmentType,
                })
            }
        }
        const date = new Date();
        const file = new File([JSON.stringify(result)], `question_banks_${date.toUTCString()}.json`,  {type: "application/json;charset=utf-8"});
        FileSaver.saveAs(file);
    }

    const _items: ICommandBarItemProps[] = [
        {
            key: 'newItem',
            text: 'New Question Bank',
            cacheKey: 'myCacheKey', // changing this key will invalidate this item's cache
            iconProps: { iconName: 'Add' },
            className: "new-question-bank-button",
            onClick: redirectToNewQuestionBank,
        },
        {
            key: 'upload',
            text: 'Upload',
            iconProps: { iconName: 'Upload' },
            onClick: () => {
                setShowUploadSuccessMsg(false);
                setHiddenUploadDialog(false);
            }
        },
        {
            key: 'download',
            text: 'Download',
            iconProps: { iconName: 'Download' },
            disabled: selectionCount === 0,
            onClick: () => { downloadSelectedQuestionBanks() },
        },
        {
            key: 'delete',
            text: 'Delete',
            disabled: selectionCount === 0,
            className: 'delete-question-bank-button',
            onClick: () => {
                setShowDeleteMsg(false);
                setShowDeleteDialog(true);
            },
            iconProps: { iconName: 'Delete' }
        },
    ];
    console.log(assessments);

    return (
        <>
            <div>
                <HomePageTitle/>
                <Header
                    mainHeader="Assessment App"
                    secondaryHeader="Home"
                />
                {showDeleteMsg && <MessageBar
                    messageBarType={MessageBarType.success}
                    onDismiss={() => setShowDeleteMsg(false)}
                    isMultiline={false}
                >
                    Question Banks were deleted successfully!
                </MessageBar>}
                {showUploadSuccessMsg && <MessageBar
                    messageBarType={MessageBarType.success}
                    onDismiss={() => setShowUploadSuccessMsg(false)}
                    isMultiline={false}
                >
                    Question Banks were uploaded successfully!
                </MessageBar>}
                <br/>
                <CommandBar
                    items={_items}
                    overflowButtonProps={overflowProps}
                    // farItems={_farItems}
                    ariaLabel="Use left and right arrow keys to navigate between commands"
                />
                <Dialog
                    hidden={!showDeleteDialog}
                    onDismiss={() => setShowDeleteDialog(false)}
                    dialogContentProps={deleteDialogContentProps}
                    modalProps={deleteDialogModalProps}
                >
                    <DialogFooter>
                        <PrimaryButton
                            onClick={deleteSelectedQuestionBanks}
                            text="Delete"
                            id="delete-question-bank-confirm-button"
                        />
                        <DefaultButton onClick={() => setShowDeleteDialog(false)} text="Cancel"/>
                    </DialogFooter>
                </Dialog>
                <UploadQuestionBanksComponent
                    hidden={hiddenUploadDialog}
                    onFinish={async (done) => {
                        if (done) {
                            await reloadData();
                            setShowUploadSuccessMsg(true);
                        }
                        setHiddenUploadDialog(true);
                    }}
                />
                <div style={{margin: '50px', textAlign: 'left'}}>
                    <Pivot
                        id="home-page-tabs"
                        linkSize="large"
                        selectedKey={selectedTab}
                        onLinkClick={(item) => {
                            if (item && item.props.itemKey) {
                                setSelectedTab(item.props.itemKey);
                            }
                        }}
                    >
                        <PivotItem headerText="Assessments" itemKey={TabKey.assessments}>
                            <DetailsList
                                items={assessments}
                                columns={COLUMNS_ASSESSMENTS}
                                selectionMode={SelectionMode.none}
                                layoutMode={DetailsListLayoutMode.justified}
                                onItemInvoked={redirectToAssessment}
                            />
                        </PivotItem>
                        <PivotItem headerText="Question Banks" itemKey={TabKey.questionBanks}>
                            <MarqueeSelection selection={selection}>
                                <DetailsList
                                    items={questionBanks}
                                    columns={COLUMNS_QUESTION_BANKS}
                                    selection={selection}
                                    selectionMode={SelectionMode.multiple}
                                    layoutMode={DetailsListLayoutMode.justified}
                                    onItemInvoked={redirectToQuestionBank}
                                />
                            </MarqueeSelection>
                        </PivotItem>
                    </Pivot>
                </div>
            </div>
        </>
    )
}
