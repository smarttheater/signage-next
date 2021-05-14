/**
 * ルーティング
 */
import debug from 'debug';
import * as express from 'express';
import { Auth2Model } from '../models/auth2/auth2.model';
import { authorizeRouter } from './api/authorize';
import { linyRouter } from './api/liny';
import { utilRouter } from './api/util';
const log = debug('application: router');

export default (app: express.Application): void => {
    app.use('/api/authorize', authorizeRouter);
    app.use('/api/liny', linyRouter);
    app.use('/api', utilRouter);

    app.get('/signIn', async (req, res, next) => {
        log('signInRedirect', req.query);
        if (req.query.code === undefined) {
            res.redirect('/');
            return;
        }
        try {
            if (req.session === undefined) {
                throw new Error('session is undefined');
            }
            const authModel = new Auth2Model((<any>req.session).auth);
            if (
                req.query.state !== undefined &&
                req.query.state !== authModel.state
            ) {
                throw new Error(
                    `state not matched ${req.query.state} !== ${authModel.state}`
                );
            }
            const auth = authModel.create(req);
            const credentials = await auth.getToken(
                <string>req.query.code,
                <string>authModel.codeVerifier
            );
            // log('credentials published', credentials);
            authModel.credentials = credentials;
            authModel.save(req.session);
            auth.setCredentials(credentials);
            res.redirect('/#/auth/signin');
        } catch (error) {
            next(error);
        }
    });

    app.get('/signOut', (req: express.Request, res: express.Response) => {
        log('signOutRedirect');
        delete (<any>req.session).auth;
        res.redirect('/');
    });
};
