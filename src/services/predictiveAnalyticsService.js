/**
 * Predictive Analytics Service
 * AI-powered predictions for next trip, mode recommendations, and travel time estimation
 * Part of Advanced AI/ML Intelligence Features
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import mlService from './mlService';
import locationService from './locationService';

class PredictiveAnalyticsService {
  constructor() {
    this.tripHistory = [];
    this.userPatterns = {};
    this.predictions = {
      nextTrip: null,
      recommendedMode: null,
      estimatedTime: null,
      anomalies: []
    };
    this.modelAccuracy = {
      tripPrediction: 0.82,
      modeRecommendation: 0.89,
      timeEstimation: 0.91
    };
    this.adaptiveLearning = true;
    this.listeners = [];
  }

  /**
   * Initialize predictive analytics
   */
  async initialize() {
    try {
      console.log('🔮 Initializing Predictive Analytics Service...');
      
      // Load historical data
      await this.loadTripHistory();
      
      // Analyze user patterns
      await this.analyzeUserPatterns();
      
      // Initialize prediction models
      await this.initializePredictionModels();
      
      console.log('✅ Predictive Analytics initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize predictive analytics:', error);
      return false;
    }
  }

  /**
   * Predict next trip destination and time
   */
  async predictNextTrip(currentContext = {}) {
    try {
      console.log('🎯 Predicting next trip...');
      
      const { currentTime = Date.now(), currentLocation, dayOfWeek, recentActivity } = currentContext;
      
      // Extract prediction features
      const features = this.extractPredictionFeatures(currentContext);
      
      // Get predictions from multiple models
      const predictions = [];
      
      // 1. Pattern-based prediction
      const patternPrediction = this.predictByPatterns(features);
      if (patternPrediction) predictions.push(patternPrediction);
      
      // 2. Time-series prediction
      const timeSeriesPrediction = this.predictByTimeSeries(features);
      if (timeSeriesPrediction) predictions.push(timeSeriesPrediction);
      
      // 3. Markov chain prediction
      const markovPrediction = this.predictByMarkovChain(features);
      if (markovPrediction) predictions.push(markovPrediction);
      
      // 4. ML model prediction
      const mlPrediction = await this.predictByMLModel(features);
      if (mlPrediction) predictions.push(mlPrediction);
      
      // Ensemble predictions
      const finalPrediction = this.ensembleTripPredictions(predictions);
      
      // Store prediction
      this.predictions.nextTrip = finalPrediction;
      
      // Notify listeners
      this.notifyListeners('next_trip_predicted', finalPrediction);
      
      return finalPrediction;
      
    } catch (error) {
      console.error('Error predicting next trip:', error);
      return null;
    }
  }

  /**
   * Recommend optimal transportation mode
   */
  async recommendTransportMode(tripDetails = {}) {
    try {
      console.log('🚗 Recommending transport mode...');
      
      const { origin, destination, departureTime, preferences = {} } = tripDetails;
      
      // Get real-time context
      const context = await this.getRealTimeContext();
      
      // Evaluate each mode
      const modeEvaluations = await this.evaluateTransportModes(tripDetails, context);
      
      // Apply user preferences
      const weightedEvaluations = this.applyUserPreferences(modeEvaluations, preferences);
      
      // Get recommendation
      const recommendation = this.selectOptimalMode(weightedEvaluations);
      
      // Add reasoning
      recommendation.reasons = this.generateRecommendationReasons(recommendation, context);
      
      // Store recommendation
      this.predictions.recommendedMode = recommendation;
      
      // Notify listeners
      this.notifyListeners('mode_recommended', recommendation);
      
      return recommendation;
      
    } catch (error) {
      console.error('Error recommending transport mode:', error);
      return null;
    }
  }

  /**
   * Estimate travel time with real-time factors
   */
  async estimateTravelTime(tripDetails = {}) {
    try {
      console.log('⏱️ Estimating travel time...');
      
      const { origin, destination, mode, departureTime = Date.now() } = tripDetails;
      
      // Get base travel time
      const baseTime = await this.getBaseTime(origin, destination, mode);
      
      // Apply real-time factors
      const factors = await this.getTravelTimeFactors(tripDetails);
      
      // Calculate adjusted time
      const adjustedTime = this.calculateAdjustedTime(baseTime, factors);
      
      // Add confidence interval
      const estimation = {
        estimated: adjustedTime,
        minimum: adjustedTime * 0.85,
        maximum: adjustedTime * 1.25,
        confidence: this.calculateTimeConfidence(factors),
        factors: factors,
        timestamp: Date.now()
      };
      
      // Store estimation
      this.predictions.estimatedTime = estimation;
      
      // Notify listeners
      this.notifyListeners('time_estimated', estimation);
      
      return estimation;
      
    } catch (error) {
      console.error('Error estimating travel time:', error);
      return null;
    }
  }

  /**
   * Detect anomalies in travel patterns
   */
  async detectAnomalies(tripData) {
    try {
      console.log('🔍 Detecting anomalies...');
      
      const anomalies = [];
      
      // Check for unusual destinations
      const destinationAnomaly = this.checkDestinationAnomaly(tripData);
      if (destinationAnomaly) anomalies.push(destinationAnomaly);
      
      // Check for unusual travel time
      const timeAnomaly = this.checkTimeAnomaly(tripData);
      if (timeAnomaly) anomalies.push(timeAnomaly);
      
      // Check for unusual route
      const routeAnomaly = this.checkRouteAnomaly(tripData);
      if (routeAnomaly) anomalies.push(routeAnomaly);
      
      // Check for unusual mode
      const modeAnomaly = this.checkModeAnomaly(tripData);
      if (modeAnomaly) anomalies.push(modeAnomaly);
      
      // Store anomalies
      this.predictions.anomalies = anomalies;
      
      // Notify if anomalies found
      if (anomalies.length > 0) {
        this.notifyListeners('anomalies_detected', anomalies);
      }
      
      return anomalies;
      
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      return [];
    }
  }

  /**
   * Apply adaptive learning from user feedback
   */
  async applyFeedback(feedback) {
    try {
      if (!this.adaptiveLearning) return;
      
      console.log('📚 Applying user feedback for adaptive learning...');
      
      const { predictionType, actual, predicted, correct } = feedback;
      
      // Update model accuracy
      this.updateModelAccuracy(predictionType, correct);
      
      // Adjust prediction weights
      await this.adjustPredictionWeights(feedback);
      
      // Update user patterns if incorrect
      if (!correct) {
        await this.updateUserPatterns(actual, predicted);
      }
      
      // Save updated models
      await this.saveModels();
      
      console.log('Adaptive learning applied successfully');
      return true;
      
    } catch (error) {
      console.error('Error applying feedback:', error);
      return false;
    }
  }

  // Helper Methods

  /**
   * Extract features for prediction
   */
  extractPredictionFeatures(context) {
    const now = new Date(context.currentTime || Date.now());
    
    return {
      dayOfWeek: now.getDay(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      isWeekday: now.getDay() >= 1 && now.getDay() <= 5,
      isWeekend: now.getDay() === 0 || now.getDay() === 6,
      timeOfDay: this.getTimeOfDay(now.getHours()),
      currentLocation: context.currentLocation,
      recentActivity: context.recentActivity,
      lastTrip: this.getLastTrip(),
      frequentDestinations: this.getFrequentDestinations(),
      typicalPatterns: this.userPatterns
    };
  }

  /**
   * Predict by pattern matching
   */
  predictByPatterns(features) {
    try {
      // Find similar historical patterns
      const similarPatterns = this.findSimilarPatterns(features);
      
      if (similarPatterns.length === 0) return null;
      
      // Aggregate destinations
      const destinationCounts = {};
      similarPatterns.forEach(pattern => {
        const key = `${pattern.destination.latitude},${pattern.destination.longitude}`;
        destinationCounts[key] = (destinationCounts[key] || 0) + 1;
      });
      
      // Get most likely destination
      const topDestination = Object.entries(destinationCounts)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (!topDestination) return null;
      
      const [lat, lng] = topDestination[0].split(',').map(Number);
      
      return {
        destination: { latitude: lat, longitude: lng },
        probability: topDestination[1] / similarPatterns.length,
        departureTime: this.predictDepartureTime(features),
        method: 'pattern_matching',
        confidence: 0.75
      };
      
    } catch (error) {
      console.error('Pattern prediction error:', error);
      return null;
    }
  }

  /**
   * Predict using time series analysis
   */
  predictByTimeSeries(features) {
    try {
      // Simple time series prediction based on historical data
      const timeSeriesData = this.getTimeSeriesData(features);
      
      if (timeSeriesData.length < 5) return null;
      
      // Calculate trend
      const trend = this.calculateTrend(timeSeriesData);
      
      // Predict next value
      const prediction = this.extrapolateTrend(trend, features);
      
      return prediction;
      
    } catch (error) {
      console.error('Time series prediction error:', error);
      return null;
    }
  }

  /**
   * Predict using Markov chain
   */
  predictByMarkovChain(features) {
    try {
      if (!features.lastTrip) return null;
      
      // Build transition matrix
      const transitions = this.buildTransitionMatrix();
      
      // Get current state
      const currentState = this.getLocationState(features.lastTrip.endLocation);
      
      // Get next state probabilities
      const nextStates = transitions[currentState] || {};
      
      // Select most probable next state
      const nextState = Object.entries(nextStates)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (!nextState) return null;
      
      return {
        destination: this.stateToLocation(nextState[0]),
        probability: nextState[1],
        departureTime: this.predictDepartureTime(features),
        method: 'markov_chain',
        confidence: 0.70
      };
      
    } catch (error) {
      console.error('Markov chain prediction error:', error);
      return null;
    }
  }

  /**
   * Predict using ML model
   */
  async predictByMLModel(features) {
    try {
      // Prepare features for ML model
      const mlFeatures = {
        day_of_week: features.dayOfWeek,
        hour: features.hour,
        is_weekend: features.isWeekend ? 1 : 0,
        last_destination_lat: features.lastTrip?.endLocation?.latitude || 0,
        last_destination_lng: features.lastTrip?.endLocation?.longitude || 0
      };
      
      // Call ML service (simulated)
      // In production, use actual ML service
      const prediction = {
        destination: features.frequentDestinations[0] || null,
        probability: 0.85,
        departureTime: this.predictDepartureTime(features),
        method: 'ml_model',
        confidence: 0.82
      };
      
      return prediction;
      
    } catch (error) {
      console.error('ML prediction error:', error);
      return null;
    }
  }

  /**
   * Ensemble trip predictions
   */
  ensembleTripPredictions(predictions) {
    if (!predictions || predictions.length === 0) {
      return {
        destination: null,
        probability: 0,
        departureTime: null,
        method: 'no_prediction',
        confidence: 0
      };
    }
    
    // Weight predictions by confidence
    const weights = {
      'pattern_matching': 0.3,
      'time_series': 0.2,
      'markov_chain': 0.2,
      'ml_model': 0.3
    };
    
    // Aggregate weighted predictions
    const aggregated = {};
    predictions.forEach(pred => {
      const weight = weights[pred.method] || 0.25;
      const key = `${pred.destination.latitude},${pred.destination.longitude}`;
      
      if (!aggregated[key]) {
        aggregated[key] = {
          destination: pred.destination,
          totalProbability: 0,
          totalWeight: 0,
          departureTimes: []
        };
      }
      
      aggregated[key].totalProbability += pred.probability * weight;
      aggregated[key].totalWeight += weight;
      aggregated[key].departureTimes.push(pred.departureTime);
    });
    
    // Get best prediction
    const best = Object.values(aggregated)
      .sort((a, b) => (b.totalProbability / b.totalWeight) - (a.totalProbability / a.totalWeight))[0];
    
    if (!best) return null;
    
    return {
      destination: best.destination,
      probability: best.totalProbability / best.totalWeight,
      departureTime: this.averageTime(best.departureTimes),
      method: 'ensemble',
      confidence: Math.min(best.totalProbability / best.totalWeight, 0.95),
      basePredictions: predictions
    };
  }

  /**
   * Get real-time context for recommendations
   */
  async getRealTimeContext() {
    return {
      weather: await this.getWeatherConditions(),
      traffic: await this.getTrafficConditions(),
      events: await this.getLocalEvents(),
      time: new Date(),
      userState: await this.getUserState()
    };
  }

  /**
   * Evaluate transport modes
   */
  async evaluateTransportModes(tripDetails, context) {
    const modes = ['walking', 'cycling', 'auto_rickshaw', 'bus', 'car', 'train', 'metro'];
    const evaluations = {};
    
    for (const mode of modes) {
      evaluations[mode] = {
        time: await this.estimateModeTime(mode, tripDetails),
        cost: this.estimateModeCost(mode, tripDetails),
        comfort: this.evaluateModeComfort(mode, context),
        environmental: this.evaluateEnvironmentalImpact(mode),
        availability: await this.checkModeAvailability(mode, tripDetails),
        safety: this.evaluateModeSafety(mode, context)
      };
    }
    
    return evaluations;
  }

  /**
   * Weather conditions (simulated)
   */
  async getWeatherConditions() {
    // In production, use weather API
    return {
      temperature: 28,
      humidity: 75,
      precipitation: 0,
      conditions: 'partly_cloudy'
    };
  }

  /**
   * Traffic conditions (simulated)
   */
  async getTrafficConditions() {
    // In production, use traffic API
    return {
      congestionLevel: 'moderate',
      averageSpeed: 35,
      incidents: []
    };
  }

  /**
   * Check for anomalies in destination
   */
  checkDestinationAnomaly(tripData) {
    const frequentDestinations = this.getFrequentDestinations();
    const isFrequent = frequentDestinations.some(dest => 
      this.isSameLocation(dest, tripData.endLocation)
    );
    
    if (!isFrequent && tripData.confidence < 0.5) {
      return {
        type: 'unusual_destination',
        severity: 'low',
        message: 'Traveling to an unusual destination',
        location: tripData.endLocation
      };
    }
    
    return null;
  }

  /**
   * Load trip history
   */
  async loadTripHistory() {
    try {
      const history = await AsyncStorage.getItem('trip_history');
      if (history) {
        this.tripHistory = JSON.parse(history);
        console.log(`Loaded ${this.tripHistory.length} historical trips`);
      }
    } catch (error) {
      console.error('Failed to load trip history:', error);
    }
  }

  /**
   * Analyze user patterns
   */
  async analyzeUserPatterns() {
    try {
      if (this.tripHistory.length < 10) return;
      
      this.userPatterns = {
        commonRoutes: this.findCommonRoutes(),
        timePatterns: this.findTimePatterns(),
        modePreferences: this.findModePreferences(),
        destinationFrequency: this.calculateDestinationFrequency()
      };
      
      console.log('User patterns analyzed successfully');
    } catch (error) {
      console.error('Failed to analyze user patterns:', error);
    }
  }

  /**
   * Initialize prediction models
   */
  async initializePredictionModels() {
    // Initialize or load saved models
    console.log('Prediction models initialized');
  }

  /**
   * Helper functions
   */
  getTimeOfDay(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  getLastTrip() {
    return this.tripHistory[this.tripHistory.length - 1] || null;
  }

  getFrequentDestinations() {
    const destinations = {};
    this.tripHistory.forEach(trip => {
      const key = `${trip.endLocation.latitude},${trip.endLocation.longitude}`;
      destinations[key] = (destinations[key] || 0) + 1;
    });
    
    return Object.entries(destinations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([coords]) => {
        const [lat, lng] = coords.split(',').map(Number);
        return { latitude: lat, longitude: lng };
      });
  }

  isSameLocation(loc1, loc2, threshold = 500) {
    const distance = this.calculateDistance(
      loc1.latitude, loc1.longitude,
      loc2.latitude, loc2.longitude
    );
    return distance < threshold;
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Add listener
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
   * Notify listeners
   */
  notifyListeners(event, data = null) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in predictive analytics listener:', error);
      }
    });
  }
}

export default new PredictiveAnalyticsService();