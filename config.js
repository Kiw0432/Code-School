/**
 * config.js - Configuration and Constants
 * Update these values with your Firebase project credentials
 */

// Firebase Configuration
// ⚙️ Firebase Configuration
// ได้มาจากไฟล์เก่า ✅

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyAoNYXuqo_c7LhYtaiDA82_aic_rL-RfO8",
  authDomain:        "df23445.firebaseapp.com",
  projectId:         "df23445",
  storageBucket:     "df23445.firebasestorage.app",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abcdefghijklmnop"
};

// App Constants
const SUBJECT_COLORS = ["#e58d8d", "#e5c08d", "#89b89a", "#89aeb8", "#d9a299", "#b89c82"];

const DEFAULT_SLIDES = [
  "https://via.placeholder.com/1200x340/D9A299/FFFFFF?text=Classroom",
  "https://via.placeholder.com/1200x340/89B89A/FFFFFF?text=Learning",
  "https://via.placeholder.com/1200x340/89AEB8/FFFFFF?text=Welcome"
];

// Firestore Collection Names
const COLLECTIONS = {
  USERS: "users",
  SUBJECTS: "subjects",
  ASSIGNMENTS: "assignments",
  IMAGES: "images"
};

// Firestore Query Optimization
const QUERY_LIMITS = {
  ASSIGNMENTS: 100,
  SUBJECTS: 50,
  RECENT_DAYS: 30
};

// Image Storage Settings
const IMAGE_SETTINGS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
  CACHE_TIME: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// UI Settings
const UI_CONFIG = {
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500
};
