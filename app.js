import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getDatabase, ref, set, get, push } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCj3revNSKJm5V-932kREKQsL6QSNUr5ic",
    authDomain: "shaktiseva-14bec.firebaseapp.com",
    databaseURL: "https://shaktiseva-14bec-default-rtdb.firebaseio.com",
    projectId: "shaktiseva-14bec",
    storageBucket: "shaktiseva-14bec.firebasestorage.app",
    messagingSenderId: "972891642824",
    appId: "1:972891642824:web:994935b12bd9a9ec207efd",
    measurementId: "G-690MFJHW1B"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUser = null;
let currentRole = null;

// Screen navigation
window.showScreen = function(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    
    if (screenId === 'homeScreen') {
        document.getElementById('header').style.display = 'none';
    } else {
        document.getElementById('header').style.display = 'flex';
    }
};

// Show message helper
function showMessage(elementId, message, type) {
    const msgEl = document.getElementById(elementId);
    msgEl.textContent = message;
    msgEl.className = `message ${type} show`;
    setTimeout(() => {
        msgEl.classList.remove('show');
    }, 5000);
}

// Role selection
window.selectRole = function(role) {
    currentRole = role;
    if (role === 'worker') {
        showScreen('workerLoginScreen');
    } else {
        showScreen('adminLoginScreen');
    }
};

// Worker Registration
window.workerRegister = async function() {
    const name = document.getElementById('workerName').value.trim();
    const phone = document.getElementById('workerPhone').value.trim();
    const email = document.getElementById('workerEmail').value.trim();
    const profession = document.getElementById('workerProfession').value;
    const experience = document.getElementById('workerExperience').value;
    const address = document.getElementById('workerAddress').value.trim();
    const password = document.getElementById('workerRegPassword').value;

    if (!name || !phone || !email || !profession || !experience || !address || !password) {
        showMessage('workerRegisterMessage', 'Please fill all fields', 'error');
        return;
    }

    const workerId = 'WKR' + Date.now().toString().slice(-8);
    
    try {
        await set(ref(db, 'workers/' + workerId), {
            workerId,
            name,
            phone,
            email,
            profession,
            experience,
            address,
            password,
            registeredAt: new Date().toISOString()
        });

        showMessage('workerRegisterMessage', `Registration successful! Your Worker ID is: ${workerId}`, 'success');
        alert(`Note your worker id: ${workerId}`);
        
        // Clear form
        document.getElementById('workerName').value = '';
        document.getElementById('workerPhone').value = '';
        document.getElementById('workerEmail').value = '';
        document.getElementById('workerProfession').value = '';
        document.getElementById('workerExperience').value = '';
        document.getElementById('workerAddress').value = '';
        document.getElementById('workerRegPassword').value = '';
        
        setTimeout(() => {
            showScreen('workerLoginScreen');
        }, 2000);
    } catch (error) {
        console.error(error);
        showMessage('workerRegisterMessage', 'Registration failed. Please try again.', 'error');
    }
};

// Worker Login
window.workerLogin = async function() {
    const workerId = document.getElementById('workerLoginId').value.trim();
    const password = document.getElementById('workerLoginPass').value;

    if (!workerId || !password) {
        showMessage('workerLoginMessage', 'Please enter Worker ID and password', 'error');
        return;
    }

    try {
        const snapshot = await get(ref(db, 'workers/' + workerId));
        if (snapshot.exists()) {
            const data = snapshot.val();
            if (data.password === password) {
                currentUser = data;
                currentRole = 'worker';
                document.getElementById('headerTitle').textContent = `Welcome, ${data.name}`;
                showScreen('workerDashboardScreen');
                loadWorkerProfile();
            } else {
                showMessage('workerLoginMessage', 'Invalid password', 'error');
            }
        } else {
            showMessage('workerLoginMessage', 'Worker ID not found', 'error');
        }
    } catch (error) {
        console.error(error);
        showMessage('workerLoginMessage', 'Login failed. Please try again.', 'error');
    }
};

