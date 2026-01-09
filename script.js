// Import Firebase modules
import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";

import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where 
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// ========================================
// FIREBASE CONFIGURATION
// ========================================

const firebaseConfig = {
  apiKey: "AIzaSyCj3revNSKJm5V-932kREKQsL6QSNUr5ic",
  authDomain: "shaktiseva-14bec.firebaseapp.com",
  databaseURL: "https://shaktiseva-14bec-default-rtdb.firebaseio.com",
  projectId: "shaktiseva-14bec",
  storageBucket: "shaktiseva-14bec.firebasestorage.app",
  messagingSenderId:  "972891642824",
  appId: "1:972891642824:web:994935b12bd9a9ec207efd",
  measurementId: "G-690MFJHW1B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("✅ Firebase Initialized Successfully");

// ========================================
// DOM ELEMENTS
// ========================================

const authSection = document.getElementById("auth-section");
const loginForm = document.getElementById("login-form");
const workerRegForm = document.getElementById("worker-reg-form");
const adminRegForm = document.getElementById("admin-reg-form");
const closeAuthBtn = document.getElementById("closeAuthBtn");

const workerDashboard = document.getElementById("worker-dashboard");
const adminDashboard = document.getElementById("admin-dashboard");

const loginBtn = document.getElementById("loginBtn");
const workerRegBtn = document.getElementById("workerRegBtn");
const adminRegBtn = document.getElementById("adminRegBtn");
const logoutBtn = document.getElementById("logoutBtn");

// Auth buttons
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const workerRegSubmitBtn = document.getElementById("workerRegSubmitBtn");
const adminRegSubmitBtn = document.getElementById("adminRegSubmitBtn");

// Switch form buttons
const switchToWorkerRegBtn = document.getElementById("switchToWorkerRegBtn");
const switchToLoginBtn = document.getElementById("switchToLoginBtn");
const switchToLoginBtn2 = document.getElementById("switchToLoginBtn2");

// Query submission
const submitQueryBtn = document.getElementById("submitQueryBtn");

// ========================================
// UTILITY FUNCTIONS
// ========================================

function generateWorkerId() {
  return `SS-W-${Math.floor(Math.random() * 100000)}`;
}

function showAlert(elementId, message, type) {
  const alertBox = document.getElementById(elementId);
  alertBox.className = `alert alert-${type}`;
  alertBox.innerHTML = message;
  alertBox.style. display = "block";
  
  if (type === "success") {
    setTimeout(() => {
      alertBox.style.display = "none";
    }, 3000);
  }
}

function hideAllForms() {
  loginForm.style.display = "none";
  workerRegForm. style.display = "none";
  adminRegForm.style.display = "none";
}

function showForm(form) {
  hideAllForms();
  form.style.display = "block";
}

function openAuthSection(form) {
  authSection.style.display = "flex";
  showForm(form);
}

function closeAuthSection() {
  authSection.style.display = "none";
  hideAllForms();
}

// ========================================
// WORKER REGISTRATION
// ========================================

workerRegSubmitBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const name = document.getElementById("workerName").value.trim();
  const email = document.getElementById("workerEmail").value.trim();
  const phone = document.getElementById("workerPhone").value.trim();
  const password = document.getElementById("workerPassword").value;
  const profession = document.getElementById("workerProfession").value;
  const location = document.getElementById("workerLocation").value.trim();
  const experience = parseInt(document.getElementById("workerExperience").value);

  // Validation
  if (!name || !email || !phone || !password || !profession || !location) {
    showAlert("workerAlert", "❌ Please fill all fields", "error");
    return;
  }

  if (phone.length !== 10 || isNaN(phone)) {
    showAlert("workerAlert", "❌ Please enter a valid 10-digit mobile number", "error");
    return;
  }

  if (password.length < 6) {
    showAlert("workerAlert", "❌ Password must be at least 6 characters", "error");
    return;
  }

  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    const workerId = generateWorkerId();

    // Create users collection entry
    await setDoc(doc(db, "users", uid), {
      uid,
      role: "WORKER",
      email,
      phone,
      createdAt: new Date().toISOString()
    });

    // Create workers collection entry
    await setDoc(doc(db, "workers", uid), {
      workerId,
      uid,
      name,
      email,
      phone,
      profession,
      location,
      experienceYears: experience,
      registeredAt: new Date().toISOString(),
      upskillingProgress: 0,
      status: "Active"
    });

    // Initialize upskilling
    await setDoc(doc(db, "upskilling", uid), {
      workerId,
      uid,
      safetyTraining: "not started",
      financialLiteracy: "not started",
      toolHandling: "not started",
      lastUpdated: new Date().toISOString()
    });

    showAlert("workerAlert", `✅ Registration successful! Worker ID: ${workerId}`, "success");
    
    setTimeout(() => {
      closeAuthSection();
      workerRegForm.reset();
      openAuthSection(loginForm);
    }, 2000);

  } catch (error) {
    console.error("❌ Worker Registration Error:", error);
    showAlert("workerAlert", `❌ ${error.message}`, "error");
  }
});

