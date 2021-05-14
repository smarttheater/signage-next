import React, { ReactNode } from 'react';
import Head from 'next/head';
import Footer from './footer';
import Contents from './contents';

type Props = {
    children?: ReactNode;
    title?: string;
};

const Layout = ({ children, title = '' }: Props): JSX.Element => (
    <>
        <Head>
            <title>{title}</title>
            <meta charSet="utf-8" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            <meta name="robots" content="noindex" />
            <meta name="viewport" content="width=device-width" />
        </Head>
        <header></header>
        <Contents>{children}</Contents>
        <Footer></Footer>
    </>
);

export default Layout;
