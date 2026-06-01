/**
 * ui.js - UI Rendering and Interactions
 */

/**
 * Render main dashboard
 */
async function renderDashboard() {
  try {
    const mainContent = document.getElementById("mainContent");
    if (!mainContent) return;

    let html = `
      <!-- Banner -->
      <div class="banner-slider">
        <div class="slides"></div>
      </div>

      <!-- Dashboard Stats -->
      <div class="card">
        <h2>📊 สถิติ</h2>
        <div class="dashboard" style="margin-top: 12px;">
          <div class="dash-card">
            <p style="font-size: 0.85rem; color: #999;">งานทั้งหมด</p>
            <h1 id="totalAssignCount">0</h1>
          </div>
          <div class="dash-card">
            <p style="font-size: 0.85rem; color: #999;">งานวันนี้</p>
            <h1 id="todayAssignCount">0</h1>
          </div>
          <div class="dash-card">
            <p style="font-size: 0.85rem; color: #999;">งานเสร็จ</p>
            <h1 id="doneAssignCount">0</h1>
          </div>
          <div class="dash-card">
            <p style="font-size: 0.85rem; color: #999;">งานคุ้ง</p>
            <h1 id="overdueAssignCount">0</h1>
          </div>
        </div>
      </div>

      <!-- Assignments List -->
      <div class="card">
        <h2>📝 งานที่มา</h2>
        <div id="assignmentsList" style="margin-top: 12px;"></div>
      </div>

      <!-- Calendar -->
      <div class="card">
        <h2>📅 ปฏิทิน</h2>
        <div style="margin-top: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <button class="btn-soft" onclick="calPrevMonth()" style="flex: 0 0 auto; padding: 8px 12px;">◀ ก่อนหน้า</button>
            <div id="calMonthLabel" style="font-weight: 600; flex: 1; text-align: center;"></div>
            <button class="btn-soft" onclick="calNextMonth()" style="flex: 0 0 auto; padding: 8px 12px;">ถัดไป ▶</button>
          </div>
          <div id="calGrid"></div>
          <div id="calDayDetail" style="margin-top: 12px;"></div>
        </div>
      </div>
    `;

    mainContent.innerHTML = html;

    // Load slide images
    loadSlideImages();

    // Initialize calendar
    initCal();
    renderCal();

    // Render statistics
    updateDashboardStats();

    // Render assignments list
    renderAssignmentsList();

  } catch (error) {
    console.error("Error rendering dashboard:", error);
    showStatus("❌ แสดงหน้าแรกไม่สำเร็จ");
  }
}

/**
 * Update dashboard statistics
 */
function updateDashboardStats() {
  try {
    const today = todayISO();
    
    const totalCount = assignments.length;
    const todayCount = assignments.filter(a => a.due === today).length;
    const doneCount = assignments.filter(a => a.done === true).length;
    const overdueCount = assignments.filter(a => {
      const status = assignStatus(a);
      return status === "overdue";
    }).length;

    document.getElementById("totalAssignCount").textContent = totalCount;
    document.getElementById("todayAssignCount").textContent = todayCount;
    document.getElementById("doneAssignCount").textContent = doneCount;
    document.getElementById("overdueAssignCount").textContent = overdueCount;

  } catch (error) {
    console.error("Error updating dashboard stats:", error);
  }
}

/**
 * Render assignments list
 */
