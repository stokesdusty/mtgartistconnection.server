import { createSlice } from '@reduxjs/toolkit';

const initialState = false;

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state) => {
      return true;
    },
    logout: (state) => {
      return false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer; // Correct: Default export of the reducer
