import {MaskedTextField} from "@fluentui/react";
import React from "react";

interface TimeSpan {
    hours: number,
    minutes: number,
}

interface TimePickerProps {
    value: TimeSpan,
    onValueChanged: (newValue: TimeSpan) => void,
}

const timeFormat = /^(\d{2}):(\d{2})$/

const checkValueFormat = (value: string) => {
    const result = timeFormat[Symbol.match](value);
    if (!result) {
        return "Invalid time format";
    }
    const hours = Number(result[0]);
    if (hours >= 24) {
        return "Should be between 0 and 23 hours";
    }
    const minutes = Number(result[1]);
    if (minutes >= 60) {
        return "Should be between 0 and 59 minutes";
    }
}

export const TimePicker = (
    {value, onValueChanged}: TimePickerProps
) => {
    const onChange = (_: any, newValue?: string) => {
        if (!newValue) {
            return;
        }
        const result = timeFormat[Symbol.match](newValue);
        if (!result) {
            return;
        }
        const hours = Number(result[1]);
        if (hours >= 24) {
            return;
        }
        const minutes = Number(result[2]);
        if (minutes >= 60) {
            return;
        }
        onValueChanged({
            hours: hours,
            minutes: minutes,
        })
    }
    return (
        <MaskedTextField
            value={`${value.hours.toString().padStart(2, '0')}:${value.minutes.toString().padStart(2, '0')}`}
            onGetErrorMessage={checkValueFormat}
            onChange={onChange}
            mask="99:99"
            maskChar='0'
        />
    )
}