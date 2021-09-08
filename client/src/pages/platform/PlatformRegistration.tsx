import React, {useEffect, useState} from 'react';
import {Container, Row} from 'react-grid-system';
import {ParameterForm} from "./ParameterForm";
import {PrimaryButton} from '@fluentui/react';
import {PlatformResponse} from "./PlatformResponse";
import {platformService} from "./PlatformService";
import {PlatformRequest} from "./PlatformRequest";
import {PlatformPageTitle} from "./PlatformPageTitle";
import {Header} from '../../components/Header';

export const PlatformRegistration = () => {
    const [platformData, setPlatformData] = useState<PlatformResponse | null>(null);
    const [userData, setUserData] = useState<PlatformRequest>({
        displayName: "",
        issuer: "",
        jwkSetUrl: "",
        accessTokenUrl: "",
        authorizationUrl: "",
        clientId: "",
        institutionName: "",
        logoUrl: "",
    });
    const [saveEnabled, setSaveEnabled] = useState<boolean>(true);
    const saveChanges = async () => {
        setSaveEnabled(false);
        await platformService.updatePlatform(userData);
        setSaveEnabled(true);
    };
    const fetchPlatformData = async () => {
        const response = await platformService.getPlatform();
        setPlatformData(response);
        setUserData({
            displayName: response.displayName,
            issuer: response.issuer,
            jwkSetUrl: response.jwkSetUrl,
            accessTokenUrl: response.accessTokenUrl,
            authorizationUrl: response.authorizationUrl,
            clientId: response.clientId,
            institutionName: response.institutionName,
            logoUrl: response.logoUrl,
        });
    };
    useEffect(() => {
        fetchPlatformData()
    }, []);
    if (!platformData) {
        return (
            <h2>Loading...</h2>
        )
    }
    return (
        <>
            <PlatformPageTitle/>
            <Header mainHeader="Platform registration"/>
            <Container>
                <Row><h3>Platform Settings</h3></Row>
                <ParameterForm name={'Display Name'}
                               required={true}
                               info={'The display name of the tool in the backend. For debug purposes.'}
                               content={platformData.displayName}
                               onChange={(newValue) => setUserData({...userData, displayName: newValue})}/>
                <ParameterForm name={'Issuer'}
                               required={true}
                               info={'This is the Issuer for all messages that originate from the Platform.'}
                               content={platformData.issuer}
                               onChange={(newValue) => setUserData({...userData, issuer: newValue})}/>
                <ParameterForm name={'JWK Set URL'}
                               required={true}
                               info={'The tool can retrieve the platform\'s public keys using this endpoint.'}
                               content={platformData.jwkSetUrl}
                               onChange={(newValue) => setUserData({...userData, jwkSetUrl: newValue})}/>
                <ParameterForm name={'Access Token URL'}
                               required={true}
                               info={'The tool can request an access token using this endpoint (for example to use the Names and Role Service).'}
                               content={platformData.accessTokenUrl}
                               onChange={(newValue) => setUserData({...userData, accessTokenUrl: newValue})}/>
                <ParameterForm name={'Authorization URL'}
                               required={true}
                               info={'The tool requests the identity token from this endpoint.'}
                               content={platformData.authorizationUrl}
                               onChange={(newValue) => setUserData({...userData, authorizationUrl: newValue})}/>
                <Row><h3>Tool Settings</h3></Row>
                <ParameterForm name={'Login URL'}
                               info={'The URL to initiate the tool\'s OpenID Connect third party login.'}
                               content={platformData.loginUrl}
                               isConstant={true}/>
                <ParameterForm name={'Launch URL'}
                               info={'The URL to launch the tool\'s resource link experience.'}
                               content={platformData.launchUrl}
                               isConstant={true}/>
                <ParameterForm name={'Domain URL'}
                               info={'The Domain URL of the tool.'}
                               content={platformData.domainUrl}
                               isConstant={true}/>
                <ParameterForm name={'Client ID'}
                               required={true}
                               info={'The client ID which is provided by the LMS for this specific registration.'}
                               content={platformData.clientId}
                               onChange={(newValue) => setUserData({...userData, clientId: newValue})}/>
                <ParameterForm name={'Public Key'}
                               info={'The public part of the RSA key to allow LMS to validate the messages that are sent by the tool.'}
                               content={platformData.publicKey}
                               isConstant={true}/>
                <ParameterForm name={'Public JWK'}
                               info={'The Json Web Key (JWK) representation of the Public Key to allow LMS to validate the messages that are sent by the tool.'}
                               content={platformData.publicJwk}
                               isConstant={true}/>
                <ParameterForm name={'Public JWK Set URL'}
                               info={'The URL providing the Json Web Key Set(JWKS) to allow LMS to validate the messages that are sent by the tool.'}
                               content={platformData.publicJwkSetUrl}
                               isConstant={true}/>
                <Row><h3>Personalization</h3></Row>
                <ParameterForm name={'Institution Name'}
                               info={'The name of the institution which will be displayed to the users.'}
                               content={platformData.institutionName}
                               onChange={(newValue) => setUserData({...userData, institutionName: newValue})}/>
                <ParameterForm name={'Logo URL'}
                               info={'The logo which will be displayed to the users.'}
                               content={platformData.logoUrl}
                               onChange={(newValue) => setUserData({...userData, logoUrl: newValue})}/>
            </Container>
            <PrimaryButton text="Save Registration"
                           allowDisabledFocus
                           disabled={!saveEnabled}
                           onClick={saveChanges}
            />
            <br/>
        </>
    );
}
