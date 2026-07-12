import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');

  // Booking Modal States
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  // Video Consultation States
  const [activeConsultation, setActiveConsultation] = useState(null);

  // Review Modal States
  const [reviewDoctor, setReviewDoctor] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const apts = await api.getAppointments();
      if (Array.isArray(apts)) setAppointments(apts);

      const docs = await api.getDoctors({ status: 'approved' });
      if (Array.isArray(docs)) setDoctors(docs);
    } catch (e) {
      console.error('Failed to load appointments data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch slots on date change
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctor || !bookingDate) return;
      try {
        const data = await api.getDoctorSlots(selectedDoctor.id, bookingDate);
        if (Array.isArray(data)) {
          setSlots(data.filter(s => !s.is_booked && !s.isBooked));
        }
      } catch (e) {
        console.error('Failed to fetch doctor slots:', e);
      }
    };
    fetchSlots();
  }, [selectedDoctor, bookingDate]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    if (!selectedDoctor || !bookingDate || !selectedSlotId) {
      setBookingError('Please select a valid doctor, date, and slot.');
      return;
    }

    try {
      const res = await api.bookAppointment({
        doctorId: selectedDoctor.id,
        timeSlotId: parseInt(selectedSlotId),
        date: bookingDate,
        fee: selectedDoctor.fee
      });

      if (res && !res.message) {
        setBookingSuccess('Appointment booked successfully! Awaiting doctor approval.');
        setSelectedDoctor(null);
        setBookingDate('');
        setSlots([]);
        setSelectedSlotId('');
        loadData();
      } else {
        setBookingError(res.message || 'Failed to book slot.');
      }
    } catch (err) {
      setBookingError(err.message || 'Booking failed.');
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await api.updateAppointmentStatus(id, 'cancelled');
      if (res && !res.message) {
        alert('Appointment cancelled successfully.');
        loadData();
      } else {
        alert(res.message || 'Failed to cancel.');
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewDoctor) return;
    try {
      // Simulate submission of reviews to doctor profile / database
      alert(`Review submitted for Dr. ${reviewDoctor.doctor_name || 'Specialist'}! Thank you.`);
      setReviewDoctor(null);
      setComment('');
      setRating(5);
    } catch (err) {
      alert('Review submission failed.');
    }
  };

  const downloadPrescription = (apt) => {
    // Generate static details or alert
    alert(`Prescription Details:\nMedications:\n- Amoxicillin 500mg (1x daily)\n- Ibuprofen 400mg (prn)\n\nPrescribed by: Dr. ${apt.doctor_name || 'Physician'}\n\nPrescription PDF downloading... (Simulated PDF download generated successfully)`);
  };

  const filteredDoctors = doctors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || 
                          d.specialization.toLowerCase().includes(search.toLowerCase());
    const matchesSpec = specialization === '' || d.specialization === specialization;
    return matchesSearch && matchesSpec;
  });

  const specializations = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Gynecology', 'Psychiatry', 'Dentistry', 'General Physician'];

  return (
    <div className="flex flex-col gap-8 font-body">
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="page-title text-3xl font-bold text-slate-800">Appointments Management</h2>
          <p className="page-subtitle text-slate-500">Book new clinical consultations and join active digital sessions.</p>
        </div>
        <button 
          onClick={() => {
            if (doctors.length > 0) setSelectedDoctor(doctors[0]);
          }}
          className="btn btn-primary rounded-xl px-6 py-3 font-semibold shadow-lg"
        >
          ➕ Quick Book Consultation
        </button>
      </div>

      {bookingSuccess && (
        <div className="bg-emerald-50 text-emerald-600 text-sm p-4 rounded-xl border border-emerald-100">
          {bookingSuccess}
        </div>
      )}

      {/* Main Grid: Search and List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Span 2): Current Booking List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="card-header border-b border-slate-100 px-6 py-4">
              <h3 className="font-title text-lg font-bold text-slate-800">My Consultation Schedule</h3>
            </div>
            <div className="card-body p-6">
              {loading ? (
                <p className="text-slate-500 text-sm text-center">Loading scheduled consults...</p>
              ) : appointments.length === 0 ? (
                <p className="text-slate-500 text-sm text-center">No consultations booked. Search doctors on the right to schedule one!</p>
              ) : (
                <div className="table-responsive">
                  <table className="custom-table w-full">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Specialty</th>
                        <th>Date</th>
                        <th>Time Slot</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map(a => (
                        <tr key={a.id}>
                          <td className="font-semibold text-slate-800">{a.doctor_name || 'Physician'}</td>
                          <td>{a.specialization}</td>
                          <td>{new Date(a.date).toLocaleDateString()}</td>
                          <td>{a.time_slot || 'TBD'}</td>
                          <td>
                            <span className={`badge ${
                              a.status === 'approved' ? 'badge-success' : 
                              a.status === 'completed' ? 'badge-primary' : 
                              a.status === 'cancelled' ? 'badge-danger' : 'badge-warning'
                            }`}>
                              {a.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ display: 'flex', gap: '8px' }}>
                            {a.status === 'approved' && (
                              <button 
                                onClick={() => setActiveConsultation(a)}
                                className="btn btn-success btn-sm rounded-lg"
                              >
                                💻 Join Video
                              </button>
                            )}
                            {a.status === 'completed' && (
                              <>
                                <button 
                                  onClick={() => downloadPrescription(a)}
                                  className="btn btn-outline-primary btn-sm rounded-lg"
                                >
                                  📥 Rx PDF
                                </button>
                                <button 
                                  onClick={() => setReviewDoctor(a)}
                                  className="btn btn-secondary btn-sm rounded-lg text-slate-600 border border-slate-200"
                                >
                                  ⭐ Review
                                </button>
                              </>
                            )}
                            {(a.status === 'pending' || a.status === 'approved') && (
                              <button 
                                onClick={() => handleCancelAppointment(a.id)}
                                className="btn btn-danger btn-sm rounded-lg"
                              >
                                Cancel
                              </button>
                            )}
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

        {/* Right Column: Search & Doctor List */}
        <div className="flex flex-col gap-6">
          <div className="card bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-title text-lg font-bold text-slate-800 mb-4">Search Approved Practitioners</h3>
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                placeholder="Doctor name or specialty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control text-sm"
              />
              <select 
                value={specialization} 
                onChange={(e) => setSpecialization(e.target.value)}
                className="form-control text-sm"
              >
                <option value="">All Specialties</option>
                {specializations.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-2">
            {filteredDoctors.map(d => (
              <div 
                key={d.id} 
                onClick={() => setSelectedDoctor(d)}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-title font-bold text-slate-800 text-sm">{d.name}</h4>
                  <span className="text-xs text-blue-600 font-semibold">{d.specialization}</span>
                  <p className="text-slate-500 text-xs mt-2 line-clamp-2">{d.bio || 'Verified medical consultant.'}</p>
                </div>
                <div className="flex justify-between items-center text-xs mt-3 border-t border-slate-100 pt-3">
                  <span className="font-medium text-slate-600">Fee: ${parseFloat(d.fee).toFixed(2)}</span>
                  <span className="text-blue-600 font-semibold hover:underline">Select Date & Book →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Booking Modal Dialog */}
      {selectedDoctor && (
        <div className="modal-overlay">
          <div className="modal-container p-6 w-full max-w-md">
            <div className="modal-header border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
              <h3 className="font-title font-bold text-slate-800">Book Session with {selectedDoctor.name}</h3>
              <button className="btn-icon" onClick={() => setSelectedDoctor(null)}>✕</button>
            </div>
            {bookingError && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 border border-red-100">
                {bookingError}
              </div>
            )}
            <form onSubmit={handleBookAppointment} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="text-xs font-semibold text-slate-600">Select Date</label>
                <input 
                  type="date" 
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="form-control mt-1 text-sm"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {bookingDate && (
                <div className="form-group">
                  <label className="text-xs font-semibold text-slate-600">Available Slots</label>
                  {slots.length === 0 ? (
                    <p className="text-xs text-amber-600 mt-2">No available time slots found for this date. (Seeded database dates: '2026-07-10').</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {slots.map(s => (
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

              <button 
                type="submit" 
                className="btn btn-primary w-full py-3 rounded-xl font-semibold mt-2"
                disabled={!selectedSlotId}
              >
                Confirm Appointment (Fee: ${parseFloat(selectedDoctor.fee).toFixed(2)})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal Dialog */}
      {reviewDoctor && (
        <div className="modal-overlay">
          <div className="modal-container p-6 w-full max-w-md">
            <div className="modal-header border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
              <h3 className="font-title font-bold text-slate-800">Review Dr. {reviewDoctor.doctor_name}</h3>
              <button className="btn-icon" onClick={() => setReviewDoctor(null)}>✕</button>
            </div>
            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="text-xs font-semibold text-slate-600">Rating (1 to 5 Stars)</label>
                <select 
                  value={rating} 
                  onChange={(e) => setRating(parseInt(e.target.value))}
                  className="form-control mt-1 text-sm"
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value="4">⭐⭐⭐⭐ (4/5)</option>
                  <option value="3">⭐⭐⭐ (3/5)</option>
                  <option value="2">⭐⭐ (2/5)</option>
                  <option value="1">⭐ (1/5)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="text-xs font-semibold text-slate-600">Write Comments</label>
                <textarea 
                  className="form-control mt-1 text-sm"
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of your clinical experience..."
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full py-3 rounded-xl font-semibold">
                Submit Consultation Review
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
              <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-4xl mb-4">
                {activeConsultation.doctor_name?.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
              </div>
              <h3 className="text-white text-2xl font-bold font-title">Dr. {activeConsultation.doctor_name}</h3>
              <p className="text-slate-300 text-sm mt-1">Video Stream Connection active...</p>
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
                const docUserId = doctors.find(d => d.name === activeConsultation.doctor_name)?.userId || activeConsultation.doctor_id;
                window.openGlobalChat({ id: docUserId, name: activeConsultation.doctor_name, role: 'doctor' });
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

export default PatientAppointments;
