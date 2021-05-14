import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import { Models } from '../..';
import * as cinerino from '@cinerino/sdk';
import { useForm } from 'react-hook-form';

type Props = {
    movieTheaters: cinerino.factory.chevre.place.movieTheater.IPlaceWithoutScreeningRoom[];
    screeningRooms: cinerino.factory.chevre.place.screeningRoom.IPlace[];
    onSubmit: (data: Inputs) => void;
    onChangeTheater: (data: string) => Promise<void>;
    inputs: Inputs;
};

type Inputs = {
    theaterId: string;
    screenId: string;
    page: string;
    direction: Models.Common.Direction;
    layout: Models.Common.Layout;
    image: string;
    color: Models.Common.Color;
};

const SettingForm = ({
    movieTheaters,
    screeningRooms,
    onSubmit,
    onChangeTheater,
    inputs,
}: Props): JSX.Element => {
    const router = useRouter();
    const [updateCount, setUpdateCount] = React.useState<number>(0);
    const {
        register,
        handleSubmit,
        watch,
        getValues,
        setValue,
        formState: { errors },
    } = useForm<Inputs>({ mode: 'all', shouldUnregister: false });

    watch();

    React.useEffect(() => {
        setValue('theaterId', inputs.theaterId);
        setValue('screenId', inputs.screenId);
        setValue('page', inputs.page);
        setValue('direction', inputs.direction);
        setValue('layout', inputs.layout);
        setValue('image', inputs.image);
        setValue('color', inputs.color);
    }, [inputs]);

    React.useEffect(() => {
        (async () => {
            try {
                const theaterId = getValues('theaterId');
                setUpdateCount(0);
                await onChangeTheater(theaterId);
                if (inputs.theaterId !== theaterId) {
                    setValue('screenId', '');
                }
                setUpdateCount(1);
            } catch (error) {
                console.error();
            }
        })();
    }, [getValues('theaterId')]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="container mw-100">
                <div className="form-group row align-items-center">
                    <div className="col-4 text-right">
                        <div className="d-flex justify-content-end align-items-center">
                            <p className="mr-2">施設</p>
                            <Badge variant="danger">必須</Badge>
                        </div>
                    </div>
                    <div className="col-8">
                        <select
                            className="form-control"
                            defaultValue={inputs.theaterId}
                            {...register('theaterId', {
                                required: '未選択です',
                            })}
                            // onChange={changeTheater}
                        >
                            <option value="">未選択</option>
                            {movieTheaters.map((m) => {
                                return (
                                    <option key={m.id} value={m.id}>
                                        {m.name.ja}
                                    </option>
                                );
                            })}
                        </select>
                        {errors.theaterId?.message && (
                            <p className="text-danger mt-2">
                                {errors.theaterId?.message}
                            </p>
                        )}
                    </div>
                </div>
                <div className="form-group row align-items-center">
                    <div className="col-4 text-right">
                        <div className="d-flex justify-content-end align-items-center">
                            <p>ルーム</p>
                        </div>
                    </div>
                    <div className="col-8">
                        {updateCount > 0 && (
                            <select
                                className="form-control"
                                defaultValue={inputs.screenId}
                                {...register('screenId')}
                            >
                                <option value="">未選択</option>
                                {screeningRooms.map((s) => {
                                    return (
                                        <option
                                            key={s.branchCode}
                                            value={s.branchCode}
                                        >
                                            {s.name.ja}
                                        </option>
                                    );
                                })}
                            </select>
                        )}
                    </div>
                </div>
                <div className="form-group row align-items-center">
                    <div className="col-4 text-right">
                        <div className="d-flex justify-content-end align-items-center">
                            <p>ページ</p>
                        </div>
                    </div>
                    <div className="col-8">
                        <select
                            className="form-control"
                            defaultValue={inputs.page}
                            {...register('page')}
                        >
                            <option value="">未選択</option>
                            {[...Array(10).keys()].map((n) => {
                                return (
                                    <option key={n + 1} value={String(n + 1)}>
                                        {n + 1}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>
                <div className="form-group row align-items-center">
                    <div className="col-4 text-right">
                        <div className="d-flex justify-content-end align-items-center">
                            <p>向き</p>
                        </div>
                    </div>
                    <div className="col-8">
                        <select
                            className="form-control"
                            defaultValue={inputs.direction}
                            {...register('direction')}
                        >
                            <option value={Models.Common.Direction.HORIZONTAL}>
                                {Models.Common.Direction.HORIZONTAL}
                            </option>
                            <option value={Models.Common.Direction.VERTICAL}>
                                {Models.Common.Direction.VERTICAL}
                            </option>
                        </select>
                    </div>
                </div>
                <div className="form-group row align-items-center">
                    <div className="col-4 text-right">
                        <div className="d-flex justify-content-end align-items-center">
                            <p>レイアウト</p>
                        </div>
                    </div>
                    <div className="col-8">
                        <select
                            className="form-control"
                            defaultValue={inputs.layout}
                            {...register('layout')}
                        >
                            <option value={Models.Common.Layout.TYPE01}>
                                {Models.Common.Layout.TYPE01}
                            </option>
                            <option value={Models.Common.Layout.TYPE02}>
                                {Models.Common.Layout.TYPE02}
                            </option>
                        </select>
                    </div>
                </div>
                <div className="form-group row align-items-center">
                    <div className="col-4 text-right">
                        <div className="d-flex justify-content-end align-items-center">
                            <p>画像</p>
                        </div>
                    </div>
                    <div className="col-8">
                        <input
                            className="form-control"
                            defaultValue={inputs.image}
                            {...register('image')}
                        />
                    </div>
                </div>
                <div className="form-group row align-items-center">
                    <div className="col-4 text-right">
                        <div className="d-flex justify-content-end align-items-center">
                            <p>色</p>
                        </div>
                    </div>
                    <div className="col-8">
                        <div className="d-flex flex-wrap">
                            {Object.values(Models.Common.Color).map((c) => {
                                return (
                                    <div key={c} className="w-25 py-2 pr-3">
                                        <label className="d-flex align-items-center pointer">
                                            <input
                                                className="d-none"
                                                type="radio"
                                                {...register('color')}
                                                defaultChecked={
                                                    inputs.color === c
                                                }
                                                value={c}
                                            />
                                            <div className="mr-2">
                                                <i className="far fa-circle"></i>
                                                <i className="far fa-dot-circle"></i>
                                            </div>
                                            <div
                                                className={
                                                    'border border-white w-100 text-center py-1 ' +
                                                    'color-' +
                                                    c
                                                }
                                            >
                                                &nbsp;
                                            </div>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div className="buttons mx-auto text-center">
                <Button
                    // disabled={!isValid}
                    type="submit"
                    variant="light"
                    block
                >
                    保存
                </Button>
                <Link
                    href={{
                        pathname: '/projects/[project]/dashboard',
                        query: { project: router.query.project },
                    }}
                >
                    <Button as="a" variant="outline-light" block>
                        戻る
                    </Button>
                </Link>
            </div>
        </form>
    );
};

export default SettingForm;
