const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { KeralaWeatherAlert, LocalBusiness, EmergencyService } = require('../models/kerala');
const logger = require('../utils/logger');

// Weather Alerts Routes
/**
 * @route GET /api/v1/kerala/weather/alerts
 * @desc Get all weather alerts
 * @access Public
 */
router.get('/weather/alerts', async (req, res) => {
  try {
    const { district, severity, active } = req.query;
    
    const query = {};
    if (district) query.district = district;
    if (severity) query.severity = severity;
    if (active !== undefined) query.isActive = active === 'true';
    
    const alerts = await KeralaWeatherAlert.find(query).sort('-createdAt');
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    logger.error('Error fetching weather alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather alerts'
    });
  }
});

/**
 * @route POST /api/v1/kerala/weather/alerts
 * @desc Create new weather alert (Admin only)
 * @access Private + Admin
 */
router.post('/weather/alerts', authenticate, authorize('admin', 'scientist'), async (req, res) => {
  try {
    const alert = new KeralaWeatherAlert({
      ...req.body,
      createdBy: req.user.id
    });
    
    await alert.save();
    
    // Emit real-time notification
    const io = req.app.get('socketio');
    io.emit('weather:alert', alert);
    
    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    logger.error('Error creating weather alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create weather alert'
    });
  }
});

/**
 * @route PUT /api/v1/kerala/weather/alerts/:id
 * @desc Update weather alert
 * @access Private + Admin
 */
router.put('/weather/alerts/:id', authenticate, authorize('admin', 'scientist'), async (req, res) => {
  try {
    const alert = await KeralaWeatherAlert.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }
    
    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    logger.error('Error updating weather alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update weather alert'
    });
  }
});

// Local Business Routes
/**
 * @route GET /api/v1/kerala/businesses
 * @desc Get local businesses
 * @access Public
 */
router.get('/businesses', async (req, res) => {
  try {
    const { type, district, verified, featured, rating, search } = req.query;
    const { page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (district) query.district = district;
    if (verified !== undefined) query.isVerified = verified === 'true';
    if (featured !== undefined) query.isFeatured = featured === 'true';
    if (rating) query.rating = { $gte: parseFloat(rating) };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { specialties: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const businesses = await LocalBusiness.find(query)
      .sort(featured === 'true' ? '-isFeatured -rating' : '-rating')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await LocalBusiness.countDocuments(query);
    
    res.json({
      success: true,
      data: businesses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching businesses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch businesses'
    });
  }
});

/**
 * @route GET /api/v1/kerala/businesses/:id
 * @desc Get single business details
 * @access Public
 */
router.get('/businesses/:id', async (req, res) => {
  try {
    const business = await LocalBusiness.findById(req.params.id);
    
    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found'
      });
    }
    
    // Increment view count
    business.viewCount = (business.viewCount || 0) + 1;
    await business.save();
    
    res.json({
      success: true,
      data: business
    });
  } catch (error) {
    logger.error('Error fetching business:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch business'
    });
  }
});

/**
 * @route POST /api/v1/kerala/businesses
 * @desc Add new business (Admin only)
 * @access Private + Admin
 */
router.post('/businesses', authenticate, authorize('admin'), async (req, res) => {
  try {
    const business = new LocalBusiness({
      ...req.body,
      createdBy: req.user.id
    });
    
    await business.save();
    
    res.status(201).json({
      success: true,
      data: business
    });
  } catch (error) {
    logger.error('Error creating business:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create business'
    });
  }
});

/**
 * @route POST /api/v1/kerala/businesses/:id/review
 * @desc Add review to business
 * @access Private
 */
router.post('/businesses/:id/review', authenticate, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const business = await LocalBusiness.findById(req.params.id);
    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found'
      });
    }
    
    // Check if user already reviewed
    const existingReview = business.reviews.find(
      review => review.userId.toString() === req.user.id
    );
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this business'
      });
    }
    
    business.reviews.push({
      userId: req.user.id,
      userName: req.user.name,
      rating,
      comment,
      createdAt: Date.now()
    });
    
    // Update average rating
    const totalRating = business.reviews.reduce((sum, review) => sum + review.rating, 0);
    business.rating = totalRating / business.reviews.length;
    business.reviewCount = business.reviews.length;
    
    await business.save();
    
    res.status(201).json({
      success: true,
      data: business
    });
  } catch (error) {
    logger.error('Error adding review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add review'
    });
  }
});

