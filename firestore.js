/**
 * firestore.js - Firestore Data Management with Query Optimization
 */

let subjects = [];
let assignments = [];

// Cache for reducing Firestore reads
const firebaseCache = {
  subjects: {
    data: [],
    timestamp: 0,
    ttl: 10 * 60 * 1000 // 10 minutes
  },
  assignments: {
    data: [],
    timestamp: 0,
    ttl: 5 * 60 * 1000 // 5 minutes
  }
};

/**
 * Check if cache is valid
 */
function isCacheValid(cacheKey) {
  try {
    const cache = firebaseCache[cacheKey];
    if (!cache) return false;
    const now = Date.now();
    return (now - cache.timestamp) < cache.ttl;
  } catch (error) {
    console.error("Error checking cache validity:", error);
    return false;
  }
}

/**
 * Get subjects with caching
 */
async function loadSubjectsData() {
  try {
    // Check cache first
    if (isCacheValid("subjects")) {
      subjects = firebaseCache.subjects.data;
      return subjects;
    }

    showLoading("กำลังโหลดวิชา...");
    const db = getFirestore();
    const user = getCurrentUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Optimized query with limits
    const querySnapshot = await db.collection(COLLECTIONS.SUBJECTS)
      .where("userId", "==", user.uid)
      .orderBy("createdAt", "desc")
      .limit(QUERY_LIMITS.SUBJECTS)
      .get();

    subjects = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      _fid: doc.id
    }));

    // Update cache
    firebaseCache.subjects.data = subjects;
    firebaseCache.subjects.timestamp = Date.now();

    return subjects;

  } catch (error) {
    console.error("Error loading subjects:", error);
    // Use local data as fallback
    subjects = StorageHelper.get("subjects") || [];
    return subjects;
  }
}

/**
 * Get assignments with caching
 */
async function loadAssignmentsData() {
  try {
    // Check cache first
    if (isCacheValid("assignments")) {
      assignments = firebaseCache.assignments.data;
      return assignments;
    }

    showLoading("กำลังโหลดงาน...");
    const db = getFirestore();
    const user = getCurrentUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Optimized query - only get recent assignments
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - QUERY_LIMITS.RECENT_DAYS);

    const querySnapshot = await db.collection(COLLECTIONS.ASSIGNMENTS)
      .where("userId", "==", user.uid)
      .where("due", ">=", cutoffDate.toISOString().split("T")[0])
      .orderBy("due", "asc")
      .limit(QUERY_LIMITS.ASSIGNMENTS)
      .get();

    assignments = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      _fid: doc.id
    }));

    // Update cache
    firebaseCache.assignments.data = assignments;
    firebaseCache.assignments.timestamp = Date.now();

    return assignments;

  } catch (error) {
    console.error("Error loading assignments:", error);
    // Use local data as fallback
    assignments = StorageHelper.get("assignments") || [];
    return assignments;
  }
}

/**
 * Save subject to Firestore
 */
async function saveSubjectToCloud(subject) {
  try {
    const db = getFirestore();
    const user = getCurrentUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const subjectData = {
      ...subject,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    };

    if (subject._fid) {
      // Update existing
      await db.collection(COLLECTIONS.SUBJECTS).doc(subject._fid).update(subjectData);
    } else if (subject.id) {
      // Create new with custom ID
      await db.collection(COLLECTIONS.SUBJECTS).doc(subject.id).set({
        ...subjectData,
        createdAt: new Date().toISOString()
      });
    } else {
      // Create new with auto ID
      await db.collection(COLLECTIONS.SUBJECTS).add({
        ...subjectData,
        createdAt: new Date().toISOString()
      });
    }

    // Invalidate cache
    firebaseCache.subjects.timestamp = 0;
    return true;

  } catch (error) {
    console.error("Error saving subject:", error);
    throw error;
  }
}

/**
 * Delete subject from Firestore
 */
