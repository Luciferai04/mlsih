const mongoose = require('mongoose');

const keralaWeatherAlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
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
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  description: {
    type: String,
    required: true,
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  affectedAreas: [{
    type: String,
  }],
  recommendations: [{
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

// Index for querying active alerts
keralaWeatherAlertSchema.index({ district: 1, isActive: 1, validUntil: -1 });

// Virtual for checking if alert is currently valid
keralaWeatherAlertSchema.virtual('isCurrentlyValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.validFrom <= now && 
         this.validUntil >= now;
});

// Method to deactivate expired alerts
keralaWeatherAlertSchema.statics.deactivateExpiredAlerts = async function() {
  const now = new Date();
  return await this.updateMany(
    {
      isActive: true,
      validUntil: { $lt: now }
    },
    {
      isActive: false,
      updatedAt: now
    }
  );
};

// Pre-save validation
keralaWeatherAlertSchema.pre('save', function(next) {
  if (this.validFrom >= this.validUntil) {
    next(new Error('Valid from date must be before valid until date'));
  }
  next();
});

const KeralaWeatherAlert = mongoose.model('KeralaWeatherAlert', keralaWeatherAlertSchema);

module.exports = KeralaWeatherAlert;