// Emergency Services Routes
/**
 * @route GET /api/v1/kerala/emergency/services
 * @desc Get emergency services
 * @access Public
 */
router.get('/emergency/services', async (req, res) => {
  try {
    const { type, district, available24x7 } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (district) query.district = district;
    if (available24x7 !== undefined) query.available24x7 = available24x7 === 'true';
    
    const services = await EmergencyService.find(query).sort('type name');
    
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    logger.error('Error fetching emergency services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch emergency services'
    });
  }
});

/**
 * @route GET /api/v1/kerala/emergency/contacts
 * @desc Get emergency contact numbers
 * @access Public
 */
router.get('/emergency/contacts', async (req, res) => {
  try {
    const contacts = [
      { name: 'National Emergency', number: '112', type: 'national', description: 'All India Emergency Response' },
      { name: 'Police', number: '100', type: 'police', description: 'Kerala State Police' },
      { name: 'Medical Emergency', number: '108', type: 'medical', description: 'Ambulance Service' },
      { name: 'Fire Service', number: '101', type: 'fire', description: 'Fire and Rescue' },
      { name: 'Tourist Helpline', number: '1363', type: 'tourist', description: 'Kerala Tourism 24x7' },
      { name: 'Women Safety', number: '1091', type: 'women', description: 'Women Safety Helpline' },
      { name: 'Disaster Management', number: '1077', type: 'disaster', description: 'Kerala State Disaster Management' },
      { name: 'Child Helpline', number: '1098', type: 'child', description: 'CHILDLINE India' }
    ];
    
    res.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    logger.error('Error fetching emergency contacts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch emergency contacts'
    });
  }
});

/**
 * @route POST /api/v1/kerala/emergency/services
 * @desc Add emergency service (Admin only)
 * @access Private + Admin
 */
router.post('/emergency/services', authenticate, authorize('admin'), async (req, res) => {
  try {
    const service = new EmergencyService({
      ...req.body,
      createdBy: req.user.id
    });
    
    await service.save();
    
    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    logger.error('Error creating emergency service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create emergency service'
    });
  }
});

/**
 * @route POST /api/v1/kerala/emergency/sos
 * @desc Send SOS alert
 * @access Private
 */
router.post('/emergency/sos', authenticate, async (req, res) => {
  try {
    const { location, message, contactNumbers } = req.body;
    
    // Log SOS alert
    logger.info(`SOS Alert from user ${req.user.id}:`, {
      userId: req.user.id,
      userName: req.user.name,
      location,
      message,
      timestamp: new Date().toISOString()
    });
    
    // In production, integrate with SMS/notification service
    // For now, just emit to connected admins
    const io = req.app.get('socketio');
    io.to('admin_room').emit('sos:alert', {
      userId: req.user.id,
      userName: req.user.name,
      userPhone: req.user.phone,
      location,
      message,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'SOS alert sent successfully',
      data: {
        alertId: Date.now().toString(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error sending SOS alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send SOS alert'
    });
  }
});

// Kerala Districts Info
/**
 * @route GET /api/v1/kerala/districts
 * @desc Get Kerala districts info
 * @access Public
 */
router.get('/districts', async (req, res) => {
  try {
    const districts = [
      { name: 'Thiruvananthapuram', code: 'TVM', region: 'South' },
      { name: 'Kollam', code: 'KLM', region: 'South' },
      { name: 'Pathanamthitta', code: 'PTA', region: 'South' },
      { name: 'Alappuzha', code: 'ALP', region: 'South' },
      { name: 'Kottayam', code: 'KTM', region: 'South' },
      { name: 'Idukki', code: 'IDK', region: 'Central' },
      { name: 'Ernakulam', code: 'EKM', region: 'Central' },
      { name: 'Thrissur', code: 'TSR', region: 'Central' },
      { name: 'Palakkad', code: 'PKD', region: 'Central' },
      { name: 'Malappuram', code: 'MPM', region: 'North' },
      { name: 'Kozhikode', code: 'KZD', region: 'North' },
      { name: 'Wayanad', code: 'WYD', region: 'North' },
      { name: 'Kannur', code: 'KNR', region: 'North' },
      { name: 'Kasaragod', code: 'KSD', region: 'North' }
    ];
    
    res.json({
      success: true,
      data: districts
    });
  } catch (error) {
    logger.error('Error fetching districts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch districts'
    });
  }
});

module.exports = router;