const express = require('express');
const router = express.Router();

// AI Feature Controllers
const companionController = {
  // Get companion detection status
  getStatus: (req, res) => {
    res.json({
      success: true,
      companions: req.session?.companions || [],
      detectionEnabled: req.session?.companionDetectionEnabled || false
    });
  },
  
  // Start companion detection
  startDetection: (req, res) => {
    req.session = req.session || {};
    req.session.companionDetectionEnabled = true;
    req.session.companions = [];
    
    res.json({
      success: true,
      message: 'Companion detection started'
    });
  },
  
  // Stop companion detection
  stopDetection: (req, res) => {
    req.session = req.session || {};
    req.session.companionDetectionEnabled = false;
    
    res.json({
      success: true,
      message: 'Companion detection stopped',
      companions: req.session.companions || []
    });
  },
  
  // Add companion
  addCompanion: (req, res) => {
    const { companion } = req.body;
    req.session = req.session || {};
    req.session.companions = req.session.companions || [];
    req.session.companions.push(companion);
    
    res.json({
      success: true,
      companion,
      total: req.session.companions.length
    });
  }
};

const tripPurposeController = {
  // Classify trip purpose
  classify: async (req, res) => {
    try {
      const { tripData } = req.body;
      
      // Simulate AI classification
      const purposes = ['work', 'shopping', 'leisure', 'medical', 'education', 'social'];
      const randomPurpose = purposes[Math.floor(Math.random() * purposes.length)];
      
      const classification = {
        purpose: randomPurpose,
        confidence: 0.75 + Math.random() * 0.2,
        method: 'ensemble',
        reasons: ['time_pattern', 'location_match', 'historical_data']
      };
      
      res.json({
        success: true,
        classification
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },
  
  // Get purpose statistics
  getStatistics: (req, res) => {
    res.json({
      success: true,
      statistics: {
        totalTrips: 156,
        purposeBreakdown: {
          work: 45,
          shopping: 28,
          leisure: 35,
          medical: 12,
          education: 20,
          social: 16
        },
        mostCommonPurpose: 'work',
        insights: [
          'You travel frequently for work',
          'Weekend trips are mostly leisure',
          'Medical visits cluster on Wednesdays'
        ]
      }
    });
  }
};

const predictiveAnalyticsController = {
  // Predict next trip
  predictNextTrip: async (req, res) => {
    try {
      const { context } = req.body;
      
      // Simulate prediction
      const prediction = {
        destination: {
          latitude: 9.9312 + (Math.random() - 0.5) * 0.1,
          longitude: 76.2673 + (Math.random() - 0.5) * 0.1,
          name: 'Predicted Destination'
        },
        probability: 0.82,
        departureTime: Date.now() + (30 + Math.random() * 60) * 60000, // 30-90 min from now
        method: 'ensemble',
        confidence: 0.78
      };
      
      res.json({
        success: true,
        prediction
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },
  
  // Recommend transport mode
  recommendMode: async (req, res) => {
    try {
      const { tripDetails } = req.body;
      
      // Simulate mode recommendation
      const modes = ['bus', 'auto_rickshaw', 'metro', 'car', 'ferry'];
      const recommended = modes[Math.floor(Math.random() * modes.length)];
      
      const recommendation = {
        mode: recommended,
        confidence: 0.85,
        reasons: [
          'Weather conditions favorable',
          'Traffic is moderate',
          'Cost-effective option',
          'Environmentally friendly'
        ],
        alternatives: modes.filter(m => m !== recommended).slice(0, 2)
      };
      
      res.json({
        success: true,
        recommendation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },
  
  // Detect anomalies
  detectAnomalies: async (req, res) => {
    try {
      const { tripData } = req.body;
      
      // Simulate anomaly detection
      const anomalies = [];
      
      if (Math.random() > 0.7) {
        anomalies.push({
          type: 'unusual_destination',
          severity: 'low',
          message: 'This is an unusual destination for this time',
          confidence: 0.65
        });
      }
      
      if (Math.random() > 0.8) {
        anomalies.push({
          type: 'unusual_mode',
          severity: 'medium',
          message: 'Unusual transport mode for this route',
          confidence: 0.72
        });
      }
      
      res.json({
        success: true,
        anomalies
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

// Kerala-specific features
const keralaFeaturesController = {
  // Get Kerala transport info
  getTransportInfo: (req, res) => {
    res.json({
      success: true,
      transportModes: {
        ksrtc: {
          available: true,
          types: ['ordinary', 'fast_passenger', 'super_deluxe'],
          nextDeparture: Date.now() + 15 * 60000
        },
        metro: {
          available: true,
          lines: ['Aluva-Palarivattom'],
          frequency: '10 minutes'
        },
        waterTransport: {
          available: true,
          types: ['ferry', 'country_boat', 'houseboat'],
          routes: ['Fort Kochi-Mattancherry', 'Vaikom-Thavanakkadavu']
        },
        autoRickshaw: {
          available: true,
          prepaidAvailable: true,
          averageFare: '₹12/km'
        }
      }
    });
  },
  
  // Get tourist attractions
  getTouristAttractions: (req, res) => {
    res.json({
      success: true,
      attractions: [
        { name: 'Fort Kochi', type: 'historical', distance: 5.2 },
        { name: 'Marine Drive', type: 'waterfront', distance: 3.1 },
        { name: 'Hill Palace', type: 'museum', distance: 12.5 },
        { name: 'Cherai Beach', type: 'beach', distance: 25.3 }
      ]
    });
  }
};

// Routes
// Companion Detection
router.get('/companion/status', companionController.getStatus);
router.post('/companion/start', companionController.startDetection);
router.post('/companion/stop', companionController.stopDetection);
router.post('/companion/add', companionController.addCompanion);

// Trip Purpose Classification
router.post('/purpose/classify', tripPurposeController.classify);
router.get('/purpose/statistics', tripPurposeController.getStatistics);

// Predictive Analytics
router.post('/predict/next-trip', predictiveAnalyticsController.predictNextTrip);
router.post('/predict/recommend-mode', predictiveAnalyticsController.recommendMode);
router.post('/predict/anomalies', predictiveAnalyticsController.detectAnomalies);

// Kerala Features
router.get('/kerala/transport-info', keralaFeaturesController.getTransportInfo);
router.get('/kerala/attractions', keralaFeaturesController.getTouristAttractions);

module.exports = router;