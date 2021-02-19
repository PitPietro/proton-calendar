import { canonizeEmail } from 'proton-shared/lib/helpers/email';
import { ContactEmail, ContactGroup } from 'proton-shared/lib/interfaces/contacts';
import { SimpleMap } from 'proton-shared/lib/interfaces/utils';
import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { useContactEmails, useContactGroups } from 'react-components';

export type ContactEmailsCache = {
    contactEmails: ContactEmail[];
    contactGroups: ContactGroup[];
    contactEmailsMap: SimpleMap<ContactEmail>;
    contactEmailsMapWithDuplicates: SimpleMap<ContactEmail[]>;
};

const ContactEmailsContext = createContext<ContactEmailsCache | null>(null);

export const useContactEmailsCache = () => {
    const state = useContext(ContactEmailsContext);
    if (!state) {
        throw new Error('Trying to use uninitialized ContactEmailsProvider');
    }
    return state;
};

const toMapWithDuplicates = (contacts: ContactEmail[]) => {
    const contactEmailsMapWithDuplicates = contacts.reduce<SimpleMap<ContactEmail[]>>((acc, contact) => {
        const email = canonizeEmail(contact.Email);
        const contacts = acc[email];
        if (!contacts) {
            acc[email] = [contact];
        } else {
            contacts.push(contact);
            contacts.sort((a, b) => a.Order - b.Order);
        }
        return acc;
    }, {});

    const contactEmailsMap = Object.keys(contactEmailsMapWithDuplicates).reduce<SimpleMap<ContactEmail>>((acc, key) => {
        acc[key] = contactEmailsMapWithDuplicates[key]?.[0];
        return acc;
    }, {});

    return { contactEmailsMap, contactEmailsMapWithDuplicates };
};

interface Props {
    children?: ReactNode;
}
const ContactEmailsProvider = ({ children }: Props) => {
    const [contactEmails = []] = useContactEmails() as [ContactEmail[], boolean, Error];
    const [contactGroups = []] = useContactGroups();
    const cache = useMemo(() => {
        return {
            contactEmails,
            contactGroups,
            ...toMapWithDuplicates(contactEmails),
        };
    }, [contactEmails, contactGroups]);

    return <ContactEmailsContext.Provider value={cache}>{children}</ContactEmailsContext.Provider>;
};

export default ContactEmailsProvider;
