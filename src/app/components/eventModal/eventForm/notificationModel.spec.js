import { fromTriggerString } from 'proton-shared/lib/calendar/vcal';
import { SETTINGS_NOTIFICATION_TYPE } from 'proton-shared/lib/interfaces/calendar/Calendar';

import { NOTIFICATION_UNITS, NOTIFICATION_WHEN } from '../../../constants';
import { triggerToModel } from './notificationModel';

const { DEVICE } = SETTINGS_NOTIFICATION_TYPE;
const { WEEK, DAY, HOURS, MINUTES } = NOTIFICATION_UNITS;
const { AFTER, BEFORE } = NOTIFICATION_WHEN;

describe('properties to model positive trigger', () => {
    test('part day 0', () => {
        expect(
            triggerToModel({
                isAllDay: false,
                type: DEVICE,
                trigger: fromTriggerString('PT0S'),
            })
        ).toEqual({
            isAllDay: false,
            value: 0,
            unit: MINUTES,
            type: DEVICE,
            when: AFTER,
        });
    });

    test('part day trigger 1 minute', () => {
        expect(
            triggerToModel({
                isAllDay: false,
                type: DEVICE,
                trigger: fromTriggerString('PT1M'),
            })
        ).toEqual({
            isAllDay: false,
            value: 1,
            unit: MINUTES,
            type: DEVICE,
            when: AFTER,
        });
    });

    test('all day trigger at 10:01 on the same day', () => {
        expect(
            triggerToModel({
                isAllDay: true,
                type: DEVICE,
                trigger: fromTriggerString('PT10H1M'),
            })
        ).toEqual({
            isAllDay: true,
            value: 0,
            unit: DAY,
            type: DEVICE,
            when: AFTER,
            at: new Date(2000, 0, 1, 10, 1),
        });
    });

    test('all day trigger at 10:01 a day after', () => {
        expect(
            triggerToModel({
                isAllDay: true,
                type: DEVICE,
                trigger: fromTriggerString('PT1D10H1M'),
            })
        ).toEqual({
            isAllDay: true,
            value: 1,
            unit: DAY,
            type: DEVICE,
            when: AFTER,
            at: new Date(2000, 0, 1, 10, 1),
        });
    });
});

describe('properties to model negative trigger', () => {
    test('part day notification 15 hours before', () => {
        expect(
            triggerToModel({
                isAllDay: false,
                type: DEVICE,
                trigger: fromTriggerString('-PT15H'),
            })
        ).toEqual({
            isAllDay: false,
            value: 15,
            unit: HOURS,
            type: DEVICE,
            when: BEFORE,
        });
    });

    test('part day notification 1 day before', () => {
        expect(
            triggerToModel({
                isAllDay: false,
                type: DEVICE,
                trigger: fromTriggerString('-PT1D'),
            })
        ).toEqual({
            isAllDay: false,
            value: 1,
            unit: DAY,
            type: DEVICE,
            when: BEFORE,
        });
    });

    test('part day notification 1 day before truncation', () => {
        expect(
            triggerToModel({
                isAllDay: false,
                type: DEVICE,
                trigger: fromTriggerString('-PT1D15H'),
            })
        ).toEqual({
            isAllDay: false,
            value: 1,
            unit: DAY,
            type: DEVICE,
            when: BEFORE,
        });
    });

    test('all day notification 1 day before at 00:00', () => {
        expect(
            triggerToModel({
                isAllDay: true,
                type: DEVICE,
                trigger: fromTriggerString('-PT1D'),
            })
        ).toEqual({
            isAllDay: true,
            value: 1,
            unit: DAY,
            type: DEVICE,
            when: BEFORE,
            at: new Date(2000, 0, 1, 0, 0),
        });
    });

    test('all day notification 1 day before at 13:50', () => {
        expect(
            triggerToModel({
                isAllDay: true,
                type: DEVICE,
                trigger: fromTriggerString('-PT10H10M'),
            })
        ).toEqual({
            isAllDay: true,
            value: 1,
            unit: DAY,
            type: DEVICE,
            when: BEFORE,
            at: new Date(2000, 0, 1, 13, 50),
        });
    });

    test('all day notification 1 week before at 00:00', () => {
        expect(
            triggerToModel({
                isAllDay: true,
                type: DEVICE,
                trigger: fromTriggerString('-PT1W'),
            })
        ).toEqual({
            isAllDay: true,
            value: 1,
            unit: WEEK,
            type: DEVICE,
            when: BEFORE,
            at: new Date(2000, 0, 1, 0, 0),
        });
    });

    test('all day notification 1 week before truncation', () => {
        expect(
            triggerToModel({
                isAllDay: true,
                type: DEVICE,
                trigger: fromTriggerString('-PT1W6D'),
            })
        ).toEqual({
            isAllDay: true,
            value: 1,
            unit: WEEK,
            type: DEVICE,
            when: BEFORE,
            at: new Date(2000, 0, 1, 0, 0),
        });
    });

    test('all day notification 1 week before at 13:50', () => {
        expect(
            triggerToModel({
                isAllDay: true,
                type: DEVICE,
                trigger: fromTriggerString('-PT6D10H10M'),
            })
        ).toEqual({
            isAllDay: true,
            value: 1,
            unit: WEEK,
            type: DEVICE,
            when: BEFORE,
            at: new Date(2000, 0, 1, 13, 50),
        });
    });

    test('all day notification 2 weeks before at 13:50', () => {
        expect(
            triggerToModel({
                isAllDay: true,
                type: DEVICE,
                trigger: fromTriggerString('-PT1W6D10H10M'),
            })
        ).toEqual({
            isAllDay: true,
            value: 2,
            unit: WEEK,
            type: DEVICE,
            when: BEFORE,
            at: new Date(2000, 0, 1, 13, 50),
        });
    });

    test('all day notification 1 week before at 13:50 truncation', () => {
        expect(
            triggerToModel({
                isAllDay: true,
                type: DEVICE,
                trigger: fromTriggerString('-PT1W5D10H10M'),
            })
        ).toEqual({
            isAllDay: true,
            value: 1,
            unit: WEEK,
            type: DEVICE,
            when: BEFORE,
            at: new Date(2000, 0, 1, 13, 50),
        });
    });
});
