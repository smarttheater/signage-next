import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UtilState = {
    loading: boolean;
    process: string;
    error?: string;
};

export type ChangeLoadingPayload = {
    loading: boolean;
    process?: string;
};
export type SetErrorPayload = string;

const initialState: UtilState = {
    loading: false,
    process: '',
    error: undefined,
};

export const utilSlice = createSlice({
    name: 'util',
    initialState,
    reducers: {
        changeLoading(state, action: PayloadAction<ChangeLoadingPayload>) {
            state.loading = action.payload.loading;
            state.process =
                action.payload.process === undefined
                    ? ''
                    : action.payload.process;
        },
        setError(state, action: PayloadAction<SetErrorPayload>) {
            state.error = action.payload;
        },
        reset(): UtilState {
            return initialState;
        },
    },
});
