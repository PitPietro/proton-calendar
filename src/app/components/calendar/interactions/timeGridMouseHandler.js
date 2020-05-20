import { addMinutes } from 'proton-shared/lib/date-fns-utc';
// eslint-disable-next-line @typescript-eslint/camelcase
import { getKey } from '../splitTimeGridEventsPerDay';
import { getRelativePosition, getTargetIndex } from '../mouseHelpers/mathHelpers';
import { getDiffTime, getNewTime, getSnappedDate, getTargetMinutes } from '../mouseHelpers/dateHelpers';
import { blockClick, createAutoScroll, createRafUpdater, findContainingParent } from '../mouseHelpers/domHelpers';
import { ACTIONS, TYPE } from './constants';

const DRAG_EVENT_MOVE = 1;
const DRAG_EVENT_TIME_UP = 2;
const DRAG_EVENT_TIME_DOWN = 3;

const CREATE_SENSITIVITY = 20; // In pixels
const CREATE_STATE_INIT = -1;
const CREATE_STATE_ACTIVE = -2;

const getAutoScrollOptions = (titleEl) => {
    if (!titleEl) {
        return;
    }
    const titleElRect = titleEl.getBoundingClientRect();
    const margin = 7;
    return {
        marginTop: titleElRect.height + margin,
        marginBottom: margin,
    };
};

const getType = (/* position, offset */) => {
    /*
    // Support removed for this because the handle needs to be stable
    if (position <= offset) {
        return DRAG_EVENT_TIME_UP;
    }
    if (position >= 1 - offset) {
        return DRAG_EVENT_TIME_DOWN;
    }
     */
    return DRAG_EVENT_MOVE;
};

const createDragCreateMouseDown = ({
    e,
    targetDate,
    targetMinutes,
    totalDays,
    totalMinutes,
    interval,
    days,
    onMouseDown,
    scrollEl,
    timeGridEl,
    titleEl,
}) => {
    const startDate = days[targetDate];
    let endTargetDate = targetDate;
    let endTargetMinutes;
    let oldMouseY = CREATE_STATE_INIT;

    let result;

    const initialCallback = onMouseDown({
        action: ACTIONS.CREATE_DOWN,
        payload: {
            type: TYPE.TIMEGRID,
            idx: startDate,
        },
    });

    // Not allowed, abort
    if (!initialCallback) {
        return;
    }

    e.preventDefault();
    e.stopPropagation();

    const options = getAutoScrollOptions(titleEl);
    const autoScroll = createAutoScroll(scrollEl, options);

    const updater = createRafUpdater();
    let callback = (args) => updater(() => initialCallback(args));

    const handleMouseMove = (e) => {
        e.preventDefault();
        e.stopPropagation();

        autoScroll.onMouseMove(e);

        if (oldMouseY === CREATE_STATE_INIT) {
            oldMouseY = e.pageY;
        }
        if (oldMouseY !== CREATE_STATE_ACTIVE && Math.abs(oldMouseY - e.pageY) < CREATE_SENSITIVITY) {
            return;
        }
        oldMouseY = CREATE_STATE_ACTIVE;

        const rect = timeGridEl.getBoundingClientRect();
        const newEndTargetDate = getTargetIndex(e.pageX, rect.left, rect.width, totalDays);
        const newEndTargetMinutes = getTargetMinutes(e.pageY, rect.top, rect.height, totalMinutes, interval);

        if (newEndTargetDate === endTargetDate && newEndTargetMinutes === endTargetMinutes) {
            return;
        }

        // Only allow d&d on the same day
        // endTargetDate = newEndTargetDate;
        endTargetDate = targetDate;
        endTargetMinutes = newEndTargetMinutes;

        const isAfter = endTargetDate * totalMinutes + endTargetMinutes >= targetDate * totalMinutes + targetMinutes;

        const endDate = days[endTargetDate];

        if (isAfter) {
            const newEnd = Math.min(totalMinutes, endTargetMinutes + interval);
            result = {
                start: getNewTime(startDate, targetMinutes),
                end: getNewTime(endDate, newEnd),
            };
        } else {
            result = {
                start: getNewTime(endDate, endTargetMinutes),
                end: getNewTime(startDate, targetMinutes),
            };
        }

        callback({
            action: ACTIONS.CREATE_MOVE,
            payload: {
                type: TYPE.TIMEGRID,
                idx: endTargetDate,
                result,
            },
        });
    };

    const handleMouseUp = (e) => {
        document.removeEventListener('mouseup', handleMouseUp, true);
        document.removeEventListener('mousemove', handleMouseMove, true);
        autoScroll.onMouseUp(e);

        // The action was to drag & drop to create an event, a temporary event may or may not already exist.
        if (result) {
            e.preventDefault();
            e.stopPropagation();

            callback({
                action: ACTIONS.CREATE_MOVE_UP,
                payload: {
                    type: TYPE.TIMEGRID,
                    idx: endTargetDate,
                    result,
                },
            });
        } else {
            // No d&d, just a click on the timegrid.
            // No range created, just a simple click
            const start = getNewTime(startDate, targetMinutes);

            callback({
                action: ACTIONS.CREATE_UP,
                payload: {
                    type: TYPE.TIMEGRID,
                    idx: endTargetDate,
                    result: {
                        start,
                        end: start,
                    },
                },
            });

            e.preventDefault();
            e.stopPropagation();
        }

        callback = undefined;
    };

    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('mousemove', handleMouseMove, true);
    blockClick();
};

