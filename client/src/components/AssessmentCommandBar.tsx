import * as React from 'react';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';
import { IButtonProps } from '@fluentui/react/lib/Button';

const overflowProps: IButtonProps = { ariaLabel: 'More commands' };

interface AssessmentCommandBarProps {
    onSave: () => void;
}

export const AssessmentCommandBar = (
    {onSave}: AssessmentCommandBarProps
) => {
    const _items: ICommandBarItemProps[] = [
        {
            key: 'saveChanges',
            text: 'Save changes',
            cacheKey: 'myCacheKey', // changing this key will invalidate this item's cache
            iconProps: { iconName: 'Save' },
            onClick: onSave,
        },
    ];
    return (
        <div>
            <CommandBar
                items={_items}
                overflowButtonProps={overflowProps}
                ariaLabel="Use left and right arrow keys to navigate between commands"
            />
        </div>
    );
};

