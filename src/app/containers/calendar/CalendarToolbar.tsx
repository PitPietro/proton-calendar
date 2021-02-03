import React, { ReactNode } from 'react';
import { Toolbar, ToolbarSeparator } from 'react-components';

interface Props {
    dateCursorButtons: ReactNode;
    timezoneSelector: ReactNode;
    viewSelector: ReactNode;
}

const CalendarToolbar = ({ dateCursorButtons, timezoneSelector, viewSelector }: Props) => {
    return (
        <Toolbar>
            {dateCursorButtons}
            <ToolbarSeparator className="mlauto" />
            {timezoneSelector}
            <ToolbarSeparator className="no-tablet no-mobile" />
            <span className="no-mobile flex flex-item-noshrink">{viewSelector}</span>
        </Toolbar>
    );
};

export default CalendarToolbar;
