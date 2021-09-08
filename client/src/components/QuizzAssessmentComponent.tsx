import {
    DetailsList,
    DetailsRow,
    GroupedList,
    IColumn,
    IGroup,
    IObjectWithKey,
    Label,
    MarqueeSelection,
    MessageBar,
    MessageBarType,
    Persona,
    PersonaSize,
    Pivot,
    PivotItem,
    Selection,
    SelectionMode,
    SelectionZone,
    TextField
} from "@fluentui/react";
import React, {useState, useContext, useEffect} from "react";
import {Col, Container, Row} from "react-grid-system"
import {RepositoryContext} from "../context/RepositoryContext";
import {Assessment} from "../model/Assessment";
import {
    DatePicker,
    DayOfWeek,
    defaultDatePickerStrings,
} from '@fluentui/react';
import {AssessmentCommandBar} from "./AssessmentCommandBar";
import {Member} from "../model/Member";
import {TimePicker} from "./TimePicker";
import {AssessmentStatisticsComponent} from "./AssessmentStatisticsComponent";

const COLUMNS: IColumn[] = [{
    key: "name",
    name: "Name",
    fieldName: "name",
    minWidth: 300,
    isResizable: true,
}];

const STUDENTS_COLUMNS: IColumn[] = [
    {
        key: "student",
        name: "Student",
        fieldName: "student",
        minWidth: 300,
        maxWidth: 600,
        isResizable: true,
        onRender: item => (
            <Persona
                imageUrl={item.picture}
                imageInitials={`${item.givenName.charAt(0)}${item.familyName.charAt(0)}`}
                text={`${item.givenName} ${item.familyName}`}
                size={PersonaSize.size32}
            />
        )
    },
    {
        key: "email",
        name: "Email",
        fieldName: "email",
        minWidth: 300,
        isResizable: true,
    },
]

interface QuestionItem extends IObjectWithKey {
    key: string,
    name: string,
}

interface StudentItem extends Member, IObjectWithKey {}

const getSelectionKeys = (s: Selection) => {
    return s.getSelection()
        .map(i => i.key)
        .filter(k => k !== undefined)
        .map(k => (k || "").toString());
}

interface ParticipantsComponentProps {
    savedAssessment: Assessment,
    students: StudentItem[],
    onSelectionChanged: (selectedIds: string[]) => void,
}

const ParticipantsComponent = ({
    savedAssessment, students, onSelectionChanged
}: ParticipantsComponentProps) => {
    const [selection] = useState<Selection>(() => {
        let resultInitialized = false;
        const result = new Selection({
            onSelectionChanged: () => {
                if (resultInitialized) {
                    const newKeys = getSelectionKeys(result);
                    console.log("selection changed");
                    console.log(newKeys);
                    onSelectionChanged(newKeys);
                }
            }
        });
        console.log("creating state");
        console.log(students);
        console.log(savedAssessment.studentIds);
        result.setItems(students);
        for (const studentId of savedAssessment.studentIds) {
            result.setKeySelected(studentId, true, false);
        }
        resultInitialized = true;
        return result;
    });
    console.log("rerendering participants")
    console.log(students);
    console.log(getSelectionKeys(selection))
    return (
        <MarqueeSelection selection={selection}>
            <DetailsList
                items={students}
                columns={STUDENTS_COLUMNS}
                selection={selection}
                selectionMode={SelectionMode.multiple}
            />
        </MarqueeSelection>
    )
}

interface QuizzAssessmentComponentProps {
    id: string;
    savedAssessment: Assessment;
    setSavedAssessment: (f: (oldValue: Assessment) => Assessment) => void;
}

