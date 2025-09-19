"""
Consolidated Services Module
All supporting services for the Flask API
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import numpy as np
from haversine import haversine, Unit
from pymongo import MongoClient
import pandas as pd

logger = logging.getLogger(__name__)

# =====================
# GPS Service
# =====================

class GPSService:
    """GPS and location services"""
    
    def __init__(self):
        self.last_location = None
        logger.info("GPS Service initialized")
    
    def is_ready(self) -> bool:
        return True
    
    def process_location(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process GPS location data"""
        location = {
            'lat': data.get('latitude'),
            'lng': data.get('longitude'),
            'altitude': data.get('altitude', 0),
            'speed': data.get('speed', 0),
            'accuracy': data.get('accuracy', 10),
            'heading': data.get('heading', 0),
            'timestamp': data.get('timestamp', datetime.now().isoformat()),
            'processed_at': datetime.now().isoformat()
        }
        
        # Calculate distance from last location
        if self.last_location:
            distance = self.calculate_distance(
                self.last_location['lat'], self.last_location['lng'],
                location['lat'], location['lng']
            )
            location['distance_from_last'] = distance
        
        self.last_location = location
        return location
    
    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two GPS points in meters"""
        return haversine((lat1, lon1), (lat2, lon2), unit=Unit.METERS)
    
    def calculate_analytics(self, gps_data: List[Dict]) -> Dict[str, Any]:
        """Calculate GPS analytics from trip data"""
        if not gps_data:
            return {'error': 'No GPS data'}
        
        speeds = [p.get('speed', 0) for p in gps_data]
        distances = []
        
        for i in range(1, len(gps_data)):
            dist = self.calculate_distance(
                gps_data[i-1]['lat'], gps_data[i-1]['lng'],
                gps_data[i]['lat'], gps_data[i]['lng']
            )
            distances.append(dist)
        
        return {
            'total_distance': sum(distances) / 1000,  # km
            'avg_speed': np.mean(speeds) if speeds else 0,
            'max_speed': max(speeds) if speeds else 0,
            'min_speed': min(speeds) if speeds else 0,
            'points_analyzed': len(gps_data),
            'stop_count': sum(1 for s in speeds if s < 2),
            'moving_time': sum(1 for s in speeds if s >= 2) / 60  # minutes
        }
    
    def check_geofence(self, location: Dict, fence: Dict) -> bool:
        """Check if location is within geofence"""
        center_lat = fence.get('center_lat')
        center_lng = fence.get('center_lng')
        radius = fence.get('radius', 100)  # meters
        
        distance = self.calculate_distance(
            location['lat'], location['lng'],
            center_lat, center_lng
        )
        
        return distance <= radius

# =====================
# Database Service
# =====================

class DatabaseService:
    """Database operations service"""
    
    def __init__(self):
        self.mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/natpac')
        self.client = None
        self.db = None
        self.connect()
    
    def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = MongoClient(self.mongo_uri)
            self.db = self.client.natpac
            logger.info("Database connected")
        except Exception as e:
            logger.error(f"Database connection error: {str(e)}")
    
    def is_connected(self) -> bool:
        """Check database connection"""
        try:
            self.client.server_info()
            return True
        except:
            return False
    
    def user_exists(self, email: str) -> bool:
        """Check if user exists"""
        return self.db.users.find_one({'email': email}) is not None
    
    def create_user(self, user: Dict) -> str:
        """Create new user"""
        result = self.db.users.insert_one(user)
        return str(result.inserted_id)
    
    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email"""
        return self.db.users.find_one({'email': email})
    
    def create_trip(self, trip: Dict) -> str:
        """Create new trip"""
        result = self.db.trips.insert_one(trip)
        return str(result.inserted_id)
    
    def get_trip(self, trip_id: str) -> Optional[Dict]:
        """Get trip by ID"""
        return self.db.trips.find_one({'id': trip_id})
    
    def update_trip(self, trip_id: str, updates: Dict):
        """Update trip"""
        self.db.trips.update_one({'id': trip_id}, {'$set': updates})
    
    def get_user_trips(self, user_id: str, page: int = 1, limit: int = 10) -> List[Dict]:
        """Get user trips with pagination"""
        skip = (page - 1) * limit
        trips = self.db.trips.find({'user_id': user_id}).skip(skip).limit(limit)
        return list(trips)
    
    def get_latest_trip_id(self, user_id: str) -> Optional[str]:
        """Get latest trip ID for user"""
        trip = self.db.trips.find_one(
            {'user_id': user_id},
            sort=[('start_time', -1)]
        )
        return trip['id'] if trip else None
    
    def store_location(self, user_id: str, location: Dict):
        """Store GPS location"""
        location['user_id'] = user_id
        self.db.locations.insert_one(location)
    
    def get_trip_gps_data(self, trip_id: str) -> List[Dict]:
        """Get GPS data for a trip"""
        # In production, would join with trips collection
        return list(self.db.locations.find({'trip_id': trip_id}))
    
    def log_trip_event(self, user_id: str, event: Dict):
        """Log trip event"""
        event['user_id'] = user_id
        self.db.trip_events.insert_one(event)
    
    def store_mode_classification(self, user_id: str, classification: Dict):
        """Store mode classification"""
        classification['user_id'] = user_id
        self.db.mode_classifications.insert_one(classification)
    
    def get_user_gamification(self, user_id: str) -> Dict:
        """Get user gamification data"""
        data = self.db.gamification.find_one({'user_id': user_id})
        if not data:
            # Initialize gamification
            data = {
                'user_id': user_id,
                'points': 0,
                'level': 1,
                'badges': [],
                'achievements': []
            }
            self.db.gamification.insert_one(data)
        return data
    
    def get_user_badges(self, user_id: str) -> List[Dict]:
        """Get user badges"""
        gamification = self.get_user_gamification(user_id)
        return gamification.get('badges', [])
    
    def get_leaderboard(self, period: str = 'week', limit: int = 10) -> List[Dict]:
        """Get leaderboard"""
        # In production, would filter by period
        leaderboard = self.db.gamification.find().sort('points', -1).limit(limit)
        return list(leaderboard)

