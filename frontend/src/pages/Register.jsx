import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const Register = () => {
  const { registerPatient, registerDoctor } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('patient'); // patient, doctor
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Common Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Patient Fields
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [contact, setContact] = useState('');
  const [insurance, setInsurance] = useState('');

  // Doctor Fields
  const [specialization, setSpecialization] = useState('Cardiology');
  const [experience, setExperience] = useState('5');
  const [fee, setFee] = useState('100');
  const [location, setLocation] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [bio, setBio] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (role === 'patient') {
        await registerPatient({
          email,
          password,
          name,
          dob,
          gender,
          contact,
          insurance
        });
        navigate('/patient/dashboard');
      } else {
        await registerDoctor({
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
        navigate('/doctor/dashboard');
      }
    } catch (e) {
      setError(e.message || 'Registration failed. Check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const specializations = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Gynecology', 'Psychiatry', 'Dentistry', 'General Physician'];

  return (
    <div className="auth-wrapper font-body bg-slate-50 min-h-screen flex items-center justify-center py-10">
      <div className="auth-container bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg p-8">
        <h3 className="font-title text-center text-3xl font-extrabold text-blue-600 mb-2">
          🩺 MediConnect
        </h3>
        <p className="text-center text-slate-500 text-sm mb-6">Create your profile to start booking appointments.</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label font-semibold text-slate-700">I want to register as a:</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border capitalize transition-all ${
                  role === 'patient' 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border capitalize transition-all ${
                  role === 'doctor' 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Doctor / Practitioner
              </button>
            </div>
          </div>

          {/* Common Fields */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label font-semibold text-slate-700">Full Name</label>
              <input 
                type="text" 
                className="form-control mt-1" 
                placeholder="e.g. Dr. Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label font-semibold text-slate-700">Email Address</label>
              <input 
                type="email" 
                className="form-control mt-1" 
                placeholder="e.g. name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label font-semibold text-slate-700">Password</label>
            <input 
              type="password" 
              className="form-control mt-1" 
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Patient Custom Fields */}
          {role === 'patient' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label font-semibold text-slate-700">Date of Birth</label>
                  <input 
                    type="date" 
                    className="form-control mt-1"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label font-semibold text-slate-700">Gender</label>
                  <select 
                    className="form-control mt-1"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label font-semibold text-slate-700">Contact Number</label>
                  <input 
                    type="tel" 
                    className="form-control mt-1"
                    placeholder="+1 (555) 012-3456"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label font-semibold text-slate-700">Insurance Provider</label>
                  <input 
                    type="text" 
                    className="form-control mt-1"
                    placeholder="BlueCross Shield, etc."
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Doctor Custom Fields */}
          {role === 'doctor' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label font-semibold text-slate-700">Specialization</label>
                  <select 
                    className="form-control mt-1"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  >
                    {specializations.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label font-semibold text-slate-700">Experience (Years)</label>
                  <input 
                    type="number" 
                    className="form-control mt-1"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label font-semibold text-slate-700">Consultation Fee ($)</label>
                  <input 
                    type="number" 
                    className="form-control mt-1"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label font-semibold text-slate-700">Clinic / Office Location</label>
                  <input 
                    type="text" 
                    className="form-control mt-1"
                    placeholder="e.g. 100 Manhattan Plaza, Suite 4B"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label font-semibold text-slate-700">License Number</label>
                  <input 
                    type="text" 
                    className="form-control mt-1"
                    placeholder="LIC-XXXXXX-STATE"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label font-semibold text-slate-700">Academic Qualifications</label>
                  <input 
                    type="text" 
                    className="form-control mt-1"
                    placeholder="e.g. MD - Harvard Medical, Board Certified"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label font-semibold text-slate-700">Biography / Short Summary</label>
                <textarea 
                  className="form-control mt-1"
                  rows="2"
                  placeholder="Tell patients about your focus area..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary w-full py-3 mt-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            disabled={loading}
          >
            {loading ? 'Submitting Registration...' : 'Complete Register'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            Log In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
