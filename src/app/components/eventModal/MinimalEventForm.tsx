import { MAXIMUM_DATE, MINIMUM_DATE } from 'proton-shared/lib/calendar/constants';
import { WeekStartsOn } from 'proton-shared/lib/calendar/interface';
import React from 'react';
import { c } from 'ttag';
import { Icon, DateInput, classnames, TimeInput } from 'react-components';
import { isSameDay } from 'date-fns';

import AllDayCheckbox from './inputs/AllDayCheckbox';
import { getAllDayCheck } from './eventForm/stateActions';
import { EventModel, EventModelErrors } from '../../interfaces/EventModel';
import useDateTimeFormHandlers from './hooks/useDateTimeFormHandlers';
import createPropFactory from './eventForm/createPropFactory';
import DescriptionInput from './inputs/DescriptionInput';
import LocationInput from './inputs/LocationInput';
import TitleInput from './inputs/TitleInput';
import CalendarSelect from './inputs/CalendarSelect';
import { EnDash } from '../EnDash';
import MinimalErrowRow from './MinimalErrorRow';
import MinimalEventRow from './MinimalEventRow';
import IconRow from './IconRow';

interface Props {
    isSubmitted: boolean;
    isNarrow: boolean;
    displayWeekNumbers: boolean;
    weekStartsOn: WeekStartsOn;
    errors: EventModelErrors;
    model: EventModel;
    setModel: (value: EventModel) => void;
}

const MinimalEventForm = ({ isSubmitted, displayWeekNumbers, weekStartsOn, errors, model, setModel }: Props) => {
    const {
        handleChangeStartDate,
        handleChangeStartTime,
        handleChangeEndDate,
        handleChangeEndTime,
        isDuration,
        minEndTime,
        minEndDate,
    } = useDateTimeFormHandlers({ model, setModel });
    const propsFor = createPropFactory({ model, setModel });
    const endsOnSameDay = isSameDay(model.start.date, model.end.date);

    const startDateInput = (
        <DateInput
            id="startDate"
            className={classnames([!model.isAllDay && 'mr0-5', 'flex-item-fluid', 'flex-item-grow-2'])}
            required
            value={model.start.date}
            onChange={handleChangeStartDate}
            displayWeekNumbers={displayWeekNumbers}
            weekStartsOn={weekStartsOn}
            min={MINIMUM_DATE}
            max={MAXIMUM_DATE}
        />
    );
    const endDateInput = (
        <DateInput
            id="endDate"
            className={classnames([!model.isAllDay && 'mr0-5', 'flex-item-fluid', 'flex-item-grow-2'])}
            required
            value={model.end.date}
            onChange={handleChangeEndDate}
            aria-invalid={!!errors.end}
            displayWeekNumbers={displayWeekNumbers}
            weekStartsOn={weekStartsOn}
            min={minEndDate}
            max={MAXIMUM_DATE}
        />
    );

    const startTimeInput = (
        <TimeInput
            className="flex-item-fluid"
            id="startTime"
            value={model.start.time}
            onChange={handleChangeStartTime}
        />
    );
    const endTimeInput = (
        <TimeInput
            id="endTime"
            className="flex-item-fluid"
            value={model.end.time}
            onChange={handleChangeEndTime}
            aria-invalid={Boolean(errors.end)}
            displayDuration={isDuration}
            min={minEndTime}
        />
    );

    return (
        <>
            <MinimalEventRow
                label={
                    <>
                        <Icon name="circle" color={model.calendar.color} />
                        <span className="sr-only">{c('Label').t`Title`}</span>
                    </>
                }
                labelFor="event-title-input"
            >
                <TitleInput id="event-title-input" type={model.type} isSubmitted={isSubmitted} {...propsFor('title')} />
            </MinimalEventRow>
            <MinimalEventRow label={<Icon name="clock" />} className="flex flex-nowrap flex-row flex-items-center w100">
                {startDateInput}
                {model.isAllDay && !endsOnSameDay && (
                    <>
                        <EnDash />
                        {endDateInput}
                    </>
                )}
                {!model.isAllDay && <>{startTimeInput}</>}
            </MinimalEventRow>
            {!model.isAllDay && (
                <MinimalEventRow className="flex flex-nowrap flex-row flex-items-center w100">
                    {endDateInput}
                    {endTimeInput}
                </MinimalEventRow>
            )}
            <MinimalEventRow>
                <AllDayCheckbox
                    checked={model.isAllDay}
                    onChange={(isAllDay) => setModel({ ...model, ...getAllDayCheck(model, isAllDay) })}
                />
            </MinimalEventRow>
            {model.calendars.length > 0 ? (
                <IconRow icon="calendar" title={c('Label').t`Calendar`} className="flex-item-fluid relative">
                    <CalendarSelect {...{ model, setModel }} />
                </IconRow>
            ) : null}
            <MinimalEventRow
                label={
                    <>
                        <Icon name="address" />
                        <span className="sr-only">{c('Label').t`Location`}</span>
                    </>
                }
                labelFor="event-location-input"
            >
                <LocationInput id="event-location-input" {...propsFor('location')} />
            </MinimalEventRow>
            <MinimalEventRow
                label={
                    <>
                        <Icon name="note" />
                        <span className="sr-only">{c('Label').t`Description`}</span>
                    </>
                }
                labelFor="event-description-input"
            >
                <DescriptionInput id="event-description-input" {...propsFor('description')} />
            </MinimalEventRow>
            <MinimalErrowRow errors={errors} />
        </>
    );
};

export default MinimalEventForm;
