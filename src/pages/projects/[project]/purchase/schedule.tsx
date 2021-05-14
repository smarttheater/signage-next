import moment from 'moment';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Functions, Models } from '../../../..';
import Layout from '../../../../components/shared/layout';
import { RootState } from '../../../../store';
import * as cinerino from '@cinerino/sdk';
import { utilSlice } from '../../../../store/util';
import { getEnvironment } from '../../../../environments/environment';
import Schedule01 from '../../../../components/purchase/schedule/schedule-01';
import Schedule02 from '../../../../components/purchase/schedule/schedule-02';
import ProjectGuard from '../../../../components/guard/projectGuard';
import SettingGuard from '../../../../components/guard/settingGuard';

const SchedulePage = (): JSX.Element => {
    const state = useSelector((state: RootState) => state);
    const dispatch = useDispatch();
    const environment = getEnvironment();
    const [updateCount, setUpdateCount] = React.useState<number>(0);
    const [screeningEvents, setScreeningEvents] = React.useState<
        cinerino.factory.chevre.event.screeningEvent.IEvent[]
    >([]);

    React.useEffect(() => {
        if (state.user.movieTheater === undefined) {
            setUpdateCount(updateCount + 1);
            return;
        }
        (async () => {
            dispatch(
                utilSlice.actions.changeLoading({
                    loading: true,
                    process: 'スケジュールを取得しています',
                })
            );
            try {
                setScreeningEvents(await getSchedule());
            } catch (error) {
                console.error(error);
            }
            dispatch(
                utilSlice.actions.changeLoading({
                    loading: false,
                })
            );
        })();
        const intervalId = setInterval(async () => {
            dispatch(
                utilSlice.actions.changeLoading({
                    loading: true,
                    process: 'スケジュールを取得しています',
                })
            );
            try {
                setScreeningEvents(await getSchedule());
            } catch (error) {
                console.error(error);
            }
            dispatch(
                utilSlice.actions.changeLoading({
                    loading: false,
                })
            );
        }, Number(environment.UPDATE_DELAY_TIME));

        return () => clearInterval(intervalId);
    }, [updateCount]);

    const searchMovieTheaters = async (
        params: cinerino.factory.chevre.creativeWork.movie.ISearchConditions
    ) => {
        const options = await Functions.Cinerino.createOption();
        const searchResult = await Functions.Cinerino.searchAll<
            cinerino.factory.chevre.creativeWork.movie.ISearchConditions,
            cinerino.factory.chevre.creativeWork.movie.ICreativeWork
        >({
            service: new cinerino.service.CreativeWork(options),
            condition: { ...params },
            method: 'searchMovies',
        });
        return searchResult;
    };

    const searchEvent = async <T extends cinerino.factory.chevre.eventType>(
        params: cinerino.factory.chevre.event.ISearchConditions<T>
    ) => {
        const options = await Functions.Cinerino.createOption();
        const searchResult = await Functions.Cinerino.searchAll<
            cinerino.factory.chevre.event.ISearchConditions<T>,
            cinerino.factory.chevre.event.IEvent<T>
        >({
            service: new cinerino.service.Event(options),
            condition: { ...params },
            method: 'search',
        });
        return searchResult;
    };

    const getSchedule = async () => {
        let result: cinerino.factory.chevre.event.screeningEvent.IEvent[] = [];
        const now = moment(
            (await Functions.Util.getServerTime()).date
        ).toDate();
        const today = moment(
            moment(now).format('YYYYMMDD'),
            'YYYYMMDD'
        ).toDate();
        const { movieTheater, screeningRoom, layout } = state.user;
        if (movieTheater === undefined) {
            throw new Error('movieTheater undefined');
        }
        const creativeWorks = await searchMovieTheaters({
            offers: { availableFrom: moment().toDate() },
        });

        const screeningEventSeries =
            Models.Common.Layout.TYPE01 === layout
                ? await searchEvent<cinerino.factory.chevre.eventType.ScreeningEventSeries>(
                      {
                          typeOf:
                              cinerino.factory.chevre.eventType
                                  .ScreeningEventSeries,
                          location: {
                              branchCode: { $eq: movieTheater.branchCode },
                          },
                          workPerformed: {
                              identifiers: creativeWorks.map(
                                  (c) => c.identifier
                              ),
                          },
                      }
                  )
                : [];

        const screeningEvent = await searchEvent<cinerino.factory.chevre.eventType.ScreeningEvent>(
            {
                typeOf: cinerino.factory.chevre.eventType.ScreeningEvent,
                superEvent: { locationBranchCodes: [movieTheater.branchCode] },
                startFrom: moment(today).toDate(),
                startThrough: moment(today)
                    .add(1, 'day')
                    .add(-1, 'millisecond')
                    .toDate(),
                location: {
                    branchCode: { $eq: screeningRoom?.branchCode },
                },
            }
        );

        result = screeningEvent
            .filter((s) => {
                return (
                    s.offers !== undefined &&
                    moment(s.offers.availabilityStarts).toDate() < now
                );
            })
            .filter((s) => moment(s.endDate).unix() > moment().unix());

        if (screeningEventSeries !== undefined) {
            result = result.sort((a, b) => {
                const KEY_NAME = 'sortNumber';
                const sortNumberA = screeningEventSeries
                    .find((s) => s.id === a.superEvent.id)
                    ?.additionalProperty?.find((p) => p.name === KEY_NAME)
                    ?.value;
                const sortNumberB = screeningEventSeries
                    .find((s) => s.id === b.superEvent.id)
                    ?.additionalProperty?.find((p) => p.name === KEY_NAME)
                    ?.value;
                if (sortNumberA === undefined) {
                    return 1;
                }
                if (sortNumberB === undefined) {
                    return -1;
                }
                if (Number(sortNumberA) > Number(sortNumberB)) {
                    return -1;
                }
                if (Number(sortNumberA) < Number(sortNumberB)) {
                    return 1;
                }
                return 0;
            });
        }

        return result;
    };

    return (
        <ProjectGuard>
            <SettingGuard>
                <Layout title="">
                    {state.user.layout === Models.Common.Layout.TYPE01 && (
                        <Schedule01
                            screeningEvents={screeningEvents}
                            direction={state.user.direction}
                            image={state.user.image}
                            page={state.user.page}
                        ></Schedule01>
                    )}
                    {state.user.layout === Models.Common.Layout.TYPE02 && (
                        <Schedule02
                            screeningEvents={screeningEvents}
                            direction={state.user.direction}
                            image={state.user.image}
                            page={state.user.page}
                        ></Schedule02>
                    )}
                </Layout>
            </SettingGuard>
        </ProjectGuard>
    );
};

export default SchedulePage;
