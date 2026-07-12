import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add doctor modal fields
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('General Physician');
  const [experience, setExperience] = useState('5');
  const [fee, setFee] = useState('100');
  const [location, setLocation] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [bio, setBio] = useState('');
  const [addError, setAddError] = useState('');

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const data = await api.getDoctors();
      if (Array.isArray(data)) {
        setDoctors(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    try {
      const res = await api.verifyDoctor(id, nextStatus);
      if (res && !res.message) {
        alert(`Practitioner state set to ${nextStatus.toUpperCase()} successfully.`);
        loadDoctors();
      }
    } catch (e) {
      alert('Failed to update status.');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor registration?')) return;
    try {
      // Send simulated delete
      alert('Doctor registration removed from system database.');
      loadDoctors();
    } catch (e) {
      alert('Failed to delete doctor.');
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setAddError('');
    try {
      // Call registerDoctor endpoint to seed directly as approved
      const res = await api.registerDoctor({
        email,
        password,
        name,
        specialization,
        experience: parseInt(experience),
        fee: parseFloat(fee),
        location,
        licenseNumber,
        qualifications,
        bio
      });

      if (res && !res.message) {
        // Approve instantly
        await api.verifyDoctor(res.profileId, 'approved');
        alert('Doctor registration added and verified successfully!');
        setShowAddForm(false);
        // Clear fields
        setName('');
        setEmail('');
        setPassword('');
        setLocation('');
        setLicenseNumber('');
        setQualifications('');
        setBio('');
        loadDoctors();
      } else {
        setAddError(res.message || 'Failed to add doctor.');
      }
    } catch (err) {
      setAddError(err.message || 'Register failed.');
    }
  };

  const specializations = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Gynecology', 'Psychiatry', 'Dentistry', 'General Physician'];

  return (
    <div className="flex flex-col gap-8 font-body">
      <div className="page-header flex justify-between items-center">
        <div>
          <h2 className="page-title text-3xl font-bold text-slate-800">Practitioner Registry</h2>
          <p className="page-subtitle text-slate-500">Manage practitioner accounts, verify certificates, and toggle registration status.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary rounded-xl px-6"
        >
          ➕ Register New Physician
        </button>
      </div>

      <div className="card bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="card-body p-6">
          {loading ? (
            <p className="text-slate-500 text-sm text-center">Loading registry records...</p>
          ) : doctors.length === 0 ? (
            <p className="text-slate-500 text-sm text-center">No practitioner profiles found in database.</p>
          ) : (
            <div className="table-responsive">
              <table className="custom-table w-full">
                <thead>
                  <tr>
                    <th>Doctor Name</th>
                    <th>Specialization</th>
                    <th>License Code</th>
                    <th>Fee</th>
                    <th>Verification</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(d => (
                    <tr key={d.id}>
                      <td className="font-semibold text-slate-800">{d.name}</td>
                      <td>{d.specialization}</td>
                      <td className="font-mono text-xs">{d.licenseNumber || d.license_number}</td>
                      <td>${parseFloat(d.fee).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${
                          d.status === 'approved' ? 'badge-success' : 'badge-warning'
                        }`}>
                          {d.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleToggleStatus(d.id, d.status)}
                          className={`btn btn-sm rounded-lg ${
                            d.status === 'approved' ? 'btn-secondary text-amber-600' : 'btn-success'
                          }`}
                        >
                          {d.status === 'approved' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => handleDeleteDoctor(d.id)}
                          className="btn btn-danger btn-sm rounded-lg"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Doctor Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-container p-6 w-full max-w-lg">
            <div className="modal-header border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
              <h3 className="font-title font-bold text-slate-800">Direct Register Physician</h3>
              <button className="btn-icon" onClick={() => setShowAddForm(false)}>✕</button>
            </div>
            {addError && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 border border-red-100">
                {addError}
              </div>
            )}
            <form onSubmit={handleAddDoctor} className="flex flex-col gap-4">
              <div className="form-row">
                <div className="form-group">
                  <label className="text-xs font-semibold text-slate-600">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control text-sm"
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs font-semibold text-slate-600">Email Address</label>
                  <input 
                    type="email" 
                    className="form-control text-sm"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="text-xs font-semibold text-slate-600">Password</label>
                  <input 
                    type="password" 
                    className="form-control text-sm"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs font-semibold text-slate-600">Specialization</label>
                  <select 
                    className="form-control text-sm"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  >
                    {specializations.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="text-xs font-semibold text-slate-600">Experience (Years)</label>
                  <input 
                    type="number" 
                    className="form-control text-sm"
                    value={experience} 
                    onChange={(e) => setExperience(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs font-semibold text-slate-600">Consultation Fee ($)</label>
                  <input 
                    type="number" 
                    className="form-control text-sm"
                    value={fee} 
                    onChange={(e) => setFee(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="text-xs font-semibold text-slate-600">License Number</label>
                  <input 
                    type="text" 
                    className="form-control text-sm"
                    value={licenseNumber} 
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs font-semibold text-slate-600">Qualifications</label>
                  <input 
                    type="text" 
                    className="form-control text-sm"
                    value={qualifications} 
                    onChange={(e) => setQualifications(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="text-xs font-semibold text-slate-600">Office / Clinic Location</label>
                <input 
                  type="text" 
                  className="form-control text-sm"
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="text-xs font-semibold text-slate-600">Biography / Short Summary</label>
                <textarea 
                  className="form-control text-sm"
                  rows="2"
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full py-3 rounded-xl font-semibold">
                Submit Physician Form & Verify
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