# =====================
# Kerala Service
# =====================

class KeralaService:
    """Kerala-specific services"""
    
    def __init__(self):
        self.districts = [
            'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
            'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
            'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
        ]
        
        self.festivals = [
            {'name': 'Onam', 'month': 8, 'type': 'harvest'},
            {'name': 'Vishu', 'month': 4, 'type': 'new_year'},
            {'name': 'Thrissur Pooram', 'month': 4, 'type': 'temple'},
            {'name': 'Theyyam', 'month': 12, 'type': 'ritual'},
            {'name': 'Nehru Trophy Boat Race', 'month': 8, 'type': 'sport'}
        ]
        
        self.tourism_spots = [
            {'name': 'Munnar', 'type': 'hill_station', 'lat': 10.0889, 'lng': 77.0595},
            {'name': 'Alleppey', 'type': 'backwaters', 'lat': 9.4981, 'lng': 76.3388},
            {'name': 'Kovalam', 'type': 'beach', 'lat': 8.4004, 'lng': 76.9787},
            {'name': 'Thekkady', 'type': 'wildlife', 'lat': 9.6050, 'lng': 77.1640},
            {'name': 'Wayanad', 'type': 'nature', 'lat': 11.6854, 'lng': 76.1320}
        ]
        
        logger.info("Kerala Service initialized")
    
    def is_ready(self) -> bool:
        return True
    
    def get_districts(self) -> List[str]:
        """Get list of Kerala districts"""
        return self.districts
    
    def get_tourism_spots(self, lat: float, lng: float, radius: int = 10) -> List[Dict]:
        """Get nearby tourism spots"""
        nearby_spots = []
        gps_service = GPSService()
        
        for spot in self.tourism_spots:
            distance = gps_service.calculate_distance(lat, lng, spot['lat'], spot['lng'])
            if distance <= radius * 1000:  # Convert km to meters
                spot['distance'] = round(distance / 1000, 2)
                nearby_spots.append(spot)
        
        return sorted(nearby_spots, key=lambda x: x['distance'])
    
    def get_weather(self, district: str) -> Dict[str, Any]:
        """Get weather for district (simulated)"""
        # In production, integrate with weather API
        return {
            'district': district,
            'temperature': 28 + np.random.randint(-5, 5),
            'humidity': 75 + np.random.randint(-10, 10),
            'conditions': np.random.choice(['sunny', 'cloudy', 'rainy']),
            'monsoon_active': datetime.now().month in [6, 7, 8, 9]
        }
    
    def get_monsoon_status(self) -> Dict[str, Any]:
        """Get monsoon status"""
        current_month = datetime.now().month
        
        if current_month in [6, 7]:
            return {
                'status': 'southwest_monsoon',
                'intensity': 'heavy',
                'advisory': 'Carry umbrellas, expect delays'
            }
        elif current_month in [10, 11]:
            return {
                'status': 'northeast_monsoon',
                'intensity': 'moderate',
                'advisory': 'Occasional showers expected'
            }
        else:
            return {
                'status': 'no_monsoon',
                'intensity': 'none',
                'advisory': 'Normal weather conditions'
            }
    
    def get_upcoming_festivals(self) -> List[Dict]:
        """Get upcoming Kerala festivals"""
        current_month = datetime.now().month
        upcoming = []
        
        for festival in self.festivals:
            if festival['month'] >= current_month:
                festival['days_until'] = (festival['month'] - current_month) * 30
                upcoming.append(festival)
        
        return upcoming
    
    def translate(self, text: str, target_lang: str) -> str:
        """Translate text (simulated)"""
        # In production, use actual translation API
        translations = {
            'ml': {
                'hello': 'നമസ്കാരം',
                'thank you': 'നന്ദി',
                'trip': 'യാത്ര',
                'bus': 'ബസ്',
                'train': 'ട്രെയിൻ'
            },
            'en': {
                'നമസ്കാരം': 'hello',
                'നന്ദി': 'thank you',
                'യാത്ര': 'trip'
            }
        }
        
        if target_lang in translations and text.lower() in translations[target_lang]:
            return translations[target_lang][text.lower()]
        
        return f"[{target_lang}] {text}"  # Placeholder translation

