import * as cinerino from '@cinerino/sdk';
import React from 'react';
import { Functions, Models } from '../../..';
import Layout from '../../../components/shared/layout';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { utilSlice } from '../../../store/util';
import { userSlice } from '../../../store/user';
import AlertModal from '../../../components/model/alertModal';
import SettingForm from '../../../components/setting/settingForm';
import ProjectGuard from '../../../components/guard/projectGuard';

type Inputs = {
    theaterId: string;
    screenId: string;
    page: string;
    direction: Models.Common.Direction;
    layout: Models.Common.Layout;
    image: string;
    color: Models.Common.Color;
};

const SettingPage = (): JSX.Element => {
    const dispatch = useDispatch();
    const state = useSelector((state: RootState) => state);
    const [updateModal, setUpdateModal] = React.useState<boolean>(false);
    const [movieTheaters, setMovieTheaters] = React.useState<
        cinerino.factory.chevre.place.movieTheater.IPlaceWithoutScreeningRoom[]
    >([]);
    const [screeningRooms, setScreeningRooms] = React.useState<
        cinerino.factory.chevre.place.screeningRoom.IPlace[]
    >([]);
    const [inputs, setInputs] = React.useState<Inputs>({
        theaterId: '',
        screenId: '',
        page: '',
        direction: Models.Common.Direction.HORIZONTAL,
        layout: Models.Common.Layout.TYPE01,
        image: '',
        color: Models.Common.Color.Darkgray,
    });

    const searchMovieTheaters = async () => {
        const options = await Functions.Cinerino.createOption();
        const searchResult = await Functions.Cinerino.searchAll<
            cinerino.factory.chevre.place.movieTheater.ISearchConditions,
            cinerino.factory.chevre.place.movieTheater.IPlaceWithoutScreeningRoom
        >({
            service: new cinerino.service.Place(options),
            condition: {},
            method: 'searchMovieTheaters',
        });
        return searchResult;
    };

    const searchScreeningRooms = async (prams: {
        containedInPlace?: {
            branchCode?: {
                $eq?: string;
            };
        };
    }) => {
        const options = await Functions.Cinerino.createOption();
        const searchResult = await Functions.Cinerino.searchAll<
            cinerino.factory.chevre.place.screeningRoom.ISearchConditions,
            cinerino.factory.chevre.place.screeningRoom.IPlace
        >({
            service: new cinerino.service.Place(options),
            condition: {
                ...prams,
            },
            method: 'searchScreeningRooms',
        });
        return searchResult;
    };

    React.useEffect(() => {
        (async () => {
            dispatch(
                utilSlice.actions.changeLoading({
                    loading: true,
                    process: '施設情報を取得しています',
                })
            );
            try {
                const searchMovieTheatersResult = await searchMovieTheaters();
                setMovieTheaters(searchMovieTheatersResult);
            } catch (error) {
                console.error(error);
            }
            dispatch(
                utilSlice.actions.changeLoading({
                    loading: false,
                })
            );
        })();
    }, []);

    React.useEffect(() => {
        setInputs({
            theaterId: state.user.movieTheater?.id || '',
            screenId: state.user.screeningRoom?.branchCode || '',
            page: state.user.page === undefined ? '' : String(state.user.page),
            direction: state.user.direction,
            layout: state.user.layout,
            image: state.user.image,
            color: state.user.color,
        });
    }, [state.user]);

    const onChangeTheater = async (data: string) => {
        dispatch(
            utilSlice.actions.changeLoading({
                loading: true,
                process: 'ルーム情報を取得しています',
            })
        );
        try {
            const theaterId = data;
            const movieTheater = movieTheaters.find((t) => t.id === theaterId);
            if (theaterId === '' || movieTheater === undefined) {
                setScreeningRooms([]);
            } else {
                const searchScreeningRoomsResult = await searchScreeningRooms({
                    containedInPlace: {
                        branchCode: {
                            $eq: movieTheater.branchCode,
                        },
                    },
                });
                setScreeningRooms(searchScreeningRoomsResult);
            }
        } catch (error) {
            console.error(error);
        }
        dispatch(
            utilSlice.actions.changeLoading({
                loading: false,
            })
        );
    };

    const onSubmit = (data: Inputs) => {
        dispatch(
            userSlice.actions.updateUser({
                movieTheater: movieTheaters.find(
                    (m) => m.id === data.theaterId
                ),
                screeningRoom: screeningRooms.find(
                    (s) => s.branchCode === data.screenId
                ),
                page: data.page === '' ? undefined : Number(data.page),
                direction: data.direction,
                layout: data.layout,
                image: data.image,
                color: data.color,
                language: state.user.language,
            })
        );
        setUpdateModal(true);
    };

    return (
        <ProjectGuard>
            <Layout title="">
                <div className="p-4">
                    <h2 className="text-large mb-4 text-center font-weight-bold">
                        設定
                    </h2>
                    {movieTheaters.length > 0 && (
                        <SettingForm
                            inputs={inputs}
                            movieTheaters={movieTheaters}
                            screeningRooms={screeningRooms}
                            onSubmit={onSubmit}
                            onChangeTheater={onChangeTheater}
                        ></SettingForm>
                    )}
                </div>
                <AlertModal
                    show={updateModal}
                    size="lg"
                    title="完了"
                    onHide={() => setUpdateModal(false)}
                >
                    <p className="mb-3 text-md-center">設定を保存しました</p>
                </AlertModal>
            </Layout>
        </ProjectGuard>
    );
};

export default SettingPage;
