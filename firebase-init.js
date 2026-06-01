/**
 * firebase-init.js - Firebase Initialization & Management
 */

let firebaseApp;
let firebaseAuth;
let firebaseDb;
let firebaseStorage;

/**
 * Initialize Firebase with error handling
 */
function initFirebase() {
  try {
    if (window._firebaseLoadError) {
      console.error("Firebase libraries failed to load");
      return false;
    }

    if (!firebase || !firebase.initializeApp) {
      console.error("Firebase SDK not available");
      return false;
    }

    // Initialize Firebase App
    firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
    
    // Get references
    firebaseAuth = firebase.auth();
    firebaseDb = firebase.firestore();
    firebaseStorage = firebase.storage();

    // Configure Firestore settings for better performance
    firebaseDb.settings({
      cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });

    console.log("✅ Firebase initialized successfully");
    return true;

  } catch (error) {
    console.error("❌ Firebase initialization error:", error.message);
    showStatus("❌ Firebase โหลดไม่สำเร็จ: " + error.message);
    return false;
  }
}

/**
 * Get auth user safely
 */
function getAuthUser() {
  try {
    return firebaseAuth?.currentUser || null;
  } catch (error) {
    console.error("Error getting auth user:", error);
    return null;
  }
}

/**
 * Get Firestore instance with error checking
 */
function getFirestore() {
  if (!firebaseDb) {
    console.error("Firestore not initialized");
    throw new Error("Firestore not initialized");
  }
  return firebaseDb;
}

/**
 * Get Storage instance with error checking
 */
function getStorage() {
  if (!firebaseStorage) {
    console.error("Storage not initialized");
    throw new Error("Storage not initialized");
  }
  return firebaseStorage;
}

/**
 * Get Auth instance with error checking
 */
function getAuth() {
  if (!firebaseAuth) {
    console.error("Auth not initialized");
    throw new Error("Auth not initialized");
  }
  return firebaseAuth;
}

/**
 * Disconnect Firestore to clear cache
 */
function disconnectFirebase() {
  try {
    if (firebaseDb) {
      firebaseDb.terminate();
    }
    console.log("Firebase disconnected");
  } catch (error) {
    console.error("Error disconnecting Firebase:", error);
  }
}
