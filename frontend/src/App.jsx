import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

// Patient Pages
import PatientDashboard from './pages/PatientDashboard.jsx';
import PatientProfile from './pages/PatientProfile.jsx';
import PatientAppointments from './pages/PatientAppointments.jsx';
import PatientRecords from './pages/PatientRecords.jsx';

// Doctor Pages
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import DoctorProfile from './pages/DoctorProfile.jsx';
import DoctorAvailability from './pages/DoctorAvailability.jsx';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminDoctors from './pages/AdminDoctors.jsx';
import AdminPatients from './pages/AdminPatients.jsx';
import AdminAppointments from './pages/AdminAppointments.jsx';
import AdminCMS from './pages/AdminCMS.jsx';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Patient Pages */}
          <Route 
            path="/patient" 
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="records" element={<PatientRecords />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Protected Doctor Pages */}
          <Route 
            path="/doctor" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="availability" element={<DoctorAvailability />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Protected Admin Pages */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="patients" element={<AdminPatients />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="cms" element={<AdminCMS />} />
            <Route path="" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
