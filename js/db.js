class DoctorAppointmentDB {
  constructor() {
    this.storageKey = 'medi_connect_db';
    this.state = null;
    this.init();
  }

  init() {
    const rawData = localStorage.getItem(this.storageKey);
    if (rawData) {
      try {
        this.state = JSON.parse(rawData);
        return;
      } catch (e) {
        console.error('Failed to parse database, resetting state', e);
      }
    }
    
    // Seed initial data
    this.state = {
      users: [
        { id: 'u_admin', email: 'admin@mediconnect.com', password: 'admin', role: 'admin', name: 'System Admin' },
        { id: 'u_pat_john', email: 'john@patient.com', password: 'john', role: 'patient', name: 'John Doe' },
        { id: 'u_doc_sarah', email: 'sarah@doctor.com', password: 'sarah', role: 'doctor', name: 'Dr. Sarah Jenkins' },
        { id: 'u_doc_alex', email: 'alex@doctor.com', password: 'alex', role: 'doctor', name: 'Dr. Alex Mercer' },
        { id: 'u_doc_ryan', email: 'ryan@doctor.com', password: 'ryan', role: 'doctor', name: 'Dr. Ryan Gosling' }
      ],
      patients: [
        { id: 'p_john', userId: 'u_pat_john', name: 'John Doe', dob: '1990-05-15', gender: 'Male', contact: '+1 (555) 019-2834', insurance: 'BlueCross Shield', medicalHistory: 'Mild asthma, seasonal allergies' }
      ],
      doctors: [
        {
          id: 'd_sarah',
          userId: 'u_doc_sarah',
          name: 'Dr. Sarah Jenkins',
          specialization: 'Cardiology',
          experience: 12,
          fee: 150,
          rating: 4.9,
          location: 'New York Medical Plaza',
          licenseNumber: 'LIC-774920-NY',
          status: 'approved',
          slots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'],
          qualifications: 'MD, FACC - Harvard Medical School',
          bio: 'Dr. Sarah Jenkins has over 12 years of clinical experience in non-invasive cardiology and coronary disease management.'
        },
        {
          id: 'd_alex',
          userId: 'u_doc_alex',
          name: 'Dr. Alex Mercer',
          specialization: 'Pediatrics',
          experience: 8,
          fee: 100,
          rating: 4.7,
          location: 'Brooklyn Health Center',
          licenseNumber: 'LIC-221983-NY',
          status: 'approved',
          slots: ['08:30 AM', '10:00 AM', '11:30 AM', '04:00 PM'],
          qualifications: 'MD - Johns Hopkins University',
          bio: 'Specializing in neonatal care, immunization, and childhood developmental health diagnostics.'
        },
        {
          id: 'd_ryan',
          userId: 'u_doc_ryan',
          name: 'Dr. Ryan Gosling',
          specialization: 'Orthopedics',
          experience: 5,
          fee: 110,
          rating: 4.5,
          location: 'Manhattan Ortho Clinic',
          licenseNumber: 'LIC-334112-NY',
          status: 'pending',
          slots: ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM'],
          qualifications: 'DO - Stanford Orthopedics Residency',
          bio: 'Specialist in sports injuries, knee arthroscopy, and corrective bone surgery. Newly registered doctor waiting for admin verification.'
        }
      ],
      specializations: ['Cardiology', 'Pediatrics', 'Dermatology', 'General Medicine', 'Psychiatry', 'Orthopedics'],
      appointments: [
        {
          id: 'apt_1',
          patientId: 'p_john',
          doctorId: 'd_sarah',
          date: '2026-07-07',
          timeSlot: '10:30 AM',
          status: 'completed',
          fee: 150,
          paymentStatus: 'paid'
        },
        {
          id: 'apt_2',
          patientId: 'p_john',
          doctorId: 'd_alex',
          date: '2026-07-10',
          timeSlot: '08:30 AM',
          status: 'approved',
          fee: 100,
          paymentStatus: 'paid'
        }
      ],
      prescriptions: [
        {
          id: 'rx_1',
          appointmentId: 'apt_1',
          date: '2026-07-07',
          medications: 'Lisinopril 10mg - Once daily in morning\nCoQ10 Supplement 100mg - Once daily with lunch',
          notes: 'Keep track of daily blood pressure readings. Reduce sodium intake.'
        }
      ],
      reviews: [
        { id: 'rev_1', doctorId: 'd_sarah', patientName: 'John Doe', rating: 5, comment: 'Dr. Sarah was highly professional and explained my cardiology reports in detail.', date: '2026-07-07' }
      ],
      payments: [
        { id: 'pay_1', appointmentId: 'apt_1', amount: 150, method: 'Card (Visa)', transactionId: 'TXN-99881123', status: 'success', date: '2026-07-07' },
        { id: 'pay_2', appointmentId: 'apt_2', amount: 100, method: 'PayPal', transactionId: 'TXN-55443219', status: 'success', date: '2026-07-08' }
      ],
      notifications: [
        { id: 'not_1', userId: 'u_pat_john', message: 'Your appointment with Dr. Sarah Jenkins is completed. Digital prescription is now ready to download.', date: '2026-07-07', read: false },
        { id: 'not_2', userId: 'u_pat_john', message: 'Payment of $100 for Dr. Alex Mercer is processed successfully.', date: '2026-07-08', read: true }
      ]
    };
    this.save();
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
  }

  // Auth Operations
  login(email, password) {
    const user = this.state.users.find(u => u.email === email && u.password === password);
    if (!user) return null;
    
    // Find role-specific profile
    let profile = null;
    if (user.role === 'patient') {
      profile = this.state.patients.find(p => p.userId === user.id);
    } else if (user.role === 'doctor') {
      profile = this.state.doctors.find(d => d.userId === user.id);
    }
    
    return { user, profile };
  }

  registerPatient(name, email, password, dob, gender, contact, insurance) {
    if (this.state.users.some(u => u.email === email)) {
      throw new Error('Email is already registered');
    }
    const userId = 'u_pat_' + Date.now();
    const patientId = 'p_' + Date.now();
    
    const newUser = { id: userId, email, password, role: 'patient', name };
    const newPatient = { id: patientId, userId, name, dob, gender, contact, insurance, medicalHistory: '' };
    
    this.state.users.push(newUser);
    this.state.patients.push(newPatient);
    this.save();
    return { user: newUser, profile: newPatient };
  }

  registerDoctor(name, email, password, specialization, experience, fee, location, licenseNumber, bio) {
    if (this.state.users.some(u => u.email === email)) {
      throw new Error('Email is already registered');
    }
    const userId = 'u_doc_' + Date.now();
    const doctorId = 'd_' + Date.now();
    
    const newUser = { id: userId, email, password, role: 'doctor', name };
    const newDoctor = {
      id: doctorId,
      userId,
      name,
      specialization,
      experience: parseInt(experience) || 1,
      fee: parseFloat(fee) || 50,
      rating: 5.0,
      location,
      licenseNumber,
      status: 'pending',
      slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
      qualifications: 'MBBS, MD',
      bio
    };
    
    this.state.users.push(newUser);
    this.state.doctors.push(newDoctor);
    this.save();
    return { user: newUser, profile: newDoctor };
  }

  // Doctor Operations
  getDoctors(filters = {}) {
    let list = [...this.state.doctors];
    if (filters.status) {
      list = list.filter(d => d.status === filters.status);
    }
    if (filters.specialization) {
      list = list.filter(d => d.specialization === filters.specialization);
    }
    if (filters.location) {
      list = list.filter(d => d.location.toLowerCase().includes(filters.location.toLowerCase()));
    }
    if (filters.maxFee) {
      list = list.filter(d => d.fee <= parseFloat(filters.maxFee));
    }
    if (filters.minExperience) {
      list = list.filter(d => d.experience >= parseInt(filters.minExperience));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q));
    }
    return list;
  }

  getDoctorById(id) {
    return this.state.doctors.find(d => d.id === id);
  }

  updateDoctorProfile(doctorId, profileData) {
    const doc = this.state.doctors.find(d => d.id === doctorId);
    if (doc) {
      Object.assign(doc, profileData);
      // update associated user name too
      const u = this.state.users.find(usr => usr.id === doc.userId);
      if (u) u.name = doc.name;
      this.save();
    }
  }

  verifyDoctor(doctorId, approved) {
    const doc = this.state.doctors.find(d => d.id === doctorId);
    if (doc) {
      doc.status = approved ? 'approved' : 'rejected';
      this.addNotification(doc.userId, `Your professional license verification has been ${approved ? 'APPROVED' : 'REJECTED'}. You can now start managing appointments.`);
      this.save();
    }
  }

  // Patient Operations
  getPatientById(id) {
    return this.state.patients.find(p => p.id === id);
  }

  updatePatientProfile(patientId, profileData) {
    const pat = this.state.patients.find(p => p.id === patientId);
    if (pat) {
      Object.assign(pat, profileData);
      const u = this.state.users.find(usr => usr.id === pat.userId);
      if (u) u.name = pat.name;
      this.save();
    }
  }

  // Appointment operations
  bookAppointment(patientId, doctorId, date, timeSlot, fee) {
    const id = 'apt_' + Date.now();
    const newApt = {
      id,
      patientId,
      doctorId,
      date,
      timeSlot,
      status: 'pending',
      fee,
      paymentStatus: 'unpaid'
    };
    this.state.appointments.push(newApt);
    
    // Add doctor notification
    const doc = this.getDoctorById(doctorId);
    const pat = this.getPatientById(patientId);
    if (doc && pat) {
      this.addNotification(doc.userId, `New appointment booking request received from ${pat.name} on ${date} at ${timeSlot}.`);
    }
    
    this.save();
    return newApt;
  }

  updateAppointmentStatus(id, status) {
    const apt = this.state.appointments.find(a => a.id === id);
    if (apt) {
      apt.status = status;
      
      const pat = this.getPatientById(apt.patientId);
      const doc = this.getDoctorById(apt.doctorId);
      
      if (pat && doc) {
        if (status === 'approved') {
          this.addNotification(pat.userId, `Your appointment booking with ${doc.name} has been ACCEPTED for ${apt.date} at ${apt.timeSlot}.`);
        } else if (status === 'rejected' || status === 'cancelled') {
          this.addNotification(pat.userId, `Your appointment booking with ${doc.name} has been CANCELLED/DECLINED.`);
        }
      }
      this.save();
    }
  }

  getAppointments(filters = {}) {
    let list = [...this.state.appointments];
    if (filters.patientId) {
      list = list.filter(a => a.patientId === filters.patientId);
    }
    if (filters.doctorId) {
      list = list.filter(a => a.doctorId === filters.doctorId);
    }
    if (filters.status) {
      list = list.filter(a => a.status === filters.status);
    }
    // Enrich with names
    return list.map(a => {
      const pat = this.getPatientById(a.patientId);
      const doc = this.getDoctorById(a.doctorId);
      return {
        ...a,
        patientName: pat ? pat.name : 'Unknown Patient',
        doctorName: doc ? doc.name : 'Unknown Doctor',
        specialization: doc ? doc.specialization : ''
      };
    });
  }

  // Payment Operations
  processPayment(appointmentId, method) {
    const apt = this.state.appointments.find(a => a.id === appointmentId);
    if (!apt) return null;
    
    apt.paymentStatus = 'paid';
    const payId = 'pay_' + Date.now();
    const newPayment = {
      id: payId,
      appointmentId,
      amount: apt.fee,
      method,
      transactionId: 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
      status: 'success',
      date: new Date().toISOString().split('T')[0]
    };
    this.state.payments.push(newPayment);
    
    const doc = this.getDoctorById(apt.doctorId);
    if (doc) {
      this.addNotification(doc.userId, `Payment of $${apt.fee} received for your appointment with patient ID ${apt.patientId}.`);
    }
    
    this.save();
    return newPayment;
  }

  getPayments() {
    return this.state.payments.map(p => {
      const apt = this.state.appointments.find(a => a.id === p.appointmentId);
      const pat = apt ? this.getPatientById(apt.patientId) : null;
      const doc = apt ? this.getDoctorById(apt.doctorId) : null;
      return {
        ...p,
        patientName: pat ? pat.name : 'Unknown Patient',
        doctorName: doc ? doc.name : 'Unknown Doctor'
      };
    });
  }

  // Prescription Operations
  addPrescription(appointmentId, medications, notes) {
    const rxId = 'rx_' + Date.now();
    const newRx = {
      id: rxId,
      appointmentId,
      date: new Date().toISOString().split('T')[0],
      medications,
      notes
    };
    this.state.prescriptions.push(newRx);
    
    // Complete the appointment automatically
    const apt = this.state.appointments.find(a => a.id === appointmentId);
    if (apt) {
      apt.status = 'completed';
      const pat = this.getPatientById(apt.patientId);
      if (pat) {
        this.addNotification(pat.userId, `A new digital prescription has been written for your consult. You can download it now.`);
      }
    }
    this.save();
    return newRx;
  }

  getPrescriptionForAppointment(appointmentId) {
    return this.state.prescriptions.find(r => r.appointmentId === appointmentId) || null;
  }

  // Reviews operations
  addReview(doctorId, patientName, rating, comment) {
    const revId = 'rev_' + Date.now();
    const newReview = {
      id: revId,
      doctorId,
      patientName,
      rating: parseInt(rating) || 5,
      comment,
      date: new Date().toISOString().split('T')[0]
    };
    this.state.reviews.push(newReview);
    
    // Update Doctor Average Rating
    const doc = this.state.doctors.find(d => d.id === doctorId);
    if (doc) {
      const docReviews = this.state.reviews.filter(r => r.doctorId === doctorId);
      const avg = docReviews.reduce((sum, r) => sum + r.rating, 0) / docReviews.length;
      doc.rating = Math.round(avg * 10) / 10;
      this.addNotification(doc.userId, `New review submitted: ${rating} stars. "${comment.substring(0, 30)}..."`);
    }
    
    this.save();
    return newReview;
  }

  getReviews(doctorId = null) {
    let list = [...this.state.reviews];
    if (doctorId) {
      list = list.filter(r => r.doctorId === doctorId);
    }
    return list;
  }

  deleteReview(reviewId) {
    this.state.reviews = this.state.reviews.filter(r => r.id !== reviewId);
    this.save();
  }

  // Admin and Notifications Operations
  addNotification(userId, message) {
    const id = 'not_' + Date.now() + Math.floor(Math.random() * 100);
    this.state.notifications.unshift({
      id,
      userId,
      message,
      date: new Date().toISOString().split('T')[0],
      read: false
    });
    this.save();
  }

  getNotifications(userId) {
    return this.state.notifications.filter(n => n.userId === userId);
  }

  markNotificationsRead(userId) {
    this.state.notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    this.save();
  }
}

// Global DB instance
const db = new DoctorAppointmentDB();
window.db = db; // expose to console for advanced testing
