/**
 * main.js - Main Application Initialization
 */

/**
 * Initialize app on window load
 */
window.addEventListener("load", async function() {
  try {
    // Show splash screen messages
    const splashMsgs = [
      "กำลังเชื่อมต่อ Firebase...",
      "ตรวจสอบสิทธิ์ผู้ใช้...",
      "โหลดข้อมูลห้องเรียน...",
      "เตรียมระบบ..."
    ];

    let msgIdx = 0;
    const splashMsg = document.getElementById("splashMsg");
    const msgInterval = setInterval(() => {
      if (splashMsg) {
        msgIdx = (msgIdx + 1) % splashMsgs.length;
        splashMsg.textContent = splashMsgs[msgIdx];
      }
    }, 900);

    function hideSplash() {
      try {
        clearInterval(msgInterval);
        const splashPage = document.getElementById("splashPage");
        if (splashPage && !splashPage.classList.contains("fade-out")) {
          setTimeout(() => {
            splashPage.classList.add("fade-out");
            setTimeout(() => {
              splashPage.style.display = "none";
            }, 500);
          }, 400);
        }
      } catch (error) {
        console.error("Error hiding splash:", error);
      }
    }

    // Set today's date
    try {
      const todayDateEl = document.getElementById("todayDate");
      if (todayDateEl) {
        todayDateEl.innerHTML = "📅 " + getThaiDate();
      }
    } catch (error) {
      console.error("Error setting today date:", error);
    }

    // Load local data first
    try {
      loadAssignData();
    } catch (error) {
      console.error("Error loading local data:", error);
    }

    // Initialize Firebase
    if (!initFirebase()) {
      hideSplash();
      showStatus("❌ Firebase โหลดไม่สำเร็จ โปรดรีเฟรช");
      return;
    }

    // Handle auth state changes
    let authHandled = false;

    try {
      const auth = getAuth();
      auth.onAuthStateChanged(async (user) => {
        try {
          const loginPage = document.getElementById("loginPage");
          const mainPage = document.getElementById("mainPage");

          if (user) {
            // User is logged in
            const alreadyLoggedIn = loginPage && loginPage.classList.contains("hidden");
            if (alreadyLoggedIn) {
              hideSplash();
              return; // Already on dashboard
            }

            if (authHandled) {
              hideSplash();
              return;
            }

            authHandled = true;
            showLoading("กำลังโหลดข้อมูล...");

            // Check user role and load data
            const success = await checkUserRole(user);
            
            if (success) {
              hideLoading();
              hideSplash();
            } else {
              hideLoading();
              showStatus("❌ โหลดข้อมูลไม่สำเร็จ");
              hideSplash();
            }

          } else {
            // User is logged out
            authHandled = false;
            if (mainPage) mainPage.classList.add("hidden");
            if (loginPage) loginPage.classList.remove("hidden");
            hideSplash();
          }

        } catch (error) {
          console.error("Error in auth state change:", error);
          hideLoading();
          hideSplash();
          showStatus("❌ ข้อผิดพลาด: " + error.message);
        }
      });

    } catch (error) {
      console.error("Error setting up auth listener:", error);
      hideSplash();
      showStatus("❌ ตั้งค่า Auth ไม่สำเร็จ");
      return;
    }

    // Handle viewport changes for responsive UI
    try {
      const baseVH = window.innerHeight;

      function updateVH() {
        const h = window.visualViewport ? 
          window.visualViewport.height : 
          window.innerHeight;
        
        document.documentElement.style.setProperty("--vh", (h * 0.01) + "px");
        
        // Detect keyboard open
        const isKeyboardOpen = (baseVH - h) > 150;
        document.body.classList.toggle("keyboard-open", isKeyboardOpen);
      }

      updateVH();
      window.addEventListener("resize", updateVH);
      
      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", updateVH);
        window.visualViewport.addEventListener("scroll", updateVH);
      }

    } catch (error) {
      console.error("Error setting up viewport listener:", error);
    }

    // Prevent unwanted scroll bouncing
    try {
      document.addEventListener("touchmove", function(e) {
        const el = e.target;
        let current = el;

        while (current && current !== document.body) {
          const isScrollable = current.scrollHeight > current.clientHeight;
          const isModal = current.classList.contains("modal-overlay") || 
                         current.classList.contains("modal-box");

          if (isScrollable && isModal) {
            return; // Allow scroll in modals
          }

          current = current.parentElement;
        }
      }, { passive: true });

    } catch (error) {
      console.error("Error setting up touch prevention:", error);
    }

    // Page visibility API for optimization
    try {
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          // Page hidden - pause animations
          if (window._slideInterval) {
            clearInterval(window._slideInterval);
          }
        } else {
          // Page visible - resume if needed
          if (!isMobileDevice()) {
            startSlideRotation();
          }
        }
      });

    } catch (error) {
      console.error("Error setting up visibility listener:", error);
    }

    // Periodic data sync every 5 minutes
    try {
      if (!isMobileDevice()) {
        setInterval(() => {
          syncDataWithCloud().catch(error => {
            console.error("Error in periodic sync:", error);
          });
        }, 5 * 60 * 1000);
      }
    } catch (error) {
      console.error("Error setting up periodic sync:", error);
    }

  } catch (error) {
    console.error("Fatal error in app initialization:", error);
    showStatus("❌ ข้อผิดพลาดร้ายแรง: " + error.message);
  }
});

/**
 * Cleanup on page unload
 */
window.addEventListener("beforeunload", function() {
  try {
    // Save all data locally
    saveAssignData();
    
    // Clear sensitive data
    if (window._slideInterval) {
      clearInterval(window._slideInterval);
    }
    
    // Disconnect Firebase
    disconnectFirebase();
  } catch (error) {
    console.error("Error in cleanup:", error);
  }
});

/**
 * Handle offline/online events
 */
window.addEventListener("offline", function() {
  try {
    showStatus("⚠️ ออนไลน์ไม่ได้ - ใช้ข้อมูล cache");
  } catch (error) {
    console.error("Error in offline handler:", error);
  }
});

window.addEventListener("online", function() {
  try {
    showStatus("✅ เชื่อมต่ออีกแล้ว");
    // Try to sync
    syncDataWithCloud().catch(error => {
      console.error("Error syncing after reconnect:", error);
    });
  } catch (error) {
    console.error("Error in online handler:", error);
  }
});

/**
 * Global error handler
 */
window.addEventListener("error", function(event) {
  console.error("Uncaught error:", event.error);
  showStatus("❌ ข้อผิดพลาด: " + (event.error?.message || "Unknown"));
});

/**
 * Unhandled promise rejection handler
 */
window.addEventListener("unhandledrejection", function(event) {
  console.error("Unhandled promise rejection:", event.reason);
  showStatus("❌ ข้อผิดพลาด: " + (event.reason?.message || "Unknown"));
});