export const QuizzAssessmentComponent = (
    {id, savedAssessment, setSavedAssessment}: QuizzAssessmentComponentProps
) => {
    const [description, setDescription] = useState<string>(savedAssessment.description);
    const [deadlineDate, setDeadlineDate] = useState<Date>(new Date(
        savedAssessment.deadline.getFullYear(), savedAssessment.deadline.getMonth(), savedAssessment.deadline.getDate()));
    const [deadlineTime, setDeadlineTime] = useState({
        hours: savedAssessment.deadline.getHours(),
        minutes: savedAssessment.deadline.getMinutes(),
    });
    const [duration, setDuration] = useState({
        hours: Math.floor(savedAssessment.durationSeconds / (60 * 60)),
        minutes: Math.floor(savedAssessment.durationSeconds / 60) % 60,
    });
    const [questionsSelection, setQuestionsSelection] = useState<Selection>(new Selection());
    const [groups, setGroups] = useState<IGroup[]>([]);
    const [items, setItems] = useState<QuestionItem[]>([]);
    const [students, setStudents] = useState<StudentItem[]>([]);
    const [studentsLoaded, setStudentsLoaded] = useState<boolean>(false);
    const [selectedStudents, setSelectedStudents] = useState<string[]>(savedAssessment.studentIds);
    const [showSavedMsg, setShowSavedMsg] = useState(false);

    console.log(deadlineDate);

    const repositoryContext = useContext(RepositoryContext);
    useEffect(() => {
        const fetchQuestionBanks = async () => {
            if (repositoryContext == null) {
                return;
            }
            const questionBanks = await repositoryContext.getQuestionBanks();
            const newGroups = [];
            const newItems = [];
            let startIndex = 0;
            for (const bank of questionBanks) {
                const questions = await repositoryContext.getQuestionsFromQuestionBank(bank.id);
                if (questions.length === 0) {
                    continue;
                }
                newGroups.push({
                    count: questions.length,
                    key: bank.id,
                    name: bank.name,
                    startIndex: startIndex,
                })
                newItems.push(...questions.map(q => ({
                    key: q.id,
                    name: q.name,
                })));
                startIndex += questions.length;
            }
            setItems(newItems);
            setGroups(newGroups);
            const newQuestionsSelection = new Selection();
            newQuestionsSelection.setItems(newItems);
            for (const questionId of savedAssessment.questionIds) {
                newQuestionsSelection.setKeySelected(questionId, true, false);
            }
            setQuestionsSelection(newQuestionsSelection);
        }
        const fetchStudents = async () => {
            if (repositoryContext == null) {
                return;
            }
            const newStudents = (await repositoryContext.getStudents(id)).map(s => ({
                ...s,
                key: s.id,
            }));
            setStudents(newStudents);
            setStudentsLoaded(true);
        }
        fetchQuestionBanks();
        fetchStudents();
    }, [id, savedAssessment, repositoryContext])

    if (repositoryContext == null) {
        return <p>Assessment cannot be found</p>
    }

    const onRenderCell = (
        nestingDepth?: number,
        item?: QuestionItem,
        itemIndex?: number,
        group?: IGroup,
    ): React.ReactNode => {
        return item && typeof itemIndex === 'number' && itemIndex > -1 ? (
            <DetailsRow
                columns={COLUMNS}
                groupNestingDepth={nestingDepth}
                item={item}
                itemIndex={itemIndex}
                selection={questionsSelection}
                selectionMode={SelectionMode.multiple}
                compact={false}
                group={group}
            />
        ) : null;
    };

    const saveChanges = async () => {

        setShowSavedMsg(false);
        console.log("save changes");
        console.log(getSelectionKeys(questionsSelection));
        console.log(selectedStudents);
        console.log(duration);
        const durationSeconds = duration.hours * 60 * 60 + duration.minutes * 60;
        const updatedAssessment = {
            ...savedAssessment,
            description: description,
            deadline: new Date(
                deadlineDate.getFullYear(),
                deadlineDate.getMonth(),
                deadlineDate.getDate(),
                deadlineTime.hours,
                deadlineTime.minutes,
            ),
            durationSeconds: durationSeconds,
            questionIds: getSelectionKeys(questionsSelection),
            studentIds: selectedStudents,
        }
        await repositoryContext.updateAssessment(updatedAssessment);
        setShowSavedMsg(true);

        setSavedAssessment(_ => updatedAssessment);

    }

    let participantsComponent;
    if (studentsLoaded) {
        participantsComponent = <ParticipantsComponent
            savedAssessment={savedAssessment}
            students={students}
            onSelectionChanged={setSelectedStudents}
        />
    } else {
        participantsComponent = <p>Loading...</p>
    }

    return (
        <>
            {showSavedMsg && <MessageBar
                messageBarType={MessageBarType.success}
                onDismiss={() => setShowSavedMsg(false)}
                isMultiline={false}
            >
               Changes were saved successfully!
            </MessageBar>}
            <br/>
            <AssessmentCommandBar
                onSave={saveChanges}
            />
            <div style={{
                margin: '30px',
                textAlign: 'left',
            }}>
                <Pivot aria-label="Large Link Size Pivot Example" linkSize="large">
                    <PivotItem headerText="General">
                        <br/>
                        <div style={{textAlign: 'left'}}>
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
                                    <Col md={6}><TextField disabled={true}
                                                           defaultValue={savedAssessment.assessmentType}/>
                                    </Col>
                                </Row>
                                <br/>
                                <Row align='start'>
                                    <Col md={2}><Label>Deadline</Label></Col>
                                    <Col md={4}>
                                        <DatePicker
                                            firstDayOfWeek={DayOfWeek.Monday}
                                            placeholder="Select a date..."
                                            ariaLabel="Select a date"
                                            value={deadlineDate}
                                            minDate={new Date()}
                                            onSelectDate={newDate => {
                                                console.log(newDate);
                                                if (newDate) {
                                                    setDeadlineDate(newDate);
                                                }
                                            }}
                                            // DatePicker uses English strings by default. For localized apps, you must override this prop.
                                            strings={defaultDatePickerStrings}
                                        />
                                        <TimePicker
                                            value={deadlineTime}
                                            onValueChanged={setDeadlineTime}
                                        />
                                    </Col>
                                </Row>
                                <br/>
                                <Row align='start'>
                                    <Col md={2}><Label>Duration</Label></Col>
                                    <Col md={4}>
                                        <TimePicker
                                            value={duration}
                                            onValueChanged={setDuration}
                                        />
                                    </Col>
                                </Row>
                                <br/>
                            </Container>
                        </div>
                    </PivotItem>
                    <PivotItem headerText="Choose questions">
                        <div style={{width: '60%'}}>
                            <SelectionZone selection={questionsSelection} selectionMode={SelectionMode.multiple}>
                                <GroupedList
                                    items={items}
                                    groups={groups}
                                    onRenderCell={onRenderCell}
                                    selection={questionsSelection}
                                    selectionMode={SelectionMode.multiple}
                                />
                            </SelectionZone>
                        </div>
                    </PivotItem>
                    <PivotItem headerText="Participants">
                        <div style={{width: '60%'}}>
                            {participantsComponent}
                        </div>
                    </PivotItem>
                    <PivotItem headerText="Analytics">
                        <AssessmentStatisticsComponent
                            id={id}
                            savedAssessment={savedAssessment}
                        />
                    </PivotItem>
                </Pivot>
            </div>
        </>
    )
}
