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
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where 
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// ========================================
// FIREBASE CONFIG
// ========================================

const firebaseConfig = {
  apiKey: "AIzaSyCj3revNSKJm5V-932kREKQsL6QSNUr5ic",
  authDomain: "shaktiseva-14bec.firebaseapp.com",
  databaseURL: "https://shaktiseva-14bec-default-rtdb.firebaseio.com",
  projectId: "shaktiseva-14bec",
  storageBucket: "shaktiseva-14bec.firebasestorage.app",
  messagingSenderId:  "972891642824",
  appId: "1:972891642824:web: 994935b12bd9a9ec207efd",
  measurementId: "G-690MFJHW1B"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("✅ Firebase Initialized");

// ========================================
// DOM ELEMENTS
// ========================================

const authModal = document.getElementById("auth-modal");
const loginForm = document.getElementById("login-form");
const workerRegForm = document.getElementById("worker-reg-form");
const adminRegForm = document.getElementById("admin-reg-form");
const closeAuthBtn = document.getElementById("closeAuthBtn");

const workerDashboard = document.getElementById("worker-dashboard");
const adminDashboard = document.getElementById("admin-dashboard");
const heroSection = document.getElementById("hero-section");

const loginBtn = document.getElementById("loginBtn");
const workerRegBtn = document.getElementById("workerRegBtn");
const adminRegBtn = document.getElementById("adminRegBtn");
const logoutBtn = document.getElementById("logoutBtn");

const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const workerRegSubmitBtn = document.getElementById("workerRegSubmitBtn");
const adminRegSubmitBtn = document.getElementById("adminRegSubmitBtn");
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
  alertBox.textContent = message;
  alertBox. style.display = "block";
  
  if (type === "success") {
    setTimeout(() => {
      alertBox. style.display = "none";
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

function openAuthModal(form) {
  authModal.style.display = "flex";
  showForm(form);
  window.scrollTo(0, 0);
}

function closeAuthModal() {
  authModal.style.display = "none";
  hideAllForms();
}

// ========================================
// AUTH MODAL CONTROLS
// ========================================

loginBtn.addEventListener("click", () => openAuthModal(loginForm));
workerRegBtn.addEventListener("click", () => openAuthModal(workerRegForm));
adminRegBtn.addEventListener("click", () => openAuthModal(adminRegForm));
closeAuthBtn.addEventListener("click", closeAuthModal);

// Switch buttons
document.getElementById("switchToWorkerReg").addEventListener("click", (e) => {
  e.preventDefault();
  showForm(workerRegForm);
});

document.getElementById("switchToLoginFromWorker").addEventListener("click", (e) => {
  e.preventDefault();
  showForm(loginForm);
});

document.getElementById("switchToLoginFromAdmin").addEventListener("click", (e) => {
  e.preventDefault();
  showForm(loginForm);
});

// Close modal on background click
authModal.addEventListener("click", (e) => {
  if (e.target === authModal) {
    closeAuthModal();
  }
});

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
  const experience = parseInt(document.getElementById("workerExperience").value) || 0;

  if (!name || !email || !phone || !password || !profession || !location) {
    showAlert("workerAlert", "❌ Please fill all fields", "error");
    return;
  }

  if (phone.length !== 10 || isNaN(phone)) {
    showAlert("workerAlert", "❌ Invalid 10-digit mobile number", "error");
    return;
  }

  if (password.length < 6) {
    showAlert("workerAlert", "❌ Password must be 6+ characters", "error");
    return;
  }

  try {
    workerRegSubmitBtn.disabled = true;
    workerRegSubmitBtn.textContent = "Registering...";

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    const workerId = generateWorkerId();

    await setDoc(doc(db, "users", uid), {
      uid,
      role: "WORKER",
      email,
      phone,
      createdAt: new Date().toISOString()
    });

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

    await setDoc(doc(db, "upskilling", uid), {
      workerId,
      uid,
      safetyTraining: "not started",
      financialLiteracy: "not started",
      toolHandling: "not started",
      lastUpdated: new Date().toISOString()
    });

    showAlert("workerAlert", `✅ Success! Worker ID: ${workerId}`, "success");

    setTimeout(() => {
      closeAuthModal();
      document.getElementById("worker-reg-form").reset();
      openAuthModal(loginForm);
      workerRegSubmitBtn.disabled = false;
      workerRegSubmitBtn. textContent = "Register as Worker";
    }, 2000);

  } catch (error) {
    showAlert("workerAlert", `❌ ${error.message}`, "error");
    workerRegSubmitBtn.disabled = false;
    workerRegSubmitBtn.textContent = "Register as Worker";
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

  if (!name || !email || !phone || !password || !designation || !department) {
    showAlert("adminAlert", "❌ Please fill all fields", "error");
    return;
  }

  if (phone.length !== 10 || isNaN(phone)) {
    showAlert("adminAlert", "❌ Invalid 10-digit mobile number", "error");
    return;
  }

  if (password.length < 6) {
    showAlert("adminAlert", "❌ Password must be 6+ characters", "error");
    return;
  }

  try {
    adminRegSubmitBtn.disabled = true;
    adminRegSubmitBtn.textContent = "Registering...";

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    await setDoc(doc(db, "users", uid), {
      uid,
      role: "ADMIN",
      email,
      phone,
      createdAt: new Date().toISOString()
    });

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
      closeAuthModal();
      document.getElementById("admin-reg-form").reset();
      openAuthModal(loginForm);
      adminRegSubmitBtn.disabled = false;
      adminRegSubmitBtn.textContent = "Register as Admin";
    }, 2000);

  } catch (error) {
    showAlert("adminAlert", `❌ ${error.message}`, "error");
    adminRegSubmitBtn.disabled = false;
    adminRegSubmitBtn.textContent = "Register as Admin";
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
    loginSubmitBtn. disabled = true;
    loginSubmitBtn.textContent = "Logging in...";

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const userDoc = await getDoc(doc(db, "users", uid));
    const role = userDoc.data().role;

    showAlert("loginAlert", "✅ Login successful!", "success");

    setTimeout(() => {
      closeAuthModal();
      document.getElementById("login-form").reset();
      heroSection.style.display = "none";
      document.getElementById("features").style.display = "none";

      if (role === "WORKER") {
        loadWorkerDashboard(uid);
        workerDashboard.style.display = "block";
        adminDashboard.style.display = "none";
      } else {
        loadAdminDashboard(uid);
        adminDashboard.style.display = "block";
        workerDashboard.style.display = "none";
      }

      logoutBtn.style.display = "block";
      loginSubmitBtn.disabled = false;
      loginSubmitBtn.textContent = "Login";
    }, 1500);

  } catch (error) {
    showAlert("loginAlert", `❌ ${error.message}`, "error");
    loginSubmitBtn.disabled = false;
    loginSubmitBtn.textContent = "Login";
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
    heroSection.style.display = "block";
    document.getElementById("features").style.display = "block";
  } catch (error) {
    console.error("❌ Logout Error:", error);
  }
});

// ========================================
// LOAD WORKER DASHBOARD
// ========================================

async function loadWorkerDashboard(uid) {
  try {
    const workerDoc = await getDoc(doc(db, "workers", uid));
    const workerData = workerDoc.data();

    const upskillingDoc = await getDoc(doc(db, "upskilling", uid));
    const upskillingData = upskillingDoc.data();

    // Profile
    document.getElementById("displayWorkerId").textContent = workerData.workerId;
    document. getElementById("displayWorkerName").textContent = workerData.name;
    document. getElementById("displayWorkerEmail").textContent = workerData.email;
    document.getElementById("displayWorkerPhone").textContent = workerData.phone;
    document. getElementById("displayWorkerProfession").textContent = workerData. profession;
    document.getElementById("displayWorkerLocation").textContent = workerData.location;
    document.getElementById("displayWorkerExperience").textContent = `${workerData.experienceYears} years`;
    document.getElementById("displayWorkerStatus").textContent = workerData. status;

    // Progress
    const progress = workerData.upskillingProgress || 0;
    document.getElementById("progressBar").style.width = progress + "%";
    document.getElementById("progressPercent").textContent = progress;

    // Stats
    document.getElementById("statsGrid").innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Progress</div>
        <div class="stat-value">${progress}%</div>
      </div>
      <div class="stat-card" style="background:  linear-gradient(135deg, #27ae60, #20c997);">
        <div class="stat-label">Status</div>
        <div class="stat-value">${workerData.status}</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #ff9800, #ffb366);">
        <div class="stat-label">Profession</div>
        <div class="stat-value">${workerData.profession. substring(0, 15)}</div>
      </div>
    `;

    // Modules
    const modules = [
      { id: "safetyTraining", title: "🛡️ Safety Training", desc: "Workplace safety & PPE", status: upskillingData.safetyTraining },
      { id:  "financialLiteracy", title: "💰 Financial Literacy", desc: "Budgeting & Banking", status: upskillingData.financialLiteracy },
      { id: "toolHandling", title: "🔧 Tool Handling", desc: "Tool usage & maintenance", status: upskillingData.toolHandling }
    ];

    let modulesHTML = "";
    modules.forEach(m => {
      const done = m.status === "completed";
      modulesHTML += `
        <div class="module-card">
          <div class="module-header">${m.title}</div>
          <div class="module-body">
            <span class="module-status ${done ?  "status-completed" : "status-pending"}">
              ${done ? "✅ Done" : "⏳ Not Done"}
            </span>
            <p style="margin:  1rem 0; color: #666; font-size:  0.9rem;">${m.desc}</p>
            <button class="btn btn-primary module-btn" data-module="${m.id}" ${done ? "disabled" : ""}>
              ${done ? "✅ Completed" : "Mark Complete"}
            </button>
          </div>
        </div>
      `;
    });
    document.getElementById("modulesGrid").innerHTML = modulesHTML;

    // Module button listeners
    document.querySelectorAll(". module-btn").forEach(btn => {
      if (! btn.disabled) {
        btn.addEventListener("click", async (e) => {
          const moduleId = e.target.dataset.module;
          
          try {
            e.target.disabled = true;
            e.target.textContent = "Updating...";

            await updateDoc(doc(db, "upskilling", uid), {
              [moduleId]: "completed",
              lastUpdated: new Date().toISOString()
            });

            const updatedDoc = await getDoc(doc(db, "upskilling", uid));
            const completed = ["safetyTraining", "financialLiteracy", "toolHandling"]
              .filter(m => updatedDoc.data()[m] === "completed").length;
            const newProgress = Math.round((completed / 3) * 100);

            await updateDoc(doc(db, "workers", uid), {
              upskillingProgress: newProgress
            });

            alert("🎉 Module marked complete!");
            loadWorkerDashboard(uid);
          } catch (error) {
            alert("❌ Error:  " + error.message);
            e.target.disabled = false;
            e.target.textContent = "Mark Complete";
          }
        });
      }
    });

    // Load queries
    const q = query(collection(db, "queries"), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    let queriesHTML = "<p style='text-align: center; padding: 2rem; color: #999;'>No queries yet</p>";

    if (! querySnapshot.empty) {
      queriesHTML = "";
      const queries = [];
      querySnapshot.forEach(doc => queries.push(doc.data()));
      queries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      queries.forEach(q => {
        let statusBg = "status-submitted";
        if (q.status === "In Progress") statusBg = "status-inprogress";
        if (q.status === "Resolved") statusBg = "status-resolved";

        queriesHTML += `
          <div class="query-item">
            <div class="query-header">
              <div><strong>${q.queryType}</strong><br><small>${q.queryId}</small></div>
              <span class="query-status ${statusBg}">${q.status}</span>
            </div>
            <p style="margin: 1rem 0; color: #666;">${q.description}</p>
            <div style="font-size: 0.85rem; color: #999;">
              Created: ${new Date(q.createdAt).toLocaleDateString()} | Updated: ${new Date(q.updatedAt).toLocaleDateString()}
            </div>
            ${q.adminNote ? `<div style="background: #f0f0f0; padding: 1rem; margin-top: 1rem; border-left: 3px solid #ff9800;"><strong>Admin: </strong> ${q.adminNote}</div>` : ""}
          </div>
        `;
      });
    }
    document.getElementById("queriesList").innerHTML = queriesHTML;

  } catch (error) {
    console.error("❌ Dashboard Error:", error);
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
    showAlert("queryAlert", "❌ Fill all fields", "error");
    return;
  }

  try {
    submitQueryBtn.disabled = true;
    submitQueryBtn.textContent = "Submitting...";

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

    showAlert("queryAlert", "✅ Query submitted!", "success");

    setTimeout(() => {
      document.getElementById("queryType").value = "";
      document.getElementById("queryDescription").value = "";
      loadWorkerDashboard(user. uid);
      submitQueryBtn.disabled = false;
      submitQueryBtn.textContent = "🚀 Submit Query";
    }, 1500);

  } catch (error) {
    showAlert("queryAlert", "❌ " + error.message, "error");
    submitQueryBtn.disabled = false;
    submitQueryBtn. textContent = "🚀 Submit Query";
  }
});

// ========================================
// LOAD ADMIN DASHBOARD
// ========================================

async function loadAdminDashboard(uid) {
  try {
    const workersSnapshot = await getDocs(collection(db, "workers"));
    const workers = [];
    workersSnapshot.forEach(doc => workers.push(doc.data()));

    const totalWorkers = workers.length;
    const activeWorkers = workers.filter(w => w.status === "Active").length;
    const avgProgress = Math.round(workers.reduce((s, w) => s + (w.upskillingProgress || 0), 0) / workers.length || 0);

    document.getElementById("adminStatsGrid").innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Total Workers</div>
        <div class="stat-value">${totalWorkers}</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #27ae60, #20c997);">
        <div class="stat-label">Active</div>
        <div class="stat-value">${activeWorkers}</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #ff9800, #ffb366);">
        <div class="stat-label">Avg Progress</div>
        <div class="stat-value">${avgProgress}%</div>
      </div>
    `;

    let workersTableHTML = "";
    workers.forEach(w => {
      workersTableHTML += `
        <tr>
          <td>${w. workerId}</td>
          <td>${w.name}</td>
          <td>${w.profession}</td>
          <td>${w.location}</td>
          <td>${w.upskillingProgress || 0}%</td>
          <td><span class="query-status status-submitted">${w.status}</span></td>
        </tr>
      `;
    });
    document.getElementById("workersTableBody").innerHTML = workersTableHTML;

    // Load queries
    const queriesSnapshot = await getDocs(collection(db, "queries"));
    let queriesHTML = "";

    if (queriesSnapshot.empty) {
      queriesHTML = "<p style='text-align: center; padding: 2rem;'>No queries</p>";
    } else {
      const queries = [];
      queriesSnapshot.forEach(doc => queries.push({... doc.data(), docId: doc.id}));
      queries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      queries.forEach(q => {
        let statusBg = "status-submitted";
        if (q. status === "In Progress") statusBg = "status-inprogress";
        if (q. status === "Resolved") statusBg = "status-resolved";

        queriesHTML += `
          <div class="query-item">
            <div class="query-header">
              <div><strong>${q.queryType}</strong><br><small>${q.workerName} (${q.queryId})</small></div>
              <span class="query-status ${statusBg}">${q. status}</span>
            </div>
            <p>${q.description}</p>
            <div style="margin-top: 1rem;">
              <select onchange="updateQueryStatus('${q. docId}', this.value, '${q.queryId}')">
                <option value="Submitted" ${q.status === "Submitted" ? "selected" : ""}>Submitted</option>
                <option value="In Progress" ${q.status === "In Progress" ?  "selected" : ""}>In Progress</option>
                <option value="Resolved" ${q.status === "Resolved" ? "selected" : ""}>Resolved</option>
              </select>
            </div>
            <textarea style="width: 100%; margin-top: 0.5rem; padding: 0.5rem; border: 1px solid #ddd;" 
              placeholder="Admin note..." id="note-${q.docId}" rows="2">${q.adminNote || ""}</textarea>
            <button class="btn btn-primary" style="margin-top: 0.5rem;" onclick="saveAdminNote('${q.docId}', '${q.queryId}')">Save</button>
          </div>
        `;
      });
    }
    document.getElementById("queriesManagement").innerHTML = queriesHTML;

  } catch (error) {
    console.error("❌ Admin Dashboard Error:", error);
  }
}

// Global functions for admin actions
window.updateQueryStatus = async function(docId, status, queryId) {
  try {
    await updateDoc(doc(db, "queries", queryId), {
      status:  status,
      updatedAt:  new Date().toISOString()
    });
    alert("✅ Status updated!");
  } catch (error) {
    alert("❌ Error:  " + error.message);
  }
};

window.saveAdminNote = async function(docId, queryId) {
  const note = document.getElementById(`note-${docId}`).value;
  try {
    await updateDoc(doc(db, "queries", queryId), {
      adminNote: note,
      updatedAt: new Date().toISOString()
    });
    alert("✅ Note saved!");
  } catch (error) {
    alert("❌ Error: " + error.message);
  }
};

// ========================================
// AUTO LOGIN CHECK
// ========================================

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const role = userDoc.data().role;

    heroSection.style.display = "none";
    document.getElementById("features").style.display = "none";
    logoutBtn.style.display = "block";

    if (role === "WORKER") {
      loadWorkerDashboard(user.uid);
      workerDashboard.style.display = "block";
    } else {
      loadAdminDashboard(user.uid);
      adminDashboard.style.display = "block";
    }
  }
});
