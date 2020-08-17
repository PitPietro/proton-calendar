import { WeekStartsOn } from 'proton-shared/lib/calendar/interface';
import { omit } from 'proton-shared/lib/helpers/object';
import { noop } from 'proton-shared/lib/helpers/function';
import { CalendarBootstrap } from 'proton-shared/lib/interfaces/calendar';
import { Address, Api } from 'proton-shared/lib/interfaces';
import { VcalVeventComponent } from 'proton-shared/lib/interfaces/calendar/VcalModel';
import isDeepEqual from 'proton-shared/lib/helpers/isDeepEqual';
import getMemberAndAddress from 'proton-shared/lib/calendar/integration/getMemberAndAddress';
import { modelToVeventComponent } from '../../../components/eventModal/eventForm/modelToProperties';
import { getRecurringEventUpdatedText, getSingleEventText } from '../../../components/eventModal/eventForm/i18n';
import getEditEventData from '../event/getEditEventData';
import getAllEventsByUID from '../getAllEventsByUID';
import { getOriginalEvent } from './recurringHelper';
import getSingleEditRecurringData from '../event/getSingleEditRecurringData';
import withVeventRruleWkst from './rruleWkst';
import { GetDecryptedEventCb } from '../eventStore/interface';
import { CalendarViewEventTemporaryEvent, OnSaveConfirmationCb } from '../interface';
import { getIsCalendarEvent } from '../eventStore/cache/helper';
import getRecurringUpdateAllPossibilities from './getRecurringUpdateAllPossibilities';
import getSaveRecurringEventActions from './getSaveRecurringEventActions';
import getSaveSingleEventActions from './getSaveSingleEventActions';
import getRecurringSaveType from './getRecurringSaveType';
import { withVeventSequence } from './sequence';

interface Arguments {
    temporaryEvent: CalendarViewEventTemporaryEvent;
    weekStartsOn: WeekStartsOn;
    addresses: Address[];
    onSaveConfirmation: OnSaveConfirmationCb;
    api: Api;
    getEventDecrypted: GetDecryptedEventCb;
    getCalendarBootstrap: (CalendarID: string) => CalendarBootstrap;
}

const getSaveEventActions = async ({
    temporaryEvent,
    weekStartsOn,
    addresses,
    onSaveConfirmation,
    api,
    getEventDecrypted,
    getCalendarBootstrap,
}: Arguments) => {
    const {
        tmpOriginalTarget: { data: { eventData: oldEventData, eventRecurrence, eventReadResult } } = { data: {} },
        tmpData,
        tmpData: {
            calendar: { id: newCalendarID },
            member: { memberID: newMemberID, addressID: newAddressID },
        },
    } = temporaryEvent;

    // All updates will remove any existing exdates since they would be more complicated to normalize
    const modelVeventComponent = modelToVeventComponent(tmpData) as VcalVeventComponent;
    const newVeventComponent = withVeventRruleWkst(omit(modelVeventComponent, ['exdate']), weekStartsOn);

    const newEditEventData = {
        veventComponent: newVeventComponent,
        calendarID: newCalendarID,
        memberID: newMemberID,
        addressID: newAddressID,
    };

    // Creation
    if (!oldEventData) {
        const newVeventWithSequence = {
            ...newEditEventData.veventComponent,
            sequence: { value: 0 },
        };
        const multiActions = getSaveSingleEventActions({
            newEditEventData: {
                ...newEditEventData,
                veventComponent: newVeventWithSequence,
            },
        });
        const successText = getSingleEventText(undefined, newEditEventData);
        return {
            actions: multiActions,
            texts: {
                success: successText,
            },
        };
    }

    const calendarBootstrap = getCalendarBootstrap(oldEventData.CalendarID);
    if (!calendarBootstrap) {
        throw new Error('Trying to update event without a calendar');
    }
    if (!getIsCalendarEvent(oldEventData) || !eventReadResult?.result) {
        throw new Error('Trying to edit event without event information');
    }

    const oldEditEventData = getEditEventData({
        eventData: oldEventData,
        eventResult: eventReadResult.result,
        memberResult: getMemberAndAddress(addresses, calendarBootstrap.Members, oldEventData.Author),
    });

    // If it's not an occurrence of a recurring event, or a single edit of a recurring event
    if (!eventRecurrence && !oldEditEventData.recurrenceID) {
        const newVeventWithSequence = withVeventSequence(
            newEditEventData.veventComponent,
            oldEditEventData.mainVeventComponent
        );
        const multiActions = getSaveSingleEventActions({
            newEditEventData: { ...newEditEventData, veventComponent: newVeventWithSequence },
            oldEditEventData,
        });
        const successText = getSingleEventText(oldEditEventData, newEditEventData);
        return {
            actions: multiActions,
            texts: {
                success: successText,
            },
        };
    }

    const recurrences = await getAllEventsByUID(api, oldEditEventData.uid, oldEditEventData.calendarID);

    const originalEventData = getOriginalEvent(recurrences);
    const originalEventResult = originalEventData ? await getEventDecrypted(originalEventData).catch(noop) : undefined;
    if (!originalEventData || !originalEventResult?.[0]) {
        throw new Error('Original event not found');
    }

    const originalEditEventData = getEditEventData({
        eventData: originalEventData,
        eventResult: originalEventResult,
        memberResult: getMemberAndAddress(addresses, calendarBootstrap.Members, originalEventData.Author),
    });

    const actualEventRecurrence =
        eventRecurrence ||
        getSingleEditRecurringData(originalEditEventData.mainVeventComponent, oldEditEventData.mainVeventComponent);

    const updateAllPossibilities = getRecurringUpdateAllPossibilities(
        originalEditEventData.mainVeventComponent,
        oldEditEventData.mainVeventComponent,
        newEditEventData.veventComponent,
        actualEventRecurrence
    );

    const hasModifiedCalendar = originalEditEventData.calendarID !== newEditEventData.calendarID;
    const hasModifiedRrule =
        tmpData.hasTouchedRrule &&
        !isDeepEqual(originalEditEventData.mainVeventComponent.rrule, newEditEventData.veventComponent.rrule);

    const saveType = await getRecurringSaveType({
        originalEditEventData,
        oldEditEventData,
        canOnlySaveAll: actualEventRecurrence.isSingleOccurrence || hasModifiedCalendar,
        hasModifiedRrule,
        onSaveConfirmation,
        recurrence: actualEventRecurrence,
        recurrences,
    });
    const multiActions = getSaveRecurringEventActions({
        type: saveType,
        recurrences,
        recurrence: actualEventRecurrence,
        updateAllPossibilities,
        newEditEventData,
        oldEditEventData,
        originalEditEventData,
        hasModifiedRrule,
    });
    const successText = getRecurringEventUpdatedText(saveType);
    return {
        actions: multiActions,
        texts: {
            success: successText,
        },
    };
};

export default getSaveEventActions;
