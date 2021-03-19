import React from 'react';
import { Tooltip } from 'react-components';

interface Props {
    icon: React.ReactNode;
    text: string;
    title: string;
    initials: string;
    tooltip: string;
}

const Participant = ({ icon, text, title, tooltip, initials }: Props) => {
    return (
        <div className="participant flex flex-nowrap flex-align-items-center">
            <Tooltip title={tooltip}>
                <div className="participant-display item-icon relative flex flex-item-noshrink flex-align-items-center flex-justify-center bordered-container">
                    <div className="item-abbr">{initials}</div>
                    <span className="participant-status">{icon}</span>
                </div>
            </Tooltip>
            <Tooltip title={title}>
                <div className="max-w100 inline-block text-ellipsis ml1 participant-text text-ellipsis">{text}</div>
            </Tooltip>
        </div>
    );
};

export default Participant;
