import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import storageService from '../../services/storageService';
import locationService from '../../services/locationService';
import mlService from '../../services/mlService';
import notificationService from '../../services/notificationService';

export const startTripTracking = createAsyncThunk(
  'trips/startTracking',
  async (_, { dispatch }) => {
    const hasPermission = await locationService.requestPermissions();
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    const startTime = Date.now();
    const tripId = `trip_${startTime}`;
    
    const currentPosition = await locationService.getCurrentPosition();
    
    const newTrip = {
      id: tripId,
      startTime,
      startLocation: {
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      },
      locations: [{
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
        timestamp: currentPosition.timestamp,
        accuracy: currentPosition.coords.accuracy,
      }],
      isActive: true,
      mode: 'unknown',
    };

    // Start location tracking
    locationService.startTracking((location) => {
      dispatch(addLocationPoint({ tripId, location }));
    });

    return newTrip;
  }
);

export const stopTripTracking = createAsyncThunk(
  'trips/stopTracking',
  async (_, { getState }) => {
    const { currentTrip } = getState().trips;
    
    if (!currentTrip) return null;

    locationService.stopTracking();
    
    const endTime = Date.now();
    const currentPosition = await locationService.getCurrentPosition();
    
    const completedTrip = {
      ...currentTrip,
      endTime,
      endLocation: {
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      },
      isActive: false,
    };

    // Predict travel mode
    const travelMode = await mlService.predictTravelMode({
      locations: completedTrip.locations,
      duration: endTime - completedTrip.startTime,
    });

    completedTrip.predictedMode = travelMode;
    completedTrip.distance = mlService.calculateTotalDistance(completedTrip.locations);

    // Save to local storage
    await storageService.saveTrip(completedTrip);

    // Show confirmation nudge
    notificationService.showTripConfirmationNudge(completedTrip);

    return completedTrip;
  }
);

export const loadTripsFromStorage = createAsyncThunk(
  'trips/loadFromStorage',
  async () => {
    return await storageService.getTrips();
  }
);

const tripSlice = createSlice({
  name: 'trips',
  initialState: {
    trips: [],
    currentTrip: null,
    isTracking: false,
    loading: false,
    error: null,
  },
  reducers: {
    addLocationPoint: (state, action) => {
      const { tripId, location } = action.payload;
      if (state.currentTrip && state.currentTrip.id === tripId) {
        state.currentTrip.locations.push({
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: location.timestamp,
          accuracy: location.accuracy,
        });
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    deleteTrip: (state, action) => {
      const tripId = action.payload;
      state.trips = state.trips.filter(trip => trip.id !== tripId);
      storageService.deleteTrip(tripId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startTripTracking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startTripTracking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTrip = action.payload;
        state.isTracking = true;
      })
      .addCase(startTripTracking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.isTracking = false;
      })
      .addCase(stopTripTracking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTrip = null;
        state.isTracking = false;
        if (action.payload) {
          state.trips.unshift(action.payload);
        }
      })
      .addCase(loadTripsFromStorage.fulfilled, (state, action) => {
        state.trips = action.payload;
      });
  },
});

export const { addLocationPoint, clearError, deleteTrip } = tripSlice.actions;
export default tripSlice.reducer;