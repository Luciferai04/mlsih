/**
 * Advanced Trip Detection Service
 * AI-Powered Trip Recognition using GPS, motion sensors, and geofencing
 * Optimized for Kerala transportation patterns
 */

import { accelerometer, gyroscope } from 'react-native-sensors';
import BackgroundTimer from 'react-native-background-timer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import locationService from './locationService';
import mlService from './mlService';
import storageService from './storageService';

class TripDetectionService {
  constructor() {
    this.isTracking = false;
    this.currentTrip = null;
    this.locationBuffer = [];
    this.motionBuffer = [];
    this.lastLocation = null;
    this.lastMotionTime = null;
    this.stationaryTimer = null;
    this.motionThreshold = 2.5; // m/s² for motion detection
    this.stationaryTimeout = 300000; // 5 minutes stationary = trip end
    this.minTripDistance = 100; // minimum 100m for valid trip
    this.minTripDuration = 60000; // minimum 1 minute
    this.backgroundInterval = null;
    this.listeners = [];
  }

  /**
   * Start automatic trip detection
   */
  async startTripDetection() {
    try {
      if (this.isTracking) {
        console.log('Trip detection already running');
        return;
      }

      console.log('🚀 Starting AI-powered trip detection...');
      this.isTracking = true;

      // Request permissions
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        throw new Error('Required permissions not granted');
      }

      // Initialize location tracking
      await locationService.startTracking();
      
      // Start motion sensor monitoring
      this.startMotionSensors();
      
      // Start background processing
      this.startBackgroundProcessing();
      
      // Load geofences for Kerala-specific locations
      await this.loadKeralageofences();

      console.log('✅ Trip detection started successfully');
      this.notifyListeners('detection_started');

    } catch (error) {
      console.error('Failed to start trip detection:', error);
      this.isTracking = false;
      throw error;
    }
  }

  /**
   * Stop trip detection
   */
  async stopTripDetection() {
    try {
      console.log('🛑 Stopping trip detection...');
      this.isTracking = false;

      // Stop location tracking
      await locationService.stopTracking();
      
      // Stop motion sensors
      this.stopMotionSensors();
      
      // Stop background processing
      this.stopBackgroundProcessing();
      
      // End current trip if active
      if (this.currentTrip) {
        await this.endTrip('manual_stop');
      }

      console.log('✅ Trip detection stopped');
      this.notifyListeners('detection_stopped');

    } catch (error) {
      console.error('Error stopping trip detection:', error);
    }
  }

  /**
   * Request necessary permissions
   */
  async requestPermissions() {
    try {
      // Location permissions handled by locationService
      const locationPermission = await locationService.requestPermissions();
      
      // Motion sensors (usually don't need explicit permission)
      return locationPermission;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  /**
   * Start motion sensor monitoring
   */
  startMotionSensors() {
    try {
      // Monitor accelerometer for motion detection
      const accelerometerSubscription = accelerometer.subscribe(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        this.processMotionData({
          type: 'accelerometer',
          magnitude,
          x, y, z,
          timestamp: Date.now()
        });
      });

      // Monitor gyroscope for rotation detection
      const gyroscopeSubscription = gyroscope.subscribe(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        this.processMotionData({
          type: 'gyroscope', 
          magnitude,
          x, y, z,
          timestamp: Date.now()
        });
      });

      this.motionSubscriptions = [accelerometerSubscription, gyroscopeSubscription];
      console.log('Motion sensors started');

    } catch (error) {
      console.error('Failed to start motion sensors:', error);
    }
  }

  /**
   * Stop motion sensors
   */
  stopMotionSensors() {
    try {
      if (this.motionSubscriptions) {
        this.motionSubscriptions.forEach(sub => sub.unsubscribe());
        this.motionSubscriptions = null;
      }
      console.log('Motion sensors stopped');
    } catch (error) {
      console.error('Error stopping motion sensors:', error);
    }
  }

  /**
   * Process motion sensor data
   */
  processMotionData(motionData) {
    try {
      this.motionBuffer.push(motionData);
      
      // Keep only last 50 motion readings (about 10 seconds at 5Hz)
      if (this.motionBuffer.length > 50) {
        this.motionBuffer = this.motionBuffer.slice(-50);
      }

      // Detect significant motion
      if (motionData.magnitude > this.motionThreshold) {
        this.lastMotionTime = Date.now();
        
        // If we were stationary, this might be trip start
        if (!this.currentTrip && this.isSignificantMotion()) {
          this.handlePotentialTripStart();
        }
        
        // Clear stationary timer
        if (this.stationaryTimer) {
          clearTimeout(this.stationaryTimer);
          this.stationaryTimer = null;
        }
      } else {
        // Low motion detected, start stationary timer if in trip
        if (this.currentTrip && !this.stationaryTimer) {
          this.stationaryTimer = setTimeout(() => {
            this.handlePotentialTripEnd('stationary');
          }, this.stationaryTimeout);
        }
      }

    } catch (error) {
      console.error('Error processing motion data:', error);
    }
  }

  /**
   * Check if current motion indicates significant movement
   */
  isSignificantMotion() {
    try {
      if (this.motionBuffer.length < 10) return false;

      const recentMotion = this.motionBuffer.slice(-10);
      const avgMagnitude = recentMotion.reduce((sum, m) => sum + m.magnitude, 0) / recentMotion.length;
      
      return avgMagnitude > this.motionThreshold * 1.2; // 20% higher than threshold
    } catch (error) {
      return false;
    }
  }

  /**
   * Start background processing for battery optimization
   */
  startBackgroundProcessing() {
    try {
      // Process location updates every 30 seconds in background
      this.backgroundInterval = BackgroundTimer.setInterval(() => {
        if (this.isTracking) {
          this.processLocationUpdates();
        }
      }, 30000); // 30 second intervals

      console.log('Background processing started');
    } catch (error) {
      console.error('Failed to start background processing:', error);
    }
  }

  /**
   * Stop background processing
   */
  stopBackgroundProcessing() {
    try {
      if (this.backgroundInterval) {
        BackgroundTimer.clearInterval(this.backgroundInterval);
        this.backgroundInterval = null;
      }
      console.log('Background processing stopped');
    } catch (error) {
      console.error('Error stopping background processing:', error);
    }
  }

  /**
   * Process location updates and detect trip patterns
   */
  async processLocationUpdates() {
    try {
      const currentLocation = await locationService.getCurrentLocation();
      if (!currentLocation) return;

      this.locationBuffer.push({
        ...currentLocation,
        timestamp: Date.now()
      });

      // Keep only last 100 locations (about 50 minutes at 30s intervals)
      if (this.locationBuffer.length > 100) {
        this.locationBuffer = this.locationBuffer.slice(-20);
      }

      // Analyze location patterns
      await this.analyzeLocationPatterns();

      this.lastLocation = currentLocation;

    } catch (error) {
      console.error('Error processing location updates:', error);
    }
  }

  /**
   * Analyze location patterns for trip detection
   */
  async analyzeLocationPatterns() {
    try {
      if (this.locationBuffer.length < 3) return;

      const recentLocations = this.locationBuffer.slice(-3);
      const distance = this.calculateTotalDistance(recentLocations);
      const timeSpan = recentLocations[recentLocations.length - 1].timestamp - recentLocations[0].timestamp;
      const avgSpeed = distance > 0 && timeSpan > 0 ? (distance / (timeSpan / 1000)) * 3.6 : 0; // km/h

      // Trip start detection
      if (!this.currentTrip && avgSpeed > 2.5 && distance > 50) {
        await this.handlePotentialTripStart();
      }

      // Trip end detection
      if (this.currentTrip && avgSpeed < 1.0 && this.isInGeofence(this.lastLocation)) {
        await this.handlePotentialTripEnd('arrived_destination');
      }

    } catch (error) {
      console.error('Error analyzing location patterns:', error);
    }
  }

  /**
   * Handle potential trip start
   */
  async handlePotentialTripStart() {
    try {
      if (this.currentTrip) return; // Already in trip

      console.log('🎯 Potential trip start detected');

      const startLocation = await locationService.getCurrentLocation();
      if (!startLocation) return;

      // Create new trip
      this.currentTrip = {
        id: `trip_${Date.now()}`,
        startTime: Date.now(),
        startLocation,
        locations: [startLocation],
        motionData: [...this.motionBuffer],
        status: 'active'
      };

      // Save trip start
      await this.saveTrip();

      console.log('🚀 Trip started:', this.currentTrip.id);
      this.notifyListeners('trip_started', this.currentTrip);

    } catch (error) {
      console.error('Error handling trip start:', error);
    }
  }

  /**
   * Handle potential trip end
   */
  async handlePotentialTripEnd(reason = 'unknown') {
    try {
      if (!this.currentTrip) return;

      console.log(`🎯 Potential trip end detected: ${reason}`);

      const endLocation = await locationService.getCurrentLocation();
      const endTime = Date.now();
      
      // Validate trip criteria
      const tripDuration = endTime - this.currentTrip.startTime;
      const tripDistance = this.calculateTotalDistance(this.currentTrip.locations);
      
      if (tripDuration < this.minTripDuration || tripDistance < this.minTripDistance) {
        console.log('Trip too short, discarding');
        this.currentTrip = null;
        return;
      }

      // Complete trip
      this.currentTrip.endTime = endTime;
      this.currentTrip.endLocation = endLocation;
      this.currentTrip.duration = tripDuration;
      this.currentTrip.distance = tripDistance;
      this.currentTrip.endReason = reason;
      this.currentTrip.status = 'completed';

      // Classify trip using ML
      await this.classifyTrip();

      // Save completed trip
      await this.saveTrip();

      console.log('✅ Trip completed:', {
        id: this.currentTrip.id,
        duration: Math.round(tripDuration / 1000 / 60),
        distance: Math.round(tripDistance),
        mode: this.currentTrip.predictedMode
      });

      this.notifyListeners('trip_completed', this.currentTrip);
      this.currentTrip = null;

    } catch (error) {
      console.error('Error handling trip end:', error);
    }
  }

  /**
   * Classify completed trip using ML
   */
  async classifyTrip() {
    try {
      if (!this.currentTrip) return;

      const tripData = {
        locations: this.currentTrip.locations,
        duration: this.currentTrip.duration,
        metadata: {
          motionData: this.currentTrip.motionData,
          startLocation: this.currentTrip.startLocation,
          endLocation: this.currentTrip.endLocation,
          endReason: this.currentTrip.endReason
        }
      };

      // Use enhanced ML service with trained models
      const prediction = await mlService.predictTravelMode(tripData);
      
      this.currentTrip.predictedMode = prediction.mode || 'unknown';
      this.currentTrip.confidence = prediction.confidence || 0;
      this.currentTrip.accuracy = prediction.accuracy || 'rule-based';
      this.currentTrip.source = prediction.source || 'local';

      console.log('🤖 Trip classified:', {
        mode: this.currentTrip.predictedMode,
        confidence: Math.round(this.currentTrip.confidence * 100) + '%',
        source: this.currentTrip.source
      });

    } catch (error) {
      console.error('Error classifying trip:', error);
      this.currentTrip.predictedMode = 'unknown';
      this.currentTrip.confidence = 0;
    }
  }

  /**
   * Load Kerala-specific geofences
   */
  async loadKeralageofences() {
    try {
      // Major Kerala transportation hubs and landmarks
      this.keralageofences = [
        // Kochi/Ernakulam
        { name: 'Kochi Metro Stations', lat: 9.9312, lng: 76.2673, radius: 500, type: 'metro' },
        { name: 'Ernakulam Junction', lat: 9.9816, lng: 76.2999, radius: 1000, type: 'train' },
        { name: 'Cochin International Airport', lat: 10.1520, lng: 76.4019, radius: 2000, type: 'airport' },
        
        // Thiruvananthapuram
        { name: 'Trivandrum Central', lat: 8.4875, lng: 76.9525, radius: 1000, type: 'train' },
        { name: 'Trivandrum Airport', lat: 8.4821, lng: 76.9199, radius: 2000, type: 'airport' },
        
        // Calicut
        { name: 'Calicut Railway Station', lat: 11.2504, lng: 75.7804, radius: 800, type: 'train' },
        
        // Thrissur
        { name: 'Thrissur Railway Station', lat: 10.5167, lng: 76.2167, radius: 600, type: 'train' },
        
        // KSRTC Bus Stations
        { name: 'Ernakulam KSRTC', lat: 9.9816, lng: 76.2847, radius: 300, type: 'bus' },
        { name: 'Trivandrum KSRTC', lat: 8.5069, lng: 76.9570, radius: 300, type: 'bus' },
        
        // Ferry/Water transport
        { name: 'Fort Kochi Ferry', lat: 9.9657, lng: 76.2394, radius: 200, type: 'ferry' },
        { name: 'Mattancherry Ferry', lat: 9.9581, lng: 76.2619, radius: 200, type: 'ferry' }
      ];

      console.log(`Loaded ${this.keralageofences.length} Kerala geofences`);
    } catch (error) {
      console.error('Error loading geofences:', error);
      this.keralageofences = [];
    }
  }

  /**
   * Check if location is within any geofence
   */
  isInGeofence(location) {
    try {
      if (!location || !this.keralageofences) return false;

      return this.keralageofences.some(fence => {
        const distance = this.calculateDistance(
          location.latitude, location.longitude,
          fence.lat, fence.lng
        );
        return distance <= fence.radius;
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate distance between two points in meters
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Calculate total distance for array of locations
   */
  calculateTotalDistance(locations) {
    if (!locations || locations.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < locations.length; i++) {
      totalDistance += this.calculateDistance(
        locations[i-1].latitude, locations[i-1].longitude,
        locations[i].latitude, locations[i].longitude
      );
    }
    return totalDistance;
  }

  /**
   * Convert degrees to radians
   */
  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Save trip to local storage
   */
  async saveTrip() {
    try {
      if (!this.currentTrip) return;
      
      await storageService.saveTrip(this.currentTrip);
    } catch (error) {
      console.error('Error saving trip:', error);
    }
  }

  /**
   * End current trip manually
   */
  async endTrip(reason = 'manual') {
    if (this.currentTrip) {
      await this.handlePotentialTripEnd(reason);
    }
  }

  /**
   * Get current trip status
   */
  getCurrentTrip() {
    return this.currentTrip;
  }

  /**
   * Get trip statistics
   */
  getTripStatistics() {
    if (!this.currentTrip) return null;

    const duration = Date.now() - this.currentTrip.startTime;
    const distance = this.calculateTotalDistance(this.currentTrip.locations);
    const avgSpeed = distance > 0 && duration > 0 ? (distance / (duration / 1000)) * 3.6 : 0;

    return {
      duration: Math.round(duration / 1000 / 60), // minutes
      distance: Math.round(distance), // meters
      avgSpeed: Math.round(avgSpeed * 10) / 10, // km/h
      locationPoints: this.currentTrip.locations.length
    };
  }

  /**
   * Add listener for trip events
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove listener
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event, data = null) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in trip detection listener:', error);
      }
    });
  }

  /**
   * Get detection status
   */
  getStatus() {
    return {
      isTracking: this.isTracking,
      hasActiveTrip: !!this.currentTrip,
      locationBufferSize: this.locationBuffer.length,
      motionBufferSize: this.motionBuffer.length,
      lastLocation: this.lastLocation,
      lastMotionTime: this.lastMotionTime
    };
  }
}

export default new TripDetectionService();