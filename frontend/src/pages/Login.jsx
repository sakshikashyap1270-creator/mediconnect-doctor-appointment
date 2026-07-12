import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient'); // patient, doctor, admin
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      // Save rememberMe if selected
      if (rememberMe) {
        localStorage.setItem('medi_connect_remember_email', email);
      } else {
        localStorage.removeItem('medi_connect_remember_email');
      }

      // Check role and redirect
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        const redir = searchParams.get('redirect');
        if (redir === 'appointments') {
          navigate(`/patient/appointments?search=${searchParams.get('search') || ''}&spec=${searchParams.get('spec') || ''}`);
        } else {
          navigate('/patient/dashboard');
        }
      }
    } catch (e) {
      setError(e.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper font-body bg-slate-50 min-h-screen flex items-center justify-center">
      <div className="auth-container bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-8">
        <h3 className="font-title text-center text-3xl font-extrabold text-blue-600 mb-2">
          🩺 MediConnect
        </h3>
        <p className="text-center text-slate-500 text-sm mb-6">Welcome back! Sign in to access your portal.</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label font-semibold text-slate-700">Account Type</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {['patient', 'doctor', 'admin'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border capitalize transition-all ${
                    role === r 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
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

          <div className="form-group">
            <label className="form-label font-semibold text-slate-700">Password</label>
            <input 
              type="password" 
              className="form-control mt-1" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-between items-center text-sm mt-2">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500" 
              />
              Remember Me
            </label>
            <span 
              onClick={() => alert('Check logs. Email verification & password resets details are seeded in README.md.')}
              className="text-blue-600 hover:underline cursor-pointer font-medium"
            >
              Forgot Password?
            </span>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full py-3 mt-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-semibold">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
