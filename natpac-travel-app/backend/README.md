# NATPAC Travel Backend API

RESTful API backend for the NATPAC Kerala Travel Companion platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- RESTful API architecture
- JWT-based authentication
- Real-time updates with Socket.io
- MongoDB for data persistence
- Redis caching (optional)
- Kerala-specific endpoints
- Comprehensive API documentation

## 📋 Prerequisites

- Node.js v16+
- MongoDB v4.4+
- Redis (optional)
- npm or yarn

## 🛠️ Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup
```bash
# Ensure MongoDB is running
mongod

# Run migrations (if any)
npm run migrate
```

### 4. Start Server
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.js   # MongoDB connection
│   ├── redis.js      # Redis configuration
│   └── swagger.js    # API documentation
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
│   ├── auth.js       # Authentication
│   ├── validation.js # Request validation
│   └── errorHandler.js
├── models/          # MongoDB models
│   ├── User.js
│   ├── Trip.js
│   └── kerala/      # Kerala-specific models
├── routes/          # API routes
├── services/        # Business logic
├── utils/          # Utilities
└── websocket/      # Socket.io handlers
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
```
POST   /auth/register      # User registration
POST   /auth/login         # User login
POST   /auth/verify-otp    # OTP verification
POST   /auth/refresh       # Refresh token
POST   /auth/logout        # Logout
```

### User Management
```
GET    /user/profile       # Get user profile
PUT    /user/profile       # Update profile
DELETE /user/account       # Delete account
GET    /user/trips         # Get user trips
```

### Trip Management
```
POST   /trips              # Create new trip
GET    /trips              # Get all trips
GET    /trips/:id          # Get trip details
PUT    /trips/:id          # Update trip
DELETE /trips/:id          # Delete trip
POST   /trips/:id/end      # End active trip
```

### Location Tracking
```
POST   /locations          # Save location update
GET    /locations/trip/:id # Get trip locations
POST   /locations/batch    # Batch location update
```

### Analytics
```
GET    /analytics/summary  # User analytics summary
GET    /analytics/trips    # Trip analytics
GET    /analytics/modes    # Transport mode stats
GET    /analytics/districts # District-wise stats
```

### Kerala Features
```
# Weather
GET    /kerala/weather/alerts
POST   /kerala/weather/alerts (Admin)
PUT    /kerala/weather/alerts/:id (Admin)

# Local Businesses
GET    /kerala/businesses
GET    /kerala/businesses/:id
POST   /kerala/businesses (Admin)
POST   /kerala/businesses/:id/review

# Emergency Services
GET    /kerala/emergency/services
GET    /kerala/emergency/contacts
POST   /kerala/emergency/sos

# Districts
GET    /kerala/districts
```

### Admin Routes
```
GET    /admin/users        # List all users
PUT    /admin/users/:id    # Update user
DELETE /admin/users/:id    # Delete user
GET    /admin/analytics    # System analytics
POST   /admin/export       # Export data
```

## 🔐 Authentication

### JWT Token Structure
```javascript
{
  userId: "string",
  role: "user|admin|super-admin",
  iat: timestamp,
  exp: timestamp
}
```

### Request Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String,
  phone: String,
  role: String,
  isVerified: Boolean,
  consent: {
    dataCollection: Boolean,
    timestamp: Date
  },
  createdAt: Date
}
```

### Trip Model
```javascript
{
  userId: ObjectId,
  origin: {
    name: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  destination: {...},
  transportMode: String,
  purpose: String,
  distance: Number,
  duration: Number,
  route: [LocationPoint],
  companions: [Companion],
  status: String,
  timestamps: {...}
}
```

### Kerala Models
- **WeatherAlert**: Weather warnings and advisories
- **LocalBusiness**: Verified local businesses
- **EmergencyService**: Emergency service locations

## 🔄 Real-time Updates

### WebSocket Events
```javascript
// Client -> Server
socket.emit('trip:start', tripData);
socket.emit('location:update', locationData);
socket.emit('trip:end', tripId);

// Server -> Client
socket.emit('trip:updated', tripData);
socket.emit('location:saved', locationData);
socket.emit('weather:alert', alertData);
```

## 🚦 Middleware

### Authentication
```javascript
// Protected route example
router.get('/profile', authenticate, getProfile);

// Admin only route
router.post('/admin/action', authenticate, authorize('admin'), adminAction);
```

### Validation
```javascript
// Request validation example
router.post('/trips', 
  validateBody(tripSchema), 
  createTrip
);
```

### Rate Limiting
```javascript
// Applied globally
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests
});
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage
```

### Test Structure
```
tests/
├── unit/           # Unit tests
├── integration/    # API integration tests
├── fixtures/       # Test data
└── helpers/        # Test utilities
```

## 📝 API Documentation

### Swagger UI
Access interactive API documentation:
```
http://localhost:3000/api-docs
```

### Postman Collection
Import `postman_collection.json` for API testing

## 🔧 Development

### Running in Development
```bash
npm run dev
# Uses nodemon for auto-reload
```

### Debugging
```bash
# Debug mode
DEBUG=app:* npm run dev

# VS Code debugging
# Use included .vscode/launch.json
```

### Database Seeding
```bash
# Seed sample data
npm run seed

# Clear database
npm run db:reset
```

## 🚀 Deployment

### Environment Variables
```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://...
JWT_SECRET=secure_random_string
# See .env.example for all variables
```

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Process Management (PM2)
```bash
pm2 start ecosystem.config.js --env production
```

## 📊 Monitoring

### Health Check
```
GET /health
```

### Logging
- Uses Winston for structured logging
- Logs stored in `logs/` directory
- Sentry integration for error tracking

### Performance Monitoring
- APM integration ready
- Custom metrics exposed at `/metrics`

## 🔍 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check MongoDB service
sudo systemctl status mongod

# Check connection string
mongodb://localhost:27017/natpac_travel
```

**Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

**JWT Token Issues**
- Check token expiry
- Verify JWT_SECRET in .env
- Ensure Authorization header format

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

### Code Style
- ESLint configuration included
- Prettier for formatting
- Run `npm run lint` before committing

## 📄 License

Proprietary - NATPAC Kerala

## 👥 Support

For backend support:
- API Issues: api-support@natpac.kerala.gov.in
- Documentation: https://api-docs.natpactravel.app