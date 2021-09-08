import * as React from 'react';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';
import { IButtonProps } from '@fluentui/react/lib/Button';
import {useHistory} from "react-router-dom";

const overflowProps: IButtonProps = { ariaLabel: 'More commands' };

export const CommandBarBasicExample: React.FunctionComponent = () => {
    const history = useHistory();
    const redirectToNewQuestionBank = () => {
        history.push("/spa/new-question-bank")}
    const _items: ICommandBarItemProps[] = [
        {
            key: 'newItem',
            text: 'New Question Bank',
            cacheKey: 'myCacheKey', // changing this key will invalidate this item's cache
            iconProps: { iconName: 'Add' },
            onClick: () => {redirectToNewQuestionBank()},
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