const createDragMoveEvent = ({
    e,
    event,
    interval,
    targetDate,
    targetMinutes,
    type,
    totalDays,
    totalMinutes,
    onMouseDown,
    scrollEl,
    timeGridEl,
    titleEl,
}) => {
    const { start, end } = event;

    const snappedStart = getSnappedDate(start, interval);
    const snappedEnd = getSnappedDate(end, interval);

    let oldTargetDate = targetDate;
    let oldTargetMinutes = targetMinutes;
    let currentTargetDate;
    let currentTargetMinutes;
    let result;

    const initialCallback = onMouseDown({
        action: ACTIONS.EVENT_DOWN,
        payload: {
            type: TYPE.TIMEGRID,
            event,
            idx: targetDate,
        },
    });

    // Move was not allowed, abort
    if (!initialCallback) {
        return;
    }

    e.preventDefault();
    e.stopPropagation();

    const options = getAutoScrollOptions(titleEl);
    const autoScroll = createAutoScroll(scrollEl, options);

    const updater = createRafUpdater();
    let callback = (args) => updater(() => initialCallback(args));

    const handleMove = (e, result, day) => {
        callback({
            action: ACTIONS.EVENT_MOVE,
            payload: {
                type: TYPE.TIMEGRID,
                result,
                day,
            },
        });
    };

    const handleMouseMove = (e) => {
        const rect = timeGridEl.getBoundingClientRect();

        currentTargetDate = getTargetIndex(e.pageX, rect.left, rect.width, totalDays);
        currentTargetMinutes = getTargetMinutes(e.pageY, rect.top, rect.height, totalMinutes, interval);

        autoScroll.onMouseMove(e);

        if (oldTargetDate === currentTargetDate && oldTargetMinutes === currentTargetMinutes) {
            return;
        }

        oldTargetDate = currentTargetDate;
        oldTargetMinutes = currentTargetMinutes;

        if (type === DRAG_EVENT_MOVE) {
            const diffDate = currentTargetDate - targetDate;
            const diffMinutes = currentTargetMinutes - targetMinutes;

            const newStart = getDiffTime(start, diffDate, diffMinutes);
            const newEnd = getDiffTime(end, diffDate, diffMinutes);

            result = {
                start: newStart,
                end: newEnd,
            };

            handleMove(e, result, currentTargetDate);
        }

        if (type === DRAG_EVENT_TIME_UP || type === DRAG_EVENT_TIME_DOWN) {
            // Only allow d&d on the same day
            // const diffDate = currentTargetDate - targetDate;
            const diffDate = 0;
            const diffMinutes = currentTargetMinutes - targetMinutes;

            if (type === DRAG_EVENT_TIME_UP) {
                const diffTime = getDiffTime(snappedStart, diffDate, diffMinutes);
                const extra = Math.abs((diffTime - end) / 60000) < interval ? interval : 0;

                if (diffTime >= end) {
                    const diffTimeWithPadding = addMinutes(diffTime, extra);
                    result = {
                        start: end,
                        end: diffTimeWithPadding,
                    };
                } else {
                    const diffTimeWithPadding = addMinutes(diffTime, -extra);
                    result = {
                        start: diffTimeWithPadding,
                        end,
                    };
                }
            } else {
                const diffTime = getDiffTime(snappedEnd, diffDate, diffMinutes);
                const extra = Math.abs((diffTime - start) / 60000) < interval ? interval : 0;

                if (diffTime >= start) {
                    const diffTimeWithPadding = addMinutes(diffTime, extra);
                    result = {
                        start,
                        end: diffTimeWithPadding,
                    };
                } else {
                    const diffTimeWithPadding = addMinutes(diffTime, -extra);
                    result = {
                        start: diffTimeWithPadding,
                        end: start,
                    };
                }
            }

            handleMove(e, result, currentTargetDate);
        }
    };

    const handleMouseUp = (e) => {
        document.removeEventListener('mouseup', handleMouseUp, true);
        document.removeEventListener('mousemove', handleMouseMove, true);
        autoScroll.onMouseUp(e);

        // The action was to drag & drop the event
        if (result) {
            e.preventDefault();
            e.stopPropagation();

            callback({
                action: ACTIONS.EVENT_MOVE_UP,
                payload: {
                    type: TYPE.TIMEGRID,
                    result,
                    idx: currentTargetDate,
                },
            });
        } else {
            // Click on the event
            e.preventDefault();
            e.stopPropagation();

            callback({
                action: ACTIONS.EVENT_UP,
                payload: {
                    type: TYPE.TIMEGRID,
                    idx: targetDate,
                },
            });
        }

        callback = undefined;
    };

    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('mousemove', handleMouseMove, true);
    blockClick();
};

