import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';

class FirebaseService {
  // Trip operations
  async saveTrip(trip) {
    try {
      const docRef = await addDoc(collection(db, 'trips'), trip);
      return docRef.id;
    } catch (error) {
      console.error('Error saving trip to Firestore:', error);
      throw error;
    }
  }

  async getUserTrips(userId) {
    try {
      const q = query(
        collection(db, 'trips'),
        where('userId', '==', userId),
        orderBy('startTime', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw error;
    }
  }

  // User operations
  async saveUserProfile(userId, profile) {
    try {
      await addDoc(collection(db, 'users'), { userId, ...profile });
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }

  // Sync local trips to Firestore
  async syncTrips(localTrips, userId) {
    try {
      const syncPromises = localTrips.map(trip => 
        this.saveTrip({ ...trip, userId, synced: true })
      );
      await Promise.all(syncPromises);
      return true;
    } catch (error) {
      console.error('Error syncing trips:', error);
      return false;
    }
  }
}

export default new FirebaseService();