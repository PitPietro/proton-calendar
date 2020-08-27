import React from 'react';
import {
    Row,
    Info,
    Label,
    Field,
    Checkbox,
    useApi,
    useLoading,
    useEventManager,
    useNotifications,
    AppLink,
} from 'react-components';
import { c } from 'ttag';
import { updateCalendarUserSettings } from 'proton-shared/lib/api/calendars';
import { CalendarUserSettings } from 'proton-shared/lib/interfaces/calendar';
import { APPS } from 'proton-shared/lib/constants';

import ViewPreferenceSelector from '../ViewPreferenceSelector';

interface Props {
    calendarUserSettings: CalendarUserSettings;
}
const LayoutSection = ({ calendarUserSettings: { ViewPreference, DisplayWeekNumber } }: Props) => {
    const api = useApi();
    const { call } = useEventManager();
    const { createNotification } = useNotifications();

    const [loadingView, withLoadingView] = useLoading();
    const [loadingWeekNumberDisplay, withLoadingWeekNumberDisplay] = useLoading();

    const handleChange = async (data: Partial<CalendarUserSettings>) => {
        await api(updateCalendarUserSettings(data));
        await call();
        createNotification({ text: c('Success').t`Preference saved` });
    };

    return (
        <>
            <Row>
                <Label htmlFor="view-select">
                    {c('Label').t`Default view`}{' '}
                    <Info
                        buttonClass="ml0-5 inline-flex"
                        title={c('Info').t`Week and month views only apply to desktop.`}
                    />
                </Label>
                <Field>
                    <ViewPreferenceSelector
                        id="view-select"
                        view={ViewPreference}
                        loading={loadingView}
                        onChange={(ViewPreference) => withLoadingView(handleChange({ ViewPreference }))}
                    />
                </Field>
            </Row>
            <Row>
                <Label htmlFor="week-start-select">{c('Label').t`Week start`}</Label>
                <Field>
                    <AppLink to="/settings" toApp={APPS.PROTONACCOUNT}>{c('Label')
                        .t`Modify in account settings`}</AppLink>
                </Field>
            </Row>
            <Row>
                <Label htmlFor="week-numbers-display">{c('Label').t`Week numbers`}</Label>
                <Field className="pt0-25">
                    <Checkbox
                        id="week-numbers-display"
                        checked={!!DisplayWeekNumber}
                        loading={loadingWeekNumberDisplay}
                        onChange={({ target: { checked } }) =>
                            withLoadingWeekNumberDisplay(handleChange({ DisplayWeekNumber: +checked }))
                        }
                    >{c('Checkbox').t`Show week numbers`}</Checkbox>
                </Field>
            </Row>
        </>
    );
};

export default LayoutSection;