// Admin Registration
window.adminRegister = async function() {
    const name = document.getElementById('adminName').value.trim();
    const email = document.getElementById('adminEmail').value.trim();
    const phone = document.getElementById('adminPhone').value.trim();
    const dept = document.getElementById('adminDept').value.trim();
    const password = document.getElementById('adminRegPassword').value;

    if (!name || !email || !phone || !dept || !password) {
        showMessage('adminRegisterMessage', 'Please fill all fields', 'error');
        return;
    }

    const adminId = 'ADM' + Date.now().toString().slice(-8);
    
    try {
        await set(ref(db, 'admins/' + adminId), {
            adminId,
            name,
            email,
            phone,
            department: dept,
            password,
            registeredAt: new Date().toISOString()
        });

        showMessage('adminRegisterMessage', `Registration successful! Your Admin ID is: ${adminId}`, 'success');
        
        // Clear form
        document.getElementById('adminName').value = '';
        document.getElementById('adminEmail').value = '';
        document.getElementById('adminPhone').value = '';
        document.getElementById('adminDept').value = '';
        document.getElementById('adminRegPassword').value = '';
        
        setTimeout(() => {
            showScreen('adminLoginScreen');
        }, 2000);
    } catch (error) {
        console.error(error);
        showMessage('adminRegisterMessage', 'Registration failed. Please try again.', 'error');
    }
};

// Admin Login
window.adminLogin = async function() {
    const adminId = document.getElementById('adminLoginId').value.trim();
    const password = document.getElementById('adminLoginPass').value;

    if (!adminId || !password) {
        showMessage('adminLoginMessage', 'Please enter Admin ID and password', 'error');
        return;
    }

    try {
        const snapshot = await get(ref(db, 'admins/' + adminId));
        if (snapshot.exists()) {
            const data = snapshot.val();
            if (data.password === password) {
                currentUser = data;
                currentRole = 'admin';
                document.getElementById('headerTitle').textContent = `Admin Panel - ${data.name}`;
                showScreen('adminDashboardScreen');
                loadAdminData();
            } else {
                showMessage('adminLoginMessage', 'Invalid password', 'error');
            }
        } else {
            showMessage('adminLoginMessage', 'Admin ID not found', 'error');
        }
    } catch (error) {
        console.error(error);
        showMessage('adminLoginMessage', 'Login failed. Please try again.', 'error');
    }
};

// Load Worker Profile
window.loadWorkerProfile = function() {
    const profileDiv = document.getElementById('workerProfileInfo');
    profileDiv.innerHTML = `
        <h3>Personal Information</h3>
        <div class="info-row">
            <div class="info-label">Worker ID:</div>
            <div class="info-value">${currentUser.workerId}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Name:</div>
            <div class="info-value">${currentUser.name}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Phone:</div>
            <div class="info-value">${currentUser.phone}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Email:</div>
            <div class="info-value">${currentUser.email}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Profession:</div>
            <div class="info-value">${currentUser.profession}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Experience:</div>
            <div class="info-value">${currentUser.experience} years</div>
        </div>
        <div class="info-row">
            <div class="info-label">Address:</div>
            <div class="info-value">${currentUser.address}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Registered:</div>
            <div class="info-value">${new Date(currentUser.registeredAt).toLocaleDateString()}</div>
        </div>
    `;
};

// Submit Query
window.submitQuery = async function() {
    const subject = document.getElementById('querySubject').value.trim();
    const description = document.getElementById('queryDescription').value.trim();

    if (!subject || !description) {
        showMessage('queryMessage', 'Please fill in both subject and description', 'error');
        return;
    }

    try {
        const queryRef = push(ref(db, 'queries'));
        await set(queryRef, {
            queryId: queryRef.key,
            workerId: currentUser.workerId,
            workerName: currentUser.name,
            subject,
            description,
            status: 'pending',
            submittedAt: new Date().toISOString()
        });

        showMessage('queryMessage', 'Query submitted successfully!', 'success');
        document.getElementById('querySubject').value = '';
        document.getElementById('queryDescription').value = '';
        
        loadWorkerQueries();
    } catch (error) {
        console.error(error);
        showMessage('queryMessage', 'Failed to submit query. Please try again.', 'error');
    }
};

