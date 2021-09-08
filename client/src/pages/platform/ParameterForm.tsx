import React from 'react';
import {Row, Col} from 'react-grid-system';
import {
    TextField,
    FontIcon,
    TooltipHost,
    Label,
} from '@fluentui/react';

interface ParameterFormProps {
    name: string;
    required: boolean;
    info: string;
    content: string;
    isConstant: boolean;
    onChange: (newValue: string) => void;
}

const labelStyle = {
    display: 'inline-block',
    textAlign: 'left' as const,
};

export const ParameterForm = (
    {
        name,
        required,
        info,
        content,
        isConstant,
        onChange,
    }: ParameterFormProps) => {
    const callOnChange = (_: any, newValue?: string) => {onChange(newValue || '')};
    return (
        <>
            <Row align="center">
                <Col md={2} style={labelStyle}>
                    <Label required={required} style={labelStyle}> {name} </Label>
                </Col>
                <Col md={1}>
                    <TooltipHost content={info}>
                        <FontIcon iconName="Info"/>
                    </TooltipHost>
                </Col>
                <Col md={4}>
                    <TextField disabled={isConstant} defaultValue={content} onChange={callOnChange}/>
                </Col>
                <Col  md={2}>
                    {isConstant &&
                    <FontIcon
                        iconName="Copy"
                        onClick={async () => navigator.clipboard.writeText(content)}
                    />
                    }
                </Col>
            </Row>
            <br/>
        </>
    );
}

ParameterForm.defaultProps = {
    required: false,
    content: '',
    isConstant: false,
    onChange: (_: string) => {},
}
