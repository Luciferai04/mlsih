import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import tripSlice from './slices/tripSlice';
import userSlice from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    trips: tripSlice,
    user: userSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'trips/startTripTracking/fulfilled'],
      },
    }),
});