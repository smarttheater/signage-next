import React, { ReactNode } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

type Props = {
    title?: string;
    children?: ReactNode;
    size: 'sm' | 'lg' | 'xl';
    show: boolean;
    onHide: () => void;
};

const AlertModal = (props: Props): JSX.Element => {
    const state = useSelector((state: RootState) => state);

    return (
        <Modal {...props} centered>
            <div
                className={'p-3 scroll-vertical ' + 'color-' + state.user.color}
            >
                {props.title && (
                    <div className="mb-3 text-large text-center">
                        {props.title}
                    </div>
                )}
                {props.children}
                <div className="buttons mx-auto text-center">
                    <Button
                        variant="outline-light"
                        block
                        onClick={props.onHide}
                    >
                        閉じる
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AlertModal;
