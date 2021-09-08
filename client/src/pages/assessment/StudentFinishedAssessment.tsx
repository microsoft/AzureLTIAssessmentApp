import {Label, PrimaryButton } from '@fluentui/react';
import React from 'react';
import { Header } from '../../components/Header';
import { getTheme } from '@fluentui/react';

export const StudentFinishedAssessment = () => {
    const theme = getTheme();
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
                <Label style={{fontSize: '25px'}}>Thank you!</Label>
                <div style={{margin: '40px', textAlign: 'left'}}>
                    <p><b>Module:</b> COMP0066 Introductory Programming</p>
                    <p><b>Assessment name:</b> Introduction to Python</p>
                    <p><b>Assessment type:</b> Quiz</p>
                    <p><b>Assessment status:</b> Finished</p>
                </div>
                <PrimaryButton
                    text='Return to Learning Management System'
                    onClick={event =>  window.location.href='https://moodle.ucl.ac.uk/'}
                />
            </div>
        </>
    )
}
