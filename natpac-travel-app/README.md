# NATPAC Travel Data Collection App

## Problem Statement ID: 25082

A comprehensive mobile application for collecting travel-related data to support transportation planning by NATPAC (National Transportation Planning and Research Centre).

## Overview

This application addresses the challenge of accurate travel data collection for transportation planning by providing:

- **Mobile App**: Cross-platform app for trip data collection
- **Backend Server**: Secure data storage and API services
- **Admin Dashboard**: Data visualization and analysis tools for NATPAC scientists

## Key Features

### Mobile Application
- **Automatic Trip Detection**: GPS-based trip tracking with intelligent start/stop detection
- **Manual Trip Entry**: User-friendly forms for manual data entry
- **Trip Chain Analysis**: Linking related trips to understand travel patterns
- **Companion Traveler Tracking**: Record details of accompanying travelers
- **Mode Detection**: Automatic and manual transport mode identification
- **Privacy Controls**: Comprehensive user consent and data privacy management

### Data Collection Points
- Trip number and sequence
- Origin and destination locations
- Trip start and end times
- Transportation mode (walking, bus, car, bike, etc.)
- Number of accompanying travelers
- Traveler demographics (with consent)
- Trip purpose (work, leisure, shopping, etc.)

### Backend Services
- Secure data storage with encryption
- RESTful API for mobile app integration
- User authentication and consent management
- Data export capabilities for research purposes
- Real-time data synchronization

### Admin Dashboard
- Interactive data visualization
- Trip pattern analysis
- Statistical reporting
- Data export tools (CSV, JSON, XML)
- User management
- Privacy compliance tools

## Technology Stack

### Mobile App
- **Framework**: React Native (cross-platform iOS/Android)
- **Maps**: Google Maps API / OpenStreetMap
- **Location Services**: Native GPS integration
- **Storage**: AsyncStorage for offline data
- **UI**: React Native Paper for Material Design

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with PostGIS for spatial data
- **Authentication**: JWT tokens with refresh mechanism
- **API Documentation**: Swagger/OpenAPI
- **File Storage**: AWS S3 or local storage
- **Real-time**: WebSocket integration

### Admin Dashboard
- **Framework**: React.js with TypeScript
- **UI Library**: Material-UI or Ant Design
- **Charts**: D3.js or Chart.js
- **Maps**: Leaflet or Google Maps
- **State Management**: Redux Toolkit

## Project Structure

```
natpac-travel-app/
├── mobile-app/          # React Native mobile application
├── backend/             # Node.js backend server
├── admin-dashboard/     # React.js admin interface
├── docs/               # Documentation and API specs
├── docker-compose.yml  # Development environment
└── README.md          # This file
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- React Native CLI
- Android Studio / Xcode
- PostgreSQL
- Git

### Development Setup
1. Clone the repository
2. Install dependencies for each component
3. Set up environment variables
4. Run database migrations
5. Start development servers

## Data Privacy & Compliance

- **User Consent**: Explicit consent required for data collection
- **Data Minimization**: Collect only necessary data
- **Encryption**: End-to-end encryption for sensitive data
- **Anonymization**: Options for anonymous data contribution
- **GDPR Compliance**: Right to data deletion and export

## Deployment

- **Mobile**: Play Store and App Store distribution
- **Backend**: Cloud deployment (AWS/Google Cloud/Azure)
- **Database**: Managed database services
- **Monitoring**: Application performance monitoring

## Contributing

This project is developed for NATPAC under KSCSTE, Government of Kerala.

## License

Government of Kerala - KSCSTE-NATPAC