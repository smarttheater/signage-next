import { useRouter } from 'next/router';
import React, { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

type Props = {
    children?: ReactNode;
};

const SettingGuard = (props: Props): JSX.Element => {
    const [mounted, setMounted] = React.useState<boolean>(false);
    const state = useSelector((state: RootState) => state);
    const router = useRouter();

    React.useEffect(() => {
        if (state.user.movieTheater === undefined) {
            router.replace(`/projects/${router.query.project}/setting`);
            return;
        }
        setMounted(true);
    }, []);

    if (mounted) {
        return <>{props.children}</>;
    }
    return <></>;
};

export default SettingGuard;
