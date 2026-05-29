// Booking Service - Firestore
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase-config';

const BOOKINGS_COLLECTION = 'bookings';

export const bookingService = {
  // Create new booking
  createBooking: async (bookingData) => {
    try {
      const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), {
        ...bookingData,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { id: docRef.id, ...bookingData };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Get booking by ID
  getBooking: async (bookingId) => {
    try {
      const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Booking not found');
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  },

  // Get user bookings
  getUserBookings: async (userId) => {
    try {
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  },

  // Get all bookings (admin)
  getAllBookings: async () => {
    try {
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      throw error;
    }
  },

  // Get bookings by status
  getBookingsByStatus: async (status) => {
    try {
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching bookings by status:', error);
      throw error;
    }
  },

  // Update booking
  updateBooking: async (bookingId, updates) => {
    try {
      const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
      return { id: bookingId, ...updates };
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status) => {
    try {
      const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
      await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.now(),
      });
      return { id: bookingId, status };
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },

  // Delete booking
  deleteBooking: async (bookingId) => {
    try {
      await deleteDoc(doc(db, BOOKINGS_COLLECTION, bookingId));
      return bookingId;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  },

  // Get bookings for date range (admin)
  getBookingsByDateRange: async (startDate, endDate) => {
    try {
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('bookingDate', '>=', Timestamp.fromDate(new Date(startDate))),
        where('bookingDate', '<=', Timestamp.fromDate(new Date(endDate))),
        orderBy('bookingDate', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching bookings by date range:', error);
      throw error;
    }
  },
};

export default bookingService;
