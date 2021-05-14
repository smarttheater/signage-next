import { factory } from '@cinerino/sdk';
import { getEnvironment } from '../environments/environment';
import { Performance } from './../models/purchase/performance';

/**
 * イベントグループ
 */
export interface IScreeningEventsGroup {
    screeningEvent: factory.chevre.event.screeningEvent.IEvent;
    data: Performance[];
}

/**
 * 施設コンテンツごとのグループへ変換
 */
export function screeningEvents2ScreeningEventSeries(params: {
    screeningEvents: factory.chevre.event.screeningEvent.IEvent[];
    now: Date;
}): IScreeningEventsGroup[] {
    const environment = getEnvironment();
    const result: IScreeningEventsGroup[] = [];
    const { screeningEvents, now } = params;
    screeningEvents.forEach((screeningEvent) => {
        const registered = result.find((data) => {
            if (environment.PURCHASE_SCHEDULE_SORT === 'screeningEventSeries') {
                return (
                    data.screeningEvent.superEvent.id ===
                    screeningEvent.superEvent.id
                );
            } else {
                return (
                    data.screeningEvent.location.branchCode ===
                    screeningEvent.location.branchCode
                );
            }
        });
        const performance = new Performance({ screeningEvent, now });
        if (registered === undefined) {
            result.push({
                screeningEvent,
                data: [performance],
            });
        } else {
            registered.data.push(performance);
        }
    });

    return result;
}
