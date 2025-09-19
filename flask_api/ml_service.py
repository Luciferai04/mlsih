"""
ML Service Module
Handles all machine learning operations
"""

import numpy as np
import pandas as pd
from datetime import datetime
import json
import pickle
import os
from typing import Dict, List, Any, Tuple
import logging

# Configure logging
logger = logging.getLogger(__name__)

class MLService:
    def __init__(self):
        """Initialize ML Service"""
        self.models = {}
        self.load_models()
        logger.info("ML Service initialized")
    
    def load_models(self):
        """Load pre-trained models"""
        # In production, these would load actual trained models
        # For now, we'll use simulated models
        self.models = {
            'trip_detector': self._create_trip_detector(),
            'mode_classifier': self._create_mode_classifier(),
            'purpose_predictor': self._create_purpose_predictor(),
            'companion_detector': self._create_companion_detector(),
            'route_predictor': self._create_route_predictor()
        }
    
    def _create_trip_detector(self):
        """Create trip detection model"""
        # Simulated model - in production, use actual trained model
        return {
            'type': 'lstm_random_forest',
            'accuracy': 0.942,
            'threshold': 0.7
        }
    
    def _create_mode_classifier(self):
        """Create transportation mode classifier"""
        return {
            'type': 'cnn_xgboost',
            'accuracy': 0.918,
            'classes': ['walk', 'bicycle', 'car', 'bus', 'train', 'auto', 'boat', 'airplane']
        }
    
    def _create_purpose_predictor(self):
        """Create trip purpose predictor"""
        return {
            'type': 'transformer',
            'accuracy': 0.885,
            'purposes': ['work', 'education', 'shopping', 'leisure', 'healthcare', 
                        'social', 'religious', 'tourism', 'business', 'home', 'other']
        }
    
    def _create_companion_detector(self):
        """Create companion detection model"""
        return {
            'type': 'graph_neural_network',
            'accuracy': 0.893,
            'max_companions': 10
        }
    
    def _create_route_predictor(self):
        """Create route prediction model"""
        return {
            'type': 'reinforcement_learning',
            'accuracy': 0.876
        }
    
    def is_ready(self) -> bool:
        """Check if ML service is ready"""
        return len(self.models) > 0
    
    def detect_trip(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detect if a trip has started or ended
        
        Args:
            data: GPS and sensor data
        
        Returns:
            Trip detection result
        """
        try:
            # Extract features
            speed = data.get('speed', 0)
            lat = data.get('lat')
            lng = data.get('lng')
            accuracy = data.get('accuracy', 10)
            accelerometer = data.get('accelerometer', {})
            
            # Simple trip detection logic
            # In production, use actual ML model
            is_moving = speed > 2  # km/h threshold
            good_accuracy = accuracy < 20  # meters
            
            # Check accelerometer if available
            if accelerometer:
                acc_magnitude = np.sqrt(
                    accelerometer.get('x', 0)**2 + 
                    accelerometer.get('y', 0)**2 + 
                    accelerometer.get('z', 0)**2
                )
                is_accelerating = acc_magnitude > 0.5
            else:
                is_accelerating = False
            
            trip_detected = is_moving and good_accuracy
            confidence = 0.95 if trip_detected else 0.1
            
            # Determine event type
            if trip_detected:
                event_type = 'trip_start' if not hasattr(self, 'last_trip_state') else 'trip_continue'
            else:
                event_type = 'trip_end' if hasattr(self, 'last_trip_state') and self.last_trip_state else 'idle'
            
            self.last_trip_state = trip_detected
            
            return {
                'trip_detected': trip_detected,
                'event_type': event_type,
                'confidence': confidence,
                'speed': speed,
                'location': {'lat': lat, 'lng': lng},
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Trip detection error: {str(e)}")
            raise
    
    def classify_transport_mode(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classify transportation mode
        
        Args:
            features: Speed, acceleration, GPS patterns
        
        Returns:
            Mode classification result
        """
        try:
            speed = features.get('speed', 0)
            acceleration = features.get('acceleration', 0)
            stop_frequency = features.get('stop_frequency', 0)
            
            # Simple rule-based classification
            # In production, use actual ML model
            modes = self.models['mode_classifier']['classes']
            probabilities = {}
            
            if speed < 5:
                probabilities = {'walk': 0.8, 'bicycle': 0.1, 'car': 0.1}
            elif speed < 15:
                probabilities = {'bicycle': 0.6, 'walk': 0.2, 'auto': 0.2}
            elif speed < 40:
                probabilities = {'auto': 0.4, 'car': 0.3, 'bus': 0.3}
            elif speed < 80:
                probabilities = {'car': 0.5, 'bus': 0.3, 'train': 0.2}
            else:
                probabilities = {'train': 0.6, 'car': 0.3, 'airplane': 0.1}
            
            # Adjust for stop frequency
            if stop_frequency > 5:
                probabilities['bus'] = probabilities.get('bus', 0) + 0.2
                probabilities['auto'] = probabilities.get('auto', 0) + 0.1
            
            # Normalize probabilities
            total = sum(probabilities.values())
            probabilities = {k: v/total for k, v in probabilities.items()}
            
            # Get top mode
            mode = max(probabilities, key=probabilities.get)
            confidence = probabilities[mode]
            
            # Add Kerala-specific modes
            if 'boat' not in probabilities:
                probabilities['boat'] = 0.0
            
            return {
                'mode': mode,
                'confidence': confidence,
                'probabilities': probabilities,
                'features_used': ['speed', 'acceleration', 'stop_frequency'],
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Mode classification error: {str(e)}")
            raise
    
    def predict_trip_purpose(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict trip purpose
        
        Args:
            context: Origin, destination, time, mode
        
        Returns:
            Purpose prediction result
        """
        try:
            time = context.get('time', datetime.now().hour)
            day_of_week = context.get('day_of_week', datetime.now().weekday())
            mode = context.get('mode', 'unknown')
            duration = context.get('duration', 0)
            
            purposes = self.models['purpose_predictor']['purposes']
            probabilities = {}
            
            # Time-based predictions
            if 6 <= time <= 10:
                probabilities = {'work': 0.4, 'education': 0.3, 'business': 0.2, 'other': 0.1}
            elif 10 <= time <= 12:
                probabilities = {'shopping': 0.3, 'business': 0.3, 'healthcare': 0.2, 'other': 0.2}
            elif 12 <= time <= 14:
                probabilities = {'home': 0.3, 'leisure': 0.3, 'social': 0.2, 'other': 0.2}
            elif 14 <= time <= 17:
                probabilities = {'business': 0.3, 'shopping': 0.2, 'education': 0.2, 'other': 0.3}
            elif 17 <= time <= 20:
                probabilities = {'home': 0.5, 'leisure': 0.2, 'shopping': 0.2, 'other': 0.1}
            else:
                probabilities = {'home': 0.4, 'leisure': 0.3, 'social': 0.2, 'other': 0.1}
            
            # Weekend adjustments
            if day_of_week >= 5:  # Saturday or Sunday
                probabilities['leisure'] = probabilities.get('leisure', 0) + 0.2
                probabilities['tourism'] = probabilities.get('tourism', 0) + 0.15
                probabilities['religious'] = probabilities.get('religious', 0) + 0.1
                probabilities['work'] = probabilities.get('work', 0) * 0.3
                probabilities['education'] = probabilities.get('education', 0) * 0.1
            
            # Kerala-specific: Religious activities on specific days
            if day_of_week == 4:  # Friday
                probabilities['religious'] = probabilities.get('religious', 0) + 0.1
            
            # Normalize
            total = sum(probabilities.values())
            probabilities = {k: v/total for k, v in probabilities.items()}
            
            # Get top purpose
            purpose = max(probabilities, key=probabilities.get)
            confidence = probabilities[purpose]
            
            return {
                'purpose': purpose,
                'confidence': confidence,
                'probabilities': probabilities,
                'context_factors': {
                    'time_of_day': time,
                    'day_of_week': day_of_week,
                    'mode': mode,
                    'duration': duration
                },
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Purpose prediction error: {str(e)}")
            raise
    
    def detect_companions(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detect travel companions
        
        Args:
            data: Bluetooth devices, trip data
        
        Returns:
            Companion detection result
        """
        try:
            bluetooth_devices = data.get('bluetooth_devices', [])
            trip_id = data.get('trip_id')
            user_id = data.get('user_id')
            
            # Analyze Bluetooth signals
            companions = []
            for device in bluetooth_devices:
                rssi = device.get('rssi', -100)  # Signal strength
                name = device.get('name', 'Unknown')
                mac = device.get('mac', '')
                
                # Strong signal indicates proximity
                if rssi > -70:  # Close proximity
                    confidence = min(1.0, (100 + rssi) / 30)
                    companions.append({
                        'device_id': mac,
                        'name': name,
                        'confidence': confidence,
                        'rssi': rssi,
                        'proximity': 'close' if rssi > -60 else 'near'
                    })
            
            # Sort by confidence
            companions = sorted(companions, key=lambda x: x['confidence'], reverse=True)
            
            # Limit to max companions
            max_companions = self.models['companion_detector']['max_companions']
            companions = companions[:max_companions]
            
            return {
                'companions_detected': len(companions) > 0,
                'companion_count': len(companions),
                'companions': companions,
                'trip_id': trip_id,
                'analysis_method': 'bluetooth_proximity',
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Companion detection error: {str(e)}")
            raise
    
    def predict_optimal_route(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict optimal route
        
        Args:
            params: Origin, destination, preferences
        
        Returns:
            Route prediction
        """
        try:
            origin = params.get('origin')
            destination = params.get('destination')
            avoid_traffic = params.get('avoid_traffic', True)
            scenic_route = params.get('scenic_route', False)
            avoid_tolls = params.get('avoid_tolls', False)
            
            # Simulated route prediction
            # In production, integrate with mapping services and ML models
            
            routes = []
            
            # Generate multiple route options
            route_types = ['fastest', 'shortest', 'scenic']
            
            for route_type in route_types:
                if route_type == 'scenic' and not scenic_route:
                    continue
                
                # Simulated route
                base_distance = 25.0  # km
                base_duration = 45  # minutes
                
                if route_type == 'fastest':
                    distance = base_distance * 1.1
                    duration = base_duration * 0.9
                    via = ['Highway']
                elif route_type == 'shortest':
                    distance = base_distance * 0.95
                    duration = base_duration * 1.1
                    via = ['City roads']
                else:  # scenic
                    distance = base_distance * 1.3
                    duration = base_duration * 1.5
                    via = ['Coastal road', 'Hill station']
                
                routes.append({
                    'type': route_type,
                    'distance': round(distance, 1),
                    'duration': round(duration),
                    'via': via,
                    'traffic_level': 'moderate' if avoid_traffic else 'heavy',
                    'has_tolls': not avoid_tolls and route_type == 'fastest',
                    'scenic_score': 8 if route_type == 'scenic' else 3,
                    'eco_score': 85 if route_type == 'shortest' else 70
                })
            
            # Select optimal route based on preferences
            if scenic_route:
                optimal = next((r for r in routes if r['type'] == 'scenic'), routes[0])
            elif avoid_traffic:
                optimal = min(routes, key=lambda x: x['duration'])
            else:
                optimal = routes[0]
            
            return {
                'optimal_route': optimal,
                'alternative_routes': [r for r in routes if r != optimal],
                'origin': origin,
                'destination': destination,
                'preferences_applied': {
                    'avoid_traffic': avoid_traffic,
                    'scenic_route': scenic_route,
                    'avoid_tolls': avoid_tolls
                },
                'kerala_highlights': [
                    'Athirappilly Waterfalls viewpoint',
                    'Spice plantation visit possible',
                    'Traditional Kerala restaurant en route'
                ],
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Route prediction error: {str(e)}")
            raise
    
    def analyze_travel_pattern(self, user_id: str, trips: List[Dict]) -> Dict[str, Any]:
        """
        Analyze user travel patterns
        
        Args:
            user_id: User ID
            trips: List of user trips
        
        Returns:
            Travel pattern analysis
        """
        try:
            if not trips:
                return {'error': 'No trips to analyze'}
            
            # Analyze patterns
            modes = [t.get('mode', 'unknown') for t in trips]
            purposes = [t.get('purpose', 'unknown') for t in trips]
            distances = [t.get('distance', 0) for t in trips]
            durations = [t.get('duration', 0) for t in trips]
            
            # Calculate statistics
            from collections import Counter
            mode_dist = dict(Counter(modes))
            purpose_dist = dict(Counter(purposes))
            
            patterns = {
                'user_id': user_id,
                'total_trips': len(trips),
                'total_distance': sum(distances),
                'total_duration': sum(durations),
                'avg_distance': np.mean(distances) if distances else 0,
                'avg_duration': np.mean(durations) if durations else 0,
                'preferred_mode': max(mode_dist, key=mode_dist.get) if mode_dist else 'unknown',
                'mode_distribution': mode_dist,
                'primary_purpose': max(purpose_dist, key=purpose_dist.get) if purpose_dist else 'unknown',
                'purpose_distribution': purpose_dist,
                'travel_frequency': len(trips) / 30,  # trips per day (assuming 30 days)
                'insights': self._generate_pattern_insights(mode_dist, purpose_dist, distances)
            }
            
            return patterns
            
        except Exception as e:
            logger.error(f"Pattern analysis error: {str(e)}")
            raise
    
    def _generate_pattern_insights(self, modes: Dict, purposes: Dict, distances: List) -> List[str]:
        """Generate insights from travel patterns"""
        insights = []
        
        # Mode insights
        if modes:
            top_mode = max(modes, key=modes.get)
            if top_mode == 'car':
                insights.append("You prefer personal vehicle for most trips")
            elif top_mode in ['bus', 'train']:
                insights.append("Great job using public transport!")
            elif top_mode == 'walk':
                insights.append("You're an active traveler - keep walking!")
        
        # Purpose insights
        if purposes:
            top_purpose = max(purposes, key=purposes.get)
            if top_purpose == 'work':
                insights.append("Most of your trips are work-related")
            elif top_purpose == 'leisure':
                insights.append("You travel frequently for leisure activities")
        
        # Distance insights
        if distances:
            avg_dist = np.mean(distances)
            if avg_dist < 5:
                insights.append("You mostly take short trips within your locality")
            elif avg_dist > 50:
                insights.append("You're a long-distance traveler")
        
        return insights