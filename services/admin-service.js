// Admin Service - User role management and dashboard
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase-config';

const USERS_COLLECTION = 'users';
const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
};

export const adminService = {
  // Create user record
  createUserRecord: async (userId, userData) => {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      await setDoc(docRef, {
        uid: userId,
        ...userData,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { id: userId, ...userData };
    } catch (error) {
      console.error('Error creating user record:', error);
      throw error;
    }
  },

  // Get user by ID
  getUser: async (userId) => {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Get all users
  getAllUsers: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Promote user to admin
  promoteToAdmin: async (userId) => {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(docRef, {
        role: ROLES.ADMIN,
        updatedAt: new Date(),
      });
      return { id: userId, role: ROLES.ADMIN };
    } catch (error) {
      console.error('Error promoting user:', error);
      throw error;
    }
  },

  // Promote user to manager
  promoteToManager: async (userId) => {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(docRef, {
        role: ROLES.MANAGER,
        updatedAt: new Date(),
      });
      return { id: userId, role: ROLES.MANAGER };
    } catch (error) {
      console.error('Error promoting user:', error);
      throw error;
    }
  },

  // Demote user to regular user
  demoteToUser: async (userId) => {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(docRef, {
        role: ROLES.USER,
        updatedAt: new Date(),
      });
      return { id: userId, role: ROLES.USER };
    } catch (error) {
      console.error('Error demoting user:', error);
      throw error;
    }
  },

  // Get users by role
  getUsersByRole: async (role) => {
    try {
      const q = query(collection(db, USERS_COLLECTION), where('role', '==', role));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      await deleteDoc(doc(db, USERS_COLLECTION, userId));
      return userId;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Check if user is admin
  isAdmin: async (userId) => {
    try {
      const user = await adminService.getUser(userId);
      return user?.role === ROLES.ADMIN;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  // Check if user is manager
  isManager: async (userId) => {
    try {
      const user = await adminService.getUser(userId);
      return user?.role === ROLES.MANAGER || user?.role === ROLES.ADMIN;
    } catch (error) {
      console.error('Error checking manager status:', error);
      return false;
    }
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    try {
      const users = await adminService.getAllUsers();
      const admins = await adminService.getUsersByRole(ROLES.ADMIN);
      const managers = await adminService.getUsersByRole(ROLES.MANAGER);
      
      return {
        totalUsers: users.length,
        totalAdmins: admins.length,
        totalManagers: managers.length,
        regularUsers: users.length - admins.length - managers.length,
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  },
};

export default adminService;
