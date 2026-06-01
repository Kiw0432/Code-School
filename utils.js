/**
 * utils.js - Utility Functions
 */

/**
 * UI Helper - Show loading state
 */
function showLoading(message = "กำลังโหลด...") {
  try {
    const overlay = document.getElementById("loadingOverlay");
    const msg = document.getElementById("loadingMsg");
    if (overlay && msg) {
      msg.textContent = message;
      overlay.style.display = "flex";
    }
  } catch (error) {
    console.error("Error showing loading:", error);
  }
}

/**
 * UI Helper - Hide loading state
 */
function hideLoading() {
  try {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) {
      overlay.style.display = "none";
    }
  } catch (error) {
    console.error("Error hiding loading:", error);
  }
}

/**
 * UI Helper - Show status message
 */
function showStatus(message, duration = UI_CONFIG.TOAST_DURATION) {
  try {
    const statusBox = document.getElementById("statusBox");
    if (!statusBox) return;

    statusBox.textContent = message;
    statusBox.classList.remove("hidden");

    setTimeout(() => {
      statusBox.classList.add("hidden");
    }, duration);

    // Clear previous timeout if exists
    if (window._statusTimeout) {
      clearTimeout(window._statusTimeout);
    }

  } catch (error) {
    console.error("Error showing status:", error);
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  try {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  } catch (error) {
    console.error("Error escaping HTML:", error);
    return String(text);
  }
}

/**
 * Get today's date in ISO format
 */
function todayISO() {
  try {
    const today = new Date();
    return today.getFullYear() + "-" +
      String(today.getMonth() + 1).padStart(2, "0") + "-" +
      String(today.getDate()).padStart(2, "0");
  } catch (error) {
    console.error("Error getting today ISO:", error);
    return new Date().toISOString().split("T")[0];
  }
}

/**
 * Get Thai date format
 */
function getThaiDate() {
  try {
    const date = new Date();
    const thaiMonths = ["", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    const day = date.getDate();
    const month = thaiMonths[date.getMonth() + 1];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  } catch (error) {
    console.error("Error getting Thai date:", error);
    return new Date().toLocaleDateString("th-TH");
  }
}

/**
 * Format date to Thai display
 */
function formatThaiDate(isoDate) {
  try {
    if (!isoDate) return "-";
    const [year, month, day] = isoDate.split("-");
    const thaiMonths = ["", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    return `${day}/${month}/${parseInt(year) + 543}`;
  } catch (error) {
    console.error("Error formatting Thai date:", error);
    return isoDate;
  }
}

/**
 * Check if date is past
 */
function isPastDate(isoDate) {
  try {
    return isoDate < todayISO();
  } catch (error) {
    console.error("Error checking past date:", error);
    return false;
  }
}

/**
 * Debounce function
 */
function debounce(func, delay = UI_CONFIG.DEBOUNCE_DELAY) {
  let timeoutId;
  return function(...args) {
    try {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    } catch (error) {
      console.error("Error in debounce:", error);
    }
  };
}

/**
 * Throttle function
 */
function throttle(func, delay = UI_CONFIG.DEBOUNCE_DELAY) {
  let lastCall = 0;
  return function(...args) {
    try {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func.apply(this, args);
      }
    } catch (error) {
      console.error("Error in throttle:", error);
    }
  };
}

/**
 * Local Storage Helper
 */
const StorageHelper = {
  set: function(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      return false;
    }
  },

  get: function(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  },

  remove: function(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error removing from localStorage:", error);
      return false;
    }
  },

  clear: function() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  }
};

/**
 * Is mobile device
 */
function isMobileDevice() {
  try {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  } catch (error) {
    console.error("Error checking mobile device:", error);
    return false;
  }
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
  try {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  } catch (error) {
    console.error("Error formatting file size:", error);
    return "Unknown";
  }
}
