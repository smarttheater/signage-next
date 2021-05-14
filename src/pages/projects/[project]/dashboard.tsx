import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { Button } from 'react-bootstrap';
import ProjectGuard from '../../../components/guard/projectGuard';
import SettingGuard from '../../../components/guard/settingGuard';
import Layout from '../../../components/shared/layout';

const DashboardPage = (): JSX.Element => {
    const router = useRouter();

    return (
        <ProjectGuard>
            <SettingGuard>
                <Layout title="">
                    <div className="p-4 h-100">
                        <div className="container mw-100 px-0">
                            <div className="row">
                                <div className="col-4">
                                    <Link
                                        href={{
                                            pathname:
                                                '/projects/[project]/purchase/schedule',
                                            query: {
                                                project: router.query.project,
                                            },
                                        }}
                                    >
                                        <Button as="a" variant="light" block>
                                            購入スケジュール
                                        </Button>
                                    </Link>
                                </div>
                                <div className="col-4">
                                    <Link
                                        href={{
                                            pathname:
                                                '/projects/[project]/setting',
                                            query: {
                                                project: router.query.project,
                                            },
                                        }}
                                    >
                                        <Button as="a" variant="light" block>
                                            設定
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </Layout>
            </SettingGuard>
        </ProjectGuard>
    );
};

export default DashboardPage;