export default ({
    e,
    totalDays,
    totalMinutes,
    interval,
    onMouseDown,
    events,
    eventsPerDay,
    days,
    timeGridEl,
    scrollEl,
    titleEl,
}) => {
    const { target } = e;

    const rect = timeGridEl.getBoundingClientRect();
    const targetDate = getTargetIndex(e.pageX, rect.left, rect.width, totalDays);
    const targetMinutes = getTargetMinutes(e.pageY, rect.top, rect.height, totalMinutes, interval);

    const dayContainerNode = timeGridEl.childNodes[targetDate + 1]; // + 1 for the hour lines

    // If hitting the days container or the day container
    if (timeGridEl === target || dayContainerNode === target) {
        createDragCreateMouseDown({
            e,
            targetDate,
            targetMinutes,
            rect,
            totalDays,
            totalMinutes,
            interval,
            days,
            onMouseDown,
            scrollEl,
            timeGridEl,
            titleEl,
        });

        return true;
    }

    const targetIndex = findContainingParent(dayContainerNode, target);
    if (targetIndex < 0) {
        return;
    }

    const day = days[targetDate];
    if (!day) {
        return;
    }

    const eventsInDay = eventsPerDay[getKey(day)];
    // The child target index is the same as the index in the events array.
    if (!Array.isArray(eventsInDay) || targetIndex >= eventsInDay.length) {
        return;
    }
    const { idx } = eventsInDay[targetIndex];
    const event = events[idx];
    if (!event) {
        return;
    }
    const eventNode = dayContainerNode.childNodes[targetIndex];
    const eventNodeRect = eventNode.getBoundingClientRect();
    const eventTargetPosition = getRelativePosition(e.pageY, eventNodeRect.top, eventNodeRect.height);

    const type = getType(eventTargetPosition, 0.2);

    const normalizedType =
        (type === DRAG_EVENT_TIME_UP && event.start.getUTCDate() !== day.getUTCDate()) ||
        (type === DRAG_EVENT_TIME_DOWN && event.end.getUTCDate() !== day.getUTCDate())
            ? DRAG_EVENT_MOVE
            : type;

    createDragMoveEvent({
        e,
        event,
        interval,
        targetDate,
        targetMinutes,
        type: normalizedType,
        rect,
        totalDays,
        totalMinutes,
        onMouseDown,
        scrollEl,
        timeGridEl,
        titleEl,
    });

    return true;
};
