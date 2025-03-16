import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth-slice'; // Correct: Default import

// Define the RootState interface
export interface RootState {
  isLoggedIn: boolean;
  // ... other state slices
}

const store = configureStore({
  reducer: {
    isLoggedIn: authReducer, // Use the imported reducer
    // ... other reducers
  },
});

export default store;
