import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export const DoctorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [fee, setFee] = useState('');
  const [location, setLocation] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [bio, setBio] = useState('');

  // Password fields
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
        setSpecialization(data.specialization || '');
        setExperience(data.experience !== undefined ? data.experience.toString() : '');
        setFee(data.fee !== undefined ? data.fee.toString() : '');
        setLocation(data.location || '');
        setQualifications(data.qualifications || '');
        setBio(data.bio || '');
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
      setErrorMsg('Could not fetch practitioner profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const updated = await api.updateProfile({
        name,
        specialization,
        experience: parseInt(experience),
        fee: parseFloat(fee),
        location,
        qualifications,
        bio
      });

      if (updated && !updated.message) {
        setSuccessMsg('Practitioner profile records saved successfully.');
        fetchProfile();
      } else {
        setErrorMsg(updated.message || 'Profile update failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unexpected error occurred.');
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
        setPwSuccess('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setPwError(res.message || 'Password update failed.');
      }
    } catch (err) {
      setPwError(err.message || 'Current password validation failed.');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) return <p className="text-slate-500 text-center py-10">Loading profile data...</p>;

  return (
    <div className="flex flex-col gap-8 font-body max-w-4xl mx-auto">
      <div className="page-header flex flex-col gap-1">
        <h2 className="page-title text-3xl font-bold text-slate-800">My Profile</h2>
        <p className="page-subtitle text-slate-500">View and update your clinical qualifications, pricing, and login credentials.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-600 text-sm p-4 rounded-xl border border-emerald-100">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: General Profile Info Form */}
        <div className="md:col-span-2 card bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-title text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">
            🏥 Practitioner Profile
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
                <label className="form-label font-semibold text-slate-600">Specialization</label>
                <input 
                  type="text" 
                  className="form-control mt-1 text-sm"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label font-semibold text-slate-600">Experience (Years)</label>
                <input 
                  type="number" 
                  className="form-control mt-1 text-sm"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label font-semibold text-slate-600">Consultation Fee ($)</label>
                <input 
                  type="number" 
                  className="form-control mt-1 text-sm"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label font-semibold text-slate-600">Academic Qualifications</label>
                <input 
                  type="text" 
                  className="form-control mt-1 text-sm"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label font-semibold text-slate-600">Clinic / Office Location</label>
                <input 
                  type="text" 
                  className="form-control mt-1 text-sm"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label font-semibold text-slate-600">Biography / Short Summary</label>
              <textarea 
                className="form-control mt-1 text-sm"
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary rounded-xl font-semibold text-sm self-end px-8 py-3 shadow-md">
              Save Profile Records
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

export default DoctorProfile;
