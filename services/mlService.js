const logger = require('../utils/logger');

class MLService {
  constructor() {
    this.models = {
      transportMode: this.loadTransportModeModel()
    };
  }

  async predictTransportMode(locations, duration) {
    try {
      if (!locations || locations.length < 2) {
        return { predictedMode: 'unknown', confidence: 0 };
      }

      const features = this.extractFeatures(locations, duration);
      const prediction = await this.classifyTransportMode(features);
      
      logger.info('Transport mode predicted', { 
        features, 
        prediction,
        locationCount: locations.length 
      });

      return prediction;
    } catch (error) {
      logger.error('ML prediction failed', error);
      return { predictedMode: 'unknown', confidence: 0 };
    }
  }

  extractFeatures(locations, duration) {
    const totalDistance = this.calculateTotalDistance(locations);
    const avgSpeed = totalDistance > 0 ? (totalDistance / (duration / (1000 * 60 * 60))) : 0;
    const maxSpeed = this.calculateMaxSpeed(locations);
    const speedVariance = this.calculateSpeedVariance(locations);
    const directionChanges = this.calculateDirectionChanges(locations);
    const stopPoints = this.identifyStopPoints(locations);

    return {
      totalDistance,
      avgSpeed,
      maxSpeed,
      speedVariance,
      directionChanges,
      stopPoints: stopPoints.length,
      duration: duration / (1000 * 60), // Convert to minutes
      pointDensity: locations.length / (duration / (1000 * 60)),
      straightLineDistance: this.calculateStraightLineDistance(
        locations[0], 
        locations[locations.length - 1]
      ),
      routeEfficiency: this.calculateRouteEfficiency(locations)
    };
  }

  async classifyTransportMode(features) {
    // Rule-based classification (replace with actual ML model)
    const { avgSpeed, maxSpeed, speedVariance, stopPoints, routeEfficiency } = features;

    let predictedMode = 'unknown';
    let confidence = 0.5;

    // Walking classification
    if (avgSpeed <= 8 && maxSpeed <= 15) {
      predictedMode = 'walking';
      confidence = 0.85;
    }
    // Cycling classification
    else if (avgSpeed <= 25 && maxSpeed <= 40 && speedVariance > 2) {
      predictedMode = 'cycling';
      confidence = 0.80;
    }
    // Public transport classification
    else if (stopPoints > 3 && speedVariance > 5 && routeEfficiency < 0.7) {
      predictedMode = 'public_transport';
      confidence = 0.75;
    }
    // Driving classification
    else if (avgSpeed > 15 && maxSpeed > 30) {
      predictedMode = 'driving';
      confidence = 0.85;
    }

    // Adjust confidence based on additional factors
    if (features.pointDensity < 0.5) {
      confidence *= 0.8; // Lower confidence for sparse data
    }
    
    if (features.duration < 2) {
      confidence *= 0.7; // Lower confidence for very short trips
    }

    return { predictedMode, confidence: Math.min(confidence, 0.95) };
  }

  calculateTotalDistance(locations) {
    let total = 0;
    for (let i = 1; i < locations.length; i++) {
      total += this.haversineDistance(
        locations[i-1].latitude, locations[i-1].longitude,
        locations[i].latitude, locations[i].longitude
      );
    }
    return total / 1000; // Convert to km
  }

  calculateMaxSpeed(locations) {
    let maxSpeed = 0;
    for (let i = 1; i < locations.length; i++) {
      const distance = this.haversineDistance(
        locations[i-1].latitude, locations[i-1].longitude,
        locations[i].latitude, locations[i].longitude
      );
      const timeDiff = (locations[i].timestamp - locations[i-1].timestamp) / 1000; // seconds
      const speed = (distance / timeDiff) * 3.6; // km/h
      
      if (speed > maxSpeed && speed < 200) { // Filter out unrealistic speeds
        maxSpeed = speed;
      }
    }
    return maxSpeed;
  }

  calculateSpeedVariance(locations) {
    const speeds = [];
    for (let i = 1; i < locations.length; i++) {
      const distance = this.haversineDistance(
        locations[i-1].latitude, locations[i-1].longitude,
        locations[i].latitude, locations[i].longitude
      );
      const timeDiff = (locations[i].timestamp - locations[i-1].timestamp) / 1000;
      const speed = (distance / timeDiff) * 3.6;
      
      if (speed < 200) { // Filter unrealistic speeds
        speeds.push(speed);
      }
    }

    if (speeds.length === 0) return 0;

    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const variance = speeds.reduce((acc, speed) => acc + Math.pow(speed - avgSpeed, 2), 0) / speeds.length;
    
    return Math.sqrt(variance);
  }

  calculateDirectionChanges(locations) {
    let changes = 0;
    let prevBearing = null;

    for (let i = 1; i < locations.length; i++) {
      const bearing = this.calculateBearing(
        locations[i-1].latitude, locations[i-1].longitude,
        locations[i].latitude, locations[i].longitude
      );

      if (prevBearing !== null) {
        const diff = Math.abs(bearing - prevBearing);
        const normalizedDiff = Math.min(diff, 360 - diff);
        
        if (normalizedDiff > 30) { // Significant direction change
          changes++;
        }
      }
      
      prevBearing = bearing;
    }

    return changes;
  }

  identifyStopPoints(locations, threshold = 50) {
    const stops = [];
    let currentStop = null;

    for (let i = 1; i < locations.length; i++) {
      const distance = this.haversineDistance(
        locations[i-1].latitude, locations[i-1].longitude,
        locations[i].latitude, locations[i].longitude
      );

      if (distance < threshold) { // Within stop threshold
        if (!currentStop) {
          currentStop = {
            startIndex: i - 1,
            endIndex: i,
            duration: 0
          };
        } else {
          currentStop.endIndex = i;
        }
      } else {
        if (currentStop) {
          currentStop.duration = locations[currentStop.endIndex].timestamp - 
                                locations[currentStop.startIndex].timestamp;
          
          if (currentStop.duration > 30000) { // At least 30 seconds
            stops.push(currentStop);
          }
          
          currentStop = null;
        }
      }
    }

    return stops;
  }

  calculateStraightLineDistance(start, end) {
    return this.haversineDistance(
      start.latitude, start.longitude,
      end.latitude, end.longitude
    ) / 1000; // Convert to km
  }

  calculateRouteEfficiency(locations) {
    const totalDistance = this.calculateTotalDistance(locations);
    const straightLineDistance = this.calculateStraightLineDistance(
      locations[0], 
      locations[locations.length - 1]
    );
    
    return straightLineDistance > 0 ? straightLineDistance / totalDistance : 0;
  }

  calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = this.toRadians(lon2 - lon1);
    const lat1Rad = this.toRadians(lat1);
    const lat2Rad = this.toRadians(lat2);

    const x = Math.sin(dLon) * Math.cos(lat2Rad);
    const y = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    const bearing = Math.atan2(x, y);
    return (this.toDegrees(bearing) + 360) % 360;
  }

  haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  toDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  loadTransportModeModel() {
    // This would load an actual ML model in production
    // For now, return a mock model configuration
    return {
      type: 'rule_based',
      version: '1.0.0',
      accuracy: 0.85,
      lastTrained: new Date('2024-01-01')
    };
  }
}

module.exports = new MLService();