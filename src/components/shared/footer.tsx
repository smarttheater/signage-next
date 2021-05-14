import React from 'react';
import Clock from './clock';
import css from './footer.module.scss';
import Loading from './locading';

const Footer = (): JSX.Element => (
    <div className={css.footer + ' px-3 w-100 fixed-bottom'}>
        <div className="d-flex align-items-center justify-content-between h-100">
            <Clock></Clock>
            <Loading></Loading>
        </div>
    </div>
);

export default Footer;
