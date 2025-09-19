const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const localBusinessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['restaurant', 'hotel', 'shop', 'attraction', 'transport'],
  },
  category: {
    type: String,
    required: true,
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
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: [{
    url: String,
    caption: String,
  }],
  features: [{
    type: String,
  }],
  specialties: [{
    type: String,
  }],
  priceRange: {
    type: String,
    enum: ['₹', '₹₹', '₹₹₹', '₹₹₹₹'],
  },
  timing: {
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
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
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isLocalOwned: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  reviews: [reviewSchema],
  tags: [{
    type: String,
  }],
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
localBusinessSchema.index({ location: '2dsphere' });

// Create text index for search
localBusinessSchema.index({ 
  name: 'text', 
  description: 'text', 
  category: 'text',
  specialties: 'text',
  tags: 'text' 
});

// Create compound index for common queries
localBusinessSchema.index({ district: 1, type: 1, isVerified: 1, rating: -1 });

// Virtual for checking if currently open
localBusinessSchema.virtual('isCurrentlyOpen').get(function() {
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[now.getDay()];
  const currentTime = now.getHours() * 100 + now.getMinutes();
  
  const dayTiming = this.timing[currentDay];
  if (!dayTiming.isOpen) return false;
  
  const openTime = parseInt(dayTiming.open.replace(':', ''));
  const closeTime = parseInt(dayTiming.close.replace(':', ''));
  
  return currentTime >= openTime && currentTime <= closeTime;
});

// Method to find nearby businesses
localBusinessSchema.statics.findNearby = async function(longitude, latitude, maxDistance = 5000) {
  return await this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    }
  });
};

const LocalBusiness = mongoose.model('LocalBusiness', localBusinessSchema);

module.exports = LocalBusiness;