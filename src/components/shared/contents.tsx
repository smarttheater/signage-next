import React, { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Functions } from '../..';
import { RootState } from '../../store';
import css from './contents.module.scss';

type Props = {
    children?: ReactNode;
};

const Contents = ({ children }: Props): JSX.Element => {
    const state = useSelector((state: RootState) => state);
    Functions.Util.changeViewport({ direction: state.user.direction });

    React.useEffect(() => {
        const registeredListener = () => {
            Functions.Util.changeViewport({ direction: state.user.direction });
        };
        window.addEventListener('resize', registeredListener);

        return () => window.removeEventListener('resize', registeredListener);
    });

    return (
        <div className={css.host + ' color-' + state.user.color}>
            <div id="contents" className={css.scroll + ' ' + css.touch}>
                {children}
            </div>
        </div>
    );
};

export default Contents;
