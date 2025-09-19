class MLService {
  constructor() {
    this.speedThresholds = {
      walking: { min: 0, max: 8 }, // km/h
      cycling: { min: 8, max: 25 },
      driving: { min: 25, max: 120 },
      public_transport: { min: 15, max: 80 }
    };
  }

  async predictTravelMode(tripData) {
    try {
      const { locations, duration } = tripData;
      
      if (!locations || locations.length < 2) {
        return 'unknown';
      }

      // Calculate average speed
      const totalDistance = this.calculateTotalDistance(locations);
      const durationHours = duration / (1000 * 60 * 60);
      const averageSpeed = durationHours > 0 ? totalDistance / durationHours : 0;

      // Calculate speed variations
      const speeds = [];
      for (let i = 1; i < locations.length; i++) {
        const speed = this.calculateSpeed(locations[i-1], locations[i]);
        if (speed > 0) speeds.push(speed);
      }

      const maxSpeed = Math.max(...speeds, 0);
      const speedVariance = this.calculateVariance(speeds);

      // Rule-based prediction with multiple factors
      return this.classifyTravelMode(averageSpeed, maxSpeed, speedVariance, totalDistance);
      
    } catch (error) {
      console.error('Error predicting travel mode:', error);
      return 'unknown';
    }
  }

  classifyTravelMode(avgSpeed, maxSpeed, variance, distance) {
    // Walking: low average speed, low variance
    if (avgSpeed <= 8 && maxSpeed <= 15 && variance < 10) {
      return 'walking';
    }
    
    // Cycling: moderate speed, moderate variance
    if (avgSpeed > 8 && avgSpeed <= 25 && maxSpeed <= 35 && distance > 0.5) {
      return 'cycling';
    }
    
    // Driving: higher speed, higher variance, longer distances
    if (avgSpeed > 25 && maxSpeed > 40 && distance > 2) {
      return 'driving';
    }
    
    // Public transport: moderate to high speed with stops (high variance)
    if (avgSpeed > 15 && avgSpeed <= 50 && variance > 20 && distance > 1) {
      return 'public_transport';
    }
    
    // Default fallback based on average speed
    if (avgSpeed <= 8) return 'walking';
    if (avgSpeed <= 25) return 'cycling';
    if (avgSpeed <= 80) return 'driving';
    return 'public_transport';
  }

  calculateSpeed(prevLocation, currentLocation) {
    if (!prevLocation || !currentLocation || !prevLocation.timestamp || !currentLocation.timestamp) {
      return 0;
    }
    
    const timeDiff = (currentLocation.timestamp - prevLocation.timestamp) / 1000; // seconds
    if (timeDiff <= 0) return 0;
    
    const distance = this.calculateDistance(
      prevLocation.latitude,
      prevLocation.longitude,
      currentLocation.latitude,
      currentLocation.longitude
    );
    
    return (distance / timeDiff) * 3.6; // convert m/s to km/h
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
  }

  calculateTotalDistance(locations) {
    if (!locations || locations.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < locations.length; i++) {
      const distance = this.calculateDistance(
        locations[i-1].latitude,
        locations[i-1].longitude,
        locations[i].latitude,
        locations[i].longitude
      );
      totalDistance += distance;
    }
    
    return totalDistance / 1000; // Convert to kilometers
  }

  calculateVariance(speeds) {
    if (speeds.length === 0) return 0;
    
    const mean = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
    const variance = speeds.reduce((sum, speed) => sum + Math.pow(speed - mean, 2), 0) / speeds.length;
    
    return variance;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Enhanced mode detection with additional heuristics
  analyzeMovementPattern(locations) {
    if (!locations || locations.length < 3) return {};
    
    const speeds = [];
    const accelerations = [];
    let stopCount = 0;
    let totalStopTime = 0;
    
    for (let i = 1; i < locations.length; i++) {
      const speed = this.calculateSpeed(locations[i-1], locations[i]);
      speeds.push(speed);
      
      // Count stops (speed < 2 km/h for more than 30 seconds)
      const timeDiff = (locations[i].timestamp - locations[i-1].timestamp) / 1000;
      if (speed < 2 && timeDiff > 30) {
        stopCount++;
        totalStopTime += timeDiff;
      }
      
      // Calculate acceleration
      if (i > 1) {
        const prevSpeed = this.calculateSpeed(locations[i-2], locations[i-1]);
        const acceleration = (speed - prevSpeed) / timeDiff;
        accelerations.push(Math.abs(acceleration));
      }
    }
    
    return {
      avgSpeed: speeds.reduce((sum, s) => sum + s, 0) / speeds.length,
      maxSpeed: Math.max(...speeds),
      speedVariance: this.calculateVariance(speeds),
      stopCount,
      avgAcceleration: accelerations.length > 0 ? 
        accelerations.reduce((sum, a) => sum + a, 0) / accelerations.length : 0,
      stopTimeRatio: totalStopTime / ((locations[locations.length-1].timestamp - locations[0].timestamp) / 1000)
    };
  }

  // Improved travel mode prediction using movement patterns
  async predictTravelModeAdvanced(tripData) {
    try {
      const { locations, duration } = tripData;
      
      if (!locations || locations.length < 2) {
        return 'unknown';
      }

      const totalDistance = this.calculateTotalDistance(locations);
      const pattern = this.analyzeMovementPattern(locations);
      
      // Enhanced classification logic
      return this.classifyTravelModeAdvanced(pattern, totalDistance, duration);
      
    } catch (error) {
      console.error('Error in advanced travel mode prediction:', error);
      return 'unknown';
    }
  }

  classifyTravelModeAdvanced(pattern, distance, duration) {
    const { avgSpeed, maxSpeed, speedVariance, stopCount, stopTimeRatio, avgAcceleration } = pattern;
    
    // Walking: consistent low speed, few stops, low acceleration
    if (avgSpeed <= 6 && maxSpeed <= 12 && avgAcceleration < 2) {
      return 'walking';
    }
    
    // Cycling: moderate speed, moderate variance, some acceleration
    if (avgSpeed > 6 && avgSpeed <= 30 && maxSpeed <= 45 && 
        avgAcceleration < 5 && distance > 0.3) {
      return 'cycling';
    }
    
    // Public transport: moderate speed with frequent stops
    if (avgSpeed > 10 && avgSpeed <= 60 && stopCount > 2 && 
        stopTimeRatio > 0.15 && distance > 1) {
      return 'public_transport';
    }
    
    // Driving: higher speed, higher acceleration, longer distances
    if (avgSpeed > 20 && maxSpeed > 35 && distance > 1) {
      return 'driving';
    }
    
    // Fallback logic
    if (avgSpeed <= 8) return 'walking';
    if (avgSpeed <= 25) return 'cycling';
    return 'driving';
  }
}

export default new MLService();