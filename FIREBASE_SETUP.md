````markdown name=FIREBASE_SETUP.md
# Firebase Integration Guide

This document provides a comprehensive guide for setting up and using Firebase in your King of Cut website.

## Table of Contents
1. [Firebase Setup](#firebase-setup)
2. [Authentication](#authentication)
3. [Database Structure](#database-structure)
4. [Product Storage](#product-storage)
5. [Booking Storage](#booking-storage)
6. [Admin Panel](#admin-panel)
7. [Firestore Security Rules](#firestore-security-rules)
8. [Firebase Storage Rules](#firebase-storage-rules)

## Firebase Setup

### Prerequisites
- Node.js and npm installed
- Firebase account at https://firebase.google.com

### Installation

1. Install Firebase packages:
```bash
npm install firebase
```

2. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Add project"
   - Follow the setup wizard

3. Get your Firebase credentials:
   - Go to Project Settings
   - Copy your config object values

4. Create a `.env.local` file in your project root and add:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_DATABASE_URL=your_database_url
```

5. Import and initialize Firebase in your app:
```javascript
import app from './firebase-config';
```

## Authentication

### Features
- Email/Password registration and login
- Password reset functionality
- User profile management
- Auth state persistence

### Usage Examples

**Register a new user:**
```javascript
import authService from './services/auth-service';

const user = await authService.register(email, password, displayName);
```

**Login:**
```javascript
const user = await authService.login(email, password);
```

**Logout:**
```javascript
await authService.logout();
```

**Monitor auth state:**
```javascript
authService.onAuthStateChange((user) => {
  if (user) {
    console.log('User logged in:', user);
  } else {
    console.log('User logged out');
  }
});
```

## Database Structure

### Firestore Collections

#### Users Collection
```
/users/{userId}
├── uid: string (user ID from auth)
├── email: string
├── displayName: string
├── photoURL: string
├── role: string (user, manager, admin)
├── createdAt: timestamp
└── updatedAt: timestamp
```

#### Products Collection
```
/products/{productId}
├── name: string
├── description: string
├── price: number
├── category: string
├── imageUrl: string
├── featured: boolean
├── availability: boolean
├── createdAt: timestamp
└── updatedAt: timestamp
```

#### Bookings Collection
```
/bookings/{bookingId}
├── userId: string (reference to user)
├── productId: string (reference to product)
├── bookingDate: timestamp
├── time: string (e.g., "10:00 AM")
├── duration: number (in minutes)
├── status: string (pending, confirmed, completed, cancelled)
├── notes: string
├── totalPrice: number
├── createdAt: timestamp
└── updatedAt: timestamp
```

## Product Storage

### Upload Product Image
```javascript
import storageService from './services/storage-service';

const imageUrl = await storageService.uploadProductImage(file, productId);
```

### Create Product
```javascript
import productService from './services/product-service';

const product = await productService.createProduct({
  name: 'Haircut',
  description: 'Premium haircut service',
  price: 50,
  category: 'haircut',
  imageUrl: imageUrl,
  featured: true,
  availability: true,
});
```

### Get Products
```javascript
// Get all products
const products = await productService.getAllProducts();

// Get by category
const haircuts = await productService.getProductsByCategory('haircut');

// Get featured products
const featured = await productService.getFeaturedProducts();
```

## Booking Storage

### Create Booking
```javascript
import bookingService from './services/booking-service';

const booking = await bookingService.createBooking({
  userId: currentUser.uid,
  productId: product.id,
  bookingDate: new Date('2024-06-15'),
  time: '10:00 AM',
  duration: 30,
  notes: 'Special request notes',
  totalPrice: 50,
});
```

### Get Bookings
```javascript
// Get user's bookings
const userBookings = await bookingService.getUserBookings(userId);

// Get all bookings (admin only)
const allBookings = await bookingService.getAllBookings();

// Get by status
const pendingBookings = await bookingService.getBookingsByStatus('pending');
```

### Update Booking Status
```javascript
await bookingService.updateBookingStatus(bookingId, 'confirmed');
```

## Admin Panel

### Check User Role
```javascript
import adminService from './services/admin-service';

const isAdmin = await adminService.isAdmin(userId);
const isManager = await adminService.isManager(userId);
```

### Manage Users
```javascript
// Get all users
const users = await adminService.getAllUsers();

// Promote to admin
await adminService.promoteToAdmin(userId);

// Promote to manager
await adminService.promoteToManager(userId);

// Demote to user
await adminService.demoteToUser(userId);
```

### Dashboard Statistics
```javascript
const stats = await adminService.getDashboardStats();
// Returns: { totalUsers, totalAdmins, totalManagers, regularUsers }
```

## Firestore Security Rules

Add these rules to your Firestore Rules editor:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth.uid == userId || isAdmin();
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if isAdmin() || isManager();
    }
    
    // Bookings collection
    match /bookings/{bookingId} {
      allow read: if request.auth.uid == resource.data.userId || isAdmin() || isManager();
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId || isAdmin() || isManager();
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return exists(/databases/$(database)/documents/users/$(request.auth.uid))
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Helper function to check if user is manager
    function isManager() {
      let userRole = get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
      return userRole in ['manager', 'admin'];
    }
  }
}
```

## Firebase Storage Rules

Add these rules to your Storage Rules editor:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Product images - public read, authenticated write
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && isAdmin();
    }
    
    // Profile pictures - owner or admin can write
    match /profiles/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // Booking documents - owner or admin can access
    match /bookings/{bookingId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Helper function to check admin
    function isAdmin() {
      return request.auth.token.admin == true;
    }
  }
}
```

## Next Steps

1. Enable Authentication methods in Firebase Console:
   - Email/Password
   - (Optional) Google Sign-in
   - (Optional) Facebook Sign-in

2. Create Firestore database:
   - Start in test mode initially
   - Switch to production after setting up security rules

3. Enable Cloud Storage:
   - Create a storage bucket in your project

4. Set up backup strategies:
   - Enable Firestore automatic backups
   - Create service account for backend admin operations

5. Monitor and scale:
   - Use Firebase Analytics to track usage
   - Monitor costs in Firebase Console
   - Set up billing alerts

## Troubleshooting

**Issue: "Permission denied" errors**
- Check your Firestore security rules
- Verify user authentication state
- Check user role in admin panel

**Issue: Images not uploading**
- Check Firebase Storage rules
- Verify file size limits
- Check browser console for errors

**Issue: Bookings not saving**
- Check Firestore rules for bookings collection
- Verify user is authenticated
- Check for validation errors in console

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Storage](https://firebase.google.com/docs/storage)
````
