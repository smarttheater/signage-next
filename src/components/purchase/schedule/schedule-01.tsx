import { factory } from '@cinerino/sdk';
import moment from 'moment';
import React from 'react';
import { Functions, Models } from '../../..';
import { Swiper, SwiperSlide } from 'swiper/react';
import css from './schedule-01.module.scss';
import { getEnvironment } from '../../../environments/environment';
import SwiperCore, { Autoplay } from 'swiper';

SwiperCore.use([Autoplay]);

type Props = {
    screeningEvents: factory.chevre.event.screeningEvent.IEvent[];
    direction: Models.Common.Direction;
    image?: string;
    page?: number;
};

type Page = {
    group: {
        screeningEvent: factory.chevre.event.screeningEvent.IEvent;
        data: Models.Purchase.Performance[];
        empty: number[];
    }[];
    emptyGroup: {
        empty: number[];
    }[];
};

const Schedule01 = ({
    screeningEvents,
    direction,
    image,
    page,
}: Props): JSX.Element => {
    const environment = getEnvironment();
    const [pages, setPages] = React.useState<Page[]>([]);
    const [itemHeight, setItemHeight] = React.useState<number>(0);
    const [
        screeningEventSeriesDisplayLength,
        setScreeningEventSeriesDisplayLength,
    ] = React.useState<number>(0);
    const [
        performanceDisplayLength,
        setPerformanceDisplayLength,
    ] = React.useState<number>(0);

    const createPages = () => {
        const now = moment().toDate();
        const screeningEventsGroup = Functions.Purchase.screeningEvents2ScreeningEventSeries(
            { screeningEvents, now }
        );
        const pages: {
            group: {
                screeningEvent: factory.chevre.event.screeningEvent.IEvent;
                data: Models.Purchase.Performance[];
                empty: number[];
            }[];
            emptyGroup: {
                empty: number[];
            }[];
        }[] = [
            {
                group: [],
                emptyGroup: [],
            },
        ];
        let pageCount = 0;
        let eventCount = 0;
        const limit =
            screeningEventSeriesDisplayLength * performanceDisplayLength;
        screeningEventsGroup.forEach((group) => {
            group.data.forEach((d, i) => {
                if (pages[pageCount] === undefined) {
                    pages[pageCount] = {
                        group: [],
                        emptyGroup: [],
                    };
                }
                const findResult = pages[pageCount].group.find(
                    (g) =>
                        g.screeningEvent.superEvent.id ===
                        d.screeningEvent.superEvent.id
                );
                if (findResult === undefined) {
                    pages[pageCount].group.push({
                        screeningEvent: group.screeningEvent,
                        data: [d],
                        empty: [],
                    });
                } else {
                    findResult.data.push(d);
                }
                eventCount++;
                if (i + 1 === group.data.length) {
                    eventCount +=
                        performanceDisplayLength -
                        (group.data.length % performanceDisplayLength);
                }
                if (eventCount === limit) {
                    pageCount++;
                }
            });
        });
        pages.forEach((p) => {
            eventCount = 0;
            p.group.forEach((g) => {
                if (g.data.length % performanceDisplayLength === 0) {
                    return;
                }
                g.empty = [
                    ...Array(
                        performanceDisplayLength -
                            (g.data.length % performanceDisplayLength)
                    ).keys(),
                ];
            });
            p.group.forEach((g) => {
                eventCount += g.data.length + g.empty.length;
            });
            p.emptyGroup = [
                ...Array(
                    screeningEventSeriesDisplayLength -
                        eventCount / performanceDisplayLength
                ).keys(),
            ].map(() => {
                return { empty: [...Array(performanceDisplayLength).keys()] };
            });
        });
        return pages;
    };

    React.useEffect(() => {
        setScreeningEventSeriesDisplayLength(
            direction === Models.Common.Direction.HORIZONTAL ? 5 : 12
        );
        setPerformanceDisplayLength(
            direction === Models.Common.Direction.HORIZONTAL ? 5 : 5
        );
        setItemHeight(
            direction === Models.Common.Direction.HORIZONTAL
                ? (1080 - 60) / screeningEventSeriesDisplayLength
                : (1920 - 60) / screeningEventSeriesDisplayLength
        );
        if (
            screeningEventSeriesDisplayLength > 0 &&
            performanceDisplayLength > 0
        ) {
            setPages(createPages());
        }
    }, [
        screeningEvents,
        screeningEventSeriesDisplayLength,
        performanceDisplayLength,
    ]);

    return (
        <>
            <Swiper
                className="h-100"
                spaceBetween={0}
                slidesPerView={1}
                autoplay={{
                    delay: Number(environment.AUTOPLAY_DELAY_TIME),
                }}
                loop={true}
                onSwiper={(s) => {
                    s.autoplay.stop();
                }}
                onUpdate={(s) => {
                    const pageCount =
                        (image === undefined ? 0 : 1) + pages.length;
                    if (page !== undefined) {
                        s.slideTo(page, 0);
                    }
                    if (page === undefined && pageCount > 1) {
                        s.autoplay.start();
                        return;
                    }
                }}
            >
                {image && (
                    <SwiperSlide className="h-100 swiper-no-swiping">
                        <div
                            className={'h-100 w-100 ' + css['bg-image']}
                            style={{
                                backgroundImage: 'url(' + image + ')',
                            }}
                        ></div>
                    </SwiperSlide>
                )}
                {pages.map((page, index) => {
                    return (
                        <SwiperSlide
                            key={'page' + index}
                            className="h-100 swiper-no-swiping"
                        >
                            {page.group.map((group, index) => {
                                return (
                                    <ScheduleEventGroup
                                        key={group.screeningEvent.superEvent.id}
                                        className={
                                            index % 2 === 0 ? 'color-alpha' : ''
                                        }
                                        group={group}
                                        itemHeight={itemHeight}
                                    ></ScheduleEventGroup>
                                );
                            })}
                            {page.emptyGroup.map((group, index) => {
                                return (
                                    <ScheduleEmptyGroup
                                        key={'emptyGroup' + index}
                                        className={
                                            (index + page.group.length) % 2 ===
                                            0
                                                ? 'color-alpha'
                                                : ''
                                        }
                                        group={group}
                                        itemHeight={itemHeight}
                                    ></ScheduleEmptyGroup>
                                );
                            })}
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </>
    );
};

export default Schedule01;

const ScheduleEventGroup = ({
    className,
    group,
    itemHeight,
}: {
    className?: string;
    group: {
        screeningEvent: factory.chevre.event.screeningEvent.IEvent;
        data: Models.Purchase.Performance[];
        empty: number[];
    };
    itemHeight: number;
}): JSX.Element => {
    return (
        <div className={'d-flex align-items-center ' + className}>
            <div
                className={
                    'px-3 d-flex align-items-center ' +
                    css['screening-event-series']
                }
            >
                <div className="w-100">
                    {group.screeningEvent.name?.ja && (
                        <p className="text-large font-weight-bold text-overflow-ellipsis-02">
                            {group.screeningEvent.superEvent.name.ja}
                        </p>
                    )}
                    {group.screeningEvent.headline?.ja && (
                        <p className="text-large font-weight-bold text-overflow-ellipsis-02">
                            {group.screeningEvent.headline?.ja}
                        </p>
                    )}
                </div>
            </div>
            <div className={'border-left ' + css['screening-event']}>
                <div className="d-flex align-items-center flex-wrap">
                    {group.data.map((data) => {
                        return (
                            <ScheduleEvent
                                key={data.screeningEvent.id}
                                data={data}
                                itemHeight={itemHeight}
                            ></ScheduleEvent>
                        );
                    })}
                    {group.empty.map((empty) => {
                        return (
                            <div
                                key={'empty' + empty}
                                className={
                                    'text-center d-flex align-items-center border-right ' +
                                    css.item
                                }
                                style={{
                                    height: itemHeight + 'px',
                                }}
                            ></div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const ScheduleEvent = ({
    data,
    itemHeight,
}: {
    data: Models.Purchase.Performance;
    itemHeight: number;
}): JSX.Element => {
    return (
        <div
            className={
                'text-center d-flex align-items-center border-right ' + css.item
            }
            style={{
                height: itemHeight + 'px',
            }}
        >
            <div className="w-100 h-100 position-relative py-2">
                <p className="text-large font-weight-bold mb-1">
                    {moment(data.screeningEvent.startDate).format('HH:mm')}
                </p>
                <div className="status">
                    {data.isSales() &&
                        !data.isInfinitetock() &&
                        data.isSeatStatus('success') && (
                            <img
                                className={css['status-image']}
                                src="/images/icon/status_success.svg"
                                alt=""
                            />
                        )}
                    {data.isSales() &&
                        !data.isInfinitetock() &&
                        data.isSeatStatus('warning') && (
                            <img
                                className={css['status-image']}
                                src="/images/icon/status_warning.svg"
                                alt=""
                            />
                        )}
                    {data.isSales() &&
                        !data.isInfinitetock() &&
                        data.isSeatStatus('danger') && <span>満席</span>}
                    {data.isSales() &&
                        !data.isInfinitetock() &&
                        data.isSeatStatus() && (
                            <img
                                className={css['status-image']}
                                src="/images/icon/status_undefined.svg"
                                alt=""
                            />
                        )}
                    {data.isSales() && data.isInfinitetock() && (
                        <img
                            className={css['status-image']}
                            src="/images/icon/status_success.svg"
                            alt=""
                        />
                    )}
                    {data.isSales('end') && <span>販売終了</span>}
                    {data.isSales('start') && <span>販売期間外</span>}
                </div>

                <div className="position-absolute fixed-bottom">
                    <p className="py-1 bg-white text-dark-gray font-weight-bold text-overflow-ellipsis">
                        <span>{data.screeningEvent.location.name?.ja}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

const ScheduleEmptyGroup = ({
    className,
    group,
    itemHeight,
}: {
    className?: string;
    group: {
        empty: number[];
    };
    itemHeight: number;
}): JSX.Element => {
    return (
        <div className={'d-flex align-items-center ' + className}>
            <div
                className={
                    'px-3 d-flex align-items-center ' +
                    css['screening-event-series']
                }
            >
                <div className="w-100"></div>
            </div>
            <div className={'border-left ' + css['screening-event']}>
                <div className="d-flex align-items-center flex-wrap">
                    {group.empty.map((empty) => {
                        return (
                            <ScheduleEmpty
                                key={'empty' + empty}
                                itemHeight={itemHeight}
                            ></ScheduleEmpty>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const ScheduleEmpty = ({ itemHeight }: { itemHeight: number }): JSX.Element => {
    return (
        <div
            className={
                'text-center d-flex align-items-center border-right ' + css.item
            }
            style={{
                height: itemHeight + 'px',
            }}
        ></div>
    );
};
