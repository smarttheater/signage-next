import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { Button } from 'react-bootstrap';
import Clock from './clock';
import css from './footer.module.scss';
import Loading from './locading';

const Footer = (): JSX.Element => {
    const router = useRouter();

    return (
        <div className={css.footer + ' px-3 w-100 fixed-bottom'}>
            <div className="d-flex align-items-center h-100">
                <Clock className="mr-auto"></Clock>
                <Loading></Loading>
                <div className="d-flex align-items-center ml-3 h-100">
                    <Link
                        href={{
                            pathname: '/projects/[project]/dashboard',
                            query: {
                                project: router.query.project,
                            },
                        }}
                    >
                        <Button
                            as="a"
                            variant="dark"
                            size="sm"
                            className="rounded-circle opacity-30"
                        >
                            <i className="fas fa-list"></i>
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Footer;
