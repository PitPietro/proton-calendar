import { dateLocale } from 'proton-shared/lib/i18n';
import { format } from 'proton-shared/lib/date-fns-utc';
import { VIEWS } from '../../constants';

const getTitleDateString = (view: VIEWS, range: number, utcDateRange: Date[], utcDate: Date) => {
    const formatOptions = { locale: dateLocale };

    if (view === VIEWS.DAY) {
        return format(utcDate, 'PPPP', formatOptions);
    }

    if (view === VIEWS.WEEK || range > 0) {
        const [utcFrom, utcTo] = utcDateRange;

        if (utcFrom.getUTCMonth() === utcTo.getUTCMonth()) {
            const fromString = format(utcFrom, 'd', formatOptions);
            const toString = format(utcTo, 'd', formatOptions);
            const rest = format(utcDate, 'MMMM yyyy', formatOptions);
            return `${fromString}-${toString} ${rest}`;
        }

        if (utcFrom.getUTCFullYear() === utcTo.getUTCFullYear()) {
            const fromString = format(utcFrom, 'd MMMM', formatOptions);
            const toString = format(utcTo, 'd MMMM', formatOptions);
            const rest = format(utcFrom, 'yyyy', formatOptions);
            return `${fromString} - ${toString} ${rest}`;
        }

        const fromString = format(utcFrom, 'd MMMM yyyy', formatOptions);
        const toString = format(utcTo, 'd MMMM yyyy', formatOptions);
        return `${fromString} - ${toString}`;
    }

    return format(utcDate, 'MMMM yyyy', formatOptions);
};

export default getTitleDateString;
