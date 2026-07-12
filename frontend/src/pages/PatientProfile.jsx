import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export const PatientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [contact, setContact] = useState('');
  const [insurance, setInsurance] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');

  // Password Update Fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await api.getProfile();
      if (data && !data.message) {
        setProfile(data);
        setName(data.name || '');
        if (data.dob) setDob(data.dob.split('T')[0]);
        setGender(data.gender || 'Male');
        setContact(data.contact || '');
        setInsurance(data.insurance || '');
        setBloodGroup(data.bloodGroup || data.blood_group || 'A+');
        setEmergencyContact(data.emergencyContact || data.emergency_contact || '');
        setAllergies(data.allergies || '');
        setMedicalHistory(data.medicalHistory || data.medical_history || '');
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
      setErrorMessage('Could not load profile records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const updated = await api.updateProfile({
        name,
        dob,
        gender,
        contact,
        insurance,
        bloodGroup,
        emergencyContact,
        allergies,
        medicalHistory
      });
      if (updated && !updated.message) {
        setSuccessMessage('Your profile records were updated successfully!');
        fetchProfile();
      } else {
        setErrorMessage(updated.message || 'Profile update failed.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unexpected error occurred.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');
    setPwLoading(true);
    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      if (res && !res.message) {
        setPwSuccess('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setPwError(res.message || 'Password update failed.');
      }
    } catch (err) {
      setPwError(err.message || 'Verification of current password failed.');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) return <p className="text-slate-500 text-center py-10">Loading profile data...</p>;

  return (
    <div className="flex flex-col gap-8 font-body max-w-4xl mx-auto">
      <div className="page-header flex flex-col gap-1">
        <h2 className="page-title text-3xl font-bold text-slate-800">My Profile</h2>
        <p className="page-subtitle text-slate-500">View and update your personal health record, allergies, and account security details.</p>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 text-emerald-600 text-sm p-4 rounded-xl border border-emerald-100">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: General Profile Info Form */}
        <div className="md:col-span-2 card bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-title text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">
            🏥 Medical Profile
          </h3>
          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label font-semibold text-slate-600">Full Name</label>
                <input 
                  type="text" 
                  className="form-control mt-1 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label font-semibold text-slate-600">Date of Birth</label>
                <input 
                  type="date" 
                  className="form-control mt-1 text-sm"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label font-semibold text-slate-600">Gender</label>
                <select 
                  className="form-control mt-1 text-sm"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label font-semibold text-slate-600">Blood Group</label>
                <select 
                  className="form-control mt-1 text-sm"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label font-semibold text-slate-600">Contact Number</label>
                <input 
                  type="tel" 
                  className="form-control mt-1 text-sm"
                  placeholder="+1 (555) 012-3456"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label font-semibold text-slate-600">Insurance Provider</label>
                <input 
                  type="text" 
                  className="form-control mt-1 text-sm"
                  placeholder="e.g. BlueCross Shield"
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label font-semibold text-slate-600">Emergency Contact</label>
                <input 
                  type="text" 
                  className="form-control mt-1 text-sm"
                  placeholder="e.g. Mary Doe (Wife) - +1 (555) 019-8877"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label font-semibold text-slate-600">Known Allergies</label>
                <input 
                  type="text" 
                  className="form-control mt-1 text-sm"
                  placeholder="e.g. Penicillin, Peanuts"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label font-semibold text-slate-600">Medical History Summary</label>
              <textarea 
                className="form-control mt-1 text-sm"
                rows="4"
                placeholder="Brief details about chronic illnesses, past surgeries..."
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary rounded-xl font-semibold text-sm self-end px-8 py-3 shadow-md">
              Save Medical Profile
            </button>
          </form>
        </div>

        {/* Right Side: Account Settings & Password Update */}
        <div className="flex flex-col gap-8">
          <div className="card bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-title text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">
              🔑 Account Security
            </h3>
            
            {pwSuccess && (
              <div className="bg-emerald-50 text-emerald-600 text-xs p-3 rounded-lg mb-4 border border-emerald-100">
                {pwSuccess}
              </div>
            )}
            {pwError && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 border border-red-100">
                {pwError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label font-semibold text-slate-600">Current Password</label>
                <input 
                  type="password" 
                  className="form-control mt-1 text-sm"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label font-semibold text-slate-600">New Password</label>
                <input 
                  type="password" 
                  className="form-control mt-1 text-sm"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-outline-primary rounded-xl w-full py-3 text-sm font-semibold"
                disabled={pwLoading}
              >
                {pwLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientProfile;