# =====================
# Analytics Service
# =====================

class AnalyticsService:
    """Analytics and reporting service"""
    
    def __init__(self):
        self.db_service = DatabaseService()
        logger.info("Analytics Service initialized")
    
    def get_user_analytics(self, user_id: str, period: str = 'week') -> Dict[str, Any]:
        """Get user analytics for dashboard"""
        trips = self.db_service.get_user_trips(user_id, page=1, limit=100)
        
        if not trips:
            return {
                'total_trips': 0,
                'total_distance': 0,
                'total_duration': 0,
                'favorite_mode': 'none',
                'favorite_purpose': 'none'
            }
        
        # Calculate analytics
        total_distance = sum(t.get('distance', 0) for t in trips)
        total_duration = sum(t.get('duration', 0) for t in trips)
        modes = [t.get('mode', 'unknown') for t in trips]
        purposes = [t.get('purpose', 'unknown') for t in trips]
        
        from collections import Counter
        mode_counts = Counter(modes)
        purpose_counts = Counter(purposes)
        
        return {
            'total_trips': len(trips),
            'total_distance': round(total_distance, 2),
            'total_duration': round(total_duration, 2),
            'avg_distance': round(total_distance / len(trips), 2),
            'avg_duration': round(total_duration / len(trips), 2),
            'favorite_mode': mode_counts.most_common(1)[0][0] if mode_counts else 'none',
            'favorite_purpose': purpose_counts.most_common(1)[0][0] if purpose_counts else 'none',
            'mode_distribution': dict(mode_counts),
            'purpose_distribution': dict(purpose_counts),
            'period': period,
            'generated_at': datetime.now().isoformat()
        }
    
    def export_user_data(self, user_id: str) -> Dict[str, Any]:
        """Export user data as JSON"""
        trips = self.db_service.get_user_trips(user_id, page=1, limit=1000)
        analytics = self.get_user_analytics(user_id)
        
        return {
            'user_id': user_id,
            'export_date': datetime.now().isoformat(),
            'analytics': analytics,
            'trips': trips,
            'total_trips': len(trips)
        }
    
    def export_to_csv(self, user_id: str) -> str:
        """Export user data to CSV"""
        trips = self.db_service.get_user_trips(user_id, page=1, limit=1000)
        
        # Convert to DataFrame
        df = pd.DataFrame(trips)
        
        # Save to CSV
        filename = f"exports/user_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        os.makedirs('exports', exist_ok=True)
        df.to_csv(filename, index=False)
        
        return filename
    
    def export_to_excel(self, user_id: str) -> str:
        """Export user data to Excel"""
        trips = self.db_service.get_user_trips(user_id, page=1, limit=1000)
        analytics = self.get_user_analytics(user_id)
        
        # Create Excel file with multiple sheets
        filename = f"exports/user_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        os.makedirs('exports', exist_ok=True)
        
        with pd.ExcelWriter(filename, engine='xlsxwriter') as writer:
            # Trips sheet
            df_trips = pd.DataFrame(trips)
            df_trips.to_excel(writer, sheet_name='Trips', index=False)
            
            # Analytics sheet
            df_analytics = pd.DataFrame([analytics])
            df_analytics.to_excel(writer, sheet_name='Analytics', index=False)
        
        return filename
    
    def generate_insights(self, user_id: str) -> List[Dict[str, str]]:
        """Generate AI-powered insights"""
        analytics = self.get_user_analytics(user_id)
        insights = []
        
        # Trip frequency insight
        if analytics['total_trips'] > 20:
            insights.append({
                'type': 'frequency',
                'title': 'Frequent Traveler',
                'message': f"You've completed {analytics['total_trips']} trips. You're an active traveler!",
                'icon': 'trending_up'
            })
        
        # Mode preference insight
        if analytics.get('favorite_mode'):
            insights.append({
                'type': 'mode',
                'title': 'Transportation Preference',
                'message': f"You prefer traveling by {analytics['favorite_mode']}",
                'icon': 'directions'
            })
        
        # Distance insight
        if analytics['total_distance'] > 500:
            insights.append({
                'type': 'distance',
                'title': 'Long Distance Traveler',
                'message': f"You've covered {analytics['total_distance']} km. That's impressive!",
                'icon': 'explore'
            })
        
        # Eco-friendly insight
        mode_dist = analytics.get('mode_distribution', {})
        public_transport = mode_dist.get('bus', 0) + mode_dist.get('train', 0)
        if public_transport > analytics['total_trips'] * 0.3:
            insights.append({
                'type': 'eco',
                'title': 'Eco-Friendly Traveler',
                'message': 'You frequently use public transport. Great for the environment!',
                'icon': 'eco'
            })
        
        return insights