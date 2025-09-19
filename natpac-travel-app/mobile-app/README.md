# NATPAC Travel Mobile App

React Native mobile application for NATPAC Kerala Travel Companion platform.

## 📱 Features

- Trip tracking with GPS
- Kerala-specific features (weather, SOS, local businesses)
- Ola Maps integration (Kerala region only)
- Offline support
- Multi-language support (English, Malayalam)

## 🚀 Setup

### Prerequisites
- Node.js v16+
- React Native CLI
- Android Studio / Xcode
- Ola Maps API credentials

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. **iOS Setup**
```bash
cd ios && pod install && cd ..
```

4. **Android Setup**
Ensure you have:
- Android SDK 29+
- Google Play Services

## 🏃 Running the App

### Development Mode

**iOS**
```bash
npm run ios
# or
npm run ios -- --simulator="iPhone 14"
```

**Android**
```bash
npm run android
# or
npm run android -- --deviceId="emulator-5554"
```

### Production Build

**iOS**
```bash
cd ios
xcodebuild -workspace NatpacTravel.xcworkspace -scheme NatpacTravel -configuration Release
```

**Android**
```bash
cd android
./gradlew assembleRelease
# APK will be in android/app/build/outputs/apk/release/
```

## 📁 Project Structure

```
src/
├── screens/          # Screen components
│   ├── auth/        # Authentication screens
│   ├── main/        # Main app screens
│   ├── tracking/    # Trip tracking screens
│   └── kerala/      # Kerala-specific screens
├── components/       # Reusable components
├── services/        # API and external services
├── context/         # React contexts
├── navigation/      # Navigation configuration
├── utils/          # Utilities and helpers
└── assets/         # Images, fonts, etc.
```

## 🗺️ Ola Maps Configuration

The app uses Ola Maps SDK configured for Kerala:

```javascript
// config/olaMapConfig.ts
export const OLA_MAPS_CONFIG = {
  apiKey: process.env.OLA_MAPS_API_KEY,
  region: 'IN',
  bounds: {
    north: 12.7922,
    south: 8.1788,
    east: 77.4039,
    west: 74.4706
  }
};
```

## 🔐 Permissions

The app requires the following permissions:

### iOS (Info.plist)
- NSLocationWhenInUseUsageDescription
- NSLocationAlwaysUsageDescription
- NSCameraUsageDescription
- NSPhotoLibraryUsageDescription

### Android (AndroidManifest.xml)
- ACCESS_FINE_LOCATION
- ACCESS_COARSE_LOCATION
- ACCESS_BACKGROUND_LOCATION
- CAMERA
- WRITE_EXTERNAL_STORAGE

## 🌐 API Integration

### Base Configuration
```javascript
// services/api.ts
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
```

### Main Services
- `authService` - Authentication
- `tripService` - Trip management
- `keralaService` - Kerala features
- `olaMapsService` - Map operations

## 🎨 Theming

The app uses React Native Paper for UI components with custom theme:

```javascript
const theme = {
  colors: {
    primary: '#1976d2',
    accent: '#ff4081',
    // ... Kerala-specific colors
  }
};
```

## 📱 Screen Flow

```
Welcome Screen
    ├── Login/Register
    │   └── OTP Verification
    │       └── Consent Screen
    │           └── Permissions
    │               └── Home Screen
    ├── Home Screen
    │   ├── Trip Tracking
    │   ├── Weather & AI
    │   ├── SOS Emergency
    │   ├── Local Business
    │   └── Profile
```

## 🔧 Debugging

### Enable Debug Mode
```bash
# iOS
npm run ios -- --configuration Debug

# Android
npm run android -- --variant=debug
```

### React Native Debugger
1. Install React Native Debugger
2. Run the app in debug mode
3. Press Cmd+D (iOS) or Cmd+M (Android)
4. Select "Debug with Chrome"

### Common Issues

**iOS Build Failures**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
```

**Android Build Failures**
```bash
cd android
./gradlew clean
```

**Metro Bundler Issues**
```bash
npx react-native start --reset-cache
```

## 📊 Performance Optimization

- Lazy loading for screens
- Image optimization with FastImage
- Memoization for expensive computations
- Optimized list rendering with FlashList
- Background location tracking optimization

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests (Detox)
npm run e2e:ios
npm run e2e:android
```

## 📦 Dependencies

### Core
- react-native: 0.72.x
- react-navigation: 6.x
- react-native-paper: 5.x

### Maps & Location
- @ola-maps/react-native: Latest
- react-native-geolocation: 3.x
- react-native-background-geolocation: 4.x

### State Management
- React Context API
- AsyncStorage for persistence

### Kerala Features
- Weather API integration
- Emergency services
- Local business directory

## 🚀 Deployment

### Android (Play Store)
1. Update version in `android/app/build.gradle`
2. Generate signed APK/Bundle
3. Upload to Play Console

### iOS (App Store)
1. Update version in Xcode
2. Archive and validate
3. Upload to App Store Connect

### Over-the-Air Updates
Using CodePush for minor updates:
```bash
code-push release-react NatpacTravel-iOS ios -d Production
code-push release-react NatpacTravel-Android android -d Production
```

## 📄 License

Proprietary - NATPAC Kerala

## 👥 Support

For development support:
- Technical Lead: tech@natpac.kerala.gov.in
- Mobile Team: mobile-dev@natpac.kerala.gov.in