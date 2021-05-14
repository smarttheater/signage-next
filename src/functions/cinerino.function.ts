import * as cinerino from '@cinerino/sdk';
import moment from 'moment';
import { getProject, getServerTime, wait } from './util.function';

export async function createOption(): Promise<{
    endpoint: string;
    auth: cinerino.auth.ClientCredentials | cinerino.auth.OAuth2;
    project: { id: string };
}> {
    const body = { member: '0' };
    const auth = window.cinerino?.auth;
    const endpoint = window.cinerino?.endpoint;
    // ログイン中ならmemberに1を設定
    if (
        endpoint !== undefined &&
        auth !== undefined &&
        auth.credentials.expiryDate !== undefined &&
        body.member !== '1'
    ) {
        const now = (await getServerTime()).date;
        const expiryDate = auth.credentials.expiryDate;
        const isTokenExpired =
            expiryDate !== undefined
                ? moment(expiryDate).add(-5, 'minutes').unix() <=
                  moment(now).unix()
                : false;
        if (!isTokenExpired) {
            // アクセストークン取得・更新しない
            return {
                endpoint,
                auth,
                project: { id: getProject().projectId },
            };
        }
    }
    // アクセストークン取得・更新
    await refreshAccessToken(body);
    return {
        endpoint: <string>window.cinerino?.endpoint,
        auth: <cinerino.auth.ClientCredentials | cinerino.auth.OAuth2>(
            window.cinerino?.auth
        ),
        project: { id: getProject().projectId },
    };
}

/**
 * アクセストークン更新
 */
async function refreshAccessToken(params: { member: string }) {
    const url = '/api/authorize/getCredentials';
    const fetchResult = await fetch(url, {
        method: 'POST',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(params),
    });
    if (!fetchResult.ok) {
        throw new Error(
            JSON.stringify({
                status: fetchResult.status,
                statusText: fetchResult.statusText,
            })
        );
    }
    const json = await fetchResult.json();
    const option = {
        domain: '',
        clientId: json.clientId,
        redirectUri: '',
        logoutUri: '',
        responseType: '',
        scope: '',
        state: '',
        nonce: null,
        tokenIssuer: '',
    };
    const auth = cinerino.createAuthInstance(option);
    auth.setCredentials({
        accessToken: json.accessToken,
        expiryDate: json.expiryDate,
    });
    window.cinerino = {
        endpoint: json.endpoint,
        userName: json.userName,
        waiterServerUrl: json.waiterServerUrl,
        auth,
    };
}

export async function searchAll<T, U>(params: {
    service:
        | cinerino.service.Place
        | cinerino.service.Event
        | cinerino.service.CreativeWork;
    condition: T;
    method: string;
}): Promise<U[]> {
    const { condition, method, service } = params;
    const limit = 100;
    let page = 1;
    let roop = true;
    let result = <U[]>[];
    while (roop) {
        const searchResult = await (<any>service)[method]({
            page,
            limit,
            ...condition,
        });
        result = [...result, ...searchResult.data];
        page++;
        roop = searchResult.data.length === limit;
        if (roop) {
            await wait();
        }
    }

    return result;
}
