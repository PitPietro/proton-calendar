import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { useApi } from 'react-components';
import { wait } from 'proton-shared/lib/helpers/promise';
import { CalendarEvent } from 'proton-shared/lib/interfaces/calendar';
import { getEvent as getEventRoute } from 'proton-shared/lib/api/calendars';
import upsertCalendarApiEvent from './cache/upsertCalendarApiEvent';
import { getIsCalendarEvent } from './cache/helper';
import useGetCalendarEventPersonal from './useGetCalendarEventPersonal';
import useGetCalendarEventRaw from './useGetCalendarEventRaw';
import { CalendarViewEvent } from '../interface';
import { CalendarsEventsCache, DecryptedEventTupleResult } from './interface';

const SLOW_EVENT_BYPASS = {};
const EVENTS_PER_BATCH = 5;
const EVENTS_RACE_MS = 300;

const useCalendarsEventsReader = (
    calendarEvents: CalendarViewEvent[],
    cacheRef: MutableRefObject<CalendarsEventsCache>,
    rerender: () => void
) => {
    const getCalendarEventPersonal = useGetCalendarEventPersonal();
    const getCalendarEventRaw = useGetCalendarEventRaw();
    const api = useApi();
    const [loading, setLoading] = useState(false);
    const abortControllerRef = useRef<AbortController>();

    useEffect(() => {
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        return () => {
            abortController.abort();
        };
    }, []);

    useEffect(() => {
        const signal = abortControllerRef.current?.signal;
        if (!signal) {
            throw new Error('Required variables');
        }

        const getEventApi = (calendarID: string, eventID: string): Promise<CalendarEvent> => {
            return api<{ Event: CalendarEvent }>({ ...getEventRoute(calendarID, eventID), silence: true, signal }).then(
                ({ Event }) => Event
            );
        };
        const getEventDecrypted = (eventData: CalendarEvent): Promise<DecryptedEventTupleResult> => {
            return Promise.all([getCalendarEventRaw(eventData), getCalendarEventPersonal(eventData)]);
        };

        const seen = new Set();

        const calendarEventPromises = calendarEvents.reduce<Promise<void>[]>((acc, calendarViewEvent) => {
            if (acc.length === EVENTS_PER_BATCH) {
                return acc;
            }

            const { calendarData, eventData } = calendarViewEvent.data;
            const calendarEventCache = cacheRef.current?.calendars[calendarData.ID];
            const eventRecord = calendarEventCache?.events.get(eventData?.ID || 'undefined');
            if (!calendarEventCache || !eventRecord || eventRecord.eventReadResult || seen.has(eventRecord)) {
                return acc;
            }

            // To ignore recurring events
            seen.add(eventRecord);

            if (!eventRecord.eventData) {
                eventRecord.eventReadResult = { error: new Error('Unknown process') };
                return acc;
            }

            if (!eventRecord.eventPromise) {
                let promise;
                if (getIsCalendarEvent(eventRecord.eventData)) {
                    promise = getEventDecrypted(eventRecord.eventData);
                } else {
                    promise = getEventApi(calendarData.ID, eventRecord.eventData.ID).then((Event) => {
                        upsertCalendarApiEvent(Event, calendarEventCache);
                        // Relies on a re-render happening which would make this error never show up
                        throw new Error('Outdated event');
                    });
                }
                eventRecord.eventPromise = promise
                    .then((result) => {
                        eventRecord.eventReadResult = { result };
                        eventRecord.eventPromise = undefined;
                    })
                    .catch((error) => {
                        eventRecord.eventReadResult = { error };
                        eventRecord.eventPromise = undefined;
                    });
            }
            acc.push(eventRecord.eventPromise);
            return acc;
        }, []);

        if (calendarEventPromises.length === 0) {
            return setLoading(false);
        }

        let isActive = true;
        setLoading(true);
        const done = () => {
            if (isActive) {
                setLoading(false);
                rerender();
            }
        };

        const run = async () => {
            const allCalendarEventPromise = Promise.all(calendarEventPromises);

            // The first one to complete. It's mostly intended to avoid api event fetches blocking other actions.
            const raceResult = await Promise.race([
                allCalendarEventPromise,
                wait(EVENTS_RACE_MS).then(() => SLOW_EVENT_BYPASS),
            ]);

            // If the slow event bypass won, set up a handler for when all the events have finished (in case a re-render never happens)
            if (raceResult === SLOW_EVENT_BYPASS) {
                allCalendarEventPromise.then(done, done);
            } else {
                done();
            }
        };

        run().catch(done);

        return () => {
            isActive = false;
        };
    }, [calendarEvents]);

    return loading;
};

export default useCalendarsEventsReader;
