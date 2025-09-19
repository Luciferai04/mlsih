const mongoose = require('mongoose');

const emergencyServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['hospital', 'police', 'fire', 'ambulance', 'pharmacy', 'disaster'],
  },
  district: {
    type: String,
    required: true,
    enum: [
      'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
      'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
      'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
    ],
  },
  address: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  contact: {
    primary: {
      type: String,
      required: true,
    },
    secondary: String,
    emergency: String,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  available24x7: {
    type: Boolean,
    default: false,
  },
  services: [{
    type: String,
  }],
  facilities: [{
    type: String,
  }],
  capacity: {
    beds: Number,
    icu: Number,
    ventilators: Number,
    ambulances: Number,
  },
  specializations: [{
    type: String,
  }],
  languages: [{
    type: String,
    default: ['Malayalam', 'English'],
  }],
  isGovernment: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  verifiedAt: Date,
  responseTime: {
    type: Number, // in minutes
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
}, {
  timestamps: true,
});

// Create 2dsphere index for geospatial queries
emergencyServiceSchema.index({ location: '2dsphere' });

// Create compound index for common queries
emergencyServiceSchema.index({ district: 1, type: 1, available24x7: 1 });

// Text index for search
emergencyServiceSchema.index({ name: 'text', services: 'text', specializations: 'text' });

// Method to find nearest emergency services
emergencyServiceSchema.statics.findNearest = async function(longitude, latitude, type, maxDistance = 10000) {
  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    }
  };
  
  if (type) {
    query.type = type;
  }
  
  return await this.find(query).limit(10);
};

// Method to get emergency services by type and district
emergencyServiceSchema.statics.getByTypeAndDistrict = async function(type, district) {
  const query = {};
  if (type) query.type = type;
  if (district) query.district = district;
  
  return await this.find(query).sort('-available24x7 -rating');
};

const EmergencyService = mongoose.model('EmergencyService', emergencyServiceSchema);

module.exports = EmergencyService;