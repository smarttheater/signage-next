import { getProject } from '../functions/util.function';

/**
 * 環境変数
 */
export interface IEnvironment {
    /**
     * 本番判定
     */
    production: boolean;
    /**
     * アプリケーションタイトル
     */
    APP_TITLE: string;
    /**
     * プライマリーカラー
     */
    PRIMARY_COLOR: string;
    /**
     * 表示タイプ
     */
    VIEW_TYPE: string;
    /**
     * タグマネージャーID
     */
    GTM_ID: string;
    /**
     * アナリティクスID
     */
    ANALYTICS_ID: string;
    /**
     * ストレージの名前
     */
    STORAGE_NAME: string;
    /**
     * ストレージの種類
     */
    STORAGE_TYPE: string;
    /**
     * ベースURL
     */
    BASE_URL: string;
    /**
     * 対応言語
     */
    LANGUAGE: string[];
    /**
     * スケジュールソート
     */
    PURCHASE_SCHEDULE_SORT: 'screeningEventSeries' | 'screen';
    /**
     * スケジュールステータス閾値
     */
    PURCHASE_SCHEDULE_STATUS_THRESHOLD_VALUE: string;
    /**
     * スケジュールステータス閾値単位（%）
     */
    PURCHASE_SCHEDULE_STATUS_THRESHOLD_UNIT: string;
    /**
     * 自動再生待機時間(ms)
     */
    AUTOPLAY_DELAY_TIME: string;
    /**
     * 更新待機時間(ms)
     */
    UPDATE_DELAY_TIME: string;
}

export function getEnvironment(): IEnvironment {
    const defaultEnvironment: IEnvironment = {
        production: false,
        APP_TITLE: 'SMART THEATER',
        PRIMARY_COLOR: 'steelblue',
        VIEW_TYPE: 'event',
        GTM_ID: '',
        ANALYTICS_ID: '',
        STORAGE_NAME:
            getProject().projectId === ''
                ? 'SIGNAGE-STATE'
                : `${getProject().projectId.toUpperCase()}-SIGNAGE-STATE`,
        STORAGE_TYPE: 'localStorage',
        BASE_URL: '/root',
        LANGUAGE: ['ja'],
        PURCHASE_SCHEDULE_SORT: 'screeningEventSeries',
        PURCHASE_SCHEDULE_STATUS_THRESHOLD_VALUE: '30',
        PURCHASE_SCHEDULE_STATUS_THRESHOLD_UNIT: '%',
        AUTOPLAY_DELAY_TIME: '60000',
        UPDATE_DELAY_TIME: '600000',
    };
    const environment = {
        ...defaultEnvironment,
        STORAGE_NAME:
            getProject().projectId === ''
                ? 'SIGNAGE-STATE'
                : `${getProject().projectId.toUpperCase()}-SIGNAGE-STATE`,
        ...(<any>window).environment,
        production: document.querySelector('body.production') !== null,
    };
    return environment;
}