function renderAssignmentsList() {
  try {
    const container = document.getElementById("assignmentsList");
    if (!container) return;

    const today = todayISO();
    const upcoming = assignments.filter(a => {
      const status = assignStatus(a);
      return status !== "done" && status !== "overdue";
    })
    .sort((a, b) => (a.due || "").localeCompare(b.due || ""))
    .slice(0, 10);

    if (upcoming.length === 0) {
      container.innerHTML = '<p style="color: #aaa; font-size: 0.85rem;">ไม่มีงานที่มา</p>';
      return;
    }

    let html = "";
    upcoming.forEach(assign => {
      const subject = getSubject(assign.subjectId);
      const status = assignStatus(assign);
      const isToday = assign.due === today;

      html += `
        <div style="
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          background: var(--c1);
          margin-bottom: 8px;
          border-left: 4px solid ${subject.color};
        ">
          <div style="flex: 1;">
            <div style="font-weight: 600; color: var(--text);">
              ${escapeHtml(assign.title)}
            </div>
            <div style="font-size: 0.8rem; color: #999; margin-top: 4px;">
              ${escapeHtml(subject.code)} · ${formatThaiDate(assign.due)}
              ${isToday ? '<span style="color: var(--red); font-weight: 600;"> (วันนี้)</span>' : ''}
            </div>
          </div>
          <button 
            class="btn-green"
            style="padding: 8px 12px; font-size: 0.85rem; flex: 0 0 auto;"
            onclick="toggleAssignmentDone('${assign.id}')"
          >
            ✓
          </button>
        </div>
      `;
    });

    container.innerHTML = html;

  } catch (error) {
    console.error("Error rendering assignments list:", error);
  }
}

/**
 * Toggle assignment done status
 */
function toggleAssignmentDone(assignmentId) {
  try {
    const assign = assignments.find(a => a.id === assignmentId);
    if (!assign) return;

    assign.done = !assign.done;
    saveAssignData();

    showStatus(assign.done ? "✅ ทำเสร็จแล้ว" : "❌ ยังไม่เสร็จ");

    // Update Firestore if possible
    saveAssignmentToCloud(assign).catch(error => {
      console.error("Error saving assignment:", error);
    });

    updateDashboardStats();
    renderAssignmentsList();

  } catch (error) {
    console.error("Error toggling assignment:", error);
    showStatus("❌ เปลี่ยนสถานะไม่สำเร็จ");
  }
}

/**
 * Open settings
 */
function openSettings() {
  try {
    if (!isUserAdmin()) {
      showStatus("⚠️ เฉพาะผู้ดูแลเท่านั้น");
      return;
    }

    // Create settings modal
    const modal = document.createElement("div");
    modal.className = "modal-overlay show";
    modal.id = "settingsModal";
    modal.innerHTML = `
      <div class="modal-box" style="max-width: 500px;">
        <div style="padding: 20px; border-bottom: 1px solid var(--c2);">
          <h2>⚙️ ตั้งค่า</h2>
        </div>
        <div style="padding: 20px;">
          <h3 style="font-size: 1rem; margin-bottom: 12px;">วิชา</h3>
          <button class="btn-main" style="width: 100%; margin-bottom: 12px;" onclick="openSubjectSetting()">
            📚 จัดการวิชา
          </button>

          <h3 style="font-size: 1rem; margin-bottom: 12px; margin-top: 20px;">รูปภาพ</h3>
          <button class="btn-main" style="width: 100%; margin-bottom: 12px;" onclick="uploadSlideImage()">
            🖼️ เพิ่มรูปแบนเนอร์
          </button>

          <button class="btn-soft" style="width: 100%; margin-bottom: 12px;" onclick="closeSettings()">
            ปิด
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeSettings();
      }
    });

  } catch (error) {
    console.error("Error opening settings:", error);
    showStatus("❌ เปิดตั้งค่าไม่สำเร็จ");
  }
}

/**
 * Close settings
 */
function closeSettings() {
  try {
    const modal = document.getElementById("settingsModal");
    if (modal) {
      modal.remove();
    }
  } catch (error) {
    console.error("Error closing settings:", error);
  }
}

/**
 * Open subject settings
 */
function openSubjectSetting() {
  try {
    if (!isUserAdmin()) {
      showStatus("⚠️ เฉพาะผู้ดูแลเท่านั้น");
      return;
    }

    const modal = document.createElement("div");
    modal.className = "modal-overlay show";
    modal.id = "subjectSettingModal";
    modal.innerHTML = `
      <div class="modal-box">
        <div style="padding: 20px; border-bottom: 1px solid var(--c2);">
          <h2>📚 จัดการวิชา</h2>
        </div>
        <div style="padding: 20px;">
          <button class="btn-main" style="width: 100%; margin-bottom: 12px;" onclick="openAddSubject()">
            ➕ เพิ่มวิชา
          </button>
          <div id="subjectSettingList"></div>
          <button class="btn-soft" style="width: 100%; margin-top: 12px;" onclick="closeSubjectSetting()">
            ปิด
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeSubjectSetting();
      }
    });

    // Render subject list
    renderSubjectSettingList();

  } catch (error) {
    console.error("Error opening subject settings:", error);
    showStatus("❌ เปิดจัดการวิชาไม่สำเร็จ");
  }
}

