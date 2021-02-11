import React from 'react';
import { useLoading, useGetCalendarBootstrap, SelectTwo, Option, useGetAddresses } from 'react-components';
import { Props as SelectProps } from 'react-components/components/selectTwo/SelectTwo';
import CalendarIcon from '../../CalendarIcon';
import { notificationsToModel } from '../../../helpers/notificationsToModel';
import { getInitialMemberModel } from '../eventForm/state';
import { getDeviceNotifications } from '../eventForm/notificationModel';
import { EventModel } from '../../../interfaces/EventModel';

export interface Props extends Omit<SelectProps<string>, 'children'> {
    withIcon?: boolean;
    model: EventModel;
    setModel: (value: EventModel) => void;
    isCreateEvent: boolean;
    frozen?: boolean;
}

const CalendarSelect = ({ withIcon = false, model, setModel, isCreateEvent, frozen = false, ...rest }: Props) => {
    const [loading, withLoading] = useLoading();
    const getCalendarBootstrap = useGetCalendarBootstrap();
    const getAddresses = useGetAddresses();

    const { color, id } = model.calendar;
    const options = model.calendars;
    const name = options.find(({ value }) => value === id)?.text;

    if (frozen) {
        return (
            <div className="pt0-5 pb0-5 flex">
                {withIcon !== false && <CalendarIcon className="mr1" color={color} />}
                {name}
            </div>
        );
    }

    const handleChangeCalendar = async (selectedIndex: number) => {
        const { color: newColor, value: newId } = options[selectedIndex];

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
        const memberEmail = Member.Email;
        const Address = Addresses.find(({ Email }) => Email === memberEmail);
        if (!memberEmail || !Address) {
            throw new Error('Address does not exist');
        }
        const newDefaultPartDayNotifications = getDeviceNotifications(
            notificationsToModel(DefaultPartDayNotifications, false)
        );
        const newDefaultFullDayNotifications = getDeviceNotifications(
            notificationsToModel(DefaultFullDayNotifications, true)
        );

        const partDayNotifications =
            model.hasTouchedNotifications.partDay || !isCreateEvent
                ? model.partDayNotifications
                : newDefaultPartDayNotifications;

        const fullDayNotifications =
            model.hasTouchedNotifications.fullDay || !isCreateEvent
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
            <SelectTwo
                value={id}
                loading={loading}
                onChange={({ selectedIndex }) => withLoading(handleChangeCalendar(selectedIndex))}
                {...rest}
            >
                {options.map(({ value, text }) => (
                    <Option value={value} title={text} key={value} />
                ))}
            </SelectTwo>
        </>
    );
};

export default CalendarSelect;
