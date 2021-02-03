import { c } from 'ttag';
import React, { ChangeEvent, DragEvent } from 'react';
import { Bordered, FileInput, Alert, Label, Field, Select, AttachedFile, classnames, Dropzone } from 'react-components';

import { Calendar } from 'proton-shared/lib/interfaces/calendar';
import { ImportCalendarModel } from '../../interfaces/Import';

import { IMPORT_CALENDAR_FAQ_URL, MAX_IMPORT_EVENTS_STRING, MAX_IMPORT_FILE_SIZE_STRING } from '../../constants';

interface Props {
    model: ImportCalendarModel;
    calendars: Calendar[];
    onSelectCalendar: (calendar: Calendar) => void;
    onAttach: (event: ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    isDropzoneHovered: boolean;
    onDrop: (event: DragEvent) => void;
    onDragEnter: (event: DragEvent) => void;
    onDragLeave: (event: DragEvent) => void;
}

const AttachingModalContent = ({
    model,
    calendars,
    onSelectCalendar,
    onAttach,
    onClear,
    isDropzoneHovered,
    onDrop,
    onDragEnter,
    onDragLeave,
}: Props) => {
    const options = calendars.map(({ Name, ID }) => ({ text: Name, value: ID }));
    const handleChange = ({ target }: ChangeEvent<HTMLSelectElement>) => {
        const calendar = calendars.find(({ ID }) => ID === target.value);
        if (calendar) {
            onSelectCalendar(calendar);
        }
    };

    const alert = model.failure ? (
        <Alert type="error">{model.failure?.message}</Alert>
    ) : (
        <Alert type="info" learnMore={IMPORT_CALENDAR_FAQ_URL}>
            {c('Description').t`You can import events in iCal format (.ics file).
                The file should have a maximum size of ${MAX_IMPORT_FILE_SIZE_STRING} and have up to ${MAX_IMPORT_EVENTS_STRING} events.
                If your file is bigger, please split it into smaller files.`}
        </Alert>
    );

    return (
        <>
            {alert}
            <Bordered className={classnames(['flex relative', !!model.failure && 'bordered-container--error'])}>
                {model.fileAttached ? (
                    <AttachedFile file={model.fileAttached} iconName="calendar" onClear={onClear} />
                ) : (
                    <Dropzone
                        isHovered={isDropzoneHovered}
                        onDrop={onDrop}
                        onDragEnter={onDragEnter}
                        onDragLeave={onDragLeave}
                        className="w100"
                    >
                        <FileInput className="center" accept=".ics" id="import-calendar" onChange={onAttach}>
                            {c('Action').t`Choose a file or drag it here`}
                        </FileInput>
                    </Dropzone>
                )}
            </Bordered>
            {calendars.length > 1 && (
                <div className="flex-nowrap mb1 on-mobile-flex-column">
                    <Label className="mr1" htmlFor="import-calendar-select">{c('Label').t`Import to:`}</Label>
                    <Field>
                        <Select
                            id="import-calendar-select"
                            loading={false}
                            onChange={handleChange}
                            value={model.calendar.ID}
                            options={options}
                        />
                    </Field>
                </div>
            )}
        </>
    );
};

export default AttachingModalContent;