// Load Worker Queries
window.loadWorkerQueries = async function() {
    try {
        const snapshot = await get(ref(db, 'queries'));
        const queriesDiv = document.getElementById('myQueriesList');
        
        if (!snapshot.exists()) {
            queriesDiv.innerHTML = '<p style="text-align: center; color: #666;">No queries submitted yet.</p>';
            return;
        }

        const queries = [];
        snapshot.forEach(child => {
            const query = child.val();
            if (query.workerId === currentUser.workerId) {
                queries.push(query);
            }
        });

        if (queries.length === 0) {
            queriesDiv.innerHTML = '<p style="text-align: center; color: #666;">No queries submitted yet.</p>';
            return;
        }

        queries.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        queriesDiv.innerHTML = queries.map(query => `
            <div class="query-item">
                <h4>${query.subject}</h4>
                <p><strong>Description:</strong> ${query.description}</p>
                <p><strong>Submitted:</strong> ${new Date(query.submittedAt).toLocaleString()}</p>
                <span class="status-badge status-${query.status}">${query.status.toUpperCase()}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error(error);
        document.getElementById('myQueriesList').innerHTML = '<p style="text-align: center; color: #c33;">Failed to load queries.</p>';
    }
};

// Load admin data
window.loadAdminData = function() {
    loadAllQueries();
    loadAllWorkers();
};

// Load all queries for admin
window.loadAllQueries = async function() {
    try {
        const snapshot = await get(ref(db, 'queries'));
        const queriesDiv = document.getElementById('adminQueriesList');
        
        if (!snapshot.exists()) {
            queriesDiv.innerHTML = '<p style="text-align: center; color: #666;">No queries found.</p>';
            return;
        }

        const queries = [];
        snapshot.forEach(child => {
            queries.push(child.val());
        });

        queries.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        queriesDiv.innerHTML = queries.map(query => `
            <div class="query-item">
                <h4>${query.subject}</h4>
                <p><strong>Worker:</strong> ${query.workerName} (ID: ${query.workerId})</p>
                <p><strong>Description:</strong> ${query.description}</p>
                <p><strong>Submitted:</strong> ${new Date(query.submittedAt).toLocaleString()}</p>
                <span class="status-badge status-${query.status}">${query.status.toUpperCase()}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error(error);
        document.getElementById('adminQueriesList').innerHTML = '<p style="text-align: center; color: #c33;">Failed to load queries.</p>';
    }
};

// Load all workers for admin
window.loadAllWorkers = async function() {
    try {
        const snapshot = await get(ref(db, 'workers'));
        const workersDiv = document.getElementById('adminWorkersList');
        
        if (!snapshot.exists()) {
            workersDiv.innerHTML = '<p style="text-align: center; color: #666;">No workers registered yet.</p>';
            return;
        }

        const workers = [];
        snapshot.forEach(child => {
            workers.push(child.val());
        });

        workers.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

        workersDiv.innerHTML = workers.map(worker => `
            <div class="worker-item">
                <h4>${worker.name}</h4>
                <p><strong>Worker ID:</strong> ${worker.workerId}</p>
                <p><strong>Profession:</strong> ${worker.profession}</p>
                <p><strong>Experience:</strong> ${worker.experience} years</p>
                <p><strong>Phone:</strong> ${worker.phone}</p>
                <p><strong>Email:</strong> ${worker.email}</p>
                <p><strong>Address:</strong> ${worker.address}</p>
                <p><strong>Registered:</strong> ${new Date(worker.registeredAt).toLocaleString()}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error(error);
        document.getElementById('adminWorkersList').innerHTML = '<p style="text-align: center; color: #c33;">Failed to load workers.</p>';
    }
};

// Admin tab switching
window.showAdminTab = function(tab) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'queries') {
        tabs[0].classList.add('active');
        document.getElementById('adminQueriesTab').style.display = 'block';
        document.getElementById('adminWorkersTab').style.display = 'none';
        loadAllQueries();
    } else if (tab === 'workers') {
        tabs[1].classList.add('active');
        document.getElementById('adminQueriesTab').style.display = 'none';
        document.getElementById('adminWorkersTab').style.display = 'block';
        loadAllWorkers();
    }
};

// Logout
window.logout = function() {
    currentUser = null;
    currentRole = null;
    showScreen('homeScreen');
};

// Load worker queries when screen is shown
const originalShowScreen = window.showScreen;
window.showScreen = function(screenId) {
    originalShowScreen(screenId);
    
    if (screenId === 'workerQueryScreen' && currentUser) {
        loadWorkerQueries();
    }
};