// ========================================
// ADMIN REGISTRATION
// ========================================

adminRegSubmitBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const name = document.getElementById("adminName").value.trim();
  const email = document.getElementById("adminEmail").value.trim();
  const phone = document.getElementById("adminPhone").value.trim();
  const password = document.getElementById("adminPassword").value;
  const designation = document.getElementById("adminDesignation").value;
  const department = document.getElementById("adminDepartment").value.trim();

  // Validation
  if (! name || !email || !phone || !password || !designation || !department) {
    showAlert("adminAlert", "❌ Please fill all fields", "error");
    return;
  }

  if (phone.length !== 10 || isNaN(phone)) {
    showAlert("adminAlert", "❌ Please enter a valid 10-digit mobile number", "error");
    return;
  }

  if (password.length < 6) {
    showAlert("adminAlert", "❌ Password must be at least 6 characters", "error");
    return;
  }

  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Create users entry
    await setDoc(doc(db, "users", uid), {
      uid,
      role:  "ADMIN",
      email,
      phone,
      createdAt: new Date().toISOString()
    });

    // Create admins entry
    await setDoc(doc(db, "admins", uid), {
      uid,
      name,
      email,
      phone,
      designation,
      department,
      registeredAt: new Date().toISOString()
    });

    showAlert("adminAlert", "✅ Admin registration successful!", "success");
    
    setTimeout(() => {
      closeAuthSection();
      adminRegForm.reset();
      openAuthSection(loginForm);
    }, 2000);

  } catch (error) {
    console.error("❌ Admin Registration Error:", error);
    showAlert("adminAlert", `❌ ${error.message}`, "error");
  }
});

// ========================================
// LOGIN
// ========================================

loginSubmitBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showAlert("loginAlert", "❌ Please fill all fields", "error");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Get user role
    const userDoc = await getDoc(doc(db, "users", uid));
    const role = userDoc.data().role;

    showAlert("loginAlert", "✅ Login successful!", "success");

    setTimeout(() => {
      closeAuthSection();
      loginForm.reset();

      if (role === "WORKER") {
        loadWorkerDashboard(uid);
        workerDashboard.style.display = "block";
        adminDashboard.style.display = "none";
      } else if (role === "ADMIN") {
        loadAdminDashboard(uid);
        adminDashboard.style.display = "block";
        workerDashboard.style.display = "none";
      }

      logoutBtn.style.display = "block";
    }, 1500);

  } catch (error) {
    console.error("❌ Login Error:", error);
    showAlert("loginAlert", `❌ ${error.message}`, "error");
  }
});

// ========================================
// LOGOUT
// ========================================

logoutBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    await signOut(auth);
    logoutBtn.style.display = "none";
    workerDashboard.style.display = "none";
    adminDashboard.style.display = "none";
    document.querySelector(".hero-section").style.display = "block";
    document.querySelector(".features-section").style.display = "block";
    document.querySelector(". about-section").style.display = "block";
  } catch (error) {
    console.error("❌ Logout Error:", error);
  }
});

