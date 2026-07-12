const VITE_API_URL = import.meta.env.VITE_API_URL;
const API_URL = VITE_API_URL ? 
  (VITE_API_URL.endsWith('/api') ? VITE_API_URL : `${VITE_API_URL}/api`) : 
  (window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api');

const getHeaders = () => {
  const token = localStorage.getItem('medi_connect_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth API
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  },

  registerPatient: async (patientData) => {
    const res = await fetch(`${API_URL}/auth/register-patient`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Patient registration failed');
    }
    return res.json();
  },

  registerDoctor: async (doctorData) => {
    const res = await fetch(`${API_URL}/auth/register-doctor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctorData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Doctor registration failed');
    }
    return res.json();
  },

  // Profile API
  getProfile: async () => {
    const res = await fetch(`${API_URL}/profile`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  updateProfile: async (profileData) => {
    const res = await fetch(`${API_URL}/profile`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return res.json();
  },

  changePassword: async (passwords) => {
    const res = await fetch(`${API_URL}/profile/password`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(passwords),
    });
    return res.json();
  },

  // Doctors API
  getDoctors: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/doctors?${query}`);
    return res.json();
  },

  getDoctorById: async (id) => {
    const res = await fetch(`${API_URL}/doctors/${id}`);
    return res.json();
  },

  getDoctorSlots: async (doctorId, date) => {
    const res = await fetch(`${API_URL}/doctors/${doctorId}/slots?date=${date}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  addAvailabilitySlot: async (date, timeSlot) => {
    const res = await fetch(`${API_URL}/doctors/slots`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ date, timeSlot }),
    });
    return res.json();
  },

  removeAvailabilitySlot: async (date, timeSlot) => {
    const res = await fetch(`${API_URL}/doctors/slots`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ date, timeSlot }),
    });
    return res.json();
  },

  verifyDoctor: async (doctorId, status) => {
    const res = await fetch(`${API_URL}/doctors/${doctorId}/verify`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  getPendingDoctors: async () => {
    const res = await fetch(`${API_URL}/doctors/pending`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Appointments API
  bookAppointment: async (bookingData) => {
    const res = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookingData),
    });
    return res.json();
  },

  getAppointments: async () => {
    const res = await fetch(`${API_URL}/appointments`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  updateAppointmentStatus: async (id, status) => {
    const res = await fetch(`${API_URL}/appointments/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Prescriptions nested
  writePrescription: async (appointmentId, prescriptionData) => {
    const res = await fetch(`${API_URL}/appointments/${appointmentId}/prescription`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(prescriptionData),
    });
    return res.json();
  },

  getPrescription: async (appointmentId) => {
    const res = await fetch(`${API_URL}/appointments/${appointmentId}/prescription`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Payments API
  processPayment: async (paymentData) => {
    const res = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentData),
    });
    return res.json();
  },

  getPayments: async () => {
    const res = await fetch(`${API_URL}/payments`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Notifications API
  getNotifications: async () => {
    const res = await fetch(`${API_URL}/notifications`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  markNotificationsRead: async () => {
    const res = await fetch(`${API_URL}/notifications/read`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Medical Records API
  uploadMedicalRecord: async (formData) => {
    const token = localStorage.getItem('medi_connect_token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}/profile/medical-records`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });
    return res.json();
  },

  getMedicalRecords: async () => {
    const res = await fetch(`${API_URL}/profile/medical-records`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  deleteMedicalRecord: async (id) => {
    const res = await fetch(`${API_URL}/profile/medical-records/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  }
};
export default api;
