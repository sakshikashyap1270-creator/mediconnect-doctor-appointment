import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';

export const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // BMI States
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [bmiStatus, setBmiStatus] = useState('');

  // Water Tracker States
  const [waterCups, setWaterCups] = useState(0);
  const targetCups = 8;

  // AI Symptom Checker States
  const [symptoms, setSymptoms] = useState('');
  const [symptomResult, setSymptomResult] = useState('');
  const [checkingSymptoms, setCheckingSymptoms] = useState(false);

  // Medicine Reminder States
  const [medicines, setMedicines] = useState([
    { name: 'Amoxicillin (500mg)', time: '08:00 AM', taken: false },
    { name: 'Lisinopril (10mg)', time: '02:00 PM', taken: false },
    { name: 'Vitamin D3 (1000 IU)', time: '08:00 PM', taken: false }
  ]);

  const loadData = async () => {
    try {
      const apts = await api.getAppointments();
      if (Array.isArray(apts)) {
        setAppointments(apts);
      }
      const notifs = await api.getNotifications();
      if (Array.isArray(notifs)) {
        setNotifications(notifs.slice(0, 4));
      }
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate BMI
  const handleCalcBmi = (e) => {
    e.preventDefault();
    if (!weight || !height) return;
    const hMeter = parseFloat(height) / 100;
    const score = parseFloat(weight) / (hMeter * hMeter);
    setBmi(score.toFixed(1));
    if (score < 18.5) setBmiStatus('Underweight');
    else if (score < 25) setBmiStatus('Normal weight');
    else if (score < 30) setBmiStatus('Overweight');
    else setBmiStatus('Obese');
  };

  // Add water cup
  const handleAddWater = () => {
    if (waterCups < targetCups) {
      setWaterCups(prev => prev + 1);
    }
  };

  // Check Symptoms
  const handleCheckSymptoms = (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setCheckingSymptoms(true);
    setSymptomResult('');
    setTimeout(() => {
      const input = symptoms.toLowerCase();
      let recommendation = '';
      if (input.includes('fever') || input.includes('cough') || input.includes('cold')) {
        recommendation = '⚠️ Possible viral infection. Advice: Hydrate, rest, check temperature. Schedule consult with a General Physician if fever persists beyond 3 days.';
      } else if (input.includes('headache') || input.includes('migraine')) {
        recommendation = '⚠️ Possible stress headache or migraine. Advice: Rest in a quiet dark room, hydrate, avoid screens. Consult a Neurologist if pain is sudden and severe.';
      } else if (input.includes('chest') || input.includes('heart') || input.includes('shortness of breath')) {
        recommendation = '🚨 EMERGENCY WARNING: Chest pains could indicate cardiovascular distress. Seek immediate care or book an urgent consultation with our Cardiology department.';
      } else {
        recommendation = 'ℹ️ Symptoms described. Advice: Get plenty of rest. We recommend booking a consult with a General Physician for formal evaluation.';
      }
      setSymptomResult(recommendation);
      setCheckingSymptoms(false);
    }, 1500);
  };

  const handleMedToggle = (idx) => {
    setMedicines(prev => prev.map((m, i) => i === idx ? { ...m, taken: !m.taken } : m));
  };

  const upcomingApts = appointments.filter(a => a.status === 'pending' || a.status === 'approved').slice(0, 3);

  return (
    <div className="flex flex-col gap-8 font-body">
      <div className="page-header flex flex-col gap-1">
        <h2 className="page-title text-3xl font-bold text-slate-800">Dashboard</h2>
        <p className="page-subtitle text-slate-500">Welcome to your MediConnect portal. Manage your health stats and appointments below.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="stat-info">
            <h3 className="text-slate-500 text-xs font-semibold uppercase">Total Bookings</h3>
            <span className="stat-value text-2xl font-extrabold text-slate-800 font-title">{appointments.length}</span>
          </div>
          <div className="stat-icon bg-blue-100 text-blue-600 p-3 rounded-xl">📅</div>
        </div>

        <div className="stat-card bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="stat-info">
            <h3 className="text-slate-500 text-xs font-semibold uppercase">Pending Approvals</h3>
            <span className="stat-value text-2xl font-extrabold text-slate-800 font-title">
              {appointments.filter(a => a.status === 'pending').length}
            </span>
          </div>
          <div className="stat-icon bg-amber-100 text-amber-600 p-3 rounded-xl">⏳</div>
        </div>

        <div className="stat-card bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="stat-info">
            <h3 className="text-slate-500 text-xs font-semibold uppercase">Completed Consults</h3>
            <span className="stat-value text-2xl font-extrabold text-slate-800 font-title">
              {appointments.filter(a => a.status === 'completed').length}
            </span>
          </div>
          <div className="stat-icon bg-emerald-100 text-emerald-600 p-3 rounded-xl">✓</div>
        </div>

        <div className="stat-card bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="stat-info">
            <h3 className="text-slate-500 text-xs font-semibold uppercase">Water Goal</h3>
            <span className="stat-value text-2xl font-extrabold text-slate-800 font-title">{waterCups} / {targetCups} Cups</span>
          </div>
          <div className="stat-icon bg-cyan-100 text-cyan-600 p-3 rounded-xl">💧</div>
        </div>
      </div>

      {/* Main Grid: Left Widgets, Right Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Span 2): Health Widgets */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Water intake & BMI row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Water Tracker */}
            <div className="card bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-title text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                💧 Water Intake Tracker
              </h3>
              <p className="text-slate-500 text-sm mb-4">Stay hydrated. Drink at least 8 cups (2L) of water today.</p>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden mb-6">
                <div 
                  className="bg-cyan-500 h-full transition-all duration-300"
                  style={{ width: `${(waterCups / targetCups) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">Progress: {Math.round((waterCups / targetCups) * 100)}%</span>
                <button 
                  onClick={handleAddWater}
                  className="btn btn-primary btn-sm flex items-center gap-1 rounded-xl"
                  disabled={waterCups >= targetCups}
                >
                  + Add 1 Cup
                </button>
              </div>
            </div>

            {/* BMI Calculator */}
            <div className="card bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-title text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                ⚖️ BMI Calculator
              </h3>
              <form onSubmit={handleCalcBmi} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Weight (kg)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 70" 
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="form-control mt-1 text-sm py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Height (cm)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 175" 
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="form-control mt-1 text-sm py-2"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-outline-primary btn-sm w-full py-2 rounded-xl mt-1">
                  Calculate BMI
                </button>
              </form>

              {bmi && (
                <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
                  <p className="text-slate-600 text-xs">Your BMI: <strong className="text-blue-600 text-sm font-title">{bmi}</strong></p>
                  <p className="text-slate-700 text-xs mt-1 font-semibold">Status: <span className="text-indigo-600">{bmiStatus}</span></p>
                </div>
              )}
            </div>
          </div>

          {/* AI Symptom Checker */}
          <div className="card bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-title text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              🤖 AI Symptom Checker
            </h3>
            <p className="text-slate-500 text-sm mb-4">
              Enter your current symptoms below to receive immediate, AI-guided medical advice and recommended medical departments.
            </p>
            <form onSubmit={handleCheckSymptoms} className="flex flex-col gap-3">
              <textarea 
                className="form-control py-3"
                rows="3"
                placeholder="e.g. I have a dry cough, low fever, and head congestion..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                required
              />
              <button 
                type="submit" 
                className="btn btn-primary rounded-xl font-semibold text-sm self-end"
                disabled={checkingSymptoms}
              >
                {checkingSymptoms ? 'Analyzing symptoms...' : 'Run Symptom Check'}
              </button>
            </form>

            {symptomResult && (
              <div className="mt-4 p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {symptomResult}
              </div>
            )}
          </div>

          {/* Upcoming appointments list */}
          <div className="card bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="card-header border-b border-slate-100 px-6 py-4 flex justify-between items-center">
              <h3 className="font-title text-lg font-bold text-slate-800">Upcoming Appointments</h3>
              <Link to="/patient/appointments" className="text-blue-600 text-xs font-semibold hover:underline">
                View All
              </Link>
            </div>
            <div className="card-body p-6">
              {loading ? (
                <p className="text-slate-500 text-sm text-center">Loading appointments...</p>
              ) : upcomingApts.length === 0 ? (
                <p className="text-slate-500 text-sm text-center">No upcoming consultation bookings. Let's schedule one!</p>
              ) : (
                <div className="table-responsive">
                  <table className="custom-table w-full">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Date</th>
                        <th>Slot</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingApts.map(a => (
                        <tr key={a.id}>
                          <td className="font-semibold text-slate-800">{a.doctor_name || 'Medical Specialist'}</td>
                          <td>{new Date(a.date).toLocaleDateString()}</td>
                          <td>{a.time_slot || 'Pending slot'}</td>
                          <td>
                            <span className={`badge ${
                              a.status === 'approved' ? 'badge-success' : 'badge-warning'
                            }`}>
                              {a.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Medicine remind & Notifications */}
        <div className="flex flex-col gap-8">
          
          {/* Medicine Reminders */}
          <div className="card bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-title text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              💊 Medicine Reminders
            </h3>
            <p className="text-slate-500 text-xs mb-4">Check off your scheduled medications as you take them.</p>
            <div className="flex flex-col gap-3">
              {medicines.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex justify-between items-center p-3 rounded-xl border transition-all ${
                    m.taken 
                      ? 'bg-slate-50 border-slate-200 opacity-60' 
                      : 'bg-blue-50/20 border-blue-100 hover:border-blue-200'
                  }`}
                >
                  <div>
                    <h5 className={`font-semibold text-sm ${m.taken ? 'line-through text-slate-400' : 'text-slate-700'}`}>{m.name}</h5>
                    <span className="text-xs text-slate-400">{m.time}</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={m.taken}
                    onChange={() => handleMedToggle(idx)}
                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Notifications panel */}
          <div className="card bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-title text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              🔔 Recent Alerts
            </h3>
            <div className="flex flex-col gap-4">
              {notifications.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">No recent updates.</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="text-sm border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <p className="text-slate-700 leading-relaxed">{n.message}</p>
                    <span className="text-xs text-slate-400 mt-1 block">{new Date(n.date).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PatientDashboard;
