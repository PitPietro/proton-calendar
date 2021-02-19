import React from 'react';
import { ICAL_ATTENDEE_STATUS } from 'proton-shared/lib/calendar/constants';
import { Icon } from 'react-components';

const { ACCEPTED, DECLINED, TENTATIVE, DELEGATED, NEEDS_ACTION } = ICAL_ATTENDEE_STATUS;

const iconContainerClassName = 'inline-flex rounded50 flex-align-items-center flex-justify-center partstatIcon';
const iconClassName = 'color-global-light';

const IconYes = () => (
    <span className={`${iconContainerClassName} bg-global-success`}>
        <Icon name="on" className={iconClassName} size={8} />
    </span>
);
const IconMaybe = () => (
    <span className={`${iconContainerClassName} bg-global-attention`}>
        <Icon name="question-nocircle" className={iconClassName} size={8} />
    </span>
);
const IconNo = () => (
    <span className={`${iconContainerClassName} bg-global-warning`}>
        <Icon name="off" className={iconClassName} size={8} />
    </span>
);
const IconNeedsAction = () => null;

export const iconMap = {
    [ACCEPTED]: IconYes,
    [DECLINED]: IconNo,
    [TENTATIVE]: IconMaybe,
    [DELEGATED]: () => null,
    [NEEDS_ACTION]: IconNeedsAction,
};

interface Props {
    partstat: ICAL_ATTENDEE_STATUS;
}
const ParticipantStatusIcon = ({ partstat }: Props) => {
    if (partstat === ACCEPTED) {
        return (
            <span className={`${iconContainerClassName} bg-global-success`}>
                <Icon name="on" className={iconClassName} size={8} />
            </span>
        );
    }
    if (partstat === TENTATIVE) {
        return (
            <span className={`${iconContainerClassName} bg-global-attention`}>
                <Icon name="question-nocircle" className={iconClassName} size={8} />
            </span>
        );
    }
    if (partstat === DECLINED) {
        return (
            <span className={`${iconContainerClassName} bg-global-warning`}>
                <Icon name="off" className={iconClassName} size={8} />
            </span>
        );
    }
    if (partstat === NEEDS_ACTION) {
        return null;
    }
    return null;
};

export default ParticipantStatusIcon;
