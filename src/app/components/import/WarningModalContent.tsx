import React from 'react';
import { c } from 'ttag';
import { Alert } from 'react-components';
import { IMPORT_CALENDAR_FAQ_URL } from '../../constants';
import { ImportCalendarModel } from '../../interfaces/Import';

import ErrorDetails from './ErrorDetails';

interface Props {
    model: ImportCalendarModel;
}

const WarningModalContent = ({ model }: Props) => {
    const eventsDiscarded = model.errors.filter((e) => e.component === 'vevent');
    const totalSupported = model.eventsParsed.length;
    const totalEventsDiscarded = eventsDiscarded.length;
    const totalEvents = totalSupported + totalEventsDiscarded;

    const learnMore = model.failure ? '' : IMPORT_CALENDAR_FAQ_URL;
    const forNow = <span key="for-now" className="bold">{c('Import calendar warning').t`for now`}</span>;
    const summary =
        totalEventsDiscarded === totalEvents
            ? c('Import warning').t`No event can be imported. Click for details`
            : totalEventsDiscarded === 0
            ? c('Import warning').t`Part of your calendar content is not supported and will not be imported`
            : c('Import warning')
                  .t`${totalEventsDiscarded} out of ${totalEvents} events will not be imported. Click for details`;

    return (
        <>
            <Alert type="warning" learnMore={learnMore}>
                <div>{c('Import calendar warning').jt`ProtonCalendar does not support ${forNow}:`}</div>
                <ul>
                    <li>{c('Import calendar warning').t`Attendees`}</li>
                    <li>{c('Import calendar warning').t`Complex recurring rules`}</li>
                    <li>{c('Import calendar warning').t`To-do's`}</li>
                    <li>{c('Import calendar warning').t`Journals`}</li>
                    <li>{c('Import calendar warning').t`Unofficial or custom timezones`}</li>
                    <li>{c('Import calendar warning').t`Non-Gregorian calendars`}</li>
                </ul>
            </Alert>
            <ErrorDetails summary={summary} errors={model.errors} />
        </>
    );
};

export default WarningModalContent;
