import { configureStore } from '@reduxjs/toolkit';
import reviewReducer from './slices/reviewSlice'
import scoreReducer from './slices/scoreSlice';

export const store = configureStore({
    reducer: {
        review: reviewReducer,
        score: scoreReducer,

    },
});