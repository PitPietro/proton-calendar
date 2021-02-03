import React from 'react';
import { classnames } from 'react-components';

interface Props {
    children?: React.ReactNode;
    className?: string;
}

const PopoverFooter = ({ children, className }: Props) => {
    return (
        <footer className={classnames(['flex flex-nowrap flex-justify-space-between flex-justify-end', className])}>
            {children}
        </footer>
    );
};

export default PopoverFooter;
