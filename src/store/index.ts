import {
    configureStore,
    getDefaultMiddleware,
    combineReducers,
    EnhancedStore,
} from '@reduxjs/toolkit';
import { userSlice } from './user';
import { utilSlice } from './util';
import {
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import { getEnvironment } from '../environments/environment';

const createNoopStorage = () => {
    return {
        getItem(_key: string) {
            return Promise.resolve(null);
        },
        setItem(_key: string, value: any) {
            return Promise.resolve(value);
        },
        removeItem(_key: string) {
            return Promise.resolve();
        },
    };
};

const rootReducer = combineReducers({
    user: userSlice.reducer,
    util: utilSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const useStore = (): EnhancedStore => {
    const storage =
        typeof window !== 'undefined'
            ? createWebStorage('local')
            : createNoopStorage();
    const persistConfig = {
        key: getEnvironment().STORAGE_NAME,
        keyPrefix: '',
        version: 1,
        storage,
        whitelist: ['user'],
    };
    const persistedReducer = persistReducer(persistConfig, rootReducer);
    return configureStore({
        reducer: persistedReducer,
        middleware: getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                ],
            },
        }),
    });
};
