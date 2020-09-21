import { WeekStartsOn } from 'proton-shared/lib/calendar/interface';
import { FREQUENCY, FREQUENCY_INTERVALS_MAX } from 'proton-shared/lib/calendar/constants';
import React, { ChangeEvent } from 'react';
import { c, msgid } from 'ttag';
import { Select, IntegerInput } from 'react-components';

import RepeatOnRow from './RepeatOnRow';
import SelectMonthlyType from '../inputs/SelectMonthlyType';
import { DateTimeModel, FrequencyModel, EventModelErrors } from '../../../interfaces/EventModel';

interface Props {
    frequencyModel: FrequencyModel;
    start: DateTimeModel;
    weekStartsOn: WeekStartsOn;
    onChange: (value: FrequencyModel) => void;
    errors: EventModelErrors;
    isSubmitted: boolean;
}

const getMaxFrequencyInterval = (frequency: FREQUENCY) => {
    return FREQUENCY_INTERVALS_MAX[frequency];
};

const RepeatEveryRow = ({ frequencyModel, start, weekStartsOn, onChange, errors, isSubmitted }: Props) => {
    const isMonthly = frequencyModel.frequency === FREQUENCY.MONTHLY;
    const isWeekly = frequencyModel.frequency === FREQUENCY.WEEKLY;
    const safeIntervalPlural = frequencyModel.interval || 1; // Can get undefined through the input
    const intervalOptions = [
        { text: c('Option').ngettext(msgid`Day`, `Days`, safeIntervalPlural), value: FREQUENCY.DAILY },
        { text: c('Option').ngettext(msgid`Week`, `Weeks`, safeIntervalPlural), value: FREQUENCY.WEEKLY },
        { text: c('Option').ngettext(msgid`Month`, `Months`, safeIntervalPlural), value: FREQUENCY.MONTHLY },
        { text: c('Option').ngettext(msgid`Year`, `Years`, safeIntervalPlural), value: FREQUENCY.YEARLY },
    ];

    const handleChangeInterval = (interval: number | undefined) => {
        if (interval !== undefined && (interval > getMaxFrequencyInterval(frequencyModel.frequency) || interval < 1)) {
            return;
        }
        onChange({ ...frequencyModel, interval });
    };
    const handleChangeFrequency = (frequency: FREQUENCY) => {
        const newMaxInterval = getMaxFrequencyInterval(frequency);
        const interval = Math.min(frequencyModel.interval || 0, newMaxInterval);
        onChange({ ...frequencyModel, frequency, interval });
    };

    return (
        <div className="flex onmobile-flex-column">
            <div className="flex-item-fluid">
                <label htmlFor="event-custom-frequency-number">{c('Label').t`Repeat every`}</label>
                <div className="flex onmobile-flex-column mt0-5 mb0-5">
                    <div className="flex flex-nowrap flex-item-fluid">
                        <span className="flex-item-fluid">
                            <IntegerInput
                                id="event-custom-frequency-number"
                                data-test-id="event-modal/custom-frequency/interval:input"
                                min={1}
                                value={frequencyModel.interval}
                                onChange={handleChangeInterval}
                                onBlur={() => {
                                    if (!frequencyModel.interval) {
                                        handleChangeInterval(1);
                                    }
                                }}
                                aria-invalid={isSubmitted && !!errors.interval}
                                isSubmitted={isSubmitted}
                                title={c('Title').t`Choose how often this event repeats`}
                            />
                        </span>
                        <span className="flex-item-fluid ml0-5">
                            <Select
                                id="event-custom-frequency-select"
                                data-test-id="event-modal/custom-frequency/interval:frequency"
                                value={frequencyModel.frequency}
                                options={intervalOptions}
                                onChange={({ target }: ChangeEvent<HTMLSelectElement>) =>
                                    handleChangeFrequency(target.value as FREQUENCY)
                                }
                                title={c('Title').t`Select event frequency interval`}
                            />
                        </span>
                    </div>
                    {isMonthly && (
                        <div className="flex-item-fluid ml0-5 onmobile-ml0 onmobile-mt0-5">
                            <SelectMonthlyType
                                id="event-custom-monthly-select"
                                value={frequencyModel.monthly.type}
                                date={start.date}
                                onChange={(type) => onChange({ ...frequencyModel, monthly: { type } })}
                                title={c('Title').t`Select a day in the month`}
                            />
                        </div>
                    )}
                </div>
            </div>
            {isWeekly && (
                <RepeatOnRow
                    frequencyModel={frequencyModel}
                    start={start}
                    weekStartsOn={weekStartsOn}
                    onChange={onChange}
                />
            )}
        </div>
    );
};

export default RepeatEveryRow;
