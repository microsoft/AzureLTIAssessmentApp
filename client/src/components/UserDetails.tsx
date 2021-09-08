import React from 'react';
import {Persona, PersonaSize} from '@fluentui/react';
import {useMsal} from "@azure/msal-react";

export const UserDetails = () => {
    const {accounts} = useMsal();

    if (accounts.length === 0) {
        return <p>No accounts found!</p>
    }
    const current = accounts[0];
    return <div style={{margin: "5px", color: "white"}}>
        <Persona
            imageInitials={current.name?.charAt(0)}
            text={current.name}
            size={PersonaSize.size32}
        />
    </div>
};