/**
 * Close subject settings
 */
function closeSubjectSetting() {
  try {
    const modal = document.getElementById("subjectSettingModal");
    if (modal) {
      modal.remove();
    }
  } catch (error) {
    console.error("Error closing subject settings:", error);
  }
}

/**
 * Render subject settings list
 */
function renderSubjectSettingList() {
  try {
    const container = document.getElementById("subjectSettingList");
    if (!container) return;

    if (subjects.length === 0) {
      container.innerHTML = '<p style="color: #aaa; font-size: 0.85rem;">ยังไม่มีวิชา</p>';
      return;
    }

    let html = "";
    subjects.forEach(subject => {
      const assignCount = assignments.filter(a => a.subjectId === subject.id).length;
      html += `
        <div style="
          display: flex;
          gap: 12px;
          padding: 12px;
          background: var(--c1);
          border-radius: 12px;
          margin-bottom: 8px;
          align-items: center;
        ">
          <div style="
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: ${subject.color};
            flex-shrink: 0;
          "></div>
          <div style="flex: 1;">
            <div style="font-weight: 600;">${escapeHtml(subject.code)} ${escapeHtml(subject.name)}</div>
            <div style="font-size: 0.8rem; color: #999;">${subject.teacher} · ${assignCount} งาน</div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

  } catch (error) {
    console.error("Error rendering subject settings list:", error);
  }
}

/**
 * Open add subject dialog
 */
function openAddSubject() {
  try {
    if (!isUserAdmin()) {
      showStatus("⚠️ เฉพาะผู้ดูแลเท่านั้น");
      return;
    }

    // Show simple dialog
    const name = prompt("ชื่อวิชา?");
    if (!name) return;

    const code = prompt("รหัสวิชา?");
    if (!code) return;

    const teacher = prompt("ชื่อครู?") || "";

    const newSubject = {
      id: "s" + Date.now(),
      name: name,
      code: code,
      teacher: teacher,
      color: SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)],
      createdAt: new Date().toISOString()
    };

    subjects.push(newSubject);
    saveAssignData();

    // Save to Cloud
    saveSubjectToCloud(newSubject).catch(error => {
      console.error("Error saving subject:", error);
    });

    showStatus("✅ เพิ่มวิชาแล้ว");
    renderSubjectSettingList();

  } catch (error) {
    console.error("Error adding subject:", error);
    showStatus("❌ เพิ่มวิชาไม่สำเร็จ");
  }
}

/**
 * Upload slide image
 */
function uploadSlideImage() {
  try {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const result = await uploadImageToStorage(file, "slides");
      if (result) {
        slideImages.push(result.url);
        saveSlideImagesToCache();
        renderSlides();
        showStatus("✅ อัปโหลดรูปแบนเนอร์สำเร็จ");
      }
    });

    input.click();

  } catch (error) {
    console.error("Error uploading slide:", error);
    showStatus("❌ อัปโหลดรูปแบนเนอร์ไม่สำเร็จ");
  }
}
