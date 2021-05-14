import * as React from 'react';
import { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { useStore } from '../store';
import '../styles/global.scss';
import { useRouter } from 'next/router';
import momentTimezone from 'moment-timezone';
import { Functions } from '../index';
import { getEnvironment } from '../environments/environment';

// タイムゾーン設定
momentTimezone.tz.setDefault('Asia/Tokyo');
momentTimezone.locale('ja');

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
    const [mounted, setMounted] = React.useState<boolean>(false);
    const [errorCode, setErrorCode] = React.useState<number>(0);
    const router = useRouter();

    React.useEffect(() => {
        (async () => {
            try {
                if (!/projects/.test(router.pathname)) {
                    setErrorCode(400);
                    return;
                }
                const projectId = router.query.project;
                if (projectId === undefined || Array.isArray(projectId)) {
                    return;
                }
                const config = await setProject({ projectId });
                await setProjectConfig({
                    storageUrl: Functions.Util.getProject().storageUrl,
                    gtmId: config.gtmId,
                    analyticsId: config.analyticsId,
                });

                setMounted(true);
            } catch (error) {
                console.error(error);
                setErrorCode(error.status ? error.status : 400);
            }
        })();
    }, [router.query.project]);

    if (mounted) {
        const store = useStore();
        const persistor = persistStore(store);
        return (
            <Provider store={store}>
                <PersistGate persistor={persistor}>
                    <Component {...pageProps} />
                </PersistGate>
            </Provider>
        );
    }

    if (errorCode) {
        return <Component {...pageProps} />;
    }

    return <></>;
};

/**
 * プロジェクト情報設定
 */
async function setProject(params: {
    projectId?: string;
    projectName?: string;
}) {
    const fetchResult = await fetch('/api/project', {
        method: 'POST',
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
    const result: {
        projectId?: string;
        projectName?: string;
        storageUrl: string;
        gmoTokenUrl: string;
        sonyTokenUrl: string;
        env: string;
        gtmId?: string;
        analyticsId?: string;
    } = await fetchResult.json();
    const projectId =
        result.projectId !== undefined
            ? result.projectId
            : params.projectId !== undefined
            ? params.projectId
            : '';
    const projectName =
        result.projectName !== undefined
            ? result.projectName
            : params.projectName !== undefined
            ? params.projectName
            : '';
    const storageUrl =
        result.projectId === undefined && result.projectName === undefined
            ? projectName !== ''
                ? `${result.storageUrl}/${projectId}-${projectName}`
                : `${result.storageUrl}/${projectId}`
            : result.storageUrl;
    sessionStorage.setItem(
        'PROJECT',
        JSON.stringify({
            projectId,
            projectName,
            storageUrl,
            env: result.env,
            gtmId: result.gtmId,
            analyticsId: result.analyticsId,
            gmoTokenUrl: result.gmoTokenUrl,
            sonyTokenUrl: result.sonyTokenUrl,
        })
    );
    if (result.gmoTokenUrl !== undefined && result.gmoTokenUrl !== '') {
        const script = document.createElement('script');
        script.src = result.gmoTokenUrl;
        document.body.appendChild(script);
    }
    document.body.classList.add(result.env);

    return result;
}

/**
 * プロジェクトごとのアプリケーション設定
 */
async function setProjectConfig(params: {
    storageUrl: string;
    gtmId?: string;
    analyticsId?: string;
}) {
    const { storageUrl, gtmId, analyticsId } = params;
    const now = momentTimezone().toISOString();
    // 設定読み込み
    const fetchResult = await fetch(
        `${storageUrl}/js/environment.js?=date${now}`,
        {
            method: 'GET',
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
        }
    );
    if (fetchResult.ok) {
        eval(await fetchResult.text());
    } else {
        window.environment = {} as any;
    }

    // GTM_ID, ANALYTICS_IDを設定
    const { GTM_ID, ANALYTICS_ID } = window.environment;
    window.environment.GTM_ID =
        (GTM_ID === undefined || GTM_ID === '') && gtmId !== undefined
            ? gtmId
            : GTM_ID;
    window.environment.ANALYTICS_ID =
        (ANALYTICS_ID === undefined || ANALYTICS_ID === '') &&
        analyticsId !== undefined
            ? analyticsId
            : ANALYTICS_ID;

    const environment = getEnvironment();
    // タイトル設定
    document.title = environment.APP_TITLE;
    // 色設定
    await applyColor({ primaryColor: environment.PRIMARY_COLOR });
    // CSS設定
    await applyCSS({ storageUrl });
    // ファビコン設定
    await applyFavicon({ storageUrl });
    // GTM設定
    applyGTM({ id: environment.GTM_ID });
}

/**
 * 色設定
 */
function applyColor(params: { primaryColor: string }) {
    const { primaryColor } = params;
    const style = document.createElement('style');
    style.id = 'applyColor';
    style.innerHTML = `
.btn-primary,
.btn-outline-primary:hover,
header::after,
.wrapper .bg-primary { background-color: ${primaryColor} !important; }

.btn-primary,
.btn-outline-primary,
.wrapper .border-primary { border-color: ${primaryColor} !important; }

.btn-outline-primary,
.wrapper .text-primary { color: ${primaryColor} !important; }
    `;
    document.head.appendChild(style);
}

/**
 * CSS設定
 */
async function applyCSS(params: { storageUrl: string }) {
    const { storageUrl } = params;
    const now = momentTimezone().toISOString();
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = (await Functions.Util.isFile(
        `${storageUrl}/css/style.css?=date${now}`
    ))
        ? `${storageUrl}/css/style.css?=date${now}`
        : `/default/css/style.css?=date${now}`;
    document.head.appendChild(style);
}

/**
 * ファビコン設定
 */
async function applyFavicon(params: { storageUrl: string }) {
    const { storageUrl } = params;
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/x-icon"';
    favicon.href = (await Functions.Util.isFile(`${storageUrl}/favicon.ico`))
        ? `${storageUrl}/favicon.ico`
        : '/default/favicon.ico';
    document.head.appendChild(favicon);
}

/**
 * GTM設定
 */
function applyGTM(params: { id?: string }) {
    const { id } = params;
    if (id === undefined || id === '') {
        return;
    }
    (function (w, d, s, l, i) {
        (w as any)[l] = (w as any)[l] || [];
        (w as any)[l].push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js',
        });
        const f = d.getElementsByTagName(s)[0];
        const j = d.createElement(s),
            dl = l !== 'dataLayer' ? '&l=' + l : '';
        (j as any).async = true;
        (j as any).src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        (f as any).parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', id);
}

export default MyApp;
