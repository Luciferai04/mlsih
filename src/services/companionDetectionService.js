/**
 * Companion Detection Service
 * Detects fellow travelers using Bluetooth proximity and contact integration
 * Part of the Smart Trip Enhancement features
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class CompanionDetectionService {
  constructor() {
    this.companions = new Map();
    this.detectionEnabled = false;
    this.bluetoothDevices = new Set();
    this.contactsMap = new Map();
    this.proximityThreshold = 10; // meters
    this.detectionFrequency = 30000; // 30 seconds
    this.companionHistory = [];
    this.listeners = [];
  }

  /**
   * Initialize companion detection
   */
  async initialize() {
    try {
      console.log('🤝 Initializing Companion Detection Service...');
      
      // Load saved companion history
      await this.loadCompanionHistory();
      
      // Initialize Bluetooth scanning (simulated for React Native)
      await this.initializeBluetooth();
      
      // Load contacts (simulated)
      await this.loadContacts();
      
      console.log('✅ Companion Detection initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize companion detection:', error);
      return false;
    }
  }

  /**
   * Start companion detection
   */
  async startDetection() {
    try {
      if (this.detectionEnabled) {
        console.log('Companion detection already running');
        return;
      }

      this.detectionEnabled = true;
      console.log('🔍 Starting companion detection...');
      
      // Start Bluetooth scanning
      await this.startBluetoothScanning();
      
      // Start periodic detection
      this.detectionInterval = setInterval(() => {
        this.detectCompanions();
      }, this.detectionFrequency);
      
      this.notifyListeners('detection_started');
      return true;
    } catch (error) {
      console.error('Failed to start companion detection:', error);
      this.detectionEnabled = false;
      return false;
    }
  }

  /**
   * Stop companion detection
   */
  async stopDetection() {
    try {
      console.log('🛑 Stopping companion detection...');
      this.detectionEnabled = false;
      
      // Stop Bluetooth scanning
      await this.stopBluetoothScanning();
      
      // Clear detection interval
      if (this.detectionInterval) {
        clearInterval(this.detectionInterval);
        this.detectionInterval = null;
      }
      
      // Save current companions
      await this.saveCompanionHistory();
      
      this.notifyListeners('detection_stopped');
      return true;
    } catch (error) {
      console.error('Failed to stop companion detection:', error);
      return false;
    }
  }

  /**
   * Initialize Bluetooth (simulated for React Native)
   */
  async initializeBluetooth() {
    try {
      // In production, use react-native-ble-manager or similar
      console.log('Bluetooth initialized (simulated)');
      
      // Simulate some nearby devices
      this.simulateBluetoothDevices();
      return true;
    } catch (error) {
      console.error('Bluetooth initialization failed:', error);
      return false;
    }
  }

  /**
   * Start Bluetooth scanning
   */
  async startBluetoothScanning() {
    try {
      console.log('📡 Scanning for Bluetooth devices...');
      
      // In production, implement actual Bluetooth scanning
      this.scanningInterval = setInterval(() => {
        this.scanForDevices();
      }, 5000);
      
      return true;
    } catch (error) {
      console.error('Failed to start Bluetooth scanning:', error);
      return false;
    }
  }

  /**
   * Stop Bluetooth scanning
   */
  async stopBluetoothScanning() {
    if (this.scanningInterval) {
      clearInterval(this.scanningInterval);
      this.scanningInterval = null;
    }
    console.log('Bluetooth scanning stopped');
  }

  /**
   * Scan for nearby Bluetooth devices
   */
  scanForDevices() {
    try {
      // Simulate finding devices
      const mockDevices = [
        { id: 'device_1', name: 'iPhone_John', rssi: -55, distance: 2 },
        { id: 'device_2', name: 'Samsung_Mary', rssi: -70, distance: 5 },
        { id: 'device_3', name: 'OnePlus_Alex', rssi: -85, distance: 12 }
      ];
      
      // Process discovered devices
      mockDevices.forEach(device => {
        if (device.distance <= this.proximityThreshold) {
          this.processNearbyDevice(device);
        }
      });
    } catch (error) {
      console.error('Error scanning for devices:', error);
    }
  }

  /**
   * Process a nearby Bluetooth device
   */
  processNearbyDevice(device) {
    try {
      const deviceKey = device.id;
      
      if (!this.bluetoothDevices.has(deviceKey)) {
        this.bluetoothDevices.add(deviceKey);
        console.log(`📱 New device detected: ${device.name} (${device.distance}m away)`);
        
        // Check if device belongs to a known contact
        const contact = this.matchDeviceToContact(device);
        if (contact) {
          this.addCompanion(contact, 'bluetooth', device);
        } else {
          // Unknown device - could be a fellow traveler
          this.addCompanion({
            id: deviceKey,
            name: device.name || 'Unknown Traveler',
            type: 'bluetooth_device'
          }, 'bluetooth', device);
        }
      }
    } catch (error) {
      console.error('Error processing nearby device:', error);
    }
  }

  /**
   * Load contacts (simulated)
   */
  async loadContacts() {
    try {
      // In production, use react-native-contacts
      const mockContacts = [
        { id: 'contact_1', name: 'John Doe', phone: '+919876543210', bluetoothId: 'device_1' },
        { id: 'contact_2', name: 'Mary Smith', phone: '+919876543211', bluetoothId: 'device_2' },
        { id: 'contact_3', name: 'Alex Kumar', phone: '+919876543212', bluetoothId: 'device_3' }
      ];
      
      mockContacts.forEach(contact => {
        this.contactsMap.set(contact.bluetoothId, contact);
      });
      
      console.log(`📞 Loaded ${this.contactsMap.size} contacts`);
      return true;
    } catch (error) {
      console.error('Failed to load contacts:', error);
      return false;
    }
  }

  /**
   * Match Bluetooth device to contact
   */
  matchDeviceToContact(device) {
    return this.contactsMap.get(device.id) || null;
  }

  /**
   * Add a companion
   */
  addCompanion(contact, detectionMethod, deviceInfo = {}) {
    try {
      const companionKey = contact.id;
      
      if (!this.companions.has(companionKey)) {
        const companion = {
          ...contact,
          detectionMethod,
          firstDetected: Date.now(),
          lastSeen: Date.now(),
          deviceInfo,
          tripCount: 1,
          totalTime: 0
        };
        
        this.companions.set(companionKey, companion);
        console.log(`👥 New companion detected: ${contact.name}`);
        
        this.notifyListeners('companion_detected', companion);
      } else {
        // Update existing companion
        const companion = this.companions.get(companionKey);
        companion.lastSeen = Date.now();
        companion.totalTime = Date.now() - companion.firstDetected;
      }
    } catch (error) {
      console.error('Error adding companion:', error);
    }
  }

  /**
   * Detect companions (main detection logic)
   */
  async detectCompanions() {
    try {
      if (!this.detectionEnabled) return;
      
      console.log('🔍 Detecting companions...');
      
      // Update companion statuses
      for (const [id, companion] of this.companions) {
        const timeSinceLastSeen = Date.now() - companion.lastSeen;
        
        // If companion hasn't been seen for 5 minutes, mark as departed
        if (timeSinceLastSeen > 300000) {
          console.log(`👋 Companion departed: ${companion.name}`);
          this.companionHistory.push({
            ...companion,
            departedAt: Date.now()
          });
          this.companions.delete(id);
          this.notifyListeners('companion_departed', companion);
        }
      }
      
      // Log current companions
      if (this.companions.size > 0) {
        console.log(`Current companions: ${this.companions.size}`);
        this.companions.forEach(companion => {
          console.log(`  - ${companion.name} (${companion.detectionMethod})`);
        });
      }
    } catch (error) {
      console.error('Error during companion detection:', error);
    }
  }

  /**
   * Get current companions
   */
  getCurrentCompanions() {
    return Array.from(this.companions.values());
  }

  /**
   * Get companion statistics
   */
  getCompanionStats() {
    const current = this.getCurrentCompanions();
    const history = this.companionHistory;
    
    // Calculate frequent companions
    const frequentCompanions = {};
    history.forEach(companion => {
      const key = companion.id;
      if (!frequentCompanions[key]) {
        frequentCompanions[key] = {
          name: companion.name,
          trips: 0,
          totalTime: 0
        };
      }
      frequentCompanions[key].trips++;
      frequentCompanions[key].totalTime += companion.totalTime || 0;
    });
    
    return {
      current: current.length,
      today: history.filter(c => {
        const today = new Date().setHours(0, 0, 0, 0);
        return c.firstDetected >= today;
      }).length,
      thisWeek: history.filter(c => {
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return c.firstDetected >= weekAgo;
      }).length,
      frequentCompanions: Object.values(frequentCompanions)
        .sort((a, b) => b.trips - a.trips)
        .slice(0, 5)
    };
  }

  /**
   * Load companion history from storage
   */
  async loadCompanionHistory() {
    try {
      const history = await AsyncStorage.getItem('companion_history');
      if (history) {
        this.companionHistory = JSON.parse(history);
        console.log(`Loaded ${this.companionHistory.length} companion records`);
      }
    } catch (error) {
      console.error('Failed to load companion history:', error);
    }
  }

  /**
   * Save companion history to storage
   */
  async saveCompanionHistory() {
    try {
      // Add current companions to history
      this.companions.forEach(companion => {
        this.companionHistory.push({
          ...companion,
          sessionEnd: Date.now()
        });
      });
      
      // Keep only last 100 records
      if (this.companionHistory.length > 100) {
        this.companionHistory = this.companionHistory.slice(-100);
      }
      
      await AsyncStorage.setItem('companion_history', JSON.stringify(this.companionHistory));
      console.log('Companion history saved');
    } catch (error) {
      console.error('Failed to save companion history:', error);
    }
  }

  /**
   * Simulate Bluetooth devices for testing
   */
  simulateBluetoothDevices() {
    // This is for testing purposes
    setTimeout(() => {
      this.scanForDevices();
    }, 2000);
  }

  /**
   * Add listener for companion events
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
   * Notify listeners of events
   */
  notifyListeners(event, data = null) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in companion detection listener:', error);
      }
    });
  }

  /**
   * Get companion insights
   */
  getCompanionInsights() {
    const stats = this.getCompanionStats();
    const insights = [];
    
    if (stats.current > 0) {
      insights.push({
        type: 'current',
        message: `Traveling with ${stats.current} companion${stats.current > 1 ? 's' : ''}`
      });
    }
    
    if (stats.frequentCompanions.length > 0) {
      const top = stats.frequentCompanions[0];
      insights.push({
        type: 'frequent',
        message: `Most frequent travel companion: ${top.name} (${top.trips} trips)`
      });
    }
    
    if (stats.thisWeek > 10) {
      insights.push({
        type: 'social',
        message: `You've traveled with ${stats.thisWeek} different people this week!`
      });
    }
    
    return insights;
  }
}

export default new CompanionDetectionService();