import React, {useContext} from 'react';
import './App.css';
import {UnauthenticatedTemplate, useMsal} from "@azure/msal-react";
import {PlatformRegistration} from "./pages/platform/PlatformRegistration";
import {AssessmentPage} from "./pages/assessment/AssessmentPage";
import {HomePage} from "./pages/home/HomePage";
import {Repository} from "./model/Repository";
import {RepositoryContext} from "./context/RepositoryContext";
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom";
import {QuestionBankPage} from './pages/questionBank/QuestionBankPage';
import {QuestionPage} from './pages/question/QuestionPage';
import {NewQuestionBank} from './pages/questionBank/NewQuestionBank';
import {NewQuestionPage} from './pages/question/NewQuestionPage';
import {StudentQuiz} from './pages/assessment/StudentQuiz';
import { StudentWelcomePage } from './pages/assessment/StudentWelcomePage';
import { StudentFinishedAssessment } from './pages/assessment/StudentFinishedAssessment';
// import { FakeRepository } from './model/FakeRepository';


const InternalApp = () => {
    const repositoryContext = useContext(RepositoryContext);
    if (repositoryContext === null || !repositoryContext.isReady()) {
        return <h1>Loading...</h1>
    }
    console.log(`Internal app: ${repositoryContext.isReady()}`);
    return (
        <Router>
            <Switch>
                <Route path="/spa/platform">
                    <PlatformRegistration/>
                </Route>
                <Route path="/spa/assessment/:id">
                    <AssessmentPage/>
                </Route>
                <Route path="/spa/question-bank/:id">
                    <QuestionBankPage/>
                </Route>
                <Route path="/spa/question/:id">
                    <QuestionPage/>
                </Route>
                <Route path="/spa/new-question-bank">
                    <NewQuestionBank/>
                </Route>
                <Route path="/spa/new-question/bank=:bankId">
                    <NewQuestionPage/>
                </Route>
                <Route path="/spa/student-quiz/:id">
                    <StudentQuiz/>
                </Route>
                <Route path="/spa/student-welcome-page/:id">
                    <StudentWelcomePage/>
                </Route>
                <Route path="/spa/student-finished-assessment">
                    <StudentFinishedAssessment/>
                </Route>
                <Route path="/login"/>
                <Route path="/">
                    <HomePage/>
                </Route>
            </Switch>
        </Router>
    )
}


const App = () => {
    const { instance, accounts, inProgress } = useMsal();

    return (
        <div className="App">

            <RepositoryContext.Provider value={new Repository(instance, accounts, inProgress)}>
            {/*<RepositoryContext.Provider value={new FakeRepository()}>*/}

                <InternalApp/>

                <UnauthenticatedTemplate>
                    <p>No users are signed in!</p>
                </UnauthenticatedTemplate>
            </RepositoryContext.Provider>
        </div>
    );
}

export default App;
