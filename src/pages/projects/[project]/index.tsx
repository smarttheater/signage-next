import { useRouter } from 'next/router';
import React from 'react';

const IndexPage = (): JSX.Element => {
    const router = useRouter();
    console.log('IndexPage', router);
    router.replace(`/projects/${router.query.project}/dashboard`);
    return <></>;
};

export default IndexPage;
