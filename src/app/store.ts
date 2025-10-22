//redux store for non-auth state (books, users)

import { configureStore } from '@reduxjs/toolkit';
import booksReducer from '../features/book/bookSlice';
import issueReducer from '../features/issue/issueSlice';
import studentReducer from '../features/student/studentSlice';
import authorReducer from '../features/author/authorSlice';

export const store = configureStore({
    reducer:{
        books: booksReducer,
        issues: issueReducer,
        students: studentReducer,
        authors: authorReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({}),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;