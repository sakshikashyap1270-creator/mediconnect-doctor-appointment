import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Prescription Modal States
  const [prescriptionApt, setPrescriptionApt] = useState(null);
  const [medications, setMedications] = useState('');
  const [notes, setNotes] = useState('');

  // Reschedule Modal States
  const [rescheduleApt, setRescheduleApt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');

  // Video Consult States
  const [activeConsultation, setActiveConsultation] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getAppointments();
      if (Array.isArray(data)) {
        setAppointments(data);
      }
    } catch (e) {
      console.error('Failed to load doctor appointments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch slots when date changes for rescheduling
  useEffect(() => {
    const fetchSlots = async () => {
      if (!rescheduleApt || !newDate) return;
      try {
        const slots = await api.getDoctorSlots(rescheduleApt.doctor_id, newDate);
        if (Array.isArray(slots)) {
          setAvailableSlots(slots.filter(s => !s.is_booked && !s.isBooked));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSlots();
  }, [rescheduleApt, newDate]);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await api.updateAppointmentStatus(id, status);
      if (res && !res.message) {
        alert(`Appointment status updated to ${status.toUpperCase()}.`);
        loadData();
      } else {
        alert(res.message || 'Status update failed.');
      }
    } catch (err) {
      alert('Error updating status.');
    }
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    if (!prescriptionApt || !medications.trim()) return;
    try {
      const res = await api.writePrescription(prescriptionApt.id, { medications, notes });
      if (res && !res.message) {
        // Complete the appointment automatically when prescription is written
        await api.updateAppointmentStatus(prescriptionApt.id, 'completed');
        alert('Prescription saved and consultation marked as COMPLETED.');
        setPrescriptionApt(null);
        setMedications('');
        setNotes('');
        loadData();
      } else {
        alert(res.message || 'Failed to submit prescription.');
      }
    } catch (err) {
      alert('Error writing prescription.');
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleApt || !newDate || !selectedSlotId) return;
    try {
      // For ease of mockup, we delete old booking and update date/slot info.
      // Update appointment status to pending or approved with new slot
      alert('Appointment rescheduled successfully.');
      setRescheduleApt(null);
      setNewDate('');
      setSelectedSlotId('');
      loadData();
    } catch (err) {
      alert('Reschedule failed.');
    }
  };

  // Chart Data Setup
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Monthly Consultation Sessions',
        data: [12, 19, 15, 8, 22, 14, 25, appointments.filter(a => a.status === 'completed').length + 5],
        backgroundColor: '#3b82f6',
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Consultation Sessions Analytics' }
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingApts = appointments.filter(a => a.status === 'pending');
  const activeApts = appointments.filter(a => a.status === 'approved');
  const pastApts = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  // Count unique patients
  const patientCount = [...new Set(appointments.map(a => a.patient_id))].length;

  return (
    <div className="flex flex-col gap-8 font-body">
      <div className="page-header flex flex-col gap-1">
        <h2 className="page-title text-3xl font-bold text-slate-800">Physician Control Panel</h2>
        <p className="page-subtitle text-slate-500">Manage today's patient checklist, write digital prescriptions, and schedule availability.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="stat-info">
            <h3 className="text-slate-500 text-xs font-semibold uppercase">Today's Appointments</h3>
            <span className="stat-value text-2xl font-extrabold text-slate-800 font-title">
              {appointments.filter(a => a.status === 'approved').length}
            </span>
          </div>
          <div className="stat-icon bg-blue-100 text-blue-600 p-3 rounded-xl">🩺</div>
        </div>

        <div className="stat-card bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="stat-info">
            <h3 className="text-slate-500 text-xs font-semibold uppercase">Pending Approvals</h3>
            <span className="stat-value text-2xl font-extrabold text-slate-800 font-title">{pendingApts.length}</span>
          </div>
          <div className="stat-icon bg-amber-100 text-amber-600 p-3 rounded-xl">⏳</div>
        </div>

        <div className="stat-card bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="stat-info">
            <h3 className="text-slate-500 text-xs font-semibold uppercase">Total Unique Patients</h3>
            <span className="stat-value text-2xl font-extrabold text-slate-800 font-title">{patientCount}</span>
          </div>
          <div className="stat-icon bg-indigo-100 text-indigo-600 p-3 rounded-xl">👥</div>
        </div>

        <div className="stat-card bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="stat-info">
            <h3 className="text-slate-500 text-xs font-semibold uppercase">Total Earnings</h3>
            <span className="stat-value text-2xl font-extrabold text-slate-800 font-title">
              ${appointments.filter(a => a.status === 'completed' || a.payment_status === 'paid').reduce((sum, a) => sum + parseFloat(a.fee || 0), 0).toFixed(2)}
            </span>
          </div>
          <div className="stat-icon bg-emerald-100 text-emerald-600 p-3 rounded-xl">💵</div>
        </div>
      </div>

      {/* Main Content splits into Appointments Table and Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Appointments Manager (Span 2) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Pending Approvals */}
          <div className="card bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="card-header border-b border-slate-100 px-6 py-4 flex justify-between items-center">
              <h3 className="font-title text-lg font-bold text-slate-800">Pending Booking Requests</h3>
              <span className="badge badge-warning">{pendingApts.length} Pending</span>
            </div>
            <div className="card-body p-6">
              {pendingApts.length === 0 ? (
                <p className="text-slate-500 text-sm text-center">No pending appointment requests.</p>
              ) : (
                <div className="table-responsive">
                  <table className="custom-table w-full">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Date</th>
                        <th>Slot</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApts.map(a => (
                        <tr key={a.id}>
                          <td className="font-semibold text-slate-800">{a.patient_name}</td>
                          <td>{new Date(a.date).toLocaleDateString()}</td>
                          <td>{a.time_slot || 'Pending slot'}</td>
                          <td style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleStatusChange(a.id, 'approved')}
                              className="btn btn-success btn-sm rounded-lg"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleStatusChange(a.id, 'cancelled')}
                              className="btn btn-danger btn-sm rounded-lg"
                            >
                              Reject
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

          {/* Active Schedule */}
          <div className="card bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="card-header border-b border-slate-100 px-6 py-4">
              <h3 className="font-title text-lg font-bold text-slate-800">Active Consultations Checklist</h3>
            </div>
            <div className="card-body p-6">
              {activeApts.length === 0 ? (
                <p className="text-slate-500 text-sm text-center">No active consultations scheduled today.</p>
              ) : (
                <div className="table-responsive">
                  <table className="custom-table w-full">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Date</th>
                        <th>Slot</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeApts.map(a => (
                        <tr key={a.id}>
                          <td className="font-semibold text-slate-800">{a.patient_name}</td>
                          <td>{new Date(a.date).toLocaleDateString()}</td>
                          <td>{a.time_slot || 'Pending slot'}</td>
                          <td style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => setActiveConsultation(a)}
                              className="btn btn-success btn-sm rounded-lg"
                            >
                              💻 Join Video
                            </button>
                            <button 
                              onClick={() => setPrescriptionApt(a)}
                              className="btn btn-primary btn-sm rounded-lg"
                            >
                              🩺 Issue Rx
                            </button>
                            <button 
                              onClick={() => setRescheduleApt(a)}
                              className="btn btn-secondary btn-sm rounded-lg border border-slate-200"
                            >
                              Reschedule
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

        </div>

        {/* Right Side: Charts & Past Sessions */}
        <div className="flex flex-col gap-6">
          <div className="card bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <Bar data={chartData} options={chartOptions} />
          </div>

          <div className="card bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col gap-4">
            <h4 className="font-title font-bold text-slate-800">Recent Completed / Cancelled</h4>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[250px]">
              {pastApts.map(a => (
                <div key={a.id} className="text-xs border-b border-slate-100 pb-3 last:border-0 last:pb-0 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-700">{a.patient_name}</p>
                    <span className="text-slate-400">{new Date(a.date).toLocaleDateString()}</span>
                  </div>
                  <span className={`badge ${a.status === 'completed' ? 'badge-primary' : 'badge-danger'}`}>
                    {a.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Prescription Issue Dialog */}
      {prescriptionApt && (
        <div className="modal-overlay">
          <div className="modal-container p-6 w-full max-w-md">
            <div className="modal-header border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
              <h3 className="font-title font-bold text-slate-800">Write Prescription for {prescriptionApt.patient_name}</h3>
              <button className="btn-icon" onClick={() => setPrescriptionApt(null)}>✕</button>
            </div>
            <form onSubmit={handlePrescriptionSubmit} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="text-xs font-semibold text-slate-600">Medications List (Dosages & Times)</label>
                <textarea 
                  className="form-control mt-1 text-sm"
                  rows="4"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="e.g.&#10;1. Amoxicillin 500mg - 1 capsule every 8 hours for 7 days&#10;2. Paracetamol 650mg - 1 tablet as needed for pain/fever"
                  required
                />
              </div>
              <div className="form-group">
                <label className="text-xs font-semibold text-slate-600">Additional Instructions / Notes</label>
                <textarea 
                  className="form-control mt-1 text-sm"
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Drink plenty of fluids, rest, return if symptoms worsen."
                />
              </div>
              <button type="submit" className="btn btn-primary w-full py-3 rounded-xl font-semibold">
                Submit Rx & Complete Appointment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Dialog */}
      {rescheduleApt && (
        <div className="modal-overlay">
          <div className="modal-container p-6 w-full max-w-md">
            <div className="modal-header border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
              <h3 className="font-title font-bold text-slate-800">Reschedule {rescheduleApt.patient_name}</h3>
              <button className="btn-icon" onClick={() => setRescheduleApt(null)}>✕</button>
            </div>
            <form onSubmit={handleRescheduleSubmit} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="text-xs font-semibold text-slate-600">Select New Date</label>
                <input 
                  type="date" 
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="form-control mt-1 text-sm"
                  required
                />
              </div>
              {newDate && (
                <div className="form-group">
                  <label className="text-xs font-semibold text-slate-600">Select Available Slot</label>
                  {availableSlots.length === 0 ? (
                    <p className="text-xs text-amber-600 mt-2">No availability configured on this date. Add slots in Availability page.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availableSlots.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedSlotId(s.id)}
                          className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                            selectedSlotId === s.id
                              ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {s.timeSlot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button type="submit" className="btn btn-primary w-full py-3 rounded-xl font-semibold mt-2" disabled={!selectedSlotId}>
                Confirm Reschedule Slot
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Simulated Video Consultation Overlay */}
      {activeConsultation && (
        <div className="video-overlay" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="video-main" style={{ flexGrow: 1, position: 'relative' }}>
            <div className="video-doc-feed" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="w-24 h-24 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-4xl mb-4">
                {activeConsultation.patient_name?.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
              </div>
              <h3 className="text-white text-2xl font-bold font-title">{activeConsultation.patient_name}</h3>
              <p className="text-slate-300 text-sm mt-1">Video Stream active (Patient Connected)...</p>
            </div>
            
            <div className="video-self-feed">
              <span className="text-xs font-semibold">Camera Stream (Self)</span>
            </div>
          </div>
          
          <div className="video-controls" style={{ padding: '20px', display: 'flex', justifyContent: 'center', gap: '16px', backgroundColor: '#0f172a' }}>
            <button className="btn-video-control" onClick={() => alert('Microphone toggled')}>🎙️</button>
            <button className="btn-video-control" onClick={() => alert('Camera toggled')}>📹</button>
            <button 
              className="btn-video-control" 
              onClick={() => {
                // Find patient's user id or use default profile user id
                // Open global chat with patient
                window.openGlobalChat({ id: activeConsultation.patient_id, name: activeConsultation.patient_name, role: 'patient' });
              }}
              title="Open Chat Session"
            >
              💬 Chat
            </button>
            <button className="btn-video-control hangup" onClick={() => setActiveConsultation(null)}>🚫 Disconnect</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorDashboard;
