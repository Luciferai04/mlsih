const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const { setupDatabase } = require('./src/config/database');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/user');
const tripRoutes = require('./src/routes/trips');
const locationRoutes = require('./src/routes/locations');
const analyticsRoutes = require('./src/routes/analytics');
const adminRoutes = require('./src/routes/admin');
const referenceRoutes = require('./src/routes/reference');
const { setupSwagger } = require('./src/config/swagger');
const { authenticateSocket } = require('./src/middleware/socketAuth');
const { errorHandler } = require('./src/middleware/errorHandler');
const logger = require('./src/utils/logger');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.'
    }
  }
});
app.use('/api/', limiter);

// Basic middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NATPAC Travel API is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1', referenceRoutes);

// Swagger documentation
setupSwagger(app);

// WebSocket connection handling
io.use(authenticateSocket);

io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.userId}`);
  
  socket.join(`user_${socket.userId}`);

  socket.on('trip:start', (data) => {
    logger.info(`Trip started by user ${socket.userId}:`, data);
    socket.to(`user_${socket.userId}`).emit('trip:started', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('trip:update', (data) => {
    socket.to(`user_${socket.userId}`).emit('trip:updated', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('location:update', (data) => {
    socket.to(`user_${socket.userId}`).emit('location:updated', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.userId}`);
  });
});

// Make io available to routes
app.set('socketio', io);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    await setupDatabase();
    logger.info('Database connected successfully');

    server.listen(PORT, () => {
      logger.info(`NATPAC Travel API server running on port ${PORT}`);
      logger.info(`Environment: ${NODE_ENV}`);
      logger.info(`Swagger docs available at: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

if (require.main === module) {
  startServer();
}

module.exports = app;