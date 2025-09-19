"""
NATPAC Travel Survey - Flask API
Smart India Hackathon 2025
Main API Application with all endpoints
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_socketio import SocketIO, emit
from datetime import datetime, timedelta
import os
import json
import numpy as np
from dotenv import load_dotenv
import logging
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import uuid

# Import custom modules
from ml_service import MLService
from services import GPSService, DatabaseService, KeralaService, AnalyticsService

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'sih-2025-natpac-secret-key')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize extensions
CORS(app, resources={r"/api/*": {"origins": "*"}})
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*")
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Initialize services
ml_service = MLService()
gps_service = GPSService()
db_service = DatabaseService()
kerala_service = KeralaService()
analytics_service = AnalyticsService()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create upload folder
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# =====================
# Health Check Endpoints
# =====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'ml': ml_service.is_ready(),
            'gps': gps_service.is_ready(),
            'database': db_service.is_connected(),
            'kerala': kerala_service.is_ready()
        }
    }), 200

@app.route('/api/version', methods=['GET'])
def version():
    """Get API version"""
    return jsonify({
        'version': '1.0.0',
        'name': 'NATPAC Travel Survey API',
        'sih': '2025'
    }), 200

# =====================
# Authentication Endpoints
# =====================

@app.route('/api/auth/register', methods=['POST'])
@limiter.limit("5 per hour")
def register():
    """Register new user"""
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['email', 'password', 'name', 'phone']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if user exists
        if db_service.user_exists(data['email']):
            return jsonify({'error': 'User already exists'}), 409
        
        # Create user
        user_id = str(uuid.uuid4())
        hashed_password = generate_password_hash(data['password'])
        
        user = {
            'id': user_id,
            'email': data['email'],
            'password': hashed_password,
            'name': data['name'],
            'phone': data['phone'],
            'created_at': datetime.now().isoformat(),
            'preferences': {
                'language': data.get('language', 'en'),
                'notifications': True
            }
        }
        
        db_service.create_user(user)
        
        # Generate token
        access_token = create_access_token(identity=user_id)
        
        return jsonify({
            'message': 'User registered successfully',
            'user_id': user_id,
            'access_token': access_token
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("10 per hour")
def login():
    """User login"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        user = db_service.get_user_by_email(email)
        
        if not user or not check_password_hash(user['password'], password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        access_token = create_access_token(identity=user['id'])
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email']
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500

# =====================
# ML/AI Endpoints
# =====================

@app.route('/api/ml/detect-trip', methods=['POST'])
@jwt_required()
def detect_trip():
    """Detect if a trip has started or ended"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        
        # Extract GPS and sensor data
        gps_data = data.get('gps', {})
        accelerometer = data.get('accelerometer', {})
        
        # Run trip detection
        result = ml_service.detect_trip({
            'lat': gps_data.get('latitude'),
            'lng': gps_data.get('longitude'),
            'speed': gps_data.get('speed', 0),
            'accuracy': gps_data.get('accuracy', 10),
            'accelerometer': accelerometer,
            'timestamp': datetime.now().isoformat()
        })
        
        # Log trip event if detected
        if result['trip_detected']:
            db_service.log_trip_event(user_id, result)
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Trip detection error: {str(e)}")
        return jsonify({'error': 'Trip detection failed'}), 500

@app.route('/api/ml/classify-mode', methods=['POST'])
@jwt_required()
def classify_mode():
    """Classify transportation mode"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        
        # Extract features
        features = {
            'speed': data.get('speed', 0),
            'acceleration': data.get('acceleration', 0),
            'gps_points': data.get('gps_points', []),
            'stop_frequency': data.get('stop_frequency', 0)
        }
        
        # Run classification
        result = ml_service.classify_transport_mode(features)
        
        # Store classification
        db_service.store_mode_classification(user_id, result)
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Mode classification error: {str(e)}")
        return jsonify({'error': 'Mode classification failed'}), 500

@app.route('/api/ml/predict-purpose', methods=['POST'])
@jwt_required()
def predict_purpose():
    """Predict trip purpose"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        
        # Extract context
        context = {
            'origin': data.get('origin'),
            'destination': data.get('destination'),
            'time': data.get('time'),
            'day_of_week': data.get('day_of_week'),
            'duration': data.get('duration'),
            'mode': data.get('mode')
        }
        
        # Run prediction
        result = ml_service.predict_trip_purpose(context)
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Purpose prediction error: {str(e)}")
        return jsonify({'error': 'Purpose prediction failed'}), 500

@app.route('/api/ml/detect-companions', methods=['POST'])
@jwt_required()
def detect_companions():
    """Detect travel companions"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        
        # Extract data
        bluetooth_devices = data.get('bluetooth_devices', [])
        trip_id = data.get('trip_id')
        
        # Run companion detection
        result = ml_service.detect_companions({
            'bluetooth_devices': bluetooth_devices,
            'trip_id': trip_id,
            'user_id': user_id
        })
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Companion detection error: {str(e)}")
        return jsonify({'error': 'Companion detection failed'}), 500

@app.route('/api/ml/predict-route', methods=['POST'])
@jwt_required()
def predict_route():
    """Predict optimal route"""
    try:
        data = request.get_json()
        
        # Extract parameters
        origin = data.get('origin')
        destination = data.get('destination')
        preferences = data.get('preferences', {})
        
        # Run route prediction
        result = ml_service.predict_optimal_route({
            'origin': origin,
            'destination': destination,
            'avoid_traffic': preferences.get('avoid_traffic', True),
            'scenic_route': preferences.get('scenic_route', False),
            'avoid_tolls': preferences.get('avoid_tolls', False)
        })
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Route prediction error: {str(e)}")
        return jsonify({'error': 'Route prediction failed'}), 500

# =====================
# GPS & Location Endpoints
# =====================

@app.route('/api/gps/track', methods=['POST'])
@jwt_required()
def track_gps():
    """Track GPS location"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        
        # Process GPS data
        location = gps_service.process_location({
            'latitude': data.get('latitude'),
            'longitude': data.get('longitude'),
            'altitude': data.get('altitude'),
            'speed': data.get('speed'),
            'accuracy': data.get('accuracy'),
            'heading': data.get('heading'),
            'timestamp': data.get('timestamp', datetime.now().isoformat())
        })
        
        # Store location
        db_service.store_location(user_id, location)
        
        # Emit real-time update
        socketio.emit('location_update', {
            'user_id': user_id,
            'location': location
        })
        
        return jsonify({
            'status': 'tracked',
            'location': location
        }), 200
        
    except Exception as e:
        logger.error(f"GPS tracking error: {str(e)}")
        return jsonify({'error': 'GPS tracking failed'}), 500

@app.route('/api/gps/analytics', methods=['GET'])
@jwt_required()
def gps_analytics():
    """Get GPS analytics for a trip"""
    try:
        user_id = get_jwt_identity()
        trip_id = request.args.get('trip_id')
        
        if not trip_id:
            # Get latest trip
            trip_id = db_service.get_latest_trip_id(user_id)
        
        # Get GPS data
        gps_data = db_service.get_trip_gps_data(trip_id)
        
        # Calculate analytics
        analytics = gps_service.calculate_analytics(gps_data)
        
        return jsonify(analytics), 200
        
    except Exception as e:
        logger.error(f"GPS analytics error: {str(e)}")
        return jsonify({'error': 'GPS analytics failed'}), 500

@app.route('/api/gps/geofence', methods=['POST'])
@jwt_required()
def check_geofence():
    """Check if location is within geofence"""
    try:
        data = request.get_json()
        
        location = {
            'lat': data.get('latitude'),
            'lng': data.get('longitude')
        }
        
        geofences = data.get('geofences', [])
        
        results = []
        for fence in geofences:
            is_inside = gps_service.check_geofence(location, fence)
            results.append({
                'fence_id': fence.get('id'),
                'name': fence.get('name'),
                'is_inside': is_inside
            })
        
        return jsonify({'results': results}), 200
        
    except Exception as e:
        logger.error(f"Geofence check error: {str(e)}")
        return jsonify({'error': 'Geofence check failed'}), 500

# =====================
# Trip Management Endpoints
# =====================

@app.route('/api/trips', methods=['GET'])
@jwt_required()
def get_trips():
    """Get user trips"""
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        
        trips = db_service.get_user_trips(user_id, page, limit)
        
        return jsonify({
            'trips': trips,
            'page': page,
            'limit': limit
        }), 200
        
    except Exception as e:
        logger.error(f"Get trips error: {str(e)}")
        return jsonify({'error': 'Failed to fetch trips'}), 500

@app.route('/api/trips', methods=['POST'])
@jwt_required()
def create_trip():
    """Start a new trip"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        
        trip = {
            'id': str(uuid.uuid4()),
            'user_id': user_id,
            'start_location': data.get('start_location'),
            'start_time': datetime.now().isoformat(),
            'mode': data.get('mode', 'unknown'),
            'purpose': data.get('purpose', 'unknown'),
            'companions': data.get('companions', []),
            'status': 'active'
        }
        
        db_service.create_trip(trip)
        
        return jsonify({
            'message': 'Trip created',
            'trip': trip
        }), 201
        
    except Exception as e:
        logger.error(f"Create trip error: {str(e)}")
        return jsonify({'error': 'Failed to create trip'}), 500

@app.route('/api/trips/<trip_id>', methods=['PUT'])
@jwt_required()
def update_trip(trip_id):
    """Update trip details"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        
        # Verify ownership
        trip = db_service.get_trip(trip_id)
        if not trip or trip['user_id'] != user_id:
            return jsonify({'error': 'Trip not found'}), 404
        
        # Update trip
        updates = {
            'end_location': data.get('end_location'),
            'end_time': data.get('end_time', datetime.now().isoformat()),
            'distance': data.get('distance'),
            'duration': data.get('duration'),
            'mode': data.get('mode', trip['mode']),
            'purpose': data.get('purpose', trip['purpose']),
            'status': data.get('status', 'completed')
        }
        
        db_service.update_trip(trip_id, updates)
        
        return jsonify({
            'message': 'Trip updated',
            'trip_id': trip_id
        }), 200
        
    except Exception as e:
        logger.error(f"Update trip error: {str(e)}")
        return jsonify({'error': 'Failed to update trip'}), 500

# =====================
# Kerala-Specific Endpoints
# =====================

@app.route('/api/kerala/districts', methods=['GET'])
def get_districts():
    """Get Kerala districts"""
    try:
        districts = kerala_service.get_districts()
        return jsonify({'districts': districts}), 200
    except Exception as e:
        logger.error(f"Get districts error: {str(e)}")
        return jsonify({'error': 'Failed to fetch districts'}), 500

@app.route('/api/kerala/tourism', methods=['GET'])
def get_tourism_spots():
    """Get nearby tourism spots"""
    try:
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        radius = request.args.get('radius', 10, type=int)
        
        if not lat or not lng:
            return jsonify({'error': 'Latitude and longitude required'}), 400
        
        spots = kerala_service.get_tourism_spots(lat, lng, radius)
        
        return jsonify({'spots': spots}), 200
        
    except Exception as e:
        logger.error(f"Get tourism spots error: {str(e)}")
        return jsonify({'error': 'Failed to fetch tourism spots'}), 500

@app.route('/api/kerala/weather', methods=['GET'])
def get_weather():
    """Get Kerala weather with monsoon info"""
    try:
        district = request.args.get('district', 'Kochi')
        
        weather = kerala_service.get_weather(district)
        monsoon_status = kerala_service.get_monsoon_status()
        
        return jsonify({
            'weather': weather,
            'monsoon': monsoon_status
        }), 200
        
    except Exception as e:
        logger.error(f"Get weather error: {str(e)}")
        return jsonify({'error': 'Failed to fetch weather'}), 500

@app.route('/api/kerala/festivals', methods=['GET'])
def get_festivals():
    """Get upcoming Kerala festivals"""
    try:
        festivals = kerala_service.get_upcoming_festivals()
        return jsonify({'festivals': festivals}), 200
    except Exception as e:
        logger.error(f"Get festivals error: {str(e)}")
        return jsonify({'error': 'Failed to fetch festivals'}), 500

@app.route('/api/kerala/translate', methods=['POST'])
def translate_text():
    """Translate text to/from Malayalam"""
    try:
        data = request.get_json()
        text = data.get('text')
        target_lang = data.get('target', 'ml')  # ml for Malayalam
        
        if not text:
            return jsonify({'error': 'Text required'}), 400
        
        translated = kerala_service.translate(text, target_lang)
        
        return jsonify({
            'original': text,
            'translated': translated,
            'target_language': target_lang
        }), 200
        
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        return jsonify({'error': 'Translation failed'}), 500

# =====================
# Analytics Endpoints
# =====================

@app.route('/api/analytics/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    """Get user dashboard analytics"""
    try:
        user_id = get_jwt_identity()
        period = request.args.get('period', 'week')  # week, month, year
        
        analytics = analytics_service.get_user_analytics(user_id, period)
        
        return jsonify(analytics), 200
        
    except Exception as e:
        logger.error(f"Dashboard error: {str(e)}")
        return jsonify({'error': 'Failed to fetch dashboard'}), 500

@app.route('/api/analytics/export', methods=['GET'])
@jwt_required()
def export_data():
    """Export user data"""
    try:
        user_id = get_jwt_identity()
        format_type = request.args.get('format', 'json')  # json, csv, excel
        
        if format_type == 'json':
            data = analytics_service.export_user_data(user_id)
            return jsonify(data), 200
        elif format_type == 'csv':
            file_path = analytics_service.export_to_csv(user_id)
            return send_file(file_path, as_attachment=True)
        elif format_type == 'excel':
            file_path = analytics_service.export_to_excel(user_id)
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'error': 'Invalid format'}), 400
            
    except Exception as e:
        logger.error(f"Export error: {str(e)}")
        return jsonify({'error': 'Export failed'}), 500

@app.route('/api/analytics/insights', methods=['GET'])
@jwt_required()
def get_insights():
    """Get AI-generated insights"""
    try:
        user_id = get_jwt_identity()
        
        insights = analytics_service.generate_insights(user_id)
        
        return jsonify({'insights': insights}), 200
        
    except Exception as e:
        logger.error(f"Insights error: {str(e)}")
        return jsonify({'error': 'Failed to generate insights'}), 500

# =====================
# Gamification Endpoints
# =====================

@app.route('/api/gamification/points', methods=['GET'])
@jwt_required()
def get_points():
    """Get user points and level"""
    try:
        user_id = get_jwt_identity()
        
        gamification = db_service.get_user_gamification(user_id)
        
        return jsonify(gamification), 200
        
    except Exception as e:
        logger.error(f"Get points error: {str(e)}")
        return jsonify({'error': 'Failed to fetch points'}), 500

@app.route('/api/gamification/badges', methods=['GET'])
@jwt_required()
def get_badges():
    """Get user badges"""
    try:
        user_id = get_jwt_identity()
        
        badges = db_service.get_user_badges(user_id)
        
        return jsonify({'badges': badges}), 200
        
    except Exception as e:
        logger.error(f"Get badges error: {str(e)}")
        return jsonify({'error': 'Failed to fetch badges'}), 500

@app.route('/api/gamification/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get leaderboard"""
    try:
        period = request.args.get('period', 'week')
        limit = request.args.get('limit', 10, type=int)
        
        leaderboard = db_service.get_leaderboard(period, limit)
        
        return jsonify({'leaderboard': leaderboard}), 200
        
    except Exception as e:
        logger.error(f"Leaderboard error: {str(e)}")
        return jsonify({'error': 'Failed to fetch leaderboard'}), 500

# =====================
# WebSocket Events
# =====================

@socketio.on('connect')
def handle_connect():
    """Handle WebSocket connection"""
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'message': 'Connected to NATPAC Travel Survey'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnection"""
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('join_trip')
def handle_join_trip(data):
    """Join trip room for real-time updates"""
    trip_id = data.get('trip_id')
    if trip_id:
        socketio.server.enter_room(request.sid, trip_id)
        emit('joined_trip', {'trip_id': trip_id})

@socketio.on('leave_trip')
def handle_leave_trip(data):
    """Leave trip room"""
    trip_id = data.get('trip_id')
    if trip_id:
        socketio.server.leave_room(request.sid, trip_id)
        emit('left_trip', {'trip_id': trip_id})

@socketio.on('location_update')
def handle_location_update(data):
    """Broadcast location update to trip room"""
    trip_id = data.get('trip_id')
    if trip_id:
        emit('location_broadcast', data, room=trip_id, include_self=False)

# =====================
# Error Handlers
# =====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(429)
def rate_limit_exceeded(error):
    return jsonify({'error': 'Rate limit exceeded'}), 429

# =====================
# Main Entry Point
# =====================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    
    logger.info(f"Starting NATPAC Travel Survey API on port {port}")
    logger.info(f"Debug mode: {debug}")
    
    # Run with SocketIO
    socketio.run(app, host='0.0.0.0', port=port, debug=debug)