// SHAKTI SEVA - Government Grade Portal
// STRICTLY follows specified architecture and database schema

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth-compat.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore-compat.js';

document.addEventListener('DOMContentLoaded', () => {
    // SHAKTI SEVA Firebase Configuration - PRODUCTION READY
    const firebaseConfig = {
        apiKey: "AIzaSyCj3revNSKJm5V-932kREKQsL6QSNUr5ic",
        authDomain: "shaktiseva-14bec.firebaseapp.com",
        projectId: "shaktiseva-14bec",
        storageBucket: "shaktiseva-14bec.firebasestorage.app",
        messagingSenderId: "972891642824",
        appId: "1:972891642824:web:994935b12bd9a9ec207efd"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // State Management
    let currentUser = null;
    let currentUserRole = null;
    let workerData = null;

    // DOM Elements
    const loadingScreen = document.getElementById('loading-screen');
    const navbar = document.getElementById('navbar');
    const authSection = document.getElementById('auth-section');
    const workerDashboard = document.getElementById('worker-dashboard');
    const adminDashboard = document.getElementById('admin-dashboard');
    const authForm = document.getElementById('auth-form');
    const authSubmit = document.getElementById('auth-submit');
    const authError = document.getElementById('auth-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Worker Elements
    const workerProfile = document.getElementById('worker-profile');
    const upskillingModules = document.getElementById('upskilling-modules');
    const workerRequests = document.getElementById('worker-requests');
    const newRequestBtn = document.getElementById('new-request-btn');

    // Admin Elements
    const totalWorkersEl = document.getElementById('total-workers');
    const avgUpskillingEl = document.getElementById('avg-upskilling');
    const activeRequestsEl = document.getElementById('active-requests');
    const workersTable = document.getElementById('workers-table');
    const adminRequests = document.getElementById('admin-requests');

    // Modal Elements
    const requestModal = document.getElementById('request-modal');
    const requestForm = document.getElementById('request-form');
    const closeModal = document.getElementById('close-modal');

    // Filters
    const professionFilter = document.getElementById('profession-filter');
    const locationFilter = document.getElementById('location-filter');
    const progressFilter = document.getElementById('progress-filter');

    // Utility Functions
    const showError = (message, element = authError) => {
        element.textContent = message;
        element.classList.remove('hidden');
        setTimeout(() => element.classList.add('hidden'), 5000);
    };

    const hideAllSections = () => {
        authSection.classList.add('hidden');
        workerDashboard.classList.add('hidden');
        adminDashboard.classList.add('hidden');
        navbar.classList.add('hidden');
        requestModal.classList.add('hidden');
    };

    const generateWorkerId = () => {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const random = Math.floor(Math.random() * 90000) + 10000;
        return `SS-W-${year}${random}`;
    };

    const calculateProgress = (modules) => {
        const completed = Object.values(modules).filter(status => status === 'completed').length;
        return Math.round((completed / 3) * 100);
    };

    // Authentication Functions
    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            authSubmit.textContent = 'Signing In...';
            authSubmit.disabled = true;

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Role check happens in onAuthStateChanged
        } catch (error) {
            showError('Invalid credentials. Please try again.');
            console.error('Auth Error:', error);
        } finally {
            authSubmit.textContent = 'Sign In';
            authSubmit.disabled = false;
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout Error:', error);
        }
    };

    const fetchUserRole = async (uid) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                return userDoc.data().role;
            }
            return null;
        } catch (error) {
            console.error('Role fetch error:', error);
            return null;
        }
    };

    // Worker Functions
    const renderWorkerProfile = () => {
        if (!workerData) return;

        workerProfile.innerHTML = `
            <div class="profile-item">
                <div class="profile-label">Worker ID</div>
                <div class="profile-value">${workerData.workerId}</div>
            </div>
            <div class="profile-item">
                <div class="profile-label">Name</div>
                <div class="profile-value">${workerData.name}</div>
            </div>
            <div class="profile-item">
                <div class="profile-label">Profession</div>
                <div class="profile-value">${workerData.profession}</div>
            </div>
            <div class="profile-item">
                <div class="profile-label">Location</div>
                <div class="profile-value">${workerData.location}</div>
            </div>
            <div class="profile-item">
                <div class="profile-label">Experience</div>
                <div class="profile-value">${workerData.experienceYears} years</div>
            </div>
            <div class="profile-item">
                <div class="profile-label">Status</div>
                <div class="profile-value">
                    <span class="badge ${workerData.status.toLowerCase()}">${workerData.status}</span>
                </div>
            </div>
        `;
    };

    const renderUpskillingModules = async () => {
        try {
            const upskillingDoc = await getDoc(doc(db, 'upskilling', currentUser.uid));
            const modules = upskillingDoc.exists() ? upskillingDoc.data() : {
                safetyTraining: 'not started',
                financialLiteracy: 'not started',
                toolHandling: 'not started'
            };

            const progress = calculateProgress(modules);
            document.getElementById('overall-progress').style.width = `${progress}%`;
            document.getElementById('overall-progress-text').textContent = `${progress}%`;

            upskillingModules.innerHTML = `
                <div class="module-card">
                    <div class="module-header">
                        <div class="module-title">Safety Training</div>
                        <span class="module-status ${modules.safetyTraining}">${modules.safetyTraining.replace(/^\w/, c => c.toUpperCase())}</span>
                    </div>
                    ${modules.safetyTraining === 'not started' ? 
                        '<button class="btn-primary module-complete-btn" onclick="app.completeModule(\'safetyTraining\')">Mark Complete</button>' : 
                        '<p class="text-green-600 font-medium">✅ Completed</p>'
                    }
                </div>
                <div class="module-card">
                    <div class="module-header">
                        <div class="module-title">Financial Literacy</div>
                        <span class="module-status ${modules.financialLiteracy}">${modules.financialLiteracy.replace(/^\w/, c => c.toUpperCase())}</span>
                    </div>
                    ${modules.financialLiteracy === 'not started' ? 
                        '<button class="btn-primary module-complete-btn" onclick="app.completeModule(\'financialLiteracy\')">Mark Complete</button>' : 
                        '<p class="text-green-600 font-medium">✅ Completed</p>'
                    }
                </div>
                <div class="module-card">
                    <div class="module-header">
                        <div class="module-title">Tool Handling</div>
                        <span class="module-status ${modules.toolHandling}">${modules.toolHandling.replace(/^\w/, c => c.toUpperCase())}</span>
                    </div>
                    ${modules.toolHandling === 'not started' ? 
                        '<button class="btn-primary module-complete-btn" onclick="app.completeModule(\'toolHandling\')">Mark Complete</button>' : 
                        '<p class="text-green-600 font-medium">✅ Completed</p>'
                    }
                </div>
            `;
        } catch (error) {
            console.error('Upskilling render error:', error);
        }
    };

    const completeModule = async (moduleName) => {
        try {
            const upskillingRef = doc(db, 'upskilling', currentUser.uid);
            await updateDoc(upskillingRef, {
                [moduleName]: 'completed',
                lastUpdated: new Date().toISOString()
            });
            renderUpskillingModules();
            showError('Module marked as completed!', authError);
            authError.style.background = '#f0fdf4';
            authError.style.color = '#059669';
            authError.style.borderLeftColor = '#10b981';
        } catch (error) {
            showError('Error updating module.');
        }
    };

    const renderWorkerRequests = async () => {
        try {
            const q = query(
                collection(db, 'command_requests'),
                where('uid', '==', currentUser.uid),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            
            workerRequests.innerHTML = snapshot.docs.map(doc => {
                const data = doc.data();
                return `
                    <div class="request-card">
                        <div class="request-info">
                            <h4>${data.requestType}</h4>
                            <p>${data.description}</p>
                            ${data.adminNote ? `<div class="admin-note">Admin: ${data.adminNote}</div>` : ''}
                            <div class="request-meta">
                                <span class="request-status status-${data.status.toLowerCase().replace(' ', '-')}">${data.status}</span>
                                <span>${new Date(data.createdAt?.toDate()).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('') || '<p class="text-gray-500">No requests submitted yet.</p>';
        } catch (error) {
            console.error('Worker requests error:', error);
            workerRequests.innerHTML = '<p class="text-red-500">Error loading requests.</p>';
        }
    };

    const submitCommandRequest = async (e) => {
        e.preventDefault();
        try {
            const requestType = document.getElementById('request-type').value;
            const description = document.getElementById('request-description').value;
            const requestId = `REQ-${Date.now()}`;

            await setDoc(doc(db, 'command_requests', requestId), {
                requestId,
                uid: currentUser.uid,
                workerId: workerData.workerId,
                workerName: workerData.name,
                requestType,
                description,
                status: 'Submitted',
                adminNote: '',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            requestForm.reset();
            requestModal.classList.add('hidden');
            renderWorkerRequests();
            showError('Request submitted successfully!');
        } catch (error) {
            showError('Error submitting request.');
            console.error('Request submit error:', error);
        }
    };

    // Admin Functions
    const renderAdminOverview = async () => {
        try {
            // Total workers
            const workersSnapshot = await getDocs(collection(db, 'workers'));
            totalWorkersEl.textContent = workersSnapshot.size;

            // Average upskilling
            const avgProgress = workersSnapshot.docs.reduce((sum, doc) => {
                return sum + (doc.data().upskillingProgress || 0);
            }, 0) / Math.max(workersSnapshot.size, 1);
            avgUpskillingEl.textContent = `${Math.round(avgProgress)}%`;

            // Active requests
            const activeRequestsQuery = query(
                collection(db, 'command_requests'),
                where('status', 'in', ['Submitted', 'In Progress'])
            );
            const activeSnapshot = await getDocs(activeRequestsQuery);
            activeRequestsEl.textContent = activeSnapshot.size;
        } catch (error) {
            console.error('Admin overview error:', error);
        }
    };

    const renderWorkersTable = async () => {
        try {
            let workersQuery = collection(db, 'workers');
            
            // Apply filters
            const profession = professionFilter.value;
            const location = locationFilter.value;
            const progress = progressFilter.value;

            if (profession) workersQuery = query(workersQuery, where('profession', '==', profession));
            if (location) workersQuery = query(workersQuery, where('location', '==', location));
            if (progress) workersQuery = query(workersQuery, where('upskillingProgress', '==', parseInt(progress)));

            const snapshot = await getDocs(workersQuery);
            
            // Populate filters
            if (snapshot.docs.length > 0) {
                const professions = [...new Set(snapshot.docs.map(d => d.data().profession))];
                professionFilter.innerHTML = '<option value="">All Professions</option>' + 
                    professions.map(p => `<option value="${p}">${p}</option>`).join('');
            }

            workersTable.innerHTML = `
                <table class="workers-table">
                    <thead>
                        <tr>
                            <th>Worker ID</th>
                            <th>Name</th>
                            <th>Profession</th>
                            <th>Location</th>
                            <th>Experience</th>
                            <th>Progress</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${snapshot.docs.map(doc => {
                            const data = doc.data();
                            return `
                                <tr>
                                    <td>${data.workerId}</td>
                                    <td>${data.name}</td>
                                    <td>${data.profession}</td>
                                    <td>${data.location}</td>
                                    <td>${data.experienceYears} yrs</td>
                                    <td>${data.upskillingProgress}%</td>
                                    <td><span class="badge ${data.status.toLowerCase()}">${data.status}</span></td>
                                </tr>
                            `;
                        }).join('') || '<tr><td colspan="7" class="text-center py-8">No workers found</td></tr>'}
                    </tbody>
                </table>
            `;
        } catch (error) {
            console.error('Workers table error:', error);
            workersTable.innerHTML = '<p class="text-red-500 p-4">Error loading workers.</p>';
        }
    };

    const renderAdminRequests = async () => {
        try {
            const snapshot = await getDocs(
                query(collection(db, 'command_requests'), orderBy('createdAt', 'desc'))
            );
            
            adminRequests.innerHTML = snapshot.docs.map(doc => {
                const data = doc.data();
                return `
                    <div class="request-card">
                        <div class="request-info">
                            <h4>${data.requestType} - ${data.workerName} (${data.workerId})</h4>
                            <p>${data.description}</p>
                            <div class="request-meta">
                                <span class="request-status status-${data.status.toLowerCase().replace(' ', '-')}">${data.status}</span>
                                <span>${new Date(data.createdAt?.toDate()).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="request-actions">
                            <select onchange="app.updateRequestStatus('${doc.id}', this.value)">
                                <option value="Submitted" ${data.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
                                <option value="In Progress" ${data.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                <option value="Resolved" ${data.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                            </select>
                            <textarea placeholder="Add admin note..." 
                                      onblur="app.addAdminNote('${doc.id}', this.value)">${data.adminNote || ''}</textarea>
                        </div>
                    </div>
                `;
            }).join('') || '<p class="text-gray-500">No requests found.</p>';
        } catch (error) {
            console.error('Admin requests error:', error);
        }
    };

    const updateRequestStatus = async (requestId, status) => {
        try {
            await updateDoc(doc(db, 'command_requests', requestId), {
                status,
                updatedAt: new Date()
            });
            renderAdminRequests();
        } catch (error) {
            showError('Error updating status.');
        }
    };

    const addAdminNote = async (requestId, note) => {
        if (!note.trim()) return;
        try {
            await updateDoc(doc(db, 'command_requests', requestId), {
                adminNote: note.trim(),
                updatedAt: new Date()
            });
        } catch (error) {
            showError('Error adding note.');
        }
    };

    // Route Management
    const showWorkerDashboard = () => {
        hideAllSections();
        workerDashboard.classList.remove('hidden');
        navbar.classList.remove('hidden');
        renderWorkerProfile();
        renderUpskillingModules();
        renderWorkerRequests();
    };

    const showAdminDashboard = () => {
        hideAllSections();
        adminDashboard.classList.remove('hidden');
        navbar.classList.remove('hidden');
        renderAdminOverview();
        renderWorkersTable();
        renderAdminRequests();
    };

    const showAuth = () => {
        hideAllSections();
        authSection.classList.remove('hidden');
        loadingScreen.classList.remove('hidden');
        setTimeout(() => loadingScreen.classList.add('hidden'), 1500);
    };

    // Event Listeners
    authForm.addEventListener('submit', handleAuthSubmit);
    logoutBtn.addEventListener('click', handleLogout);
    newRequestBtn?.addEventListener('click', () => requestModal.classList.remove('hidden'));
    closeModal?.addEventListener('click', () => requestModal.classList.add('hidden'));
    requestForm.addEventListener('submit', submitCommandRequest);

    // Filter listeners
    professionFilter?.addEventListener('change', renderWorkersTable);
    locationFilter?.addEventListener('change', renderWorkersTable);
    progressFilter?.addEventListener('change', renderWorkersTable);

    // Auth State Observer
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            currentUserRole = await fetchUserRole(user.uid);
            
            if (currentUserRole === 'WORKER') {
                // Fetch worker data
                const workerDoc = await getDoc(doc(db, 'workers', user.uid));
                if (workerDoc.exists()) {
                    workerData = workerDoc.data();
                }
                showWorkerDashboard();
            } else if (currentUserRole === 'ADMIN') {
                showAdminDashboard();
            } else {
                showAuth();
                showError('Invalid user role. Contact administrator.');
            }
        } else {
            currentUser = null;
            currentUserRole = null;
            workerData = null;
            showAuth();
        }
    });

    // Expose app methods globally for onclick handlers
    window.app = {
        completeModule,
        updateRequestStatus,
        addAdminNote
    };

    console.log('🔧 SHAKTI SEVA Portal initialized successfully - PRODUCTION READY');
});
