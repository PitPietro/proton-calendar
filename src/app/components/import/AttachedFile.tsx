import React from 'react';
import { c } from 'ttag';
import { Icon, Button } from 'react-components';

import humanSize from 'proton-shared/lib/helpers/humanSize';
import { splitExtension } from 'proton-shared/lib/helpers/file';

interface Props {
    file: File;
    iconName: string;
    className?: string;
    clear?: string;
    onClear: () => void;
}

const AttachedFile = ({ file, iconName, className, clear = c('Action').t`Delete`, onClear, ...rest }: Props) => {
    const [fileName, extension] = splitExtension(file.name);

    return (
        <div className={`flex bordered-container w100 ${className}`} {...rest}>
            <div className="p0-5 flex flex-item-noshrink w10">
                <Icon name={iconName} className="mauto" />
            </div>
            <div className="message-attachmentInfo p0-5 flex flex-nowrap w90">
                <div className="flex-item-fluid pr1">
                    <div className="ellipsis" title={fileName}>
                        {fileName}
                    </div>
                    <div>{`${extension.toUpperCase()} - ${humanSize(file.size)}`}</div>
                </div>
                <Button className="flex-item-noshrink" onClick={onClear}>
                    {clear}
                </Button>
            </div>
        </div>
    );
};

export default AttachedFile;
