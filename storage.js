/**
 * storage.js - Firebase Storage Management (Images & Files)
 */

// Store references to uploaded images
let slideImages = [];

/**
 * Upload image to Firebase Storage
 */
async function uploadImageToStorage(file, folder = "slides") {
  try {
    // Validate file
    if (!file) {
      throw new Error("ไม่มีไฟล์");
    }

    if (!IMAGE_SETTINGS.ALLOWED_TYPES.includes(file.type)) {
      throw new Error("ประเภทไฟล์ไม่ถูกต้อง ยอมรับเฉพาะ JPG, PNG, WebP");
    }

    if (file.size > IMAGE_SETTINGS.MAX_SIZE) {
      throw new Error(`ไฟล์ใหญ่เกินไป (สูงสุด ${formatFileSize(IMAGE_SETTINGS.MAX_SIZE)})`);
    }

    showLoading("กำลังอัปโหลดรูปภาพ...");
    const storage = getStorage();
    const user = getCurrentUser();

    if (!user) {
      throw new Error("ไม่ได้เข้าสู่ระบบ");
    }

    // Create unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const filename = `${user.uid}_${timestamp}_${random}_${file.name}`;
    const path = `${folder}/${filename}`;

    // Upload file
    const reference = storage.ref(path);
    const uploadTask = await reference.put(file);
    
    // Get download URL
    const downloadUrl = await uploadTask.ref.getDownloadURL();
    
    hideLoading();
    showStatus("✅ อัปโหลดรูปภาพสำเร็จ");

    return {
      url: downloadUrl,
      path: path,
      name: filename,
      uploadedAt: new Date().toISOString(),
      userId: user.uid
    };

  } catch (error) {
    hideLoading();
    console.error("Image upload error:", error);
    showStatus("❌ อัปโหลดรูปภาพไม่สำเร็จ: " + error.message);
    return null;
  }
}

/**
 * Delete image from Firebase Storage
 */
async function deleteImageFromStorage(path) {
  try {
    const storage = getStorage();
    const reference = storage.ref(path);
    await reference.delete();
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}

/**
 * Load slide images with caching
 */
function loadSlideImages() {
  try {
    const cached = StorageHelper.get("slideImages");
    if (cached && Array.isArray(cached)) {
      slideImages = cached;
    } else {
      slideImages = DEFAULT_SLIDES.slice();
    }
    renderSlides();
  } catch (error) {
    console.error("Error loading slide images:", error);
    slideImages = DEFAULT_SLIDES.slice();
    renderSlides();
  }
}

/**
 * Save slide images to cache
 */
function saveSlideImagesToCache() {
  try {
    StorageHelper.set("slideImages", slideImages);
  } catch (error) {
    console.error("Error saving slide images:", error);
  }
}

/**
 * Render banner slides with optimized animations
 */
function renderSlides() {
  try {
    const slidesContainer = document.querySelector(".slides");
    if (!slidesContainer) return;

    let html = "";
    slideImages.forEach((img, idx) => {
      html += `
        <div class="slide ${idx === 0 ? "active" : ""}">
          <img src="${escapeHtml(img)}" alt="Slide ${idx + 1}" loading="lazy">
        </div>
      `;
    });

    // Add navigation dots
    html += '<div class="dots">';
    slideImages.forEach((_, idx) => {
      html += `<div class="dot ${idx === 0 ? "active" : ""}" onclick="changeSlide(${idx})"></div>`;
    });
    html += '</div>';

    slidesContainer.innerHTML = html;

    // Start auto-rotation only on desktop
    if (!isMobileDevice()) {
      startSlideRotation();
    }

  } catch (error) {
    console.error("Error rendering slides:", error);
  }
}

/**
 * Change slide manually
 */
function changeSlide(idx) {
  try {
    const slides = document.querySelectorAll(".slide");
    const dots = document.querySelectorAll(".dot");

    slides.forEach(s => s.classList.remove("active"));
    dots.forEach(d => d.classList.remove("active"));

    if (slides[idx]) slides[idx].classList.add("active");
    if (dots[idx]) dots[idx].classList.add("active");

    // Reset auto-rotation
    if (window._slideInterval) {
      clearInterval(window._slideInterval);
    }
    if (!isMobileDevice()) {
      startSlideRotation();
    }

  } catch (error) {
    console.error("Error changing slide:", error);
  }
}

/**
 * Start auto-rotating slides (desktop only)
 */
function startSlideRotation() {
  try {
    const slides = document.querySelectorAll(".slide");
    if (slides.length === 0) return;

    let currentIdx = 0;

    if (window._slideInterval) {
      clearInterval(window._slideInterval);
    }

    window._slideInterval = setInterval(() => {
      currentIdx = (currentIdx + 1) % slides.length;
      changeSlide(currentIdx);
    }, 8000);

  } catch (error) {
    console.error("Error starting slide rotation:", error);
  }
}

/**
 * Get image with error handling and fallback
 */
function getImageWithFallback(url, fallback = DEFAULT_SLIDES[0]) {
  try {
    return url && typeof url === "string" ? url : fallback;
  } catch (error) {
    console.error("Error getting image:", error);
    return fallback;
  }
}

/**
 * Cache busting for images
 */
function getCachebustedImageUrl(url) {
  try {
    if (!url || typeof url !== "string") return url;
    
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}v=${Date.now()}`;
  } catch (error) {
    console.error("Error adding cache buster:", error);
    return url;
  }
}

/**
 * Add image loading optimization
 */
function optimizeImageLoading() {
  try {
    const images = document.querySelectorAll("img[data-src]");
    
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
            observer.unobserve(img);
          }
        });
      });

      images.forEach(img => observer.observe(img));
    } else {
      // Fallback for older browsers
      images.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
      });
    }

  } catch (error) {
    console.error("Error optimizing image loading:", error);
  }
}
