import React from 'react';

interface Props {
    className?: string;
    hours: string[];
}
const HourTexts = ({ className, hours }: Props) => {
    return (
        <div className={className}>
            {hours.map((text, i) => {
                return (
                    <div className="calendar-grid-timeBlock" key={i}>
                        {i === 0 ? null : (
                            <span className="calendar-grid-timeText aligncenter bl relative">{text}</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default React.memo(HourTexts);
