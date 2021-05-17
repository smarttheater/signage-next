/**
 * 認証API
 */
import debug from 'debug';
import * as express from 'express';
import { errorProsess } from '../../functions/base';
import { AuthModel } from '../../models/auth/auth.model';
const router = express.Router();
const log = debug('application: /api/authorize');

/**
 * 認証情報取得
 */
router.post('/getCredentials', async (req, res) => {
    log('getCredentials', req.body.member);
    try {
        let userName;
        const endpoint = <string>process.env.API_ENDPOINT;
        const waiterServerUrl = <string>process.env.WAITER_SERVER_URL;
        const authModel = new AuthModel();
        const options = {
            endpoint,
            auth: authModel.create(),
        };
        const accessToken = await options.auth.getAccessToken();
        const expiryDate = options.auth.credentials.expiry_date;
        if (req.body.member === '1') {
            userName = options.auth.verifyIdToken(<any>{}).getUsername();
        }
        const clientId = options.auth.options.clientId;
        res.json({
            accessToken,
            expiryDate,
            userName,
            clientId,
            endpoint,
            waiterServerUrl,
        });
    } catch (error) {
        errorProsess(res, error);
    }
});

export const authorizeRouter = router;