// ========================================
// WORKER DASHBOARD
// ========================================

async function loadWorkerDashboard(uid) {
  try {
    const workerDoc = await getDoc(doc(db, "workers", uid));
    const workerData = workerDoc.data();

    const upskillingDoc = await getDoc(doc(db, "upskilling", uid));
    const upskillingData = upskillingDoc. data();

    // Update profile
    document.getElementById("displayWorkerId").textContent = workerData.workerId;
    document. getElementById("displayWorkerName").textContent = workerData.name;
    document. getElementById("displayWorkerEmail").textContent = workerData.email;
    document.getElementById("displayWorkerPhone").textContent = workerData.phone;
    document. getElementById("displayWorkerProfession").textContent = workerData. profession;
    document.getElementById("displayWorkerLocation").textContent = workerData.location;
    document.getElementById("displayWorkerExperience").textContent = `${workerData.experienceYears} years`;
    document.getElementById("displayWorkerStatus").textContent = workerData. status;

    // Update progress bar
    const progress = workerData.upskillingProgress || 0;
    document.getElementById("progressBar").style.width = progress + "%";
    document.getElementById("progressPercent").textContent = progress;

    // Stats Grid
    const statsHTML = `
      <div class="stat-card">
        <div class="stat-label">Upskilling Progress</div>
        <div class="stat-value">${progress}%</div>
      </div>
      <div class="stat-card" style="background:  linear-gradient(135deg, var(--success), #20c997);">
        <div class="stat-label">Status</div>
        <div class="stat-value">${workerData.status}</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, var(--accent-orange), #ffb366);">
        <div class="stat-label">Profession</div>
        <div class="stat-value" style="font-size: 1.5rem;">${workerData.profession}</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #667eea, #764ba2);">
        <div class="stat-label">Experience</div>
        <div class="stat-value">${workerData.experienceYears} yrs</div>
      </div>
    `;
    document.getElementById("statsGrid").innerHTML = statsHTML;

    // Training Modules
    const modules = [
      {
        id: "safetyTraining",
        title: "🛡️ Safety Training",
        description: "Learn workplace safety, emergency protocols, and PPE.",
        status: upskillingData.safetyTraining
      },
      {
        id: "financialLiteracy",
        title: "💰 Financial Literacy",
        description: "Understand budgeting, saving, banking, and investment.",
        status: upskillingData.financialLiteracy
      },
      {
        id: "toolHandling",
        title: "🔧 Tool Handling",
        description: "Master the proper use and maintenance of work tools.",
        status: upskillingData.toolHandling
      }
    ];

    let modulesHTML = "";
    modules. forEach(module => {
      const isCompleted = module.status === "completed";
      modulesHTML += `
        <div class="module-card">
          <div class="module-header">${module.title}</div>
          <div class="module-body">
            <span class="module-status ${isCompleted ? "status-completed" : "status-pending"}">
              ${isCompleted ? "✅ Completed" : "⏳ Not Started"}
            </span>
            <p class="module-description">${module.description}</p>
            <button class="btn ${isCompleted ? "btn-success" : "btn-primary"} module-btn" data-module="${module.id}" ${isCompleted ? "disabled" :  ""}>
              ${isCompleted ? "✅ Completed" : "Mark as Completed"}
            </button>
          </div>
        </div>
      `;
    });
    document.getElementById("modulesGrid").innerHTML = modulesHTML;

    // Module button listeners
    document.querySelectorAll(".module-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const moduleId = e.target.dataset.module;
        try {
          await updateDoc(doc(db, "upskilling", uid), {
            [moduleId]: "completed",
            lastUpdated: new Date().toISOString()
          });

          // Recalculate progress
          const updatedDoc = await getDoc(doc(db, "upskilling", uid));
          const modules = ["safetyTraining", "financialLiteracy", "toolHandling"];
          const completedCount = modules.filter(m => updatedDoc.data()[m] === "completed").length;
          const newProgress = Math.round((completedCount / modules.length) * 100);

          await updateDoc(doc(db, "workers", uid), {
            upskillingProgress: newProgress
          });

          alert("🎉 Module completed!  Your progress has been updated.");
          loadWorkerDashboard(uid);
        } catch (error) {
          alert("❌ Error:  " + error.message);
        }
      });
    });

    // Load queries
    const q = query(collection(db, "queries"), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    let queriesHTML = "";

    if (querySnapshot.empty) {
      queriesHTML = '<p style="text-align: center; color: var(--text-light);">No queries submitted yet.</p>';
    } else {
      querySnapshot.forEach(doc => {
        const query = doc.data();
        let statusClass = "status-submitted";
        if (query.status === "In Progress") statusClass = "status-inprogress";
        if (query.status === "Resolved") statusClass = "status-resolved";

        queriesHTML += `
          <div class="query-item">
            <div class="query-header">
              <div>
                <div class="query-type">${query.queryType}</div>
                <div style="font-size: 0.9rem; color: var(--text-light);">${query.queryId}</div>
              </div>
              <span class="query-status ${statusClass}">${query.status}</span>
            </div>
            <p class="query-description">${query.description}</p>
            <div class="query-footer">
              <span>Created: ${new Date(query.createdAt).toLocaleDateString()}</span>
              <span>Updated: ${new Date(query.updatedAt).toLocaleDateString()}</span>
            </div>
            ${query.adminNote ? `<div class="admin-note"><div class="admin-note-title">Admin Note:</div>${query. adminNote}</div>` : ""}
          </div>
        `;
      });
    }
    document.getElementById("queriesList").innerHTML = queriesHTML;

  } catch (error) {
    console.error("❌ Error loading dashboard:", error);
  }
}

