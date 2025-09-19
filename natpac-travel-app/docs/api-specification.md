# NATPAC Travel App - API Specification

## Base URL
- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://api.natpac-travel.gov.in/v1`

## Authentication
All API endpoints (except registration and public data) require JWT authentication.

```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### 1. Authentication & User Management

#### POST /auth/register
Register a new user with consent
```json
{
  "phoneNumber": "+919876543210",
  "email": "user@example.com", // optional
  "deviceInfo": {
    "platform": "android",
    "version": "12",
    "model": "Samsung Galaxy S21"
  },
  "consentGiven": true,
  "consentTimestamp": "2024-01-15T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid-string",
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresIn": 86400
  }
}
```

#### POST /auth/login
Login existing user
```json
{
  "phoneNumber": "+919876543210",
  "deviceInfo": {
    "platform": "android",
    "version": "12",
    "model": "Samsung Galaxy S21"
  }
}
```

#### POST /auth/refresh
Refresh access token
```json
{
  "refreshToken": "refresh-token"
}
```

#### GET /user/profile
Get current user profile

#### PUT /user/profile
Update user profile
```json
{
  "ageGroup": "26-35",
  "gender": "male",
  "occupation": "Software Engineer",
  "householdSize": 4,
  "incomeBracket": "50000-100000"
}
```

#### PUT /user/privacy-settings
Update privacy settings
```json
{
  "shareLocation": true,
  "shareDemographics": false,
  "allowDataExport": true,
  "anonymousMode": false
}
```

### 2. Trip Management

#### POST /trips
Create a new trip
```json
{
  "tripDate": "2024-01-15",
  "origin": {
    "name": "Home",
    "address": "123 Main Street, Kochi",
    "coordinates": {
      "latitude": 9.9312,
      "longitude": 76.2673
    }
  },
  "destination": {
    "name": "Office",
    "address": "Infopark, Kakkanad",
    "coordinates": {
      "latitude": 10.0261,
      "longitude": 76.3478
    }
  },
  "startTime": "2024-01-15T09:00:00Z",
  "endTime": "2024-01-15T09:45:00Z",
  "transportMode": "bus",
  "tripPurpose": "work",
  "detectionMethod": "manual", // or "automatic"
  "confidenceScore": 0.95, // for automatic detection
  "distanceKm": 15.2,
  "companions": [
    {
      "ageGroup": "30-40",
      "gender": "female",
      "relationship": "family"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tripId": "uuid-string",
    "tripNumber": 1,
    "message": "Trip created successfully"
  }
}
```

#### GET /trips
Get user's trips with filters
- Query parameters: `page`, `limit`, `startDate`, `endDate`, `mode`, `purpose`

**Response:**
```json
{
  "success": true,
  "data": {
    "trips": [
      {
        "tripId": "uuid-string",
        "tripNumber": 1,
        "tripDate": "2024-01-15",
        "origin": {
          "name": "Home",
          "coordinates": {...}
        },
        "destination": {
          "name": "Office",
          "coordinates": {...}
        },
        "startTime": "2024-01-15T09:00:00Z",
        "endTime": "2024-01-15T09:45:00Z",
        "durationMinutes": 45,
        "transportMode": "bus",
        "tripPurpose": "work",
        "distanceKm": 15.2,
        "companions": [...],
        "createdAt": "2024-01-15T09:50:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalPages": 5,
      "totalCount": 98
    }
  }
}
```

#### GET /trips/:tripId
Get specific trip details

#### PUT /trips/:tripId
Update trip details

#### DELETE /trips/:tripId
Soft delete a trip

#### POST /trips/chain
Create a trip chain
```json
{
  "tripIds": ["trip-uuid-1", "trip-uuid-2", "trip-uuid-3"],
  "chainName": "Daily Commute" // optional
}
```

### 3. Automatic Trip Detection

#### POST /trips/start-tracking
Start automatic trip tracking
```json
{
  "enableGPS": true,
  "trackingInterval": 30, // seconds
  "confidenceThreshold": 0.7
}
```

#### POST /trips/stop-tracking
Stop automatic trip tracking

#### POST /trips/tracking-data
Submit GPS tracking points
```json
{
  "tripId": "uuid-string", // if trip already created
  "trackingPoints": [
    {
      "coordinates": {
        "latitude": 9.9312,
        "longitude": 76.2673
      },
      "timestamp": "2024-01-15T09:05:00Z",
      "accuracy": 5.2,
      "speed": 25.5
    }
  ]
}
```

#### GET /trips/suggestions
Get AI suggestions for incomplete trips

### 4. Reference Data

#### GET /transport-modes
Get all available transport modes
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "modeName": "walk",
      "category": "non_motorized",
      "description": "Walking"
    }
  ]
}
```

#### GET /trip-purposes
Get all trip purposes

#### GET /locations/search
Search for locations
- Query parameters: `q` (search term), `lat`, `lon`, `radius`

#### POST /locations
Add a frequently visited location
```json
{
  "name": "My Office",
  "address": "Infopark, Kakkanad",
  "coordinates": {
    "latitude": 10.0261,
    "longitude": 76.3478
  },
  "placeType": "work"
}
```

### 5. Analytics & Insights

#### GET /analytics/personal
Get personal travel analytics
- Query parameters: `period` (week, month, year)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTrips": 125,
      "totalDistance": 2450.5,
      "totalDuration": 3600,
      "averageTripLength": 19.6,
      "mostUsedMode": "bus",
      "carbonFootprint": 125.5
    },
    "trendData": {
      "dailyTrips": [...],
      "modeDistribution": {...},
      "purposeDistribution": {...}
    }
  }
}
```

#### GET /analytics/routes
Get popular routes for the user

#### GET /analytics/patterns
Get travel pattern insights

### 6. Admin Endpoints (NATPAC Scientists)

#### POST /admin/auth/login
Admin authentication

#### GET /admin/users
Get user list with filters
- Requires admin role

#### GET /admin/trips/export
Export trip data
- Query parameters: `format` (csv, json, geojson), `startDate`, `endDate`, `filters`

**Response:**
```json
{
  "success": true,
  "data": {
    "exportId": "uuid-string",
    "downloadUrl": "https://api.natpac-travel.gov.in/downloads/export-uuid.csv",
    "recordCount": 15432,
    "expiresAt": "2024-01-20T00:00:00Z"
  }
}
```

#### GET /admin/analytics/aggregate
Get aggregated analytics
- Query parameters: `region`, `ageGroup`, `mode`, `period`

#### GET /admin/analytics/heatmap
Get trip density heatmap data

#### POST /admin/reports/generate
Generate custom reports

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "phoneNumber",
      "message": "Phone number is required"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Codes
- `VALIDATION_ERROR` - Invalid input data
- `UNAUTHORIZED` - Invalid or expired token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error
- `CONSENT_REQUIRED` - User consent not given

## Rate Limiting
- Standard endpoints: 100 requests per minute per user
- Analytics endpoints: 20 requests per minute per user
- Export endpoints: 5 requests per hour per admin

## Data Privacy
- All personal data is encrypted at rest
- GPS coordinates are stored with reduced precision for privacy
- Users can request data deletion at any time
- Data export for research requires proper anonymization

## WebSocket Events (Real-time features)

### Connection
```
wss://api.natpac-travel.gov.in/v1/ws?token=<jwt_token>
```

### Events
- `trip:started` - Trip tracking started
- `trip:completed` - Trip automatically detected and completed  
- `trip:suggestion` - AI suggestion for trip completion
- `location:entered` - Entered a significant location
- `location:exited` - Exited a significant location