import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import {MsalAuthenticationTemplate, MsalProvider} from "@azure/msal-react";
import {Configuration, InteractionType, PublicClientApplication} from "@azure/msal-browser";

initializeIcons();

// MSAL configuration
const configuration: Configuration = {
    auth: {
        // clientId: '6bf0ea7a-239d-414a-8e0f-c88bac05b6c8',
        // authority: 'https://login.microsoftonline.com/8e149a57-04b4-4215-9cff-5a23fc0a7fbf',
        clientId: `${process.env.REACT_APP_CLIENT_ID}`,
        authority: `https://login.microsoftonline.com/${process.env.REACT_APP_TENANT_ID}`,
        redirectUri: `${window.location.origin}/login`,
    }
};

const pca = new PublicClientApplication(configuration);
const LoadingComponent = () => <p>Authentication in progress...</p>;
// Component
const AppProvider = () => (
    <MsalProvider instance={pca}>
        <React.StrictMode>
            <MsalAuthenticationTemplate
                interactionType={InteractionType.Redirect}
                loadingComponent={LoadingComponent}>
            <App />
            </MsalAuthenticationTemplate>
        </React.StrictMode>
    </MsalProvider>
);

ReactDOM.render(
  <AppProvider/>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
