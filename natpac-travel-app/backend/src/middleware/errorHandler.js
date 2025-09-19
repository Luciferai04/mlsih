const logger = require('../utils/logger');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error handler
const handleValidationError = (error) => {
  const errors = [];
  
  if (error.details && Array.isArray(error.details)) {
    // Joi validation errors
    error.details.forEach(detail => {
      errors.push({
        field: detail.context.label || detail.path.join('.'),
        message: detail.message.replace(/"/g, '')
      });
    });
  } else if (error.errors) {
    // Express validator errors
    error.errors.forEach(err => {
      errors.push({
        field: err.param || err.path,
        message: err.msg
      });
    });
  }

  return new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors);
};

// Database error handler
const handleDatabaseError = (error) => {
  logger.error('Database error:', error);

  // PostgreSQL error codes
  switch (error.code) {
    case '23505': // Unique violation
      return new AppError('Resource already exists', 409, 'DUPLICATE_ENTRY');
    
    case '23503': // Foreign key violation
      return new AppError('Referenced resource not found', 400, 'INVALID_REFERENCE');
    
    case '23502': // Not null violation
      return new AppError('Required field is missing', 400, 'MISSING_REQUIRED_FIELD');
    
    case '23514': // Check violation
      return new AppError('Invalid field value', 400, 'INVALID_VALUE');
    
    case '42P01': // Undefined table
      return new AppError('Database configuration error', 500, 'DATABASE_ERROR');
    
    case '28P01': // Invalid password
      return new AppError('Database authentication failed', 500, 'DATABASE_ERROR');
    
    case 'ECONNREFUSED':
      return new AppError('Database connection failed', 500, 'DATABASE_CONNECTION_ERROR');
    
    case 'ETIMEDOUT':
      return new AppError('Database operation timed out', 500, 'DATABASE_TIMEOUT');
    
    default:
      return new AppError('Database operation failed', 500, 'DATABASE_ERROR');
  }
};

// JWT error handler
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }
  
  if (error.name === 'TokenExpiredError') {
    return new AppError('Token has expired', 401, 'TOKEN_EXPIRED');
  }
  
  return new AppError('Authentication failed', 401, 'AUTH_ERROR');
};

// Send error response in development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message,
      details: err.details || null,
      stack: err.stack
    },
    timestamp: new Date().toISOString()
  });
};

// Send error response in production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code || 'OPERATION_FAILED',
        message: err.message,
        details: err.details || null
      },
      timestamp: new Date().toISOString()
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('Unexpected error:', err);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong!'
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Main error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Handle different types of errors
  if (error.name === 'ValidationError' || error.isJoi) {
    error = handleValidationError(error);
  } else if (error.code && (error.code.startsWith('23') || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT')) {
    error = handleDatabaseError(error);
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    error = handleJWTError(error);
  } else if (error.name === 'CastError') {
    error = new AppError('Invalid ID format', 400, 'INVALID_ID');
  } else if (error.code === 'LIMIT_FILE_SIZE') {
    error = new AppError('File too large', 413, 'FILE_TOO_LARGE');
  } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    error = new AppError('Unexpected file field', 400, 'UNEXPECTED_FILE');
  }

  // Ensure error has required properties
  error.statusCode = error.statusCode || 500;
  error.code = error.code || 'INTERNAL_ERROR';

  // Send response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found handler
const notFoundHandler = (req, res) => {
  const message = `Route ${req.originalUrl} not found`;
  
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message,
      path: req.originalUrl,
      method: req.method
    },
    timestamp: new Date().toISOString()
  });
};

// Unhandled promise rejection handler
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Close server & exit process
  process.exit(1);
});

module.exports = {
  AppError,
  errorHandler,
  asyncHandler,
  notFoundHandler
};