import { Alert, ConfirmModal, Button } from 'react-components';
import { c } from 'ttag';
import React from 'react';

const CloseConfirmationModal = (props: any) => {
    return (
        <ConfirmModal
            title={c('Info').t`Discard changes?`}
            close={<Button type="reset" autoFocus>{c('Action').t`Cancel`}</Button>}
            confirm={c('Action').t`Discard`}
            {...props}
        >
            <Alert type="warning">{c('Info').t`You will lose all unsaved changes.`}</Alert>
        </ConfirmModal>
    );
};

export default CloseConfirmationModal;
