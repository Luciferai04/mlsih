import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const signInAnonymously = createAsyncThunk(
  'auth/signInAnonymously',
  async () => {
    // Placeholder for Firebase Auth
    return {
      uid: `anonymous_${Date.now()}`,
      isAnonymous: true,
    };
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
  },
  reducers: {
    signOut: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInAnonymously.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      });
  },
});

export const { signOut } = authSlice.actions;
export default authSlice.reducer;