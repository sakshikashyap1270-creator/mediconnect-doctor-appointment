class AppController {
  constructor() {
    this.currentUser = null;
    this.currentProfile = null;
    this.activeRoute = 'home';
    this.chatActive = false;
    this.chatPartner = null;
    
    // Binding methods
    this.handleRoute = this.handleRoute.bind(this);
    
    // Listen for hash change or custom switches
    window.addEventListener('hashchange', this.handleRoute);
    document.addEventListener('DOMContentLoaded', () => {
      this.initUI();
      this.handleRoute();
    });
  }

  initUI() {
    // Inject notification sound (we can just use standard web audio API synthesized beep!)
    this.beepSound = () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch (e) {}
    };
  }

  showToast(message, type = 'primary') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${message}</span>
      <button class="btn-icon" style="color: inherit; padding: 2px;" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(toast);
    this.beepSound();

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Session handling
  setCurrentSession(user, profile) {
    this.currentUser = user;
    this.currentProfile = profile;
    
    // Update profile UI in sidebar
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');
    const avatarEl = document.getElementById('sidebar-user-avatar');
    
    if (user && nameEl && roleEl) {
      nameEl.textContent = user.name;
      roleEl.textContent = user.role.toUpperCase();
      avatarEl.textContent = user.name.split(' ').map(n => n[0]).join('').substring(0,2);
      
      // Update quick role-switcher active state
      document.querySelectorAll('.role-switch-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.role === user.role) btn.classList.add('active');
      });
    }
  }

  switchRole(role) {
    if (role === 'guest') {
      this.currentUser = null;
      this.currentProfile = null;
      window.location.hash = '#home';
      this.renderSidebar();
      this.showToast('Logged out successfully', 'success');
      return;
    }

    let email = '';
    let password = '';
    if (role === 'patient') {
      email = 'john@patient.com';
      password = 'john';
    } else if (role === 'doctor') {
      email = 'sarah@doctor.com';
      password = 'sarah';
    } else if (role === 'admin') {
      email = 'admin@mediconnect.com';
      password = 'admin';
    }

    const session = db.login(email, password);
    if (session) {
      this.setCurrentSession(session.user, session.profile);
      this.showToast(`Switched view to ${session.user.name} (${role.toUpperCase()})`, 'success');
      
      // Direct routing
      if (role === 'patient') window.location.hash = '#patient-dashboard';
      if (role === 'doctor') window.location.hash = '#doctor-dashboard';
      if (role === 'admin') window.location.hash = '#admin-dashboard';
      
      this.renderSidebar();
    }
  }

  handleRoute() {
    const hash = window.location.hash || '#home';
    this.activeRoute = hash.substring(1);
    
    // Update active state in sidebar nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      const href = item.querySelector('a').getAttribute('href');
      if (href === hash) item.classList.add('active');
    });

    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    // Render appropriate template
    switch (this.activeRoute) {
      case 'home':
        this.renderHome(mainContent);
        break;
      case 'about':
        this.renderAbout(mainContent);
        break;
      case 'services':
        this.renderServices(mainContent);
        break;
      case 'contact':
        this.renderContact(mainContent);
        break;
      case 'login':
        this.renderLogin(mainContent);
        break;
      case 'register-patient':
        this.renderRegisterPatient(mainContent);
        break;
      case 'register-doctor':
        this.renderRegisterDoctor(mainContent);
        break;
      case 'patient-dashboard':
        this.checkAuth('patient') ? this.renderPatientDashboard(mainContent) : this.redirectToLogin();
        break;
      case 'doctor-dashboard':
        this.checkAuth('doctor') ? this.renderDoctorDashboard(mainContent) : this.redirectToLogin();
        break;
      case 'admin-dashboard':
        this.checkAuth('admin') ? this.renderAdminDashboard(mainContent) : this.redirectToLogin();
        break;
      case 'find-doctors':
        this.checkAuth('patient') ? this.renderFindDoctors(mainContent) : this.redirectToLogin();
        break;
      case 'patient-records':
        this.checkAuth('patient') ? this.renderPatientRecords(mainContent) : this.redirectToLogin();
        break;
      case 'doctor-availability':
        this.checkAuth('doctor') ? this.renderDoctorAvailability(mainContent) : this.redirectToLogin();
        break;
      default:
        mainContent.innerHTML = '<h2>Page Not Found</h2>';
    }
  }

  checkAuth(role) {
    return this.currentUser && this.currentUser.role === role;
  }

  redirectToLogin() {
    window.location.hash = '#login';
    this.showToast('Please sign in to access that portal', 'warning');
  }

  // Sidebar Menu Renderer
  renderSidebar() {
    const navList = document.getElementById('sidebar-nav-list');
    if (!navList) return;

    let navHTML = '';
    const role = this.currentUser ? this.currentUser.role : 'guest';

    if (role === 'guest') {
      navHTML = `
        <li class="nav-item active"><a href="#home"><i class="icon">🏠</i> Home</a></li>
        <li class="nav-item"><a href="#services"><i class="icon">⚕️</i> Services</a></li>
        <li class="nav-item"><a href="#about"><i class="icon">🏥</i> About Us</a></li>
        <li class="nav-item"><a href="#contact"><i class="icon">📞</i> Contact</a></li>
        <li class="nav-item" style="margin-top: auto;"><a href="#login"><i class="icon">🔑</i> Portal Login</a></li>
      `;
    } else if (role === 'patient') {
      navHTML = `
        <li class="nav-item"><a href="#patient-dashboard"><i class="icon">📊</i> Dashboard</a></li>
        <li class="nav-item"><a href="#find-doctors"><i class="icon">🔍</i> Find Doctors</a></li>
        <li class="nav-item"><a href="#patient-records"><i class="icon">📁</i> Medical Records</a></li>
        <li class="nav-item" onclick="app.openSymptomChecker()"><a href="javascript:void(0)"><i class="icon">🤖</i> AI Symptom Checker</a></li>
        <li class="nav-item" style="margin-top: auto;" onclick="app.switchRole('guest')"><a href="#home"><i class="icon">🚪</i> Logout</a></li>
      `;
    } else if (role === 'doctor') {
      navHTML = `
        <li class="nav-item"><a href="#doctor-dashboard"><i class="icon">📊</i> Doctor Portal</a></li>
        <li class="nav-item"><a href="#doctor-availability"><i class="icon">📅</i> Manage Schedule</a></li>
        <li class="nav-item" style="margin-top: auto;" onclick="app.switchRole('guest')"><a href="#home"><i class="icon">🚪</i> Logout</a></li>
      `;
    } else if (role === 'admin') {
      navHTML = `
        <li class="nav-item"><a href="#admin-dashboard"><i class="icon">🛡️</i> Admin Controls</a></li>
        <li class="nav-item" style="margin-top: auto;" onclick="app.switchRole('guest')"><a href="#home"><i class="icon">🚪</i> Logout</a></li>
      `;
    }

    navList.innerHTML = navHTML;
    
    // Refresh user card visibility in sidebar
    const profileCard = document.getElementById('user-profile-card');
    if (profileCard) {
      profileCard.style.display = this.currentUser ? 'flex' : 'none';
    }
  }

  // --- PUBLIC PAGES TEMPLATES ---

  renderHome(container) {
    container.innerHTML = `
      <div class="hero-section">
        <h1 class="hero-title">Your Health, Guided by Professional Experts</h1>
        <p class="hero-subtitle">Book online appointments, receive digital prescriptions, run AI symptom assessments, and consult doctors securely in real-time.</p>
        <div class="hero-actions">
          <button class="btn btn-primary" onclick="app.switchRole('patient')">Try Patient Portal</button>
          <button class="btn btn-secondary" onclick="app.switchRole('doctor')">Try Doctor Portal</button>
        </div>
      </div>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🔍</div>
          <h3>Find Medical Specialists</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 10px;">Filter practitioners by specialty, pricing range, ratings, and experience in real-time.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🤖</div>
          <h3>AI Symptom Assessment</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 10px;">Assess potential conditions quickly via our smart symptom checklist flow.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💳</div>
          <h3>Secure Digital Payments</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 10px;">Pay consultations securely. Fast refunds and digital invoices directly inside your profile.</p>
        </div>
      </div>
    `;
  }

  renderAbout(container) {
    container.innerHTML = `
      <div class="card glass-panel" style="max-width: 800px; margin: 0 auto;">
        <h2>About MediConnect</h2>
        <p style="margin: 16px 0; color: var(--text-muted);">MediConnect is a next-generation healthcare platform bridging the gap between practitioners and patient care. Founded in 2026, we aim to streamline booking scheduling, digital charting, and secure virtual care consultations.</p>
        <p style="color: var(--text-muted);">Our unified system caters to patients seeking top-tier clinical consultations, doctors looking to manage virtual medical notes, and administrators monitoring hospital performance indicators.</p>
      </div>
    `;
  }

  renderServices(container) {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Healthcare Offerings</h1>
          <p class="page-subtitle">Premium virtual health features</p>
        </div>
      </div>
      <div class="dashboard-grid">
        <div class="card">
          <div class="card-body">
            <h3 style="margin-bottom: 8px;">Cardiovascular Health</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Consult leading cardiologists for vascular diseases, ECG interpretations, and routine checkups.</p>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <h3 style="margin-bottom: 8px;">Pediatric Clinic</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Caring for your little ones: checkups, immunizations, and dynamic developmental tracking.</p>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <h3 style="margin-bottom: 8px;">Mental Well-being</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Counseling, depression screening, therapy slots, and emotional wellness management.</p>
          </div>
        </div>
      </div>
    `;
  }

  renderContact(container) {
    container.innerHTML = `
      <div class="card" style="max-width: 600px; margin: 0 auto;">
        <div class="card-header"><h3>Contact MediConnect Support</h3></div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-control" placeholder="John Doe">
          </div>
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-control" placeholder="john@example.com">
          </div>
          <div class="form-group">
            <label class="form-label">Message</label>
            <textarea class="form-control" rows="4" placeholder="How can we assist you today?"></textarea>
          </div>
          <button class="btn btn-primary w-100" onclick="app.showToast('Your message has been sent!', 'success')">Submit Ticket</button>
        </div>
      </div>
    `;
  }

  // --- PORTAL VIEW RENDERERS ---

  renderLogin(container) {
    container.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-container">
          <div class="auth-header">
            <h2>Welcome Back</h2>
            <p>Access the patient, doctor or admin panels</p>
          </div>
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" id="login-email" class="form-control" placeholder="john@patient.com">
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="login-password" class="form-control" placeholder="••••••••">
          </div>
          <button class="btn btn-primary" style="width: 100%; margin-bottom: 16px;" onclick="app.handleLoginSubmit()">Verify & Sign In</button>
          
          <div style="text-align: center; font-size: 0.85rem; color: var(--text-muted);">
            Don't have an account? <br>
            <a href="#register-patient" style="color: var(--primary); font-weight: 600;">Register as Patient</a> or 
            <a href="#register-doctor" style="color: var(--primary); font-weight: 600;">Register as Doctor</a>
          </div>
        </div>
      </div>
    `;
  }

  handleLoginSubmit() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    
    const session = db.login(email, pass);
    if (session) {
      this.setCurrentSession(session.user, session.profile);
      this.showToast(`Successfully logged in as ${session.user.name}`, 'success');
      this.renderSidebar();
      
      if (session.user.role === 'patient') window.location.hash = '#patient-dashboard';
      if (session.user.role === 'doctor') window.location.hash = '#doctor-dashboard';
      if (session.user.role === 'admin') window.location.hash = '#admin-dashboard';
    } else {
      this.showToast('Invalid credentials. Hint: use the Role Switcher at the top!', 'danger');
    }
  }

  renderRegisterPatient(container) {
    container.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-container" style="max-width: 500px;">
          <div class="auth-header">
            <h2>Patient Registration</h2>
            <p>Create a secure healthcare profile</p>
          </div>
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="reg-pat-name" class="form-control" required placeholder="John Doe">
          </div>
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" id="reg-pat-email" class="form-control" required placeholder="john@patient.com">
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="reg-pat-pass" class="form-control" required placeholder="••••••••">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Birth Date</label>
              <input type="date" id="reg-pat-dob" class="form-control" required>
            </div>
            <div class="form-group">
              <label class="form-label">Gender</label>
              <select id="reg-pat-gender" class="form-control">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Insurance Provider</label>
            <input type="text" id="reg-pat-insurance" class="form-control" placeholder="BlueCross Shield">
          </div>
          <button class="btn btn-primary w-100" onclick="app.handlePatientRegistration()">Submit & Verify OTP</button>
        </div>
      </div>
    `;
  }

  handlePatientRegistration() {
    const name = document.getElementById('reg-pat-name').value;
    const email = document.getElementById('reg-pat-email').value;
    const pass = document.getElementById('reg-pat-pass').value;
    const dob = document.getElementById('reg-pat-dob').value;
    const gender = document.getElementById('reg-pat-gender').value;
    const insurance = document.getElementById('reg-pat-insurance').value;

    if (!name || !email || !pass || !dob) {
      this.showToast('Please fill out all required fields', 'warning');
      return;
    }

    // Trigger Mock OTP Modal
    this.openOTPModal(() => {
      try {
        const session = db.registerPatient(name, email, pass, dob, gender, '+1 (555) 000-0000', insurance);
        this.setCurrentSession(session.user, session.profile);
        this.renderSidebar();
        window.location.hash = '#patient-dashboard';
        this.showToast('Registration complete & account activated!', 'success');
      } catch (err) {
        this.showToast(err.message, 'danger');
      }
    });
  }

  renderRegisterDoctor(container) {
    container.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-container" style="max-width: 550px;">
          <div class="auth-header">
            <h2>Doctor Onboarding</h2>
            <p>Submit verification credentials for review</p>
          </div>
          <div class="form-group">
            <label class="form-label">Doctor Full Name</label>
            <input type="text" id="reg-doc-name" class="form-control" placeholder="Dr. Sarah Jenkins">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" id="reg-doc-email" class="form-control" placeholder="sarah@doctor.com">
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" id="reg-doc-pass" class="form-control" placeholder="••••••••">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Specialty</label>
              <select id="reg-doc-special" class="form-control">
                ${db.state.specializations.map(s => `<option>${s}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Experience (Years)</label>
              <input type="number" id="reg-doc-exp" class="form-control" placeholder="10">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Consultation Fee ($)</label>
              <input type="number" id="reg-doc-fee" class="form-control" placeholder="100">
            </div>
            <div class="form-group">
              <label class="form-label">Professional License ID</label>
              <input type="text" id="reg-doc-license" class="form-control" placeholder="LIC-123456">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Clinic Location Address</label>
            <input type="text" id="reg-doc-loc" class="form-control" placeholder="Manhattan Medical Plaza">
          </div>
          <button class="btn btn-primary w-100" onclick="app.handleDoctorRegistration()">Submit Registration & Credentials</button>
        </div>
      </div>
    `;
  }

  handleDoctorRegistration() {
    const name = document.getElementById('reg-doc-name').value;
    const email = document.getElementById('reg-doc-email').value;
    const pass = document.getElementById('reg-doc-pass').value;
    const specialty = document.getElementById('reg-doc-special').value;
    const exp = document.getElementById('reg-doc-exp').value;
    const fee = document.getElementById('reg-doc-fee').value;
    const license = document.getElementById('reg-doc-license').value;
    const loc = document.getElementById('reg-doc-loc').value;

    if (!name || !email || !pass || !license) {
      this.showToast('Please fill out basic doctor credentials', 'warning');
      return;
    }

    try {
      const session = db.registerDoctor(name, email, pass, specialty, exp, fee, loc, license, 'Onboarded specialist practitioner.');
      this.showToast('Onboarding files uploaded! Wait for Admin Verification.', 'success');
      
      // Auto login as doctor to let them view pending state
      this.setCurrentSession(session.user, session.profile);
      this.renderSidebar();
      window.location.hash = '#doctor-dashboard';
    } catch (e) {
      this.showToast(e.message, 'danger');
    }
  }

  openOTPModal(callback) {
    const modal = document.getElementById('general-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');
    
    title.textContent = 'OTP Mobile & Email Verification';
    body.innerHTML = `
      <p style="margin-bottom: 16px; font-size: 0.9rem; color: var(--text-muted);">We sent a 6-digit confirmation code to your device. Please enter it below to confirm registration.</p>
      <div style="display: flex; gap: 10px; justify-content: center; margin: 20px 0;">
        <input type="text" class="form-control" style="width: 50px; text-align: center; font-size: 1.5rem;" maxlength="1" value="4">
        <input type="text" class="form-control" style="width: 50px; text-align: center; font-size: 1.5rem;" maxlength="1" value="9">
        <input type="text" class="form-control" style="width: 50px; text-align: center; font-size: 1.5rem;" maxlength="1" value="2">
        <input type="text" class="form-control" style="width: 50px; text-align: center; font-size: 1.5rem;" maxlength="1" value="8">
        <input type="text" class="form-control" style="width: 50px; text-align: center; font-size: 1.5rem;" maxlength="1" placeholder="•">
        <input type="text" class="form-control" style="width: 50px; text-align: center; font-size: 1.5rem;" maxlength="1" placeholder="•">
      </div>
      <p style="text-align: center; font-size: 0.8rem; color: var(--primary); cursor: pointer;" onclick="app.showToast('New OTP Resent!', 'success')">Resend Code (SMS & Email)</p>
    `;
    
    footer.innerHTML = `
      <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
      <button class="btn btn-primary" id="confirm-otp-btn">Verify Account</button>
    `;
    
    modal.classList.add('active');
    
    document.getElementById('confirm-otp-btn').onclick = () => {
      this.closeModal();
      callback();
    };
  }

  closeModal() {
    document.getElementById('general-modal').classList.remove('active');
  }

  // --- PATIENT VIEWS ---

  renderPatientDashboard(container) {
    const apts = db.getAppointments({ patientId: this.currentProfile.id });
    const pending = apts.filter(a => a.status === 'pending');
    const upcoming = apts.filter(a => a.status === 'approved');
    const completed = apts.filter(a => a.status === 'completed');

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Welcome, ${this.currentProfile.name}</h1>
          <p class="page-subtitle">Track your upcoming appointments, prescriptions and reviews</p>
        </div>
        <div>
          <button class="btn btn-primary" onclick="window.location.hash='#find-doctors'">🔍 Find & Book Doctors</button>
        </div>
      </div>
      
      <div class="dashboard-grid">
        <div class="stat-card">
          <div class="stat-info">
            <h3>Scheduled Consultation</h3>
            <div class="stat-value">${upcoming.length}</div>
          </div>
          <div class="stat-icon success">📅</div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <h3>Pending Bookings</h3>
            <div class="stat-value">${pending.length}</div>
          </div>
          <div class="stat-icon warning">⌛</div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <h3>Heart Rate</h3>
            <div class="stat-value" style="font-size: 1.5rem; display: flex; align-items: baseline; gap: 4px;">
              72 <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">bpm</span>
            </div>
          </div>
          <div class="stat-icon danger">❤️</div>
        </div>
      </div>
      
      <div class="card" style="margin-bottom: 30px;">
        <div class="card-header">
          <h3 class="card-title">Consultation Records</h3>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Consultation Fee</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${apts.length === 0 ? `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No booking schedule found.</td></tr>` : ''}
                ${apts.map(a => `
                  <tr>
                    <td><strong>${a.doctorName}</strong><br><span style="font-size: 0.75rem; color: var(--text-muted);">${a.specialization}</span></td>
                    <td>${a.date} at ${a.timeSlot}</td>
                    <td>$${a.fee}</td>
                    <td>
                      <span class="badge ${a.status === 'approved' ? 'badge-success' : a.status === 'completed' ? 'badge-primary' : a.status === 'pending' ? 'badge-warning' : 'badge-danger'}">
                        ${a.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span class="badge ${a.paymentStatus === 'paid' ? 'badge-success' : 'badge-danger'}">
                        ${a.paymentStatus.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style="display: flex; gap: 8px;">
                        ${a.paymentStatus === 'unpaid' ? `<button class="btn btn-sm btn-success" onclick="app.payForAppointment('${a.id}')">💳 Pay</button>` : ''}
                        ${a.status === 'completed' ? `<button class="btn btn-sm btn-outline-primary" onclick="app.downloadPrescription('${a.id}')">📄 Rx</button>` : ''}
                        ${a.status === 'completed' ? `<button class="btn btn-sm btn-secondary" onclick="app.writeReview('${a.doctorId}')">⭐ Review</button>` : ''}
                        ${a.status === 'approved' ? `<button class="btn btn-sm btn-primary" onclick="app.startVideoCall('${a.id}', '${a.doctorName}')">📹 Call</button>` : ''}
                        ${a.status === 'approved' ? `<button class="btn btn-sm btn-outline-primary" onclick="app.openChat('${a.doctorId}', '${a.doctorName}')">💬 Chat</button>` : ''}
                        ${a.status === 'approved' ? `<button class="btn btn-sm btn-secondary" onclick="app.showCheckInQR('${a.id}')">📱 QR</button>` : ''}
                        ${a.status === 'pending' || a.status === 'approved' ? `<button class="btn btn-sm btn-danger" onclick="app.cancelBooking('${a.id}')">✕ Cancel</button>` : ''}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  payForAppointment(id) {
    const apt = db.state.appointments.find(a => a.id === id);
    if (!apt) return;
    
    const modal = document.getElementById('general-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');
    
    title.textContent = 'Secure Payment Gateway';
    body.innerHTML = `
      <div style="margin-bottom: 20px; text-align: center;">
        <p style="color: var(--text-muted); font-size: 0.9rem;">Pay consultation fee for booking reference <strong>${apt.id}</strong></p>
        <h2 style="font-size: 2.25rem; font-weight: 800; color: var(--primary); margin: 10px 0;">$${apt.fee}.00</h2>
      </div>
      <div class="form-group">
        <label class="form-label">Payment Method</label>
        <select id="payment-method-select" class="form-control">
          <option>Visa Card ending 4492</option>
          <option>PayPal Account</option>
          <option>Apple Pay</option>
          <option>Health Insurance Reimbursement</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Card Verification Code (CVC)</label>
        <input type="password" class="form-control" placeholder="•••" maxlength="3" value="123">
      </div>
    `;
    
    footer.innerHTML = `
      <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
      <button class="btn btn-success" id="confirm-payment-btn">Authorize Payment</button>
    `;
    
    modal.classList.add('active');
    
    document.getElementById('confirm-payment-btn').onclick = () => {
      const method = document.getElementById('payment-method-select').value;
      db.processPayment(id, method);
      this.closeModal();
      this.showToast('Payment completed successfully!', 'success');
      this.handleRoute(); // reload page
    };
  }

  showCheckInQR(appointmentId) {
    const modal = document.getElementById('general-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');
    
    title.textContent = 'Digital QR Check-in Pass';
    body.innerHTML = `
      <p style="margin-bottom: 16px; font-size: 0.9rem; color: var(--text-muted); text-align: center;">Present this QR code at the clinic front desk to check-in instantly.</p>
      <div class="qr-container">
        <!-- Render a simulated QR code using canvas or inline SVG -->
        <svg width="150" height="150" viewBox="0 0 150 150" style="background-color: white; padding: 10px;">
          <!-- QR pattern mock -->
          <rect x="10" y="10" width="30" height="30" fill="#0f172a" />
          <rect x="15" y="15" width="20" height="20" fill="white" />
          <rect x="20" y="20" width="10" height="10" fill="#0f172a" />
          
          <rect x="110" y="10" width="30" height="30" fill="#0f172a" />
          <rect x="115" y="15" width="20" height="20" fill="white" />
          <rect x="120" y="20" width="10" height="10" fill="#0f172a" />
          
          <rect x="10" y="110" width="30" height="30" fill="#0f172a" />
          <rect x="15" y="115" width="20" height="20" fill="white" />
          <rect x="20" y="120" width="10" height="10" fill="#0f172a" />
          
          <!-- Mock pixels -->
          <rect x="50" y="20" width="10" height="10" fill="#0f172a" />
          <rect x="70" y="40" width="20" height="10" fill="#0f172a" />
          <rect x="90" y="20" width="10" height="30" fill="#0f172a" />
          <rect x="50" y="60" width="30" height="10" fill="#0f172a" />
          <rect x="60" y="90" width="10" height="20" fill="#0f172a" />
          <rect x="100" y="80" width="20" height="20" fill="#0f172a" />
          <rect x="80" y="120" width="30" height="10" fill="#0f172a" />
        </svg>
        <span class="qr-title">REF: ${appointmentId}</span>
      </div>
    `;
    
    footer.innerHTML = `
      <button class="btn btn-primary" onclick="app.closeModal()">Close Pass</button>
    `;
    
    modal.classList.add('active');
  }

  cancelBooking(id) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      db.updateAppointmentStatus(id, 'cancelled');
      this.showToast('Appointment successfully cancelled.', 'danger');
      this.handleRoute();
    }
  }

  downloadPrescription(appointmentId) {
    const rx = db.getPrescriptionForAppointment(appointmentId);
    if (!rx) {
      this.showToast('No digital prescription found for this visit.', 'warning');
      return;
    }
    
    const modal = document.getElementById('general-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');
    
    title.textContent = 'Digital Prescription & Medical Notes';
    body.innerHTML = `
      <div style="border: 2px dashed var(--border-color); padding: 24px; border-radius: var(--radius-md); font-family: monospace; background-color: var(--bg-app); color: var(--text-main);">
        <h3 style="text-align: center; text-transform: uppercase; margin-bottom: 20px;">℞ MEDICONNECT DIGITAL</h3>
        <p><strong>Rx Reference:</strong> ${rx.id}</p>
        <p><strong>Date Issued:</strong> ${rx.date}</p>
        <hr style="margin: 16px 0; border: none; border-top: 1px solid var(--border-color);">
        <p style="font-weight: bold; margin-bottom: 8px;">Medications Recommended:</p>
        <pre style="white-space: pre-wrap; font-family: inherit; font-size: 0.9rem; line-height: 1.6;">${rx.medications}</pre>
        <hr style="margin: 16px 0; border: none; border-top: 1px solid var(--border-color);">
        <p style="font-weight: bold; margin-bottom: 8px;">Doctor Instructions:</p>
        <p style="font-size: 0.9rem;">${rx.notes}</p>
        <p style="margin-top: 40px; text-align: right; font-style: italic; font-size: 0.8rem;">Digitally Signed & Secured</p>
      </div>
    `;
    
    footer.innerHTML = `
      <button class="btn btn-secondary" onclick="app.closeModal()">Close</button>
      <button class="btn btn-primary" onclick="app.showToast('PDF Prescription download simulated!', 'success')">📥 Download PDF</button>
    `;
    
    modal.classList.add('active');
  }

  writeReview(doctorId) {
    const modal = document.getElementById('general-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');
    
    title.textContent = 'Submit Doctor Consultation Review';
    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Review Rating</label>
        <select id="review-rating" class="form-control">
          <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
          <option value="4">⭐⭐⭐⭐ (Very Good)</option>
          <option value="3">⭐⭐⭐ (Average)</option>
          <option value="2">⭐⭐ (Poor)</option>
          <option value="1">⭐ (Terrible)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Patient Feedback Comments</label>
        <textarea id="review-comment" class="form-control" rows="4" placeholder="How was your clinical diagnosis experience?"></textarea>
      </div>
    `;
    
    footer.innerHTML = `
      <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
      <button class="btn btn-primary" id="submit-review-btn">Post Feedback</button>
    `;
    
    modal.classList.add('active');
    
    document.getElementById('submit-review-btn').onclick = () => {
      const rating = document.getElementById('review-rating').value;
      const comment = document.getElementById('review-comment').value;
      
      db.addReview(doctorId, this.currentProfile.name, rating, comment);
      this.closeModal();
      this.showToast('Review submitted. Thank you for your feedback!', 'success');
      this.handleRoute();
    };
  }

  // --- FIND DOCTORS & BOOKING ---

  renderFindDoctors(container) {
    const specs = db.state.specializations;
    
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Find Clinical Specialists</h1>
          <p class="page-subtitle">Search and book authenticated practitioners</p>
        </div>
      </div>
      
      <div class="search-filter-bar">
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Search Doctor Name</label>
          <input type="text" id="filter-search" class="form-control" placeholder="e.g. Jenkins" oninput="app.applyDoctorFilters()">
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Specialty</label>
          <select id="filter-specialty" class="form-control" onchange="app.applyDoctorFilters()">
            <option value="">All Specialties</option>
            ${specs.map(s => `<option value="${s}">${s}</option>`).join('')}
          </select>
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Maximum Fee</label>
          <select id="filter-fee" class="form-control" onchange="app.applyDoctorFilters()">
            <option value="">No Limit</option>
            <option value="80">Under $80</option>
            <option value="120">Under $120</option>
            <option value="160">Under $160</option>
          </select>
        </div>
        
        <button class="btn btn-secondary" onclick="app.clearDoctorFilters()">Reset</button>
      </div>
      
      <div class="doctor-search-grid" id="doctor-list-container">
        <!-- Rendered by applyDoctorFilters -->
      </div>
    `;
    
    this.applyDoctorFilters();
  }

  applyDoctorFilters() {
    const search = document.getElementById('filter-search')?.value || '';
    const specialization = document.getElementById('filter-specialty')?.value || '';
    const maxFee = document.getElementById('filter-fee')?.value || '';
    
    const docs = db.getDoctors({
      status: 'approved',
      search,
      specialization,
      maxFee
    });
    
    const grid = document.getElementById('doctor-list-container');
    if (!grid) return;
    
    if (docs.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No matching certified doctors found.</div>`;
      return;
    }
    
    grid.innerHTML = docs.map(d => `
      <div class="doctor-profile-card">
        <div class="doctor-card-info">
          <div class="doctor-card-avatar">${d.name.split(' ').map(n=>n[0]).join('').substring(0,2)}</div>
          <div class="doctor-card-meta">
            <span class="doc-specialty">${d.specialization.toUpperCase()}</span>
            <h3 class="doc-name">${d.name}</h3>
            <span class="doc-rating"><span class="star-icon">★</span> ${d.rating} (${db.getReviews(d.id).length} reviews)</span>
          </div>
        </div>
        <div class="doctor-card-details">
          <div class="detail-item">
            <span>Consultation Fee</span>
            <strong>$${d.fee}</strong>
          </div>
          <div class="detail-item">
            <span>Experience</span>
            <strong>${d.experience} Years</strong>
          </div>
        </div>
        <div style="margin-top: auto; display: flex; gap: 8px;">
          <button class="btn btn-outline-primary" style="flex: 1;" onclick="app.viewDoctorProfile('${d.id}')">View Details</button>
          <button class="btn btn-primary" style="flex: 1;" onclick="app.openBookingModal('${d.id}')">Book Slots</button>
        </div>
      </div>
    `).join('');
  }

  clearDoctorFilters() {
    const s = document.getElementById('filter-search');
    const sp = document.getElementById('filter-specialty');
    const f = document.getElementById('filter-fee');
    if (s) s.value = '';
    if (sp) sp.value = '';
    if (f) f.value = '';
    this.applyDoctorFilters();
  }

  viewDoctorProfile(doctorId) {
    const doc = db.getDoctorById(doctorId);
    if (!doc) return;

    const reviews = db.getReviews(doctorId);

    const modal = document.getElementById('general-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');
    
    title.textContent = `Medical Profile - ${doc.name}`;
    body.innerHTML = `
      <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 24px;">
        <div class="doctor-card-avatar" style="width: 70px; height: 70px; font-size: 1.5rem;">${doc.name.split(' ').map(n=>n[0]).join('').substring(0,2)}</div>
        <div>
          <h3>${doc.name}</h3>
          <p style="color: var(--primary); font-weight: 600;">${doc.specialization} • ${doc.experience} Years Exp</p>
          <p style="font-size: 0.85rem; color: var(--text-muted);">License: ${doc.licenseNumber}</p>
        </div>
      </div>
      <div style="margin-bottom: 20px;">
        <h4 style="margin-bottom: 6px;">Professional Bio</h4>
        <p style="font-size: 0.9rem; color: var(--text-muted);">${doc.bio}</p>
      </div>
      <div style="margin-bottom: 20px;">
        <h4 style="margin-bottom: 6px;">Credentials</h4>
        <p style="font-size: 0.9rem; color: var(--text-muted);">${doc.qualifications}</p>
      </div>
      <div>
        <h4 style="margin-bottom: 12px;">Patient Reviews (${reviews.length})</h4>
        ${reviews.length === 0 ? '<p style="font-size: 0.85rem; color: var(--text-muted);">No reviews written yet.</p>' : ''}
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${reviews.map(r => `
            <div style="background-color: var(--bg-app); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 6px;">
                <strong>${r.patientName}</strong>
                <span style="color: var(--warning);">★ ${r.rating}</span>
              </div>
              <p style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">"${r.comment}"</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    footer.innerHTML = `
      <button class="btn btn-secondary" onclick="app.closeModal()">Close</button>
      <button class="btn btn-primary" onclick="app.closeModal(); app.openBookingModal('${doc.id}')">Book Appointment</button>
    `;
    
    modal.classList.add('active');
  }

  openBookingModal(doctorId) {
    const doc = db.getDoctorById(doctorId);
    if (!doc) return;

    const modal = document.getElementById('general-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');
    
    title.textContent = 'Schedule Medical Appointment';
    body.innerHTML = `
      <div style="margin-bottom: 16px;">
        <p style="font-size: 0.9rem;">Consultation with <strong>${doc.name}</strong></p>
        <span style="font-size: 0.8rem; color: var(--text-muted);">Fees per slot: $${doc.fee}</span>
      </div>
      <div class="form-group">
        <label class="form-label">Pick Appointment Date</label>
        <input type="date" id="booking-date" class="form-control" value="2026-07-10">
      </div>
      <div class="form-group">
        <label class="form-label">Available Time Slots</label>
        <div class="slots-container">
          ${doc.slots.map((s, idx) => `
            <button class="slot-btn ${idx === 0 ? 'active' : ''}" onclick="app.selectBookingSlot(this)" data-slot="${s}">${s}</button>
          `).join('')}
        </div>
      </div>
    `;
    
    footer.innerHTML = `
      <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
      <button class="btn btn-primary" id="confirm-booking-btn">Proceed to Book</button>
    `;
    
    modal.classList.add('active');
    
    document.getElementById('confirm-booking-btn').onclick = () => {
      const date = document.getElementById('booking-date').value;
      const activeSlotBtn = document.querySelector('.slot-btn.active');
      if (!activeSlotBtn) {
        this.showToast('Please select a time slot.', 'warning');
        return;
      }
      const slot = activeSlotBtn.dataset.slot;
      
      const newApt = db.bookAppointment(this.currentProfile.id, doctorId, date, slot, doc.fee);
      this.closeModal();
      
      // Prompt user to pay immediately
      this.showToast('Booking submitted as Pending. Please process payment to authorize scheduling.', 'success');
      this.payForAppointment(newApt.id);
    };
  }

  selectBookingSlot(btn) {
    document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  // --- MOCK TELEHEALTH VIDEO CONSULTATION ---

  startVideoCall(appointmentId, name) {
    const overlay = document.getElementById('video-consultation-overlay');
    if (!overlay) return;
    
    overlay.querySelector('.video-doc-feed').innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 12px;">👨‍⚕️</div>
        <h3>${name}</h3>
        <p style="color: var(--success); font-size: 0.9rem; margin-top: 4px;">Connecting to secure clinical server...</p>
      </div>
    `;
    
    overlay.classList.add('active');
    this.showToast('Connecting video stream...', 'primary');
    
    // Simulate connection success after 2 seconds
    setTimeout(() => {
      const feed = overlay.querySelector('.video-doc-feed');
      if (feed) {
        feed.innerHTML = `
          <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 12px; animation: pulse 2s infinite;">🧑‍⚕️</div>
            <h3>${name}</h3>
            <span class="badge badge-success">LIVE CONSULTATION</span>
            <p style="font-size: 0.85rem; color: #94a3b8; margin-top: 10px;">Consultation Session ID: ${appointmentId}</p>
          </div>
        `;
      }
    }, 2000);
  }

  endVideoCall() {
    const overlay = document.getElementById('video-consultation-overlay');
    if (overlay) overlay.classList.remove('active');
    this.showToast('Video consultation ended.', 'warning');
  }

  // --- INTERACTIVE SYMPTOM CHECKER ---

  openSymptomChecker() {
    const modal = document.getElementById('general-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');
    
    title.textContent = 'AI Clinical Symptom Checklist';
    this.symptomStep = 1;
    this.symptomResponses = [];
    
    this.renderSymptomStep(body, footer);
    modal.classList.add('active');
  }

  renderSymptomStep(body, footer) {
    if (this.symptomStep === 1) {
      body.innerHTML = `
        <div class="symptom-question-box">
          <h4>What is the primary medical issue you are experiencing today?</h4>
          <div class="symptom-options">
            <button class="symptom-option-btn" onclick="app.handleSymptomSelect('chest')">Chest Pain or Shortness of Breath</button>
            <button class="symptom-option-btn" onclick="app.handleSymptomSelect('fever')">Fever, cough, or flu-like symptoms</button>
            <button class="symptom-option-btn" onclick="app.handleSymptomSelect('joint')">Joint pain, fracture suspicion, or muscle sprain</button>
            <button class="symptom-option-btn" onclick="app.handleSymptomSelect('skin')">Skin rashes, sudden spots, or severe acne</button>
          </div>
        </div>
      `;
      footer.innerHTML = `<button class="btn btn-secondary" onclick="app.closeModal()">Exit Checker</button>`;
    } else if (this.symptomStep === 2) {
      const type = this.symptomResponses[0];
      let questions = '';
      if (type === 'chest') {
        questions = `
          <button class="symptom-option-btn" onclick="app.handleSymptomSelect('severe')">Yes, it radiates to my arm/jaw (Severe)</button>
          <button class="symptom-option-btn" onclick="app.handleSymptomSelect('moderate')">No, it occurs mostly when climbing stairs (Moderate)</button>
        `;
      } else {
        questions = `
          <button class="symptom-option-btn" onclick="app.handleSymptomSelect('yes')">Yes, symptoms persist for more than 5 days</button>
          <button class="symptom-option-btn" onclick="app.handleSymptomSelect('no')">No, they started less than 48 hours ago</button>
        `;
      }
      body.innerHTML = `
        <div class="symptom-question-box">
          <h4>Are you experiencing high severity markers?</h4>
          <div class="symptom-options">
            ${questions}
          </div>
        </div>
      `;
      footer.innerHTML = `<button class="btn btn-secondary" onclick="app.symptomStep=1; app.renderSymptomStep(document.getElementById('modal-body'), document.getElementById('modal-footer'));">Back</button>`;
    } else if (this.symptomStep === 3) {
      const p1 = this.symptomResponses[0];
      const p2 = this.symptomResponses[1];
      
      let diagnosis = '';
      let recommendedSpecialty = 'General Medicine';
      
      if (p1 === 'chest') {
        if (p2 === 'severe') {
          diagnosis = '<div class="badge badge-danger" style="margin-bottom:10px;">HIGH RISK EMERGENCY</div><p style="color:var(--danger); font-weight:bold;">Please call local emergency services immediately. Do not wait for online booking.</p>';
          recommendedSpecialty = 'Cardiology';
        } else {
          diagnosis = '<p>Potential cardiovascular stress. A cardiologist review is highly recommended.</p>';
          recommendedSpecialty = 'Cardiology';
        }
      } else if (p1 === 'fever') {
        diagnosis = '<p>Probable viral upper respiratory infection. Rest and hydration recommended.</p>';
        recommendedSpecialty = 'Pediatrics'; // Or General Medicine
      } else if (p1 === 'joint') {
        diagnosis = '<p>Orthopedic strain or local inflammatory process.</p>';
        recommendedSpecialty = 'Orthopedics';
      } else {
        diagnosis = '<p>Skin dermatological condition. Avoid itching, consult dermatologist.</p>';
        recommendedSpecialty = 'Dermatology';
      }
      
      body.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <h3 style="color: var(--primary); margin-bottom: 12px;">Clinical Assessment Result</h3>
          <div style="background-color: var(--bg-app); padding: 16px; border-radius: var(--radius-md); margin-bottom: 20px;">
            ${diagnosis}
          </div>
          <p style="font-size: 0.95rem; margin-bottom: 10px;">Recommended Specialist Focus:</p>
          <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary); margin-bottom: 20px;">${recommendedSpecialty}</div>
        </div>
      `;
      
      footer.innerHTML = `
        <button class="btn btn-secondary" onclick="app.closeModal()">Close</button>
        <button class="btn btn-primary" id="search-spec-btn" data-spec="${recommendedSpecialty}">Find ${recommendedSpecialty} Doctors</button>
      `;
      
      document.getElementById('search-spec-btn').onclick = (e) => {
        const spec = e.currentTarget.dataset.spec;
        this.closeModal();
        window.location.hash = '#find-doctors';
        setTimeout(() => {
          const specSel = document.getElementById('filter-specialty');
          if (specSel) {
            specSel.value = spec;
            this.applyDoctorFilters();
          }
        }, 100);
      };
    }
  }

  handleSymptomSelect(option) {
    this.symptomResponses.push(option);
    this.symptomStep++;
    this.renderSymptomStep(document.getElementById('modal-body'), document.getElementById('modal-footer'));
  }

  // --- FLOATING CHAT SYSTEM ---

  openChat(partnerId, name) {
    this.chatPartner = partnerId;
    const widget = document.getElementById('chat-widget');
    if (!widget) return;
    
    widget.querySelector('.chat-title').textContent = `Chat: ${name}`;
    widget.classList.add('active');
    
    // Clear & seed initial chat history
    const body = widget.querySelector('.chat-body');
    body.innerHTML = `
      <div class="chat-msg received">Hello. How can I help you today?</div>
      <div class="chat-msg sent">Hi. I wanted to ask about my appointment today.</div>
    `;
    body.scrollTop = body.scrollHeight;
  }

  closeChat() {
    const widget = document.getElementById('chat-widget');
    if (widget) widget.classList.remove('active');
  }

  sendChatMessage() {
    const input = document.getElementById('chat-input-field');
    if (!input || !input.value.trim()) return;
    
    const widget = document.getElementById('chat-widget');
    const body = widget.querySelector('.chat-body');
    
    // Add sent message
    const msg = document.createElement('div');
    msg.className = 'chat-msg sent';
    msg.textContent = input.value;
    body.appendChild(msg);
    
    const text = input.value;
    input.value = '';
    body.scrollTop = body.scrollHeight;
    
    // Simulate quick automated response from Doctor
    setTimeout(() => {
      const response = document.createElement('div');
      response.className = 'chat-msg received';
      response.textContent = `Thank you for your message. I am currently checking details for our consultation. See you online!`;
      body.appendChild(response);
      body.scrollTop = body.scrollHeight;
      this.beepSound();
    }, 1500);
  }

  // --- DOCTOR VIEWS ---

  renderDoctorDashboard(container) {
    const apts = db.getAppointments({ doctorId: this.currentProfile.id });
    const pending = apts.filter(a => a.status === 'pending');
    const approved = apts.filter(a => a.status === 'approved');
    const earnings = apts.filter(a => a.status === 'completed' && a.paymentStatus === 'paid').reduce((sum, a) => sum + a.fee, 0);

    // Render pending verification message if doctor is pending
    if (this.currentProfile.status === 'pending') {
      container.innerHTML = `
        <div class="card glass-panel" style="text-align: center; max-width: 600px; margin: 40px auto; padding: 40px;">
          <div style="font-size: 3rem; margin-bottom: 20px;">⏳</div>
          <h2>Verification Pending Approval</h2>
          <p style="color: var(--text-muted); margin: 16px 0;">Your professional profile and license (<strong>${this.currentProfile.licenseNumber}</strong>) are currently undergoing admin audit. You will receive a dashboard notification as soon as verification completes.</p>
          <div style="background-color: var(--primary-light); color: var(--primary); padding: 12px; border-radius: var(--radius-sm); font-size: 0.9rem; font-weight: 600;">
            Hint: Switch to Admin Role at the top right to verify this doctor instantly!
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">${this.currentProfile.name}</h1>
          <p class="page-subtitle">Manage upcoming patient visits, digital prescriptions and set scheduling slots</p>
        </div>
      </div>
      
      <div class="dashboard-grid">
        <div class="stat-card">
          <div class="stat-info">
            <h3>Consultation Income</h3>
            <div class="stat-value">$${earnings}</div>
          </div>
          <div class="stat-icon success">💵</div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <h3>Pending Requests</h3>
            <div class="stat-value">${pending.length}</div>
          </div>
          <div class="stat-icon warning">⌛</div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <h3>Approved Scheduled Visits</h3>
            <div class="stat-value">${approved.length}</div>
          </div>
          <div class="stat-icon primary">📅</div>
        </div>
      </div>
      
      <div class="dashboard-grid" style="grid-template-columns: 2fr 1fr;">
        <!-- Left: Appointments Manager -->
        <div class="card">
          <div class="card-header"><h3>Active Appointment Registry</h3></div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Schedule</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${apts.length === 0 ? `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No records registered.</td></tr>` : ''}
                  ${apts.map(a => `
                    <tr>
                      <td><strong>${a.patientName}</strong></td>
                      <td>${a.date} at ${a.timeSlot}</td>
                      <td>
                        <span class="badge ${a.status === 'approved' ? 'badge-success' : a.status === 'completed' ? 'badge-primary' : a.status === 'pending' ? 'badge-warning' : 'badge-danger'}">
                          ${a.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span class="badge ${a.paymentStatus === 'paid' ? 'badge-success' : 'badge-danger'}">
                          ${a.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style="display: flex; gap: 6px;">
                          ${a.status === 'pending' ? `<button class="btn btn-sm btn-success" onclick="app.changeAptStatus('${a.id}', 'approved')">✓ Accept</button>` : ''}
                          ${a.status === 'pending' ? `<button class="btn btn-sm btn-danger" onclick="app.changeAptStatus('${a.id}', 'rejected')">✕ Reject</button>` : ''}
                          
                          ${a.status === 'approved' ? `<button class="btn btn-sm btn-primary" onclick="app.startVideoCall('${a.id}', '${a.patientName}')">📹 Call</button>` : ''}
                          ${a.status === 'approved' ? `<button class="btn btn-sm btn-outline-primary" onclick="app.openChat('${a.patientId}', '${a.patientName}')">💬 Chat</button>` : ''}
                          ${a.status === 'approved' ? `<button class="btn btn-sm btn-success" onclick="app.openPrescriptionWriter('${a.id}')">📝 Prescribe</button>` : ''}
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Right: Earnings Analytics SVG Chart -->
        <div class="card">
          <div class="card-header"><h3>Monthly Earnings Trend</h3></div>
          <div class="card-body">
            <svg class="earnings-svg" viewBox="0 0 300 200">
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <!-- Grid lines -->
              <line x1="20" y1="20" x2="280" y2="20" stroke="var(--border-color)" stroke-dasharray="2" />
              <line x1="20" y1="80" x2="280" y2="80" stroke="var(--border-color)" stroke-dasharray="2" />
              <line x1="20" y1="140" x2="280" y2="140" stroke="var(--border-color)" stroke-dasharray="2" />
              <line x1="20" y1="170" x2="280" y2="170" stroke="var(--text-muted)" />
              
              <!-- Sparkline path -->
              <path d="M 20 160 Q 70 120 120 130 T 220 50 T 280 40" fill="none" stroke="var(--primary)" stroke-width="3" />
              <path d="M 20 160 Q 70 120 120 130 T 220 50 T 280 40 L 280 170 L 20 170 Z" fill="url(#chart-gradient)" />
              
              <!-- Dots on peaks -->
              <circle cx="220" cy="50" r="5" fill="var(--primary)" />
              <circle cx="280" cy="40" r="5" fill="var(--success)" />
              
              <!-- Month labels -->
              <text x="20" y="190" fill="var(--text-muted)" font-size="9">May</text>
              <text x="120" y="190" fill="var(--text-muted)" font-size="9">Jun</text>
              <text x="260" y="190" fill="var(--text-muted)" font-size="9">Jul</text>
            </svg>
            <div style="margin-top: 16px; text-align: center;">
              <span style="font-size: 0.85rem; color: var(--text-muted);">Analytics represent payouts for completed appointments.</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  changeAptStatus(id, status) {
    db.updateAppointmentStatus(id, status);
    this.showToast(`Appointment status updated to ${status.toUpperCase()}`, 'success');
    this.handleRoute();
  }

  openPrescriptionWriter(appointmentId) {
    const apt = db.state.appointments.find(a => a.id === appointmentId);
    if (!apt) return;

    const modal = document.getElementById('general-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');
    
    title.textContent = 'Write Digital Prescription & Clinical Notes';
    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Rx Medications (Specify dosages, timeline)</label>
        <textarea id="rx-medications" class="form-control" rows="5" placeholder="e.g. Paracetamol 500mg - 3 times daily for 5 days"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Clinical Advice & Notes</label>
        <textarea id="rx-advice" class="form-control" rows="3" placeholder="Rest well, drink warm fluids. Review in 1 week."></textarea>
      </div>
    `;
    
    footer.innerHTML = `
      <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
      <button class="btn btn-primary" id="save-rx-btn">Sign & Dispatch Rx</button>
    `;
    
    modal.classList.add('active');
    
    document.getElementById('save-rx-btn').onclick = () => {
      const meds = document.getElementById('rx-medications').value;
      const advice = document.getElementById('rx-advice').value;
      
      if (!meds) {
        this.showToast('Please specify recommended medications.', 'warning');
        return;
      }
      
      db.addPrescription(appointmentId, meds, advice);
      this.closeModal();
      this.showToast('Prescription dispatched successfully. Patient notified!', 'success');
      this.handleRoute();
    };
  }

  renderDoctorAvailability(container) {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Manage Availability Schedule</h1>
          <p class="page-subtitle">Select recurring time slots for virtual & clinic visits</p>
        </div>
      </div>
      
      <div class="card" style="max-width: 600px;">
        <div class="card-header"><h3>Active Availability Slots</h3></div>
        <div class="card-body">
          <p style="margin-bottom: 20px; font-size: 0.9rem; color: var(--text-muted);">Pick slots patients can request when scheduling visits. Click slots to remove them from your active calendar.</p>
          
          <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 30px;">
            ${this.currentProfile.slots.map(s => `
              <span class="badge badge-primary" style="padding: 10px 14px; font-size: 0.85rem; cursor: pointer;" onclick="app.removeAvailabilitySlot('${s}')">
                ${s} <span style="margin-left: 6px; opacity: 0.6;">✕</span>
              </span>
            `).join('')}
          </div>
          
          <div style="border-top: 1px solid var(--border-color); padding-top: 20px;">
            <h4>Add New Time Slot</h4>
            <div style="display: flex; gap: 12px; margin-top: 14px;">
              <input type="text" id="new-slot-input" class="form-control" placeholder="e.g. 05:00 PM">
              <button class="btn btn-primary" onclick="app.addAvailabilitySlot()">Add Slot</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  addAvailabilitySlot() {
    const input = document.getElementById('new-slot-input');
    if (!input || !input.value.trim()) return;
    
    const value = input.value.trim();
    if (this.currentProfile.slots.includes(value)) {
      this.showToast('Slot already exists.', 'warning');
      return;
    }
    
    this.currentProfile.slots.push(value);
    db.updateDoctorProfile(this.currentProfile.id, { slots: this.currentProfile.slots });
    input.value = '';
    this.showToast(`Added availability slot: ${value}`, 'success');
    this.handleRoute();
  }

  removeAvailabilitySlot(slot) {
    const idx = this.currentProfile.slots.indexOf(slot);
    if (idx > -1) {
      this.currentProfile.slots.splice(idx, 1);
      db.updateDoctorProfile(this.currentProfile.id, { slots: this.currentProfile.slots });
      this.showToast(`Removed slot: ${slot}`, 'danger');
      this.handleRoute();
    }
  }

  // --- ADMIN VIEWS ---

  renderAdminDashboard(container) {
    const docs = db.getDoctors();
    const pendingDocs = docs.filter(d => d.status === 'pending');
    const apts = db.getAppointments();
    const payments = db.getPayments();
    const totalRev = payments.reduce((sum, p) => sum + p.amount, 0);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Administrator Console</h1>
          <p class="page-subtitle">Verify specialist onboarding applications and audit financial reports</p>
        </div>
      </div>
      
      <div class="dashboard-grid">
        <div class="stat-card">
          <div class="stat-info">
            <h3>Registered Clinics</h3>
            <div class="stat-value">${docs.length}</div>
          </div>
          <div class="stat-icon primary">⚕️</div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <h3>Awaiting Verification</h3>
            <div class="stat-value">${pendingDocs.length}</div>
          </div>
          <div class="stat-icon warning">⌛</div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <h3>Gross Revenue Collected</h3>
            <div class="stat-value">$${totalRev}</div>
          </div>
          <div class="stat-icon success">📈</div>
        </div>
      </div>
      
      <div class="dashboard-grid" style="grid-template-columns: 2fr 1fr;">
        <!-- Left: Onboarding Queue -->
        <div class="card">
          <div class="card-header"><h3>Specialist Verification Pipeline</h3></div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Doctor Name</th>
                    <th>Specialty</th>
                    <th>License Number</th>
                    <th>Location Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${pendingDocs.length === 0 ? `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">All onboarded doctors are successfully audited & verified.</td></tr>` : ''}
                  ${pendingDocs.map(d => `
                    <tr>
                      <td><strong>${d.name}</strong></td>
                      <td>${d.specialization}</td>
                      <td><code>${d.licenseNumber}</code></td>
                      <td>${d.location}</td>
                      <td>
                        <div style="display: flex; gap: 8px;">
                          <button class="btn btn-sm btn-success" onclick="app.approveDoctor('${d.id}')">Verify License</button>
                          <button class="btn btn-sm btn-danger" onclick="app.rejectDoctor('${d.id}')">Decline</button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Right: Recent Reviews Auditor -->
        <div class="card">
          <div class="card-header"><h3>Recent Reviews</h3></div>
          <div class="card-body">
            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${db.getReviews().length === 0 ? '<p style="font-size: 0.85rem; color: var(--text-muted);">No reviews posted.</p>' : ''}
              ${db.getReviews().slice(0, 3).map(r => `
                <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 6px;">
                    <strong>${r.patientName}</strong>
                    <button class="btn-icon" style="color: var(--danger); font-size: 0.8rem;" onclick="app.deleteReview('${r.id}')">✕ Delete</button>
                  </div>
                  <p style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">"${r.comment}"</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  approveDoctor(id) {
    db.verifyDoctor(id, true);
    this.showToast('Doctor credentials verified successfully. Specialist notified!', 'success');
    this.handleRoute();
  }

  rejectDoctor(id) {
    db.verifyDoctor(id, false);
    this.showToast('Doctor onboarding verification declined.', 'danger');
    this.handleRoute();
  }

  deleteReview(id) {
    if (confirm('Delete this feedback review?')) {
      db.deleteReview(id);
      this.showToast('Feedback post deleted by Admin audit.', 'danger');
      this.handleRoute();
    }
  }

  // --- MOCK PATIENT RECORDS TAB ---

  renderPatientRecords(container) {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Digital Health Records</h1>
          <p class="page-subtitle">Manage medical reports and patient insurance files</p>
        </div>
      </div>
      
      <div class="dashboard-grid" style="grid-template-columns: 2fr 1fr;">
        <!-- Left: Uploaded files -->
        <div class="card">
          <div class="card-header"><h3>Active Medical Documents</h3></div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Report Name</th>
                    <th>Category</th>
                    <th>Upload Date</th>
                    <th>Clinical Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Vaccination_Card_2026.pdf</strong></td>
                    <td>Immunization</td>
                    <td>2026-06-15</td>
                    <td><span class="badge badge-success">Verified</span></td>
                    <td><button class="btn btn-sm btn-secondary" onclick="app.showToast('Report view simulated', 'success')">👁️ View</button></td>
                  </tr>
                  <tr>
                    <td><strong>Blood_Glucose_Panel.pdf</strong></td>
                    <td>Biochemistry</td>
                    <td>2026-07-02</td>
                    <td><span class="badge badge-success">Verified</span></td>
                    <td><button class="btn btn-sm btn-secondary" onclick="app.showToast('Report view simulated', 'success')">👁️ View</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Right: Insurance information -->
        <div class="card">
          <div class="card-header"><h3>Patient Health Insurance</h3></div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Provider Name</label>
              <input type="text" class="form-control" value="${this.currentProfile.insurance}" disabled>
            </div>
            <div class="form-group">
              <label class="form-label">Active Policy ID</label>
              <input type="text" class="form-control" value="POL-9912093-X" disabled>
            </div>
            <button class="btn btn-outline-primary w-100" onclick="app.showToast('Insurance coverage validated!', 'success')">Validate Coverage Status</button>
          </div>
        </div>
      </div>
    `;
  }
}

// Instantiate global controller
const app = new AppController();
window.app = app;
