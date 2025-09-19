const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  timestamp: {
    type: Date,
    required: true
  },
  accuracy: {
    type: Number,
    default: 0
  },
  speed: {
    type: Number,
    default: 0
  },
  heading: {
    type: Number,
    default: 0
  }
});

const tripSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  locations: [locationSchema],
  locationCount: {
    type: Number,
    required: true,
    min: 2
  },
  predictedMode: {
    type: String,
    required: true,
    enum: ['walking', 'cycling', 'driving', 'public_transport', 'unknown'],
    default: 'unknown'
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    default: 0.5
  },
  distance: {
    type: Number,
    required: true,
    min: 0
  },
  averageSpeed: {
    type: Number,
    default: 0
  },
  maxSpeed: {
    type: Number,
    default: 0
  },
  anonymized: {
    type: Boolean,
    default: true
  },
  processed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
tripSchema.index({ userId: 1, startTime: -1 });
tripSchema.index({ predictedMode: 1, createdAt: -1 });

// Virtual for trip summary
tripSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    startTime: this.startTime,
    endTime: this.endTime,
    duration: this.duration,
    distance: this.distance,
    predictedMode: this.predictedMode,
    confidence: this.confidence
  };
});

module.exports = mongoose.model('Trip', tripSchema);