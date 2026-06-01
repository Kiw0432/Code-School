# 🚀 Quick Setup Guide

## 📦 Files Structure

```
outputs/
├── index.html                 ← Main HTML (open this in browser)
├── OPTIMIZATION_REPORT.md     ← Full documentation
├── js/
│   ├── config.js             ← Firebase configuration (EDIT THIS!)
│   ├── firebase-init.js      ← Firebase initialization
│   ├── utils.js              ← Helper functions
│   ├── auth.js               ← Login & security
│   ├── storage.js            ← Image upload (Firebase Storage)
│   ├── firestore.js          ← Database optimization
│   ├── ui.js                 ← UI rendering
│   └── main.js               ← App startup
└── README-TH.md              ← Thai documentation
```

---

## ⚡ Step 1: Firebase Setup (IMPORTANT!)

### 1.1 Create Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com)
- Click "Create Project"
- Name: `classroom-m5`
- Enable Google Analytics (optional)

### 1.2 Get Configuration
- Go to Project Settings (⚙️)
- Copy your config under "Web" section
- Should look like:
```javascript
{
  apiKey: "AIzaSyD...",
  authDomain: "classroom-m5.firebaseapp.com",
  projectId: "classroom-m5",
  storageBucket: "classroom-m5.appspot.com",
  messagingSenderId: "123456...",
  appId: "1:123456...:web:abcdef..."
}
```

### 1.3 Update config.js
1. Open `js/config.js`
2. Replace values in `FIREBASE_CONFIG`:
```javascript
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",           // ← Replace
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```
3. Save file

---

## 🔐 Step 2: Enable Firebase Services

### 2.1 Authentication
- Go to Firebase Console → Authentication
- Click "Get Started"
- Enable "Email/Password"
- Enable "Google" (optional)

### 2.2 Firestore Database
- Go to Firebase Console → Firestore Database
- Click "Create Database"
- Start in **Test Mode** (for testing)
- Choose location (e.g., `asia-southeast1`)

### 2.3 Firebase Storage
- Go to Firebase Console → Storage
- Click "Get Started"
- Accept default settings
- Finish

---

## 🔒 Step 3: Security Rules (Important!)

### Firestore Rules:
```
Copy this to Firestore Rules tab:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    match /subjects/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /assignments/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage Rules:
```
Copy this to Storage Rules tab:

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🎯 Step 4: Test Application

### 4.1 Open in Browser
1. Open `index.html` in web browser
2. Should see splash screen then login page
3. If you see errors → Check browser console (F12)

### 4.2 Test Login/Register
1. Click "สมัครสมาชิก" (Register)
2. Enter:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `123456`
3. Click "สมัครสมาชิก"
4. Should see dashboard after login

### 4.3 Test Features
- ✅ Try adding a subject (⚙️ → 📚 จัดการวิชา)
- ✅ Try uploading image (⚙️ → 🖼️ เพิ่มรูปแบนเนอร์)
- ✅ Try adding assignment
- ✅ Check calendar
- ✅ Try logout

---

## 🐛 Troubleshooting

### Problem: "Firebase โหลดไม่สำเร็จ"
**Solution:**
1. Check console (F12 → Console tab)
2. Make sure config.js has correct values
3. Check internet connection
4. Reload page

### Problem: Can't register
**Solution:**
1. Check email format is correct
2. Check password is at least 6 characters
3. Check in Firestore that user document was created
4. Check console for specific error

### Problem: Can't upload image
**Solution:**
1. Check file is JPEG/PNG/WebP
2. Check file size < 5MB
3. Check you're logged in as admin
4. Check Storage rules are correct

### Problem: Assignments not saving
**Solution:**
1. Check you're logged in
2. Check Firestore rules are correct
3. Check Firestore Database is enabled
4. Check console for error details

---

## 📊 Monitor Firebase Usage

### Check Firestore Reads/Writes
1. Go to Firebase Console
2. Go to Firestore Database
3. Click "Usage" tab
4. See daily read/write count

### Tips to reduce reads:
- System automatically caches for 10 minutes
- Data loads once then uses cache
- Use local data as backup
- Limit daily usage

---

## 📱 Deploy to Web

### Option 1: Firebase Hosting (FREE)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize project
firebase init hosting

# Deploy
firebase deploy
```

### Option 2: Other Hosting
- Netlify
- Vercel
- GitHub Pages
- Your own server

Just upload all files and open `index.html`

---

## ✅ Checklist Before Production

- [ ] Update `FIREBASE_CONFIG` in `js/config.js`
- [ ] Enable Email/Password authentication
- [ ] Create Firestore database
- [ ] Enable Firebase Storage
- [ ] Set Firestore security rules
- [ ] Set Storage security rules
- [ ] Test login/register
- [ ] Test image upload
- [ ] Test all features
- [ ] Deploy to production

---

## 📞 Need Help?

### Check These:
1. Browser console (F12 → Console) for errors
2. Firebase Console → Firestore → Rules for syntax
3. Firebase Console → Storage → Rules for syntax
4. Check file permissions
5. Check internet connection

### Common Issues:
- **CORS Error**: Check origin in Firebase
- **Auth Error**: Check email/password rules
- **Storage Error**: Check file type & size
- **Firestore Error**: Check rules & authentication

---

## 🎓 Learning Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

**Last Updated:** 2024
**Version:** 2.0 (Optimized & Modular)
**Status:** Ready for Production ✅
