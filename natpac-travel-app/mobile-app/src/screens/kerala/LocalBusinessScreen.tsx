import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Surface,
  Text,
  Card,
  Button,
  Chip,
  SearchBar,
  useTheme,
  SegmentedButtons,
  Rating,
  IconButton,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Business {
  id: string;
  name: string;
  type: 'restaurant' | 'hotel' | 'shop' | 'attraction' | 'transport';
  category: string;
  rating: number;
  reviews: number;
  distance: string;
  address: string;
  phone: string;
  description: string;
  images: string[];
  features: string[];
  priceRange: '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹';
  isVerified: boolean;
  isLocalOwned: boolean;
  specialties?: string[];
  timing: {
    open: string;
    close: string;
    isOpen: boolean;
  };
}

const LocalBusinessScreen: React.FC = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    // Mock data - replace with API call
    const mockBusinesses: Business[] = [
      {
        id: '1',
        name: 'Kerala Heritage Hotel',
        type: 'hotel',
        category: 'Heritage Stay',
        rating: 4.8,
        reviews: 342,
        distance: '2.5 km',
        address: 'Fort Kochi, Kerala',
        phone: '+91 484 2215666',
        description: 'Experience authentic Kerala hospitality in a 200-year-old heritage building with modern amenities.',
        images: ['/placeholder-hotel.jpg'],
        features: ['Wi-Fi', 'Ayurvedic Spa', 'Traditional Cuisine', 'Pool'],
        priceRange: '₹₹₹',
        isVerified: true,
        isLocalOwned: true,
        timing: {
          open: '24/7',
          close: '24/7',
          isOpen: true,
        },
      },
      {
        id: '2',
        name: 'Malabar Spice Kitchen',
        type: 'restaurant',
        category: 'Traditional Kerala',
        rating: 4.6,
        reviews: 567,
        distance: '1.2 km',
        address: 'MG Road, Kochi',
        phone: '+91 484 2371234',
        description: 'Authentic Kerala cuisine served in traditional banana leaves with live classical music.',
        images: ['/placeholder-restaurant.jpg'],
        features: ['Pure Veg Options', 'Live Music', 'AC', 'Parking'],
        priceRange: '₹₹',
        isVerified: true,
        isLocalOwned: true,
        specialties: ['Sadya', 'Karimeen Fry', 'Appam & Stew'],
        timing: {
          open: '11:00 AM',
          close: '10:30 PM',
          isOpen: true,
        },
      },
      {
        id: '3',
        name: 'Kerala Handicrafts Emporium',
        type: 'shop',
        category: 'Handicrafts',
        rating: 4.5,
        reviews: 189,
        distance: '3.0 km',
        address: 'Jew Town, Mattancherry',
        phone: '+91 484 2224507',
        description: 'Government authorized shop selling authentic Kerala handicrafts, spices, and souvenirs.',
        images: ['/placeholder-shop.jpg'],
        features: ['Fixed Prices', 'Export Quality', 'Gift Wrapping', 'Shipping'],
        priceRange: '₹₹',
        isVerified: true,
        isLocalOwned: true,
        specialties: ['Kathakali Masks', 'Coconut Shell Crafts', 'Aranmula Mirrors'],
        timing: {
          open: '10:00 AM',
          close: '7:00 PM',
          isOpen: true,
        },
      },
      {
        id: '4',
        name: 'Backwater Boat Tours',
        type: 'attraction',
        category: 'Tours',
        rating: 4.9,
        reviews: 892,
        distance: '5.5 km',
        address: 'Alappuzha Beach Road',
        phone: '+91 477 2251234',
        description: 'Traditional houseboat cruises through Kerala\'s scenic backwaters with meals included.',
        images: ['/placeholder-boat.jpg'],
        features: ['AC Boats', 'Meals Included', 'Multi-lingual Guides', 'Sunset Tours'],
        priceRange: '₹₹₹',
        isVerified: true,
        isLocalOwned: true,
        specialties: ['Day Cruises', 'Overnight Stays', 'Honeymoon Packages'],
        timing: {
          open: '6:00 AM',
          close: '6:00 PM',
          isOpen: true,
        },
      },
    ];
    
    setBusinesses(mockBusinesses);
    setFilteredBusinesses(mockBusinesses);
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [searchQuery, selectedCategory]);

  const filterBusinesses = () => {
    let filtered = businesses;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(b => b.type === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBusinesses(filtered);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'restaurant':
        return 'food';
      case 'hotel':
        return 'bed';
      case 'shop':
        return 'shopping';
      case 'attraction':
        return 'camera';
      case 'transport':
        return 'car';
      default:
        return 'store';
    }
  };

  const makeCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const openMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.google.com/?q=${encodedAddress}`;
    Linking.openURL(url);
  };

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'restaurant', label: 'Food' },
    { value: 'hotel', label: 'Stay' },
    { value: 'shop', label: 'Shop' },
    { value: 'attraction', label: 'Tours' },
  ];

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <Surface style={styles.searchHeader}>
        <SearchBar
          placeholder="Search local businesses..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {categories.map((cat) => (
            <Chip
              key={cat.value}
              selected={selectedCategory === cat.value}
              onPress={() => setSelectedCategory(cat.value)}
              style={styles.categoryChip}
            >
              {cat.label}
            </Chip>
          ))}
        </ScrollView>
      </Surface>

      {/* Business List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredBusinesses.map((business) => (
          <Card key={business.id} style={styles.businessCard}>
            <Card.Cover source={{ uri: business.images[0] }} style={styles.businessImage} />
            
            <Card.Content style={styles.businessContent}>
              <View style={styles.businessHeader}>
                <View style={styles.businessTitle}>
                  <Icon 
                    name={getTypeIcon(business.type)} 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                  <Text style={styles.businessName}>{business.name}</Text>
                  {business.isVerified && (
                    <Icon name="check-decagram" size={16} color="#4CAF50" />
                  )}
                </View>
                {business.isLocalOwned && (
                  <Chip style={styles.localChip} textStyle={styles.localChipText}>
                    Local Owned
                  </Chip>
                )}
              </View>

              <Text style={styles.businessCategory}>{business.category}</Text>
              
              <View style={styles.businessInfo}>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={16} color="#FFC107" />
                  <Text style={styles.rating}>{business.rating}</Text>
                  <Text style={styles.reviews}>({business.reviews} reviews)</Text>
                </View>
                <Text style={styles.priceRange}>{business.priceRange}</Text>
                <Text style={styles.distance}>{business.distance}</Text>
              </View>

              <Text style={styles.description} numberOfLines={2}>
                {business.description}
              </Text>

              {business.specialties && (
                <View style={styles.specialties}>
                  <Text style={styles.specialtiesTitle}>Specialties:</Text>
                  <Text style={styles.specialtiesList}>
                    {business.specialties.join(' • ')}
                  </Text>
                </View>
              )}

              <View style={styles.features}>
                {business.features.slice(0, 3).map((feature, index) => (
                  <Chip key={index} style={styles.featureChip} textStyle={styles.featureChipText}>
                    {feature}
                  </Chip>
                ))}
                {business.features.length > 3 && (
                  <Text style={styles.moreFeatures}>
                    +{business.features.length - 3} more
                  </Text>
                )}
              </View>

              <View style={styles.timingRow}>
                <Icon 
                  name="clock-outline" 
                  size={16} 
                  color={business.timing.isOpen ? '#4CAF50' : '#F44336'} 
                />
                <Text style={[
                  styles.timing,
                  { color: business.timing.isOpen ? '#4CAF50' : '#F44336' }
                ]}>
                  {business.timing.isOpen ? 'Open' : 'Closed'} • {business.timing.open} - {business.timing.close}
                </Text>
              </View>

              <View style={styles.actions}>
                <Button
                  mode="outlined"
                  onPress={() => makeCall(business.phone)}
                  icon="phone"
                  compact
                  style={styles.actionButton}
                >
                  Call
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => openMaps(business.address)}
                  icon="map-marker"
                  compact
                  style={styles.actionButton}
                >
                  Directions
                </Button>
                <Button
                  mode="contained"
                  onPress={() => Alert.alert('Details', `View details for ${business.name}`)}
                  compact
                  style={styles.actionButton}
                >
                  View Details
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}

        {filteredBusinesses.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="store-search" size={64} color={theme.colors.onSurfaceDisabled} />
            <Text style={styles.emptyText}>No businesses found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchHeader: {
    backgroundColor: 'white',
    paddingBottom: 10,
    elevation: 2,
  },
  searchBar: {
    margin: 10,
    marginBottom: 0,
  },
  categoryScroll: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryChip: {
    marginHorizontal: 5,
  },
  businessCard: {
    margin: 10,
    marginBottom: 5,
  },
  businessImage: {
    height: 180,
  },
  businessContent: {
    paddingTop: 10,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  businessTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  localChip: {
    backgroundColor: '#E8F5E9',
  },
  localChipText: {
    fontSize: 10,
    color: '#2E7D32',
  },
  businessCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviews: {
    fontSize: 12,
    color: '#666',
  },
  priceRange: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  distance: {
    fontSize: 12,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  specialties: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  specialtiesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 5,
  },
  specialtiesList: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 8,
  },
  featureChip: {
    backgroundColor: '#F5F5F5',
    height: 24,
  },
  featureChipText: {
    fontSize: 10,
  },
  moreFeatures: {
    fontSize: 10,
    color: '#666',
    alignSelf: 'center',
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
  },
  timing: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});

export default LocalBusinessScreen;