async function deleteSubjectFromCloud(docId) {
  try {
    const db = getFirestore();
    await db.collection(COLLECTIONS.SUBJECTS).doc(docId).delete();
    firebaseCache.subjects.timestamp = 0;
    return true;
  } catch (error) {
    console.error("Error deleting subject:", error);
    throw error;
  }
}

/**
 * Save assignment to Firestore
 */
async function saveAssignmentToCloud(assignment) {
  try {
    const db = getFirestore();
    const user = getCurrentUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const assignmentData = {
      ...assignment,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    };

    if (assignment._fid) {
      // Update existing
      await db.collection(COLLECTIONS.ASSIGNMENTS).doc(assignment._fid).update(assignmentData);
    } else if (assignment.id) {
      // Create new with custom ID
      await db.collection(COLLECTIONS.ASSIGNMENTS).doc(assignment.id).set({
        ...assignmentData,
        createdAt: new Date().toISOString()
      });
    } else {
      // Create new with auto ID
      await db.collection(COLLECTIONS.ASSIGNMENTS).add({
        ...assignmentData,
        createdAt: new Date().toISOString()
      });
    }

    // Invalidate cache
    firebaseCache.assignments.timestamp = 0;
    return true;

  } catch (error) {
    console.error("Error saving assignment:", error);
    throw error;
  }
}

/**
 * Delete assignment from Firestore
 */
async function deleteAssignmentFromCloud(docId) {
  try {
    const db = getFirestore();
    await db.collection(COLLECTIONS.ASSIGNMENTS).doc(docId).delete();
    firebaseCache.assignments.timestamp = 0;
    return true;
  } catch (error) {
    console.error("Error deleting assignment:", error);
    throw error;
  }
}

/**
 * Get subject by ID
 */
function getSubject(subjectId) {
  try {
    return subjects.find(s => s.id === subjectId || s._fid === subjectId) || {
      id: subjectId,
      code: "?",
      name: "วิชาไม่ทราบ",
      color: "#ccc"
    };
  } catch (error) {
    console.error("Error getting subject:", error);
    return { id: subjectId, code: "?", name: "วิชาไม่ทราบ", color: "#ccc" };
  }
}

/**
 * Save all data locally as backup
 */
function saveAssignData() {
  try {
    StorageHelper.set("subjects", subjects);
    StorageHelper.set("assignments", assignments);
  } catch (error) {
    console.error("Error saving data locally:", error);
  }
}

/**
 * Load all data locally as backup
 */
function loadAssignData() {
  try {
    subjects = StorageHelper.get("subjects") || [];
    assignments = StorageHelper.get("assignments") || [];
  } catch (error) {
    console.error("Error loading data locally:", error);
    subjects = [];
    assignments = [];
  }
}

/**
 * Get assignment status
 */
function assignStatus(assign) {
  try {
    if (!assign || !assign.due) return "upcoming";
    
    const today = todayISO();
    
    if (assign.done === true) return "done";
    if (assign.due < today) return "overdue";
    if (assign.due === today) return "today";
    return "upcoming";
  } catch (error) {
    console.error("Error getting assignment status:", error);
    return "upcoming";
  }
}

/**
 * Sync data with Cloud (batch operation to reduce writes)
 */
async function syncDataWithCloud() {
  try {
    showLoading("กำลังซิงค์ข้อมูล...");
    
    const promises = [];
    
    // Sync subjects
    subjects.forEach(subject => {
      if (!subject._fid) {
        promises.push(saveSubjectToCloud(subject).catch(err => {
          console.error("Error syncing subject:", err);
        }));
      }
    });

    // Sync assignments
    assignments.forEach(assignment => {
      if (!assignment._fid) {
        promises.push(saveAssignmentToCloud(assignment).catch(err => {
          console.error("Error syncing assignment:", err);
        }));
      }
    });

    await Promise.all(promises);
    
    hideLoading();
    showStatus("✅ ซิงค์ข้อมูลสำเร็จ");
    return true;

  } catch (error) {
    hideLoading();
    console.error("Error syncing data:", error);
    showStatus("❌ ซิงค์ข้อมูลไม่สำเร็จ");
    return false;
  }
}
