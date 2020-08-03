import { BASE_SIZE } from 'proton-shared/lib/constants';

export const DEFAULT_CALENDAR = {
    name: 'My calendar',
    color: '#657ee4',
    description: '',
};

export enum VIEWS {
    DAY = 1,
    WEEK,
    MONTH,
    YEAR,
    AGENDA,
    CUSTOM,
}

export const MINUTE = 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;
export const WEEK = DAY * 7;

export enum NOTIFICATION_WHEN {
    BEFORE = '-',
    AFTER = '',
}

export enum NOTIFICATION_UNITS {
    WEEK = 1,
    DAY = 2,
    HOURS = 3,
    MINUTES = 4,
}

export const NOTIFICATION_UNITS_MAX = {
    [NOTIFICATION_UNITS.WEEK]: 1000 - 1,
    [NOTIFICATION_UNITS.DAY]: 7000 - 1,
    [NOTIFICATION_UNITS.HOURS]: 1000 - 1,
    [NOTIFICATION_UNITS.MINUTES]: 10000 - 1,
};

export const MAX_CALENDARS_PER_USER = 10;

export const DEFAULT_EVENT_DURATION = 30;

export const COLORS = {
    BLACK: '#000',
    WHITE: '#FFF',
};

export const MAX_DEFAULT_NOTIFICATIONS = 5;
export const MAX_NOTIFICATIONS = 10;

export enum SAVE_CONFIRMATION_TYPES {
    SINGLE = 1,
    RECURRING,
}

export enum DELETE_CONFIRMATION_TYPES {
    SINGLE = 1,
    RECURRING,
}

export enum RECURRING_TYPES {
    ALL = 1,
    FUTURE,
    SINGLE,
}

export const MAX_IMPORT_EVENTS = 15000;
export const MAX_IMPORT_EVENTS_STRING = "15'000";
export const MAX_IMPORT_FILE_SIZE = 10 * BASE_SIZE ** 2;
export const MAX_IMPORT_FILE_SIZE_STRING = '10 MB';
export const MAX_UID_CHARS_DISPLAY = 43;
export const MAX_FILENAME_CHARS_DISPLAY = 100;
export const IMPORT_CALENDAR_FAQ_URL =
    'https://protonmail.com/support/knowledge-base/import-calendar-to-protoncalendar';
