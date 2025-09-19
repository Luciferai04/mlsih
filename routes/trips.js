const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const { validateTrip } = require('../middleware/validation');
const auth = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');

// Get user trips with pagination
router.get('/:userId', auth, rateLimit, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0, startDate, endDate } = req.query;

    const query = { userId };
    
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const trips = await Trip.find(query)
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select('-locations'); // Exclude detailed location data for list view

    const total = await Trip.countDocuments(query);

    res.json({
      trips: trips.map(trip => ({
        id: trip._id,
        startTime: trip.startTime,
        endTime: trip.endTime,
        duration: trip.duration,
        distance: trip.distance,
        predictedMode: trip.predictedMode,
        confidence: trip.confidence,
        locationCount: trip.locationCount
      })),
      total,
      hasMore: (parseInt(offset) + parseInt(limit)) < total
    });
  } catch (error) {
    console.error('Failed to get trips:', error);
    res.status(500).json({ error: 'Failed to retrieve trips' });
  }
});

// Get specific trip details
router.get('/:userId/:tripId', auth, async (req, res) => {
  try {
    const { userId, tripId } = req.params;
    
    const trip = await Trip.findOne({ 
      _id: tripId, 
      userId 
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Failed to get trip details:', error);
    res.status(500).json({ error: 'Failed to retrieve trip details' });
  }
});

// Create new trip
router.post('/', auth, validateTrip, async (req, res) => {
  try {
    const { userId, tripData } = req.body;

    const trip = new Trip({
      userId,
      startTime: new Date(tripData.startTime),
      endTime: new Date(tripData.endTime),
      duration: tripData.duration,
      locations: tripData.locations,
      predictedMode: tripData.predictedMode,
      confidence: tripData.confidence || 0.5,
      distance: tripData.distance,
      locationCount: tripData.locations.length,
      createdAt: new Date()
    });

    const savedTrip = await trip.save();

    res.status(201).json({
      message: 'Trip saved successfully',
      tripId: savedTrip._id,
      trip: {
        id: savedTrip._id,
        startTime: savedTrip.startTime,
        endTime: savedTrip.endTime,
        duration: savedTrip.duration,
        distance: savedTrip.distance,
        predictedMode: savedTrip.predictedMode
      }
    });
  } catch (error) {
    console.error('Failed to save trip:', error);
    res.status(500).json({ error: 'Failed to save trip' });
  }
});

// Update trip
router.put('/:userId/:tripId', auth, validateTrip, async (req, res) => {
  try {
    const { userId, tripId } = req.params;
    const { tripData } = req.body;

    const trip = await Trip.findOneAndUpdate(
      { _id: tripId, userId },
      {
        predictedMode: tripData.predictedMode,
        confidence: tripData.confidence,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({ message: 'Trip updated successfully', trip });
  } catch (error) {
    console.error('Failed to update trip:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

// Delete trip
router.delete('/:userId/:tripId', auth, async (req, res) => {
  try {
    const { userId, tripId } = req.params;

    const trip = await Trip.findOneAndDelete({ 
      _id: tripId, 
      userId 
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Failed to delete trip:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

module.exports = router;