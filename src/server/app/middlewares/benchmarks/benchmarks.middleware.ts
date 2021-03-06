/**
 * ベンチマーク
 */

import debug from 'debug';
import * as express from 'express';
const log = debug('benchmark');

export default (
    req: express.Request,
    _: express.Response,
    next: express.NextFunction
): void => {
    if (process.env.APP_ENV === 'development') {
        const startMemory = process.memoryUsage();
        const startTime = process.hrtime();

        req.on('end', () => {
            const endMemory = process.memoryUsage();
            const memoryUsage = endMemory.rss - startMemory.rss;
            const diff = process.hrtime(startTime);
            const memory = `${startMemory.rss} - ${endMemory.rss}`;
            log(
                `benchmark took ${diff[0]} seconds and ${diff[1]} nanoseconds. memoryUsage:${memoryUsage} (${memory})`
            );
        });
    }

    next();
};
