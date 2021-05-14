import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import css from './loading.module.scss';

const Loading = (): JSX.Element => {
    const state = useSelector((state: RootState) => state);
    if (!state.util.loading) {
        return <></>;
    }
    return (
        <>
            <div className={'fixed-top fixed-bottom ' + css.cover}></div>
            <div className={'d-flex align-items-center ' + css.loading}>
                <div className="mr-3 text-white">{state.util.process}</div>
                <div className={css.loader}>Loading...</div>
            </div>
        </>
    );
};

export default Loading;
