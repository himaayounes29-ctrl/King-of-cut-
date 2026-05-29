// Product Service - Firestore
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
  limit,
} from 'firebase/firestore';
import { db } from '../firebase-config';

const PRODUCTS_COLLECTION = 'products';

export const productService = {
  // Get all products
  getAllProducts: async () => {
    try {
      const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get product by ID
  getProduct: async (productId) => {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, productId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Create new product
  createProduct: async (productData) => {
    try {
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { id: docRef.id, ...productData };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  updateProduct: async (productId, updates) => {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, productId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });
      return { id: productId, ...updates };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
      return productId;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Search products by category
  getProductsByCategory: async (category) => {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async (limitCount = 10) => {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('featured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },
};

export default productService;
