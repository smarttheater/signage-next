/**
 * ルーティング
 */
import * as express from 'express';
import { authorizeRouter } from './api/authorize';
import { utilRouter } from './api/util';

export default (app: express.Application): void => {
    app.use('/api/authorize', authorizeRouter);
    app.use('/api', utilRouter);
};
