import { Direction } from '../models/common';

/**
 * 全角変換
 */
export function toFull(value: string): string {
    return value.replace(/[A-Za-z0-9]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) + 65248);
    });
}

/**
 * 半角変換
 */
export function toHalf(value: string): string {
    return value.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
    });
}

/**
 * リトライ
 * @param args
 */
export async function retry(args: {
    process: any;
    interval: number;
    limit: number;
}): Promise<any> {
    let count = 0;
    const timerProcess = () => {
        setTimeout(async () => {
            count++;
            try {
                const result = await args.process();
                return result;
            } catch (error) {
                if (count >= args.limit) {
                    throw new Error(error);
                }
                timerProcess();
            }
        }, args.interval);
    };
    try {
        const result = await args.process();
        return result;
    } catch (error) {
        timerProcess();
    }
}

/**
 * ミリ秒待つ
 * デフォルト値500ms
 */
export async function wait(time = 500): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

/**
 * 文字列をBLOB変換
 */
export function string2blob(value: string, options?: BlobPropertyBag): Blob {
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    return new Blob([bom, value], options);
}

/**
 * パラメータ取得
 */
export function getParameter(): {
    theaterBranchCode?: string;
    superEventId?: string;
    eventId?: string;
    passportToken?: string;
    workPerformedId?: string;
    scheduleDate?: string;
    linyId?: string;
    language?: string;
    projectId?: string;
    projectName?: string;
    redirectUrl?: string;
} {
    const result: any = {};
    const params = location.search.replace('?', '').split('&');
    for (let i = 0; i < params.length; i++) {
        const param = params[i].split('=');
        const key = param[0];
        const value = param[1];
        if (key && value) {
            result[key] = value;
        }
    }
    if (result.performanceId !== undefined && result.eventId === undefined) {
        result.eventId = result.performanceId;
        result.performanceId = undefined;
    }
    return result;
}

/**
 * プロジェクト情報取得
 */
export function getProject(): {
    projectId: string;
    projectName: string;
    storageUrl: string;
    env?: string;
    gtmId?: string;
    analyticsId?: string;
    gmoTokenUrl?: string;
    sonyTokenUrl?: string;
} {
    const project = sessionStorage.getItem('PROJECT');
    const defaultProject = { projectId: '', projectName: '', storageUrl: '' };
    if (project === null || project === '') {
        return defaultProject;
    }
    return {
        ...defaultProject,
        ...JSON.parse(project),
    };
}

/**
 * 外部データ取得
 */
export function getExternalData(): {
    theaterBranchCode?: string;
    superEventId?: string;
    eventId?: string;
    passportToken?: string;
    workPerformedId?: string;
    scheduleDate?: string;
    linyId?: string;
    language?: string;
    redirectUrl?: string;
} {
    const external = sessionStorage.getItem('EXTERNAL');
    if (external === null || external === '') {
        return {};
    }
    return JSON.parse(external);
}

/**
 * ファイル存在判定
 */
export async function isFile(url: string): Promise<boolean> {
    const fetchResult = await fetch(url, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'charset=utf-8',
        },
    });
    return fetchResult.ok;
}

/**
 * オブジェクトディープコピー
 */
export function deepCopy<T>(obj: T): T {
    return <T>JSON.parse(JSON.stringify(obj));
}

/**
 * ビューポート変更
 */
export function changeViewport(params: { direction: Direction }): void {
    const { direction } = params;
    const base = {
        width: direction === Direction.HORIZONTAL ? 1920 : 1080,
        height: direction === Direction.HORIZONTAL ? 1080 : 1920,
    };
    const scale = {
        width: window.innerWidth / base.width,
        height: window.innerHeight / base.height,
    };
    const currentScale =
        scale.width < scale.height ? scale.width : scale.height;
    const body = document.body;
    body.style.transform = `scale(${currentScale})`;
    body.style.opacity = '1';
    body.style.width = `${base.width}px`;
    body.style.height = `${base.height}px`;
    body.setAttribute('data-scale', String(currentScale));
    body.classList.remove(
        direction === Direction.HORIZONTAL
            ? Direction.VERTICAL.toLowerCase()
            : Direction.HORIZONTAL.toLowerCase()
    );
    body.classList.add(direction.toLowerCase());
    document.documentElement.style.fontSize =
        direction === Direction.HORIZONTAL ? '30px' : '20px';
}

/**
 * ビューポートリセット
 */
export function resetViewport(): void {
    const target = document.body;
    target.style.transform = 'scale(' + 1 + ')';
    // target.style.opacity = '0';
}

/**
 * サーバータイム取得
 */
export async function getServerTime(): Promise<{
    date: string;
}> {
    const fetchResult = await fetch('/api/serverTime', {
        method: 'GET',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
    });
    if (!fetchResult.ok) {
        throw new Error(
            JSON.stringify({
                status: fetchResult.status,
                statusText: fetchResult.statusText,
            })
        );
    }
    return await fetchResult.json();
}

/**
 * バージョン取得
 */
export async function getVersion(): Promise<{
    version: string;
}> {
    const fetchResult = await fetch('/api/version', {
        method: 'GET',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
    });
    if (!fetchResult.ok) {
        throw new Error(
            JSON.stringify({
                status: fetchResult.status,
                statusText: fetchResult.statusText,
            })
        );
    }
    return await fetchResult.json();
}
