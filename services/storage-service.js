// Storage Service - Firebase Cloud Storage
import {
  ref,
  uploadBytes,
  downloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '../firebase-config';

export const storageService = {
  // Upload product image
  uploadProductImage: async (file, productId) => {
    try {
      const fileName = `products/${productId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, file);
      const url = await downloadURL(snapshot.ref);
      
      return url;
    } catch (error) {
      console.error('Error uploading product image:', error);
      throw error;
    }
  },

  // Upload user profile picture
  uploadProfilePicture: async (file, userId) => {
    try {
      const fileName = `profiles/${userId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, file);
      const url = await downloadURL(snapshot.ref);
      
      return url;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  },

  // Upload booking invoice/receipt
  uploadBookingDocument: async (file, bookingId) => {
    try {
      const fileName = `bookings/${bookingId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, file);
      const url = await downloadURL(snapshot.ref);
      
      return url;
    } catch (error) {
      console.error('Error uploading booking document:', error);
      throw error;
    }
  },

  // Generic file upload
  uploadFile: async (file, path) => {
    try {
      const fileName = `${path}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, file);
      const url = await downloadURL(snapshot.ref);
      
      return url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Delete file
  deleteFile: async (fileUrl) => {
    try {
      const storageRef = ref(storage, fileUrl);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  // Get file download URL
  getFileUrl: async (filePath) => {
    try {
      const storageRef = ref(storage, filePath);
      const url = await downloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }
  },
};

export default storageService;
