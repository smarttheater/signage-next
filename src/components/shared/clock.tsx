import moment from 'moment';
import React from 'react';

const Clock = ({ className }: { className?: string }): JSX.Element => {
    const [date, setDate] = React.useState<string>('');

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setDate(moment().format('YYYY/MM/DD (ddd) HH:mm'));
        });

        return () => clearInterval(intervalId);
    });
    return <div className={className}>{date}</div>;
};

export default Clock;
