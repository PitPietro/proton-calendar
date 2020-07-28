import React from 'react';
import { useLoading, useGetCalendarBootstrap, Select, useGetAddresses } from 'react-components';
import { Props as SelectProps } from 'react-components/components/select/Select';
import CalendarIcon from '../../CalendarIcon';
import { notificationsToModel } from '../../../helpers/notificationsToModel';
import { getInitialMemberModel } from '../eventForm/state';
import { getDeviceNotifications } from '../eventForm/notificationModel';
import { getHasEditedNotifications } from '../eventForm/getHasEdited';
import { EventModel } from '../../../interfaces/EventModel';

export interface Props extends Omit<SelectProps, 'options' | 'value'> {
    withIcon?: boolean;
    model: EventModel;
    setModel: (value: EventModel) => void;
}

const CalendarSelect = ({ withIcon = false, model, setModel, ...rest }: Props) => {
    const [loading, withLoading] = useLoading();
    const getCalendarBootstrap = useGetCalendarBootstrap();
    const getAddresses = useGetAddresses();

    const { color, id } = model.calendar;
    const options = model.calendars;

    const handleChangeCalendar = async ({ target }: React.ChangeEvent<HTMLSelectElement>) => {
        const { value: newId, color: newColor } = options[target.selectedIndex];

        // grab default settings for the old calendar
        const {
            CalendarSettings: {
                DefaultPartDayNotifications: oldDefaultPartDayNotificationsSettings,
                DefaultFullDayNotifications: oldDefaultFullDayNotificationsSettings,
            },
        } = await getCalendarBootstrap(id);

        const oldDefaultPartDayNotifications = getDeviceNotifications(
            notificationsToModel(oldDefaultPartDayNotificationsSettings, false)
        );
        const oldDefaultFullDayNotifications = getDeviceNotifications(
            notificationsToModel(oldDefaultFullDayNotificationsSettings, true)
        );

        // grab members and default settings for the new calendar
        const {
            Members,
            CalendarSettings: {
                DefaultEventDuration: defaultEventDuration,
                DefaultPartDayNotifications,
                DefaultFullDayNotifications,
            },
        } = await getCalendarBootstrap(newId);
        const Addresses = await getAddresses();

        const [Member = {}] = Members;
        const Address = Addresses.find(({ Email }) => Member.Email === Email);
        if (!Member || !Address) {
            throw new Error('Address does not exist');
        }
        const newDefaultPartDayNotifications = getDeviceNotifications(
            notificationsToModel(DefaultPartDayNotifications, false)
        );
        const newDefaultFullDayNotifications = getDeviceNotifications(
            notificationsToModel(DefaultFullDayNotifications, true)
        );

        const partDayNotifications =
            getHasEditedNotifications(oldDefaultPartDayNotifications, model.partDayNotifications) ||
            model.hasTouchedNotifications.partDay
                ? model.partDayNotifications
                : newDefaultPartDayNotifications;

        const fullDayNotifications =
            getHasEditedNotifications(oldDefaultFullDayNotifications, model.fullDayNotifications) ||
            model.hasTouchedNotifications.fullDay
                ? model.fullDayNotifications
                : newDefaultFullDayNotifications;

        setModel({
            ...model,
            calendar: { id: newId, color: newColor },
            ...getInitialMemberModel(Addresses, Members, Member, Address),
            defaultEventDuration,
            partDayNotifications,
            fullDayNotifications,
        });
    };

    return (
        <>
            {withIcon !== false && <CalendarIcon className="mr1" color={color} />}
            <Select
                options={options}
                value={id}
                loading={loading}
                onChange={(e) => withLoading(handleChangeCalendar(e))}
                {...rest}
            />
        </>
    );
};

export default CalendarSelect;
