import { MutableRefObject, useEffect, useMemo, useState } from 'react';
import { useApi } from 'react-components';

import { addMilliseconds } from 'proton-shared/lib/date-fns-utc';
import { Calendar as tsCalendar } from 'proton-shared/lib/interfaces/calendar';

import { DAY } from '../../constants';
import getCalendarsAlarmsCached from './getCalendarsAlarmsCached';
import { CalendarAlarmsCache } from './CacheInterface';

const PADDING = 60 * 1000 * 2;

export const getInitialCalendarsAlarmsCache = () => ({
    cache: {},
    start: new Date(2000, 1, 1),
    end: new Date(2000, 1, 1)
});

const useCalendarsAlarms = (
    calendars: tsCalendar[],
    cacheRef: MutableRefObject<CalendarAlarmsCache>,
    lookAhead = 2 * DAY * 1000
) => {
    const api = useApi();
    const [forceRefresh, setForceRefresh] = useState<any>();

    const calendarIDs = useMemo(() => calendars.map(({ ID }) => ID), [calendars]);

    useEffect(() => {
        let timeoutHandle = 0;
        let unmounted = false;

        const update = async () => {
            const now = new Date();

            // Cache is invalid
            if (+cacheRef.current.end - PADDING <= +now) {
                cacheRef.current = {
                    cache: {},
                    start: now,
                    end: addMilliseconds(now, lookAhead),
                    rerender: () => setForceRefresh({})
                };
            }

            const promise = (cacheRef.current.promise = getCalendarsAlarmsCached(
                api,
                cacheRef.current.cache,
                calendarIDs,
                [cacheRef.current.start, cacheRef.current.end]
            ));

            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
            }

            await promise;

            // If it's not the latest, ignore
            if (unmounted || promise !== cacheRef.current.promise) {
                return;
            }

            const delay = Math.max(0, +cacheRef.current.end - PADDING - Date.now());

            timeoutHandle = window.setTimeout(update, delay);

            setForceRefresh({});
        };

        update();

        cacheRef.current.rerender = () => setForceRefresh({});
        return () => {
            cacheRef.current.rerender = undefined;
            unmounted = true;
            clearTimeout(timeoutHandle);
        };
    }, [calendarIDs]);

    return useMemo(() => {
        const { cache } = cacheRef.current;
        return calendarIDs
            .map((calendarID) => {
                return cache[calendarID]?.result ?? [];
            })
            .flat()
            .sort((a, b) => {
                return a.Occurrence - b.Occurrence;
            });
    }, [forceRefresh, calendarIDs]);
};

export default useCalendarsAlarms;
