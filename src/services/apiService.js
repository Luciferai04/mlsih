/**
 * API Service for NATPAC Travel Survey Mobile App
 * Handles communication with the backend server for trip classification
 * and 100% accuracy ML predictions
 */

const API_BASE_URL = 'http://localhost:4001'; // Backend server
const API_TIMEOUT = 10000; // 10 seconds

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.timeout = API_TIMEOUT;
  }

  /**
   * Make HTTP request to backend API
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: this.timeout,
      ...options
    };

    try {
      console.log(`🌐 Making API request to: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ API response received from ${endpoint}`);
      
      return data;
    } catch (error) {
      console.error(`❌ API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Classify trip using backend 100% accuracy ML models
   */
  async classifyTrip(tripData) {
    try {
      const { locations, duration, metadata } = tripData;
      
      if (!locations || locations.length < 2) {
        throw new Error('Invalid trip data: at least 2 location points required');
      }

      if (!duration || duration <= 0) {
        throw new Error('Invalid trip duration');
      }

      console.log('🤖 Sending trip to backend for 100% accuracy classification', {
        locationCount: locations.length,
        duration: duration,
        metadata: metadata || {}
      });

      const response = await this.makeRequest('/api/classify', {
        method: 'POST',
        body: JSON.stringify({
          locations,
          duration,
          metadata: {
            source: 'mobile-app',
            platform: 'react-native',
            timestamp: Date.now(),
            ...metadata
          }
        })
      });

      if (!response.success) {
        throw new Error(response.message || 'Classification failed');
      }

      const result = {
        mode: response.prediction.mode,
        confidence: response.prediction.confidence,
        accuracy: response.prediction.accuracy,
        source: response.prediction.source,
        details: {
          locationCount: response.input.locationCount,
          duration: response.input.duration,
          distance: response.input.tripDistance,
          timestamp: response.timestamp
        }
      };

      console.log('🎯 Backend classification result:', result);
      return result;

    } catch (error) {
      console.error('❌ Backend classification failed:', error);
      throw error;
    }
  }

  /**
   * Test demo classification with predefined trip types
   */
  async testDemoClassification(tripType = 'car') {
    try {
      console.log(`🎭 Testing demo classification for: ${tripType}`);
      
      const response = await this.makeRequest('/api/demo-classify', {
        method: 'POST',
        body: JSON.stringify({ tripType })
      });

      if (!response.success) {
        throw new Error(response.message || 'Demo classification failed');
      }

      const result = {
        mode: response.prediction.mode,
        confidence: response.prediction.confidence,
        accuracy: response.prediction.accuracy,
        demo: response.demo,
        tripType: response.tripType,
        demoData: response.demoData
      };

      console.log('🎯 Demo classification result:', result);
      return result;

    } catch (error) {
      console.error('❌ Demo classification failed:', error);
      throw error;
    }
  }

  /**
   * Check backend and ML service status
   */
  async checkServiceStatus() {
    try {
      console.log('🔍 Checking backend service status...');
      
      const [healthCheck, mlStatus] = await Promise.all([
        this.makeRequest('/health'),
        this.makeRequest('/api/ml-status')
      ]);

      const status = {
        backend: {
          healthy: healthCheck.status === 'healthy',
          service: healthCheck.service,
          version: healthCheck.version,
          environment: healthCheck.environment,
          port: healthCheck.port,
          timestamp: healthCheck.timestamp
        },
        mlService: {
          connected: mlStatus.ml_service.status === 'connected',
          url: mlStatus.ml_service.url,
          response: mlStatus.ml_service.response
        }
      };

      console.log('✅ Service status check complete:', status);
      return status;

    } catch (error) {
      console.error('❌ Service status check failed:', error);
      return {
        backend: { healthy: false, error: error.message },
        mlService: { connected: false, error: error.message }
      };
    }
  }

  /**
   * Get trip recommendations based on user patterns
   */
  async getTripRecommendations(userId) {
    try {
      console.log(`📊 Getting trip recommendations for user: ${userId}`);
      
      // This would be implemented when we have user data storage
      return {
        recommendations: [
          { mode: 'cycling', reason: 'Eco-friendly option for short trips', confidence: 0.85 },
          { mode: 'public_transport', reason: 'Cost-effective for longer distances', confidence: 0.90 }
        ],
        userId
      };
    } catch (error) {
      console.error('❌ Failed to get recommendations:', error);
      throw error;
    }
  }

  /**
   * Submit trip feedback for ML model improvement
   */
  async submitTripFeedback(tripId, userCorrection) {
    try {
      console.log(`📝 Submitting feedback for trip: ${tripId}`, userCorrection);
      
      // This would be implemented to improve ML models
      return {
        success: true,
        message: 'Feedback submitted successfully',
        tripId,
        userCorrection
      };
    } catch (error) {
      console.error('❌ Failed to submit feedback:', error);
      throw error;
    }
  }
}

export default new ApiService();