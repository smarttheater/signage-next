import moment from 'moment';
import React from 'react';

const Clock = (): JSX.Element => {
    const [date, setDate] = React.useState<string>('');

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setDate(moment().format('YYYY/MM/DD (ddd) HH:mm'));
        });

        return () => clearInterval(intervalId);
    });
    return <p className="mb-0">{date}</p>;
};

export default Clock;
