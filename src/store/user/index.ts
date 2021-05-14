import { factory } from '@cinerino/sdk';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Models } from '../..';

export type UserState = {
    /**
     * 劇場
     */
    movieTheater?: factory.chevre.place.movieTheater.IPlaceWithoutScreeningRoom;
    /**
     * スクリーン
     */
    screeningRoom?: factory.chevre.place.screeningRoom.IPlace;
    /**
     * ページ
     */
    page?: number;
    /**
     * 向き
     */
    direction: Models.Common.Direction;
    /**
     * レイアウト
     */
    layout: Models.Common.Layout;
    /**
     * 言語
     */
    language: string;
    /**
     * バージョン
     */
    version?: string;
    /**
     * 画像
     */
    image?: any;
    /**
     * 色
     */
    color: Models.Common.Color;
};

export type UpdateUserPayload = UserState;

const initialState: UserState = {
    language: 'ja',
    direction: Models.Common.Direction.HORIZONTAL,
    layout: Models.Common.Layout.TYPE01,
    color: Models.Common.Color.Darkgray,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateUser(state, action: PayloadAction<UpdateUserPayload>) {
            state.movieTheater = action.payload.movieTheater;
            state.screeningRoom = action.payload.screeningRoom;
            state.page = action.payload.page;
            state.direction = action.payload.direction;
            state.layout = action.payload.layout;
            state.image = action.payload.image;
            state.color = action.payload.color;
        },
        reset(): UserState {
            return initialState;
        },
    },
});
