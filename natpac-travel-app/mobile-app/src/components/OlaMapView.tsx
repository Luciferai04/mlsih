import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import WebView from 'react-native-webview';
import { OLA_MAPS_CONFIG, isWithinKerala } from '../config/olaMapConfig';
import { Location } from '../types/location';

interface OlaMapViewProps {
  currentLocation?: Location | null;
  tripRoute?: Location[];
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title?: string;
    type?: 'origin' | 'destination' | 'waypoint';
  }>;
  onMapReady?: () => void;
  showUserLocation?: boolean;
  followUserLocation?: boolean;
  style?: any;
}

const OlaMapView: React.FC<OlaMapViewProps> = ({
  currentLocation,
  tripRoute = [],
  markers = [],
  onMapReady,
  showUserLocation = true,
  followUserLocation = false,
  style,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Generate HTML for Ola Maps
  const generateMapHTML = () => {
    const center = currentLocation && isWithinKerala(currentLocation.latitude, currentLocation.longitude)
      ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
      : { lat: OLA_MAPS_CONFIG.defaultCenter.latitude, lng: OLA_MAPS_CONFIG.defaultCenter.longitude };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100%; height: 100vh; }
          .marker-label {
            background-color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .kerala-boundary-info {
            position: absolute;
            top: 10px;
            left: 10px;
            background: white;
            padding: 8px 12px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            font-size: 14px;
            z-index: 1000;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="kerala-boundary-info">Kerala Region Only</div>
        
        <script src="https://maps.ola.com/v1/map.js?key=${OLA_MAPS_CONFIG.apiKey}"></script>
        <script>
          let map;
          let userMarker;
          let routePolyline;
          let markers = [];
          
          // Initialize map
          function initMap() {
            map = new OlaMap({
              container: 'map',
              center: [${center.lng}, ${center.lat}],
              zoom: ${followUserLocation ? 15 : 10},
              style: '${OLA_MAPS_CONFIG.mapStyle}',
            });
            
            // Set Kerala bounds
            map.fitBounds([
              [${OLA_MAPS_CONFIG.keralaBounds.west}, ${OLA_MAPS_CONFIG.keralaBounds.south}],
              [${OLA_MAPS_CONFIG.keralaBounds.east}, ${OLA_MAPS_CONFIG.keralaBounds.north}]
            ], { padding: 20 });
            
            // Add Kerala boundary rectangle
            map.addLayer({
              id: 'kerala-boundary',
              type: 'line',
              source: {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  geometry: {
                    type: 'Polygon',
                    coordinates: [[
                      [${OLA_MAPS_CONFIG.keralaBounds.west}, ${OLA_MAPS_CONFIG.keralaBounds.south}],
                      [${OLA_MAPS_CONFIG.keralaBounds.east}, ${OLA_MAPS_CONFIG.keralaBounds.south}],
                      [${OLA_MAPS_CONFIG.keralaBounds.east}, ${OLA_MAPS_CONFIG.keralaBounds.north}],
                      [${OLA_MAPS_CONFIG.keralaBounds.west}, ${OLA_MAPS_CONFIG.keralaBounds.north}],
                      [${OLA_MAPS_CONFIG.keralaBounds.west}, ${OLA_MAPS_CONFIG.keralaBounds.south}]
                    ]]
                  }
                }
              },
              paint: {
                'line-color': '#0066CC',
                'line-width': 2,
                'line-dasharray': [2, 2]
              }
            });
            
            // Map loaded callback
            map.on('load', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapLoaded'
              }));
            });
            
            ${showUserLocation ? 'updateUserLocation();' : ''}
            ${markers.length > 0 ? 'addMarkers();' : ''}
            ${tripRoute.length > 0 ? 'drawRoute();' : ''}
          }
          
          // Update user location marker
          function updateUserLocation() {
            ${currentLocation ? `
              const lat = ${currentLocation.latitude};
              const lng = ${currentLocation.longitude};
              
              if (${isWithinKerala(currentLocation.latitude, currentLocation.longitude)}) {
                if (!userMarker) {
                  userMarker = new OlaMarker({
                    position: [lng, lat],
                    map: map,
                    icon: {
                      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiM0Mjg1RjQiIG9wYWNpdHk9IjAuMyIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI2IiBmaWxsPSIjNDI4NUY0Ii8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjMiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
                      size: [24, 24]
                    }
                  });
                } else {
                  userMarker.setPosition([lng, lat]);
                }
                
                ${followUserLocation ? 'map.setCenter([lng, lat]);' : ''}
              }
            ` : ''}
          }
          
          // Add markers
          function addMarkers() {
            const markerData = ${JSON.stringify(markers)};
            
            markerData.forEach(function(marker) {
              if (marker.latitude >= ${OLA_MAPS_CONFIG.keralaBounds.south} && 
                  marker.latitude <= ${OLA_MAPS_CONFIG.keralaBounds.north} &&
                  marker.longitude >= ${OLA_MAPS_CONFIG.keralaBounds.west} && 
                  marker.longitude <= ${OLA_MAPS_CONFIG.keralaBounds.east}) {
                
                let icon;
                switch(marker.type) {
                  case 'origin':
                    icon = '🟢';
                    break;
                  case 'destination':
                    icon = '🔴';
                    break;
                  default:
                    icon = '📍';
                }
                
                const m = new OlaMarker({
                  position: [marker.longitude, marker.latitude],
                  map: map,
                  title: marker.title || '',
                  label: icon
                });
                
                markers.push(m);
              }
            });
          }
          
          // Draw route
          function drawRoute() {
            const routeCoords = ${JSON.stringify(tripRoute.map(loc => [loc.longitude, loc.latitude]))};
            
            // Filter coordinates within Kerala
            const keralaCoords = routeCoords.filter(coord => 
              coord[1] >= ${OLA_MAPS_CONFIG.keralaBounds.south} && 
              coord[1] <= ${OLA_MAPS_CONFIG.keralaBounds.north} &&
              coord[0] >= ${OLA_MAPS_CONFIG.keralaBounds.west} && 
              coord[0] <= ${OLA_MAPS_CONFIG.keralaBounds.east}
            );
            
            if (keralaCoords.length > 1) {
              if (routePolyline) {
                map.removeLayer('route');
                map.removeSource('route');
              }
              
              map.addSource('route', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: keralaCoords
                  }
                }
              });
              
              map.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                paint: {
                  'line-color': '#4285F4',
                  'line-width': 4
                }
              });
            }
          }
          
          // Handle messages from React Native
          window.addEventListener('message', function(event) {
            const data = JSON.parse(event.data);
            
            switch(data.type) {
              case 'updateLocation':
                updateUserLocation();
                break;
              case 'updateRoute':
                drawRoute();
                break;
              case 'fitBounds':
                if (data.bounds) {
                  map.fitBounds(data.bounds, { padding: 50 });
                }
                break;
            }
          });
          
          // Initialize map
          initMap();
        </script>
      </body>
      </html>
    `;
  };

  // Handle WebView messages
  const handleMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    
    switch (data.type) {
      case 'mapLoaded':
        setIsMapLoaded(true);
        onMapReady?.();
        break;
      case 'error':
        Alert.alert('Map Error', data.message);
        break;
    }
  };

  // Update map when props change
  useEffect(() => {
    if (isMapLoaded && webViewRef.current) {
      // Update user location
      if (currentLocation) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'updateLocation',
          location: currentLocation,
        }));
      }

      // Update route
      if (tripRoute.length > 0) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'updateRoute',
          route: tripRoute,
        }));
      }
    }
  }, [currentLocation, tripRoute, isMapLoaded]);

  // Check if current location is within Kerala
  useEffect(() => {
    if (currentLocation && !isWithinKerala(currentLocation.latitude, currentLocation.longitude)) {
      Alert.alert(
        'Outside Kerala',
        'NATPAC Travel App only tracks trips within Kerala state boundaries.',
        [{ text: 'OK' }]
      );
    }
  }, [currentLocation]);

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: generateMapHTML() }}
        style={styles.webView}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4285F4" />
          </View>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});

export default OlaMapView;