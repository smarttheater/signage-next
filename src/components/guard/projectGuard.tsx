import React, { ReactNode } from 'react';
import { Functions } from '../..';
import * as cinerino from '@cinerino/sdk';
import { useRouter } from 'next/router';

type Props = {
    children?: ReactNode;
};

const ProjectGuard = (props: Props): JSX.Element => {
    const [mounted, setMounted] = React.useState<boolean>(false);
    const router = useRouter();

    React.useEffect(() => {
        (async () => {
            try {
                const options = await Functions.Cinerino.createOption();
                await new cinerino.service.Event(options).search({
                    typeOf: cinerino.factory.chevre.eventType.ScreeningEvent,
                    limit: 1,
                });
                setMounted(true);
            } catch (error) {
                console.error(error);
                router.replace(`/404`);
            }
        })();
    }, []);

    if (mounted) {
        return <>{props.children}</>;
    }
    return <></>;
};

export default ProjectGuard;
