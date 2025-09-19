import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import storageService from '../../services/storageService';

export const loadUserSettings = createAsyncThunk(
  'user/loadSettings',
  async () => {
    return await storageService.getUserSettings();
  }
);

export const saveUserSettings = createAsyncThunk(
  'user/saveSettings',
  async (settings) => {
    await storageService.saveUserSettings(settings);
    return settings;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    hasCompletedWelcome: false,
    consentStatus: false,
    trackingEnabled: false,
    pushNotifications: true,
    dataRetentionDays: 30,
    loading: false,
  },
  reducers: {
    setWelcomeCompleted: (state, action) => {
      state.hasCompletedWelcome = action.payload;
    },
    setConsentStatus: (state, action) => {
      state.consentStatus = action.payload;
    },
    setTrackingEnabled: (state, action) => {
      state.trackingEnabled = action.payload;
    },
    setPushNotifications: (state, action) => {
      state.pushNotifications = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserSettings.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      })
      .addCase(saveUserSettings.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      });
  },
});

export const { 
  setWelcomeCompleted, 
  setConsentStatus, 
  setTrackingEnabled, 
  setPushNotifications 
} = userSlice.actions;
export default userSlice.reducer;