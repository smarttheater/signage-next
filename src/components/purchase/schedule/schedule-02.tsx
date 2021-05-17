import { factory } from '@cinerino/sdk';
import moment from 'moment';
import React from 'react';
import { Models } from '../../..';
import { Swiper, SwiperSlide } from 'swiper/react';
import css from './schedule-02.module.scss';
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
    data: Models.Purchase.Performance[];
    empty: number[];
};

const Schedule02 = ({
    screeningEvents,
    direction,
    image,
    page,
}: Props): JSX.Element => {
    const environment = getEnvironment();
    const [pages, setPages] = React.useState<Page[]>([]);
    const [itemHeight, setItemHeight] = React.useState<number>(0);
    const [
        screeningEventDisplayLength,
        setScreeningEventDisplayLength,
    ] = React.useState<number>(0);

    const createPages = () => {
        const pages: {
            data: Models.Purchase.Performance[];
            empty: number[];
        }[] = [
            {
                data: [],
                empty: [],
            },
        ];
        let pageCount = 0;
        screeningEvents.forEach((s, i) => {
            if (pages[pageCount] === undefined) {
                pages[pageCount] = {
                    data: [],
                    empty: [],
                };
            }
            pages[pageCount].data.push(
                new Models.Purchase.Performance({ screeningEvent: s })
            );
            if (i > 1 && (i + 1) % screeningEventDisplayLength === 0) {
                pageCount++;
            }
        });
        pages.forEach((p) => {
            p.empty = [
                ...Array(screeningEventDisplayLength - p.data.length).keys(),
            ];
        });
        return pages;
    };

    React.useEffect(() => {
        setScreeningEventDisplayLength(
            direction === Models.Common.Direction.HORIZONTAL ? 5 : 12
        );
        setItemHeight(
            direction === Models.Common.Direction.HORIZONTAL
                ? (1080 - 60) / screeningEventDisplayLength
                : (1920 - 60) / screeningEventDisplayLength
        );
        if (screeningEventDisplayLength > 0) {
            setPages(createPages());
        }
    }, [screeningEvents, screeningEventDisplayLength]);

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
                            {page.data.map((data, index) => {
                                return (
                                    <ScheduleEvent
                                        key={data.screeningEvent.id}
                                        className={
                                            index % 2 === 0 ? 'color-alpha' : ''
                                        }
                                        data={data}
                                        itemHeight={itemHeight}
                                    ></ScheduleEvent>
                                );
                            })}
                            {page.empty.map((data, index) => {
                                return (
                                    <ScheduleEmpty
                                        key={'empty' + data}
                                        className={
                                            (index + page.data.length) % 2 === 0
                                                ? 'color-alpha'
                                                : ''
                                        }
                                        itemHeight={itemHeight}
                                    ></ScheduleEmpty>
                                );
                            })}
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </>
    );
};

export default Schedule02;

const ScheduleEvent = ({
    className,
    data,
    itemHeight,
}: {
    className?: string;
    data: Models.Purchase.Performance;
    itemHeight: number;
}): JSX.Element => {
    return (
        <div
            className={'item d-flex ' + className}
            style={{
                height: itemHeight + 'px',
            }}
        >
            <div
                className={
                    'd-flex align-items-center border-right px-3 ' + css['w-20']
                }
            >
                <p className="w-100 text-large text-center">
                    {moment(data.screeningEvent.startDate).format('HH:mm')} -{' '}
                    {moment(data.screeningEvent.endDate).format('HH:mm')}
                </p>
            </div>
            <div
                className={
                    'd-flex align-items-center border-right px-3 ' + css['w-15']
                }
            >
                <div className="status w-100 text-center">
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
            </div>
            <div className="w-25 d-flex align-items-center border-right px-3">
                <p className="w-100 text-large text-center">
                    {data.screeningEvent.location.name?.ja}
                </p>
            </div>
            <div className={'d-flex align-items-center px-3 ' + css['w-40']}>
                <div className="w-100">
                    {data.screeningEvent.name?.ja && (
                        <p className="text-overflow-ellipsis-02">
                            {data.screeningEvent.superEvent.name.ja}
                        </p>
                    )}
                    {data.screeningEvent.headline?.ja && (
                        <p className="text-overflow-ellipsis-02">
                            {data.screeningEvent.headline?.ja}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const ScheduleEmpty = ({
    className,
    itemHeight,
}: {
    className?: string;
    itemHeight: number;
}): JSX.Element => {
    return (
        <div
            className={'item d-flex ' + className}
            style={{
                height: itemHeight + 'px',
            }}
        >
            <div
                className={
                    'd-flex align-items-center border-right px-3 ' + css['w-20']
                }
            ></div>
            <div
                className={
                    'd-flex align-items-center border-right px-3 ' + css['w-15']
                }
            ></div>
            <div className="w-25 d-flex align-items-center border-right px-3"></div>
            <div
                className={'d-flex align-items-center px-3 ' + css['w-40']}
            ></div>
        </div>
    );
};
