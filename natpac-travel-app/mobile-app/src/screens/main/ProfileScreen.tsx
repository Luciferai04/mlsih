import React, { useContext, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import {
  Surface,
  Text,
  List,
  Divider,
  Button,
  Avatar,
  useTheme,
  Card,
  IconButton,
  Switch,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { TripContext } from '../../context/TripContext';

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { user, logout } = useContext(AuthContext);
  const { trips } = useContext(TripContext);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    emergencyContact: user?.emergencyContact || '',
  });

  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [dataSaving, setDataSaving] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.navigate('Welcome');
          },
        },
      ]
    );
  };

  const handleUpdateProfile = () => {
    // Update profile API call
    Alert.alert('Success', 'Profile updated successfully');
    setShowEditModal(false);
  };

  const getTotalDistance = () => {
    // Calculate from trips
    return '2,456';
  };

  const getAverageTripDuration = () => {
    return '45 min';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Surface style={styles.header}>
        <Avatar.Text
          size={80}
          label={user?.name?.substring(0, 2).toUpperCase() || 'US'}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Text style={styles.userPhone}>{user?.phone}</Text>
        
        <Button
          mode="outlined"
          onPress={() => setShowEditModal(true)}
          style={styles.editButton}
          icon="pencil"
        >
          Edit Profile
        </Button>
      </Surface>

      {/* Stats Card */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={styles.statsTitle}>Travel Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="map-marker-path" size={24} color={theme.colors.primary} />
              <Text style={styles.statValue}>{trips?.length || 0}</Text>
              <Text style={styles.statLabel}>Total Trips</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="road-variant" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>{getTotalDistance()}</Text>
              <Text style={styles.statLabel}>Kilometers</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="clock-outline" size={24} color="#FF9800" />
              <Text style={styles.statValue}>{getAverageTripDuration()}</Text>
              <Text style={styles.statLabel}>Avg Duration</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <List.Item
          title="Notifications"
          description="Receive trip and weather alerts"
          left={(props) => <Icon {...props} name="bell" size={24} />}
          right={() => (
            <Switch
              value={notifications}
              onValueChange={setNotifications}
            />
          )}
        />
        <Divider />
        
        <List.Item
          title="Location Sharing"
          description="Share location with emergency contacts"
          left={(props) => <Icon {...props} name="crosshairs-gps" size={24} />}
          right={() => (
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
            />
          )}
        />
        <Divider />
        
        <List.Item
          title="Data Saver Mode"
          description="Reduce mobile data usage"
          left={(props) => <Icon {...props} name="database-outline" size={24} />}
          right={() => (
            <Switch
              value={dataSaving}
              onValueChange={setDataSaving}
            />
          )}
        />
      </View>

      {/* Quick Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Links</Text>
        
        <TouchableOpacity onPress={() => navigation.navigate('TripHistory')}>
          <List.Item
            title="Trip History"
            description="View all your past trips"
            left={(props) => <Icon {...props} name="history" size={24} />}
            right={(props) => <Icon {...props} name="chevron-right" size={24} />}
          />
        </TouchableOpacity>
        <Divider />
        
        <TouchableOpacity onPress={() => navigation.navigate('EmergencyContacts')}>
          <List.Item
            title="Emergency Contacts"
            description="Manage emergency contacts"
            left={(props) => <Icon {...props} name="account-multiple" size={24} />}
            right={(props) => <Icon {...props} name="chevron-right" size={24} />}
          />
        </TouchableOpacity>
        <Divider />
        
        <TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
          <List.Item
            title="Privacy & Security"
            description="Manage your data privacy"
            left={(props) => <Icon {...props} name="shield-lock" size={24} />}
            right={(props) => <Icon {...props} name="chevron-right" size={24} />}
          />
        </TouchableOpacity>
        <Divider />
        
        <TouchableOpacity onPress={() => navigation.navigate('About')}>
          <List.Item
            title="About NATPAC"
            description="Learn more about the app"
            left={(props) => <Icon {...props} name="information" size={24} />}
            right={(props) => <Icon {...props} name="chevron-right" size={24} />}
          />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor={theme.colors.error}
        icon="logout"
      >
        Logout
      </Button>

      {/* Edit Profile Modal */}
      <Portal>
        <Modal
          visible={showEditModal}
          onDismiss={() => setShowEditModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Edit Profile</Text>
          
          <TextInput
            label="Name"
            value={editData.name}
            onChangeText={(text) => setEditData({ ...editData, name: text })}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Phone Number"
            value={editData.phone}
            onChangeText={(text) => setEditData({ ...editData, phone: text })}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />
          
          <TextInput
            label="Emergency Contact"
            value={editData.emergencyContact}
            onChangeText={(text) => setEditData({ ...editData, emergencyContact: text })}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />
          
          <View style={styles.modalActions}>
            <Button onPress={() => setShowEditModal(false)} mode="outlined">
              Cancel
            </Button>
            <Button onPress={handleUpdateProfile} mode="contained">
              Update
            </Button>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 2,
  },
  avatar: {
    backgroundColor: '#1976d2',
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  editButton: {
    marginTop: 8,
  },
  statsCard: {
    margin: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#666',
  },
  logoutButton: {
    margin: 16,
    marginBottom: 32,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
});

export default ProfileScreen;