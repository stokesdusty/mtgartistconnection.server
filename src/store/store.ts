import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth-slice';

export interface RootState {
  isLoggedIn: boolean;
}

const store = configureStore({
  reducer: {
    isLoggedIn: authReducer,
  },
});

export default store;
