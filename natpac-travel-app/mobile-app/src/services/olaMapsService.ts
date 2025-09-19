import axios from 'axios';
import { OLA_MAPS_CONFIG, isWithinKerala } from '../config/olaMapConfig';
import { Location } from '../types/location';

interface OlaPlace {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_type: string[];
}

interface OlaRoute {
  distance: {
    value: number; // meters
    text: string;
  };
  duration: {
    value: number; // seconds
    text: string;
  };
  polyline: string;
  steps: any[];
}

class OlaMapsService {
  private apiClient = axios.create({
    baseURL: OLA_MAPS_CONFIG.baseUrl,
    headers: {
      'X-API-Key': OLA_MAPS_CONFIG.apiKey,
      'X-Project-Id': OLA_MAPS_CONFIG.projectId,
      'Content-Type': 'application/json',
    },
  });

  // Search for places in Kerala
  async searchPlaces(query: string, location?: Location): Promise<OlaPlace[]> {
    try {
      const params: any = {
        query: `${query} Kerala`,
        region: 'IN',
        bounds: `${OLA_MAPS_CONFIG.keralaBounds.south},${OLA_MAPS_CONFIG.keralaBounds.west}|${OLA_MAPS_CONFIG.keralaBounds.north},${OLA_MAPS_CONFIG.keralaBounds.east}`,
      };

      if (location && isWithinKerala(location.latitude, location.longitude)) {
        params.location = `${location.latitude},${location.longitude}`;
        params.radius = 50000; // 50km radius
      }

      const response = await this.apiClient.get('/places/search', { params });
      
      // Filter results to ensure they're within Kerala
      const places = response.data.results || [];
      return places.filter((place: OlaPlace) => 
        isWithinKerala(place.geometry.location.lat, place.geometry.location.lng)
      );
    } catch (error) {
      console.error('Ola Maps search error:', error);
      return [];
    }
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    if (!isWithinKerala(latitude, longitude)) {
      return 'Location outside Kerala';
    }

    try {
      const response = await this.apiClient.get('/geocode/reverse', {
        params: {
          latlng: `${latitude},${longitude}`,
          language: 'en',
        },
      });

      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      }
      return null;
    } catch (error) {
      console.error('Ola Maps reverse geocode error:', error);
      return null;
    }
  }

  // Get directions between two points
  async getDirections(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: string = 'driving'
  ): Promise<OlaRoute | null> {
    // Verify both points are within Kerala
    if (!isWithinKerala(origin.lat, origin.lng) || !isWithinKerala(destination.lat, destination.lng)) {
      throw new Error('Routes must be within Kerala');
    }

    try {
      const olaModeMap: Record<string, string> = {
        walk: 'walking',
        car: 'driving',
        bike: 'driving', // Ola Maps doesn't differentiate
        bus: 'transit',
        auto: 'driving',
        bicycle: 'bicycling',
      };

      const response = await this.apiClient.get('/directions', {
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          mode: olaModeMap[mode] || 'driving',
          alternatives: true,
          region: 'IN',
        },
      });

      if (response.data.routes && response.data.routes.length > 0) {
        return response.data.routes[0];
      }
      return null;
    } catch (error) {
      console.error('Ola Maps directions error:', error);
      return null;
    }
  }

  // Get nearby places (POIs)
  async getNearbyPlaces(
    location: Location,
    type: string = 'bus_station',
    radius: number = 5000
  ): Promise<OlaPlace[]> {
    if (!isWithinKerala(location.latitude, location.longitude)) {
      return [];
    }

    try {
      const response = await this.apiClient.get('/places/nearby', {
        params: {
          location: `${location.latitude},${location.longitude}`,
          radius: Math.min(radius, 50000), // Max 50km
          type,
          language: 'en',
        },
      });

      return response.data.results || [];
    } catch (error) {
      console.error('Ola Maps nearby places error:', error);
      return [];
    }
  }

  // Calculate distance matrix between multiple points
  async getDistanceMatrix(
    origins: Array<{ lat: number; lng: number }>,
    destinations: Array<{ lat: number; lng: number }>
  ): Promise<any> {
    // Verify all points are within Kerala
    const allPoints = [...origins, ...destinations];
    const allWithinKerala = allPoints.every(point => 
      isWithinKerala(point.lat, point.lng)
    );

    if (!allWithinKerala) {
      throw new Error('All points must be within Kerala');
    }

    try {
      const originStr = origins.map(o => `${o.lat},${o.lng}`).join('|');
      const destStr = destinations.map(d => `${d.lat},${d.lng}`).join('|');

      const response = await this.apiClient.get('/distancematrix', {
        params: {
          origins: originStr,
          destinations: destStr,
          mode: 'driving',
          region: 'IN',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Ola Maps distance matrix error:', error);
      return null;
    }
  }

  // Autocomplete for places in Kerala
  async autocomplete(input: string, location?: Location): Promise<any[]> {
    try {
      const params: any = {
        input: `${input} Kerala`,
        region: 'IN',
        components: 'country:IN|administrative_area:Kerala',
      };

      if (location && isWithinKerala(location.latitude, location.longitude)) {
        params.location = `${location.latitude},${location.longitude}`;
        params.radius = 50000;
      }

      const response = await this.apiClient.get('/places/autocomplete', { params });
      return response.data.predictions || [];
    } catch (error) {
      console.error('Ola Maps autocomplete error:', error);
      return [];
    }
  }

  // Get place details by place_id
  async getPlaceDetails(placeId: string): Promise<OlaPlace | null> {
    try {
      const response = await this.apiClient.get(`/places/${placeId}`, {
        params: {
          fields: 'name,formatted_address,geometry,place_type,rating,user_ratings_total',
        },
      });

      const place = response.data.result;
      
      // Verify the place is in Kerala
      if (place && isWithinKerala(place.geometry.location.lat, place.geometry.location.lng)) {
        return place;
      }
      
      return null;
    } catch (error) {
      console.error('Ola Maps place details error:', error);
      return null;
    }
  }

  // Snap to roads - useful for trip tracking
  async snapToRoads(locations: Location[]): Promise<Location[]> {
    if (locations.length === 0) return [];

    try {
      const path = locations
        .filter(loc => isWithinKerala(loc.latitude, loc.longitude))
        .map(loc => `${loc.latitude},${loc.longitude}`)
        .join('|');

      if (!path) return [];

      const response = await this.apiClient.get('/roads/snap', {
        params: {
          path,
          interpolate: true,
        },
      });

      if (response.data.snapped_points) {
        return response.data.snapped_points.map((point: any) => ({
          latitude: point.location.latitude,
          longitude: point.location.longitude,
          accuracy: 5, // High accuracy for snapped points
          altitude: null,
          speed: null,
          heading: null,
          timestamp: Date.now(),
        }));
      }

      return locations;
    } catch (error) {
      console.error('Ola Maps snap to roads error:', error);
      return locations;
    }
  }

  // Validate if a trip is within Kerala boundaries
  validateTripWithinKerala(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): { valid: boolean; message?: string } {
    const originInKerala = isWithinKerala(origin.lat, origin.lng);
    const destInKerala = isWithinKerala(destination.lat, destination.lng);

    if (!originInKerala && !destInKerala) {
      return { valid: false, message: 'Both origin and destination are outside Kerala' };
    } else if (!originInKerala) {
      return { valid: false, message: 'Origin is outside Kerala' };
    } else if (!destInKerala) {
      return { valid: false, message: 'Destination is outside Kerala' };
    }

    return { valid: true };
  }
}

export const olaMapsService = new OlaMapsService();