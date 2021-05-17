import basicAuth from 'basic-auth';
import debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { UNAUTHORIZED } from 'http-status';

const log = debug('basicAuth');

/**
 * ベーシック認証ミドルウェア
 *
 * @module basicAuthMiddleware
 */
export default (req: Request, res: Response, next: NextFunction): void => {
    if (
        process.env.BASIC_AUTH_NAME === undefined ||
        process.env.BASIC_AUTH_PASS === undefined ||
        /\.(css|js|svg|jpg|png|gif|ico|json|html|txt)/.test(req.path)
    ) {
        // 環境変数設定なしもしくは静的ファイル
        next();

        return;
    }

    log('authenticating...', process.env.BASIC_AUTH_NAME);
    const user = basicAuth(req);
    if (
        user !== undefined &&
        user.name === process.env.BASIC_AUTH_NAME &&
        user.pass === process.env.BASIC_AUTH_PASS
    ) {
        log('authenticated!');
        // 認証情報が正しければOK
        next();

        return;
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="SSKTS Authentication"');
    res.status(UNAUTHORIZED).end('Unauthorized');
};
