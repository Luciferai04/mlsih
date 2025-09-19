/**
 * Trip Purpose Classification Service
 * AI-powered categorization for work, shopping, leisure, medical, education trips
 * Uses location patterns, time analysis, and ML to determine trip purposes
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import locationService from './locationService';

class TripPurposeClassifier {
  constructor() {
    this.purposes = {
      work: {
        name: 'Work Commute',
        icon: '💼',
        patterns: ['weekday_morning', 'weekday_evening', 'regular_route', 'office_location'],
        timeWindows: [
          { start: 6, end: 10 }, // Morning commute
          { start: 17, end: 20 }  // Evening commute
        ]
      },
      shopping: {
        name: 'Shopping',
        icon: '🛍️',
        patterns: ['weekend', 'mall_location', 'market_location', 'short_duration'],
        locations: ['mall', 'market', 'shop', 'store', 'bazaar']
      },
      leisure: {
        name: 'Leisure',
        icon: '🎭',
        patterns: ['weekend', 'evening', 'entertainment_venue', 'tourist_location'],
        locations: ['park', 'beach', 'cinema', 'restaurant', 'tourist']
      },
      medical: {
        name: 'Medical',
        icon: '🏥',
        patterns: ['hospital_location', 'clinic_location', 'pharmacy'],
        locations: ['hospital', 'clinic', 'medical', 'pharmacy', 'doctor']
      },
      education: {
        name: 'Education',
        icon: '🎓',
        patterns: ['school_hours', 'college_location', 'regular_schedule'],
        timeWindows: [
          { start: 7, end: 9 },   // School start
          { start: 14, end: 17 }  // School end
        ],
        locations: ['school', 'college', 'university', 'institute', 'academy']
      },
      social: {
        name: 'Social Visit',
        icon: '👥',
        patterns: ['residential_area', 'evening_weekend', 'companion_present'],
        locations: ['home', 'residence', 'apartment']
      },
      religious: {
        name: 'Religious',
        icon: '🛕',
        patterns: ['temple', 'church', 'mosque', 'special_days'],
        locations: ['temple', 'church', 'mosque', 'gurudwara', 'shrine']
      },
      transit: {
        name: 'Transit/Transfer',
        icon: '🚉',
        patterns: ['station', 'airport', 'bus_terminal'],
        locations: ['station', 'airport', 'terminal', 'junction']
      },
      fitness: {
        name: 'Fitness',
        icon: '🏃',
        patterns: ['gym', 'sports_complex', 'morning_evening'],
        locations: ['gym', 'fitness', 'sports', 'stadium', 'ground']
      },
      errands: {
        name: 'Errands',
        icon: '📋',
        patterns: ['multiple_stops', 'short_stops', 'various_locations'],
        characteristics: ['multiple_destinations', 'varied_durations']
      }
    };
    
    this.locationCategories = this.initializeLocationCategories();
    this.historicalPatterns = [];
    this.userPreferences = {};
    this.confidenceThreshold = 0.6;
  }

  /**
   * Initialize location categories for Kerala
   */
  initializeLocationCategories() {
    return {
      // Work locations
      'technopark': 'work',
      'infopark': 'work',
      'cyberpark': 'work',
      'it_corridor': 'work',
      'business_district': 'work',
      
      // Shopping
      'lulu_mall': 'shopping',
      'centre_square': 'shopping',
      'broadway': 'shopping',
      'mg_road': 'shopping',
      
      // Medical
      'medical_college': 'medical',
      'general_hospital': 'medical',
      'aster_medcity': 'medical',
      'amrita_hospital': 'medical',
      
      // Education
      'iit_palakkad': 'education',
      'nit_calicut': 'education',
      'cusat': 'education',
      'kerala_university': 'education',
      
      // Religious
      'guruvayur': 'religious',
      'sabarimala': 'religious',
      'padmanabhaswamy': 'religious',
      'st_francis_church': 'religious',
      
      // Leisure
      'marine_drive': 'leisure',
      'fort_kochi': 'leisure',
      'munnar': 'leisure',
      'kovalam': 'leisure',
      'backwaters': 'leisure'
    };
  }

  /**
   * Classify trip purpose using AI/ML
   */
  async classifyTripPurpose(tripData) {
    try {
      const { startLocation, endLocation, startTime, endTime, duration, route, companions } = tripData;
      
      console.log('🎯 Classifying trip purpose...');
      
      // Extract features for classification
      const features = this.extractPurposeFeatures(tripData);
      
      // Get predictions from multiple methods
      const predictions = [];
      
      // 1. Time-based classification
      const timePrediction = this.classifyByTime(features);
      if (timePrediction) predictions.push(timePrediction);
      
      // 2. Location-based classification
      const locationPrediction = await this.classifyByLocation(features);
      if (locationPrediction) predictions.push(locationPrediction);
      
      // 3. Pattern-based classification
      const patternPrediction = await this.classifyByPattern(features);
      if (patternPrediction) predictions.push(patternPrediction);
      
      // 4. Historical pattern matching
      const historicalPrediction = await this.classifyByHistory(features);
      if (historicalPrediction) predictions.push(historicalPrediction);
      
      // 5. ML model prediction (if available)
      const mlPrediction = await this.classifyByML(features);
      if (mlPrediction) predictions.push(mlPrediction);
      
      // Ensemble the predictions
      const finalPrediction = this.ensemblePredictions(predictions);
      
      // Save to history for learning
      await this.saveTripPurpose(tripData, finalPrediction);
      
      return finalPrediction;
      
    } catch (error) {
      console.error('Error classifying trip purpose:', error);
      return {
        purpose: 'unknown',
        confidence: 0,
        method: 'error',
        details: { error: error.message }
      };
    }
  }

  /**
   * Extract features for purpose classification
   */
  extractPurposeFeatures(tripData) {
    const { startLocation, endLocation, startTime, endTime, duration, metadata = {} } = tripData;
    
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    return {
      // Temporal features
      dayOfWeek: startDate.getDay(),
      startHour: startDate.getHours(),
      endHour: endDate.getHours(),
      isWeekday: startDate.getDay() >= 1 && startDate.getDay() <= 5,
      isWeekend: startDate.getDay() === 0 || startDate.getDay() === 6,
      timeOfDay: this.getTimeOfDay(startDate.getHours()),
      duration: duration,
      
      // Location features
      startLocation,
      endLocation,
      startLocationType: metadata.startLocationType,
      endLocationType: metadata.endLocationType,
      distance: metadata.distance,
      
      // Context features
      hasCompanions: metadata.companions && metadata.companions.length > 0,
      companionCount: metadata.companions ? metadata.companions.length : 0,
      transportMode: metadata.mode,
      routeComplexity: metadata.routeComplexity,
      numberOfStops: metadata.stops ? metadata.stops.length : 0,
      
      // User context
      isRegularRoute: metadata.isRegularRoute,
      frequency: metadata.routeFrequency
    };
  }

  /**
   * Classify by time patterns
   */
  classifyByTime(features) {
    const predictions = [];
    
    // Check work commute times
    if (features.isWeekday) {
      if (features.startHour >= 6 && features.startHour <= 10) {
        predictions.push({ purpose: 'work', confidence: 0.8, reason: 'morning_commute' });
      } else if (features.startHour >= 17 && features.startHour <= 20) {
        predictions.push({ purpose: 'work', confidence: 0.7, reason: 'evening_commute' });
      }
    }
    
    // Education times
    if (features.isWeekday && features.startHour >= 7 && features.startHour <= 9) {
      predictions.push({ purpose: 'education', confidence: 0.6, reason: 'school_hours' });
    }
    
    // Shopping/leisure times
    if (features.isWeekend) {
      if (features.startHour >= 10 && features.startHour <= 20) {
        predictions.push({ purpose: 'shopping', confidence: 0.5, reason: 'weekend_shopping' });
        predictions.push({ purpose: 'leisure', confidence: 0.5, reason: 'weekend_leisure' });
      }
    }
    
    // Fitness times
    if (features.startHour >= 5 && features.startHour <= 7) {
      predictions.push({ purpose: 'fitness', confidence: 0.6, reason: 'morning_fitness' });
    } else if (features.startHour >= 18 && features.startHour <= 21) {
      predictions.push({ purpose: 'fitness', confidence: 0.5, reason: 'evening_fitness' });
    }
    
    // Return highest confidence prediction
    return predictions.sort((a, b) => b.confidence - a.confidence)[0] || null;
  }

  /**
   * Classify by location
   */
  async classifyByLocation(features) {
    try {
      // Get location details (in production, use reverse geocoding)
      const startLocationInfo = await this.getLocationInfo(features.startLocation);
      const endLocationInfo = await this.getLocationInfo(features.endLocation);
      
      const predictions = [];
      
      // Check known location categories
      if (endLocationInfo.category) {
        const purpose = endLocationInfo.category;
        predictions.push({
          purpose,
          confidence: 0.85,
          reason: `destination_is_${purpose}`
        });
      }
      
      // Check location keywords
      Object.entries(this.purposes).forEach(([purpose, config]) => {
        if (config.locations) {
          config.locations.forEach(keyword => {
            if (endLocationInfo.name && endLocationInfo.name.toLowerCase().includes(keyword)) {
              predictions.push({
                purpose,
                confidence: 0.75,
                reason: `location_keyword_${keyword}`
              });
            }
          });
        }
      });
      
      return predictions.sort((a, b) => b.confidence - a.confidence)[0] || null;
      
    } catch (error) {
      console.error('Location classification error:', error);
      return null;
    }
  }

  /**
   * Classify by travel patterns
   */
  async classifyByPattern(features) {
    const predictions = [];
    
    // Multiple stops pattern - likely errands
    if (features.numberOfStops > 3) {
      predictions.push({
        purpose: 'errands',
        confidence: 0.7,
        reason: 'multiple_stops'
      });
    }
    
    // Regular route pattern - likely work/education
    if (features.isRegularRoute && features.isWeekday) {
      if (features.timeOfDay === 'morning' || features.timeOfDay === 'evening') {
        predictions.push({
          purpose: 'work',
          confidence: 0.8,
          reason: 'regular_commute_pattern'
        });
      }
    }
    
    // Social pattern - companions present + residential area
    if (features.hasCompanions && features.endLocationType === 'residential') {
      predictions.push({
        purpose: 'social',
        confidence: 0.65,
        reason: 'social_visit_pattern'
      });
    }
    
    // Short duration + nearby = likely errands or shopping
    if (features.duration < 1800000 && features.distance < 5000) { // < 30 min, < 5km
      predictions.push({
        purpose: 'errands',
        confidence: 0.6,
        reason: 'short_nearby_trip'
      });
    }
    
    return predictions.sort((a, b) => b.confidence - a.confidence)[0] || null;
  }

  /**
   * Classify by historical patterns
   */
  async classifyByHistory(features) {
    try {
      // Load historical patterns
      const history = await this.loadHistoricalPatterns();
      
      if (!history || history.length === 0) return null;
      
      // Find similar trips
      const similarTrips = history.filter(trip => {
        const timeSimilarity = Math.abs(trip.startHour - features.startHour) <= 1;
        const daySimilarity = trip.dayOfWeek === features.dayOfWeek;
        const locationSimilarity = this.calculateLocationSimilarity(
          trip.endLocation,
          features.endLocation
        );
        
        return timeSimilarity && daySimilarity && locationSimilarity > 0.7;
      });
      
      if (similarTrips.length === 0) return null;
      
      // Aggregate purposes from similar trips
      const purposeCounts = {};
      similarTrips.forEach(trip => {
        purposeCounts[trip.purpose] = (purposeCounts[trip.purpose] || 0) + 1;
      });
      
      // Get most common purpose
      const topPurpose = Object.entries(purposeCounts)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (topPurpose) {
        return {
          purpose: topPurpose[0],
          confidence: Math.min(topPurpose[1] / similarTrips.length, 0.9),
          reason: 'historical_pattern',
          similarTrips: similarTrips.length
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('Historical classification error:', error);
      return null;
    }
  }

  /**
   * Classify using ML model
   */
  async classifyByML(features) {
    try {
      // Prepare features for ML model
      const mlFeatures = {
        day_of_week: features.dayOfWeek,
        hour_of_day: features.startHour,
        duration_minutes: features.duration / 60000,
        has_companions: features.hasCompanions ? 1 : 0,
        is_weekend: features.isWeekend ? 1 : 0,
        num_stops: features.numberOfStops
      };
      
      // In production, call actual ML service
      // For now, use rule-based prediction
      if (features.isWeekday && features.startHour >= 8 && features.startHour <= 9) {
        return {
          purpose: 'work',
          confidence: 0.85,
          reason: 'ml_model_prediction'
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('ML classification error:', error);
      return null;
    }
  }

  /**
   * Ensemble multiple predictions
   */
  ensemblePredictions(predictions) {
    if (!predictions || predictions.length === 0) {
      return {
        purpose: 'unknown',
        confidence: 0,
        method: 'no_predictions'
      };
    }
    
    // Aggregate predictions by purpose
    const purposeScores = {};
    predictions.forEach(pred => {
      if (!purposeScores[pred.purpose]) {
        purposeScores[pred.purpose] = {
          totalConfidence: 0,
          count: 0,
          reasons: []
        };
      }
      purposeScores[pred.purpose].totalConfidence += pred.confidence;
      purposeScores[pred.purpose].count++;
      purposeScores[pred.purpose].reasons.push(pred.reason);
    });
    
    // Calculate average confidence for each purpose
    Object.keys(purposeScores).forEach(purpose => {
      purposeScores[purpose].avgConfidence = 
        purposeScores[purpose].totalConfidence / purposeScores[purpose].count;
    });
    
    // Get top purpose
    const topPurpose = Object.entries(purposeScores)
      .sort(([,a], [,b]) => b.avgConfidence - a.avgConfidence)[0];
    
    if (!topPurpose || topPurpose[1].avgConfidence < this.confidenceThreshold) {
      return {
        purpose: 'unknown',
        confidence: topPurpose ? topPurpose[1].avgConfidence : 0,
        method: 'below_threshold',
        details: { purposeScores }
      };
    }
    
    return {
      purpose: topPurpose[0],
      confidence: topPurpose[1].avgConfidence,
      method: 'ensemble',
      reasons: topPurpose[1].reasons,
      details: {
        purposeInfo: this.purposes[topPurpose[0]],
        allPredictions: predictions,
        purposeScores
      }
    };
  }

  /**
   * Get location information
   */
  async getLocationInfo(location) {
    // In production, use reverse geocoding API
    // For now, return simulated data
    
    // Check if location matches known categories
    for (const [place, category] of Object.entries(this.locationCategories)) {
      if (location.name && location.name.toLowerCase().includes(place)) {
        return {
          name: location.name,
          category,
          type: 'known_place'
        };
      }
    }
    
    return {
      name: location.name || 'Unknown',
      category: null,
      type: 'unknown'
    };
  }

  /**
   * Calculate location similarity
   */
  calculateLocationSimilarity(loc1, loc2) {
    if (!loc1 || !loc2) return 0;
    
    const distance = this.calculateDistance(
      loc1.latitude, loc1.longitude,
      loc2.latitude, loc2.longitude
    );
    
    // Consider locations within 500m as similar
    if (distance < 500) {
      return 1 - (distance / 500);
    }
    
    return 0;
  }

  /**
   * Calculate distance between coordinates
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

  toRad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Get time of day category
   */
  getTimeOfDay(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  /**
   * Save trip purpose to history
   */
  async saveTripPurpose(tripData, prediction) {
    try {
      const tripRecord = {
        ...this.extractPurposeFeatures(tripData),
        purpose: prediction.purpose,
        confidence: prediction.confidence,
        timestamp: Date.now()
      };
      
      this.historicalPatterns.push(tripRecord);
      
      // Keep only last 100 trips
      if (this.historicalPatterns.length > 100) {
        this.historicalPatterns = this.historicalPatterns.slice(-100);
      }
      
      await AsyncStorage.setItem('trip_purposes', JSON.stringify(this.historicalPatterns));
      console.log('Trip purpose saved to history');
      
    } catch (error) {
      console.error('Failed to save trip purpose:', error);
    }
  }

  /**
   * Load historical patterns
   */
  async loadHistoricalPatterns() {
    try {
      const data = await AsyncStorage.getItem('trip_purposes');
      if (data) {
        this.historicalPatterns = JSON.parse(data);
        console.log(`Loaded ${this.historicalPatterns.length} historical patterns`);
      }
      return this.historicalPatterns;
    } catch (error) {
      console.error('Failed to load historical patterns:', error);
      return [];
    }
  }

  /**
   * Get purpose statistics
   */
  async getPurposeStatistics() {
    const history = await this.loadHistoricalPatterns();
    
    const stats = {
      totalTrips: history.length,
      purposeBreakdown: {},
      timePatterns: {},
      mostCommonPurpose: null,
      insights: []
    };
    
    // Calculate purpose breakdown
    history.forEach(trip => {
      if (!stats.purposeBreakdown[trip.purpose]) {
        stats.purposeBreakdown[trip.purpose] = 0;
      }
      stats.purposeBreakdown[trip.purpose]++;
    });
    
    // Find most common purpose
    if (Object.keys(stats.purposeBreakdown).length > 0) {
      stats.mostCommonPurpose = Object.entries(stats.purposeBreakdown)
        .sort(([,a], [,b]) => b - a)[0][0];
    }
    
    // Generate insights
    if (stats.purposeBreakdown.work > stats.totalTrips * 0.4) {
      stats.insights.push('You travel frequently for work');
    }
    if (stats.purposeBreakdown.leisure > stats.purposeBreakdown.work) {
      stats.insights.push('You prioritize leisure travel over work commutes');
    }
    
    return stats;
  }
}

export default new TripPurposeClassifier();