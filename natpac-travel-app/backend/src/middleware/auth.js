const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const logger = require('../utils/logger');

// Verify JWT token and add user to request
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Access token is required'
      },
      timestamp: new Date().toISOString()
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist and are active
    const userResult = await query(
      'SELECT id, user_id, phone_number, email, is_active, consent_given FROM users WHERE user_id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found'
        },
        timestamp: new Date().toISOString()
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Account is deactivated'
        },
        timestamp: new Date().toISOString()
      });
    }

    if (!user.consent_given) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'CONSENT_REQUIRED',
          message: 'User consent is required to access this resource'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      userId: user.user_id,
      phoneNumber: user.phone_number,
      email: user.email,
      tokenExp: decoded.exp
    };

    next();
  } catch (error) {
    logger.error('Token authentication failed:', { error: error.message });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token has expired'
        },
        timestamp: new Date().toISOString()
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token'
        },
        timestamp: new Date().toISOString()
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication error'
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Admin access token is required'
      },
      timestamp: new Date().toISOString()
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required'
        },
        timestamp: new Date().toISOString()
      });
    }

    req.admin = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || 'admin'
    };

    next();
  } catch (error) {
    logger.error('Admin token authentication failed:', { error: error.message });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Admin token has expired'
        },
        timestamp: new Date().toISOString()
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid admin token'
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const userResult = await query(
      'SELECT id, user_id, phone_number, email, is_active FROM users WHERE user_id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length > 0 && userResult.rows[0].is_active) {
      const user = userResult.rows[0];
      req.user = {
        id: user.id,
        userId: user.user_id,
        phoneNumber: user.phone_number,
        email: user.email
      };
    }
  } catch (error) {
    // Ignore token errors for optional auth
    logger.debug('Optional auth token invalid:', { error: error.message });
  }

  next();
};

// Generate JWT token
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN || '24h') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

// Check if token is about to expire (within 1 hour)
const isTokenNearExpiry = (exp) => {
  const now = Math.floor(Date.now() / 1000);
  const oneHour = 60 * 60;
  return (exp - now) < oneHour;
};

module.exports = {
  authenticateToken,
  authenticateAdmin,
  optionalAuth,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  isTokenNearExpiry
};