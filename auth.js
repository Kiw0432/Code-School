/**
 * auth.js - Authentication Management with Enhanced Security
 */

let currentUser = null;
let isAdmin = false;

/**
 * Switch between login and register tabs
 */
function switchLoginTab(tab) {
  try {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const tabs = document.querySelectorAll(".login-tab");

    if (tab === "login") {
      loginForm.style.display = "block";
      registerForm.style.display = "none";
      tabs[0].classList.add("active");
      tabs[1].classList.remove("active");
      clearLoginErrors();
    } else {
      loginForm.style.display = "none";
      registerForm.style.display = "block";
      tabs[0].classList.remove("active");
      tabs[1].classList.add("active");
      clearLoginErrors();
    }
  } catch (error) {
    console.error("Error switching login tab:", error);
    showStatus("❌ เกิดข้อผิดพลาด");
  }
}

/**
 * Show login error with proper escaping
 */
function showLoginError(message, isRegister = false) {
  try {
    const errorElement = isRegister ? 
      document.getElementById("registerError") : 
      document.getElementById("loginError");
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  } catch (error) {
    console.error("Error showing login error:", error);
  }
}

/**
 * Clear login errors
 */
function clearLoginErrors() {
  try {
    const loginError = document.getElementById("loginError");
    const registerError = document.getElementById("registerError");
    if (loginError) loginError.textContent = "";
    if (registerError) registerError.textContent = "";
  } catch (error) {
    console.error("Error clearing login errors:", error);
  }
}

/**
 * Validate email format
 */
function validateEmail(email) {
  try {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(String(email).toLowerCase());
  } catch (error) {
    console.error("Error validating email:", error);
    return false;
  }
}

/**
 * Validate password strength
 */
function validatePassword(password) {
  try {
    // Minimum 6 characters
    return password && password.length >= 6;
  } catch (error) {
    console.error("Error validating password:", error);
    return false;
  }
}

/**
 * Login with email and password
 */
async function doLogin() {
  try {
    clearLoginErrors();
    const email = document.getElementById("loginEmail")?.value?.trim() || "";
    const password = document.getElementById("loginPassword")?.value || "";

    // Validation
    if (!email) {
      showLoginError("❌ กรุณากรอกอีเมล");
      return;
    }

    if (!validateEmail(email)) {
      showLoginError("❌ รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }

    if (!password) {
      showLoginError("❌ กรุณากรอกรหัสผ่าน");
      return;
    }

    showLoading("กำลังเข้าสู่ระบบ...");

    const auth = getAuth();
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    
    if (userCredential.user) {
      currentUser = userCredential.user;
      await checkUserRole(currentUser);
      hideLoading();
    }

  } catch (error) {
    hideLoading();
    console.error("Login error:", error);
    
    // User-friendly error messages
    let message = "❌ เข้าสู่ระบบไม่สำเร็จ";
    
    if (error.code === "auth/user-not-found") {
      message = "❌ ไม่พบบัญชีผู้ใช้นี้";
    } else if (error.code === "auth/wrong-password") {
      message = "❌ รหัสผ่านไม่ถูกต้อง";
    } else if (error.code === "auth/invalid-email") {
      message = "❌ อีเมลไม่ถูกต้อง";
    } else if (error.code === "auth/too-many-requests") {
      message = "❌ พยายามหลายครั้งเกินไป กรุณาลองอีกครั้งภายหลัง";
    } else if (error.message) {
      message = "❌ " + error.message;
    }
    
    showLoginError(message);
  }
}

/**
 * Register new account
 */
async function doRegister() {
  try {
    clearLoginErrors();
    const name = document.getElementById("registerName")?.value?.trim() || "";
    const email = document.getElementById("registerEmail")?.value?.trim() || "";
    const password = document.getElementById("registerPassword")?.value || "";
    const passwordConfirm = document.getElementById("registerPasswordConfirm")?.value || "";

    // Validation
    if (!name) {
      showLoginError("❌ กรุณากรอกชื่อ", true);
      return;
    }

    if (!validateEmail(email)) {
      showLoginError("❌ รูปแบบอีเมลไม่ถูกต้อง", true);
      return;
    }

    if (!validatePassword(password)) {
      showLoginError("❌ รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", true);
      return;
    }

    if (password !== passwordConfirm) {
      showLoginError("❌ รหัสผ่านไม่ตรงกัน", true);
      return;
    }

    showLoading("กำลังสมัครสมาชิก...");

    const auth = getAuth();
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    
    if (userCredential.user) {
      currentUser = userCredential.user;
      
      // Update user profile
      await currentUser.updateProfile({
        displayName: name
      });

      // Save user info to Firestore
      await saveUserToFirestore(currentUser, name);
      
      hideLoading();
      showStatus("✅ สมัครสมาชิกสำเร็จ");
    }

  } catch (error) {
    hideLoading();
    console.error("Register error:", error);
    
    let message = "❌ สมัครสมาชิกไม่สำเร็จ";
    
    if (error.code === "auth/email-already-in-use") {
      message = "❌ อีเมลนี้ถูกใช้งานแล้ว";
    } else if (error.code === "auth/weak-password") {
      message = "❌ รหัสผ่านอ่อนแอเกินไป";
    } else if (error.message) {
      message = "❌ " + error.message;
    }
    
    showLoginError(message, true);
  }
}

/**
 * Check user role and permissions
 */
async function checkUserRole(user) {
  try {
    if (!user) {
      console.error("No user provided to checkUserRole");
      return false;
    }

    const db = getFirestore();
    
    // Use get() instead of onSnapshot to reduce reads
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(user.uid).get();

    if (!userDoc.exists) {
      // Create default user document
      await saveUserToFirestore(user, user.displayName || "Unknown");
      isAdmin = false;
    } else {
      isAdmin = userDoc.data()?.isAdmin || false;
    }

    currentUser = user;
    loginPage.classList.add("hidden");
    mainPage.classList.remove("hidden");
    
    // Load data
    await Promise.all([
      loadSubjectsData(),
      loadAssignmentsData()
    ]);

    renderDashboard();
    return true;

  } catch (error) {
    console.error("Error checking user role:", error);
    showStatus("❌ ตรวจสอบสิทธิ์ไม่สำเร็จ: " + error.message);
    return false;
  }
}

/**
 * Save user to Firestore
 */
async function saveUserToFirestore(user, displayName) {
  try {
    const db = getFirestore();
    await db.collection(COLLECTIONS.USERS).doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.displayName,
      createdAt: new Date().toISOString(),
      isAdmin: false
    }, { merge: true });

    return true;
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
    return false;
  }
}

/**
 * Logout
 */
async function doLogout() {
  try {
    if (!confirm("ออกจากระบบ?")) return;

    showLoading("กำลังออกจากระบบ...");
    
    const auth = getAuth();
    await auth.signOut();

    currentUser = null;
    isAdmin = false;

    // Clear local data
    StorageHelper.clear();

    hideLoading();
    showStatus("✅ ออกจากระบบแล้ว");

    // Reload page
    setTimeout(() => {
      window.location.reload();
    }, 500);

  } catch (error) {
    hideLoading();
    console.error("Logout error:", error);
    showStatus("❌ ออกจากระบบไม่สำเร็จ");
  }
}

/**
 * Get current user
 */
function getCurrentUser() {
  try {
    return currentUser || getAuthUser();
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Check if user is admin
 */
function isUserAdmin() {
  return isAdmin === true;
}
