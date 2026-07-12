import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem('medi_connect_token');
      if (token) {
        try {
          // Fetch fresh user profile
          const profile = await api.getProfile();
          if (profile && !profile.message) {
            setUser({
              id: profile.user_id,
              email: profile.email,
              role: profile.specialization !== undefined ? 'doctor' : profile.dob !== undefined ? 'patient' : 'admin',
              name: profile.name,
              profileId: profile.id,
              doctorStatus: profile.status
            });
          } else {
            localStorage.removeItem('medi_connect_token');
          }
        } catch (e) {
          console.error('Session restoration failed:', e);
          localStorage.removeItem('medi_connect_token');
        }
      }
      setLoading(false);
    };
    checkUserSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('medi_connect_token', data.token);
      setUser(data.user);
      return data.user;
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const registerPatient = async (patientData) => {
    setLoading(true);
    try {
      const data = await api.registerPatient(patientData);
      localStorage.setItem('medi_connect_token', data.token);
      setUser(data.user);
      return data.user;
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const registerDoctor = async (doctorData) => {
    setLoading(true);
    try {
      const data = await api.registerDoctor(doctorData);
      localStorage.setItem('medi_connect_token', data.token);
      setUser(data.user);
      return data.user;
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('medi_connect_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, registerPatient, registerDoctor, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
