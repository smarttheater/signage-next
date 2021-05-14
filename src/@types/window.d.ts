import { IEnvironment } from '../environments/environment';
import * as cinerino from '@cinerino/sdk';

declare global {
    interface Window {
        environment: IEnvironment;
        cinerino?: {
            userName: string;
            endpoint: string;
            waiterServerUrl: string;
            auth: cinerino.auth.ClientCredentials | cinerino.auth.OAuth2;
        };
    }
}
