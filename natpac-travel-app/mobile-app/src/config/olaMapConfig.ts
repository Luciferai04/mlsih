// Ola Maps Configuration for Kerala Region
export const OLA_MAPS_CONFIG = {
  apiKey: 'TNcItHkNWaPj1UTXYU3sngxT7O29sTIQaMWzBoR4',
  projectId: 'aead3a71-418f-4680-86f3-c51729e4bc95',
  baseUrl: 'https://api.olamaps.io',
  
  // Kerala state boundaries
  keralaBounds: {
    north: 12.7936,
    south: 8.1785,
    east: 77.4119,
    west: 74.6147,
  },
  
  // Default center (Kochi)
  defaultCenter: {
    latitude: 9.9312,
    longitude: 76.2673,
  },
  
  // Major Kerala cities for quick reference
  keralaCities: {
    thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
    kochi: { lat: 9.9312, lng: 76.2673 },
    kozhikode: { lat: 11.2588, lng: 75.7804 },
    thrissur: { lat: 10.5276, lng: 76.2144 },
    kollam: { lat: 8.8932, lng: 76.6141 },
    palakkad: { lat: 10.7867, lng: 76.6548 },
    kannur: { lat: 11.8745, lng: 75.3704 },
    kottayam: { lat: 9.5916, lng: 76.5222 },
    malappuram: { lat: 11.0510, lng: 76.0711 },
    alappuzha: { lat: 9.4981, lng: 76.3388 },
  },
  
  // Map styles
  mapStyle: 'default',
  
  // Zoom levels
  zoomLevels: {
    state: 8,
    district: 10,
    city: 13,
    street: 16,
    building: 18,
  },
};

// Kerala-specific transport modes with Ola Maps icons
export const KERALA_TRANSPORT_MODES = [
  { value: 'walk', label: 'Walk', icon: 'walking', olaIcon: 'walk' },
  { value: 'bicycle', label: 'Bicycle', icon: 'bicycle', olaIcon: 'bicycle' },
  { value: 'bus', label: 'Bus', icon: 'bus', olaIcon: 'bus' },
  { value: 'car', label: 'Car', icon: 'car', olaIcon: 'car' },
  { value: 'bike', label: 'Bike', icon: 'motorbike', olaIcon: 'two-wheeler' },
  { value: 'train', label: 'Train', icon: 'train', olaIcon: 'train' },
  { value: 'auto', label: 'Auto', icon: 'rickshaw', olaIcon: 'auto-rickshaw' },
  { value: 'boat', label: 'Boat', icon: 'ferry', olaIcon: 'ferry' }, // Kerala-specific
];

// Check if coordinates are within Kerala bounds
export const isWithinKerala = (latitude: number, longitude: number): boolean => {
  const { north, south, east, west } = OLA_MAPS_CONFIG.keralaBounds;
  return latitude >= south && latitude <= north && longitude >= west && longitude <= east;
};

// Get appropriate zoom level based on distance
export const getZoomLevel = (distance: number): number => {
  if (distance < 1) return OLA_MAPS_CONFIG.zoomLevels.building;
  if (distance < 5) return OLA_MAPS_CONFIG.zoomLevels.street;
  if (distance < 20) return OLA_MAPS_CONFIG.zoomLevels.city;
  if (distance < 100) return OLA_MAPS_CONFIG.zoomLevels.district;
  return OLA_MAPS_CONFIG.zoomLevels.state;
};