// ========================================
// SUBMIT QUERY
// ========================================

submitQueryBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return;

  const queryType = document.getElementById("queryType").value;
  const description = document.getElementById("queryDescription").value. trim();

  if (!queryType || !description) {
    showAlert("queryAlert", "❌ Please fill all fields", "error");
    return;
  }

  try {
    const workerDoc = await getDoc(doc(db, "workers", user. uid));
    const workerData = workerDoc.data();

    const queryId = `QRY-${Date.now()}`;

    await setDoc(doc(db, "queries", queryId), {
      queryId,
      uid: user.uid,
      workerId: workerData.workerId,
      workerName: workerData.name,
      queryType,
      description,
      status: "Submitted",
      adminNote: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    showAlert("queryAlert", "✅ Query submitted successfully!", "success");
    document.getElementById("queryType").value = "";
    document. getElementById("queryDescription").value = "";

    // Reload queries
    setTimeout(() => {
      loadWorkerDashboard(user.uid);
    }, 1500);

  } catch (error) {
    console.error("❌ Error submitting query:", error);
    showAlert("queryAlert", `❌ ${error.message}`, "error");
  }
});

// ========================================
// ADMIN DASHBOARD
// ========================================

async function loadAdminDashboard(uid) {
  try {
    // Get all workers
    const workersSnapshot = await getDocs(collection(db, "workers"));
    const workers = [];
    workersSnapshot.forEach(doc => {
      workers.push(doc.data());
    });

    // Stats
    const totalWorkers = workers.length;
    const activeWorkers = workers.filter(w => w.status === "Active").length;
    const avgProgress = Math.round(
      workers.reduce((sum, w) => sum + (w.upskillingProgress || 0), 0) / workers.length
    );

    const statsHTML = `
      <div class="stat-card">
        <div class="stat-label">Total Workers</div>
        <div class="stat-value">${totalWorkers}</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, var(--success), #20c997);">
        <div class="stat-label">Active Workers</div>
        <div class="stat-value">${activeWorkers}</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, var(--accent-orange), #ffb366);">
        <div class="stat-label">Avg.  Progress</div>
        <div class="stat-value">${avgProgress}%</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #667eea, #764ba2);">
        <div class="stat-label">Professions</div>
        <div class="stat-value">${new Set(workers.map(w => w.profession)).size}</div>
      </div>
    `;
    
