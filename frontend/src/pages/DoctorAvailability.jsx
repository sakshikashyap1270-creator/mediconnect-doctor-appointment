import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export const DoctorAvailability = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDate, setActiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);

  // Form inputs
  const [newSlotTime, setNewSlotTime] = useState('09:00 AM');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      const prof = await api.getProfile();
      if (prof && !prof.message) {
        setProfile(prof);
        const data = await api.getDoctorSlots(prof.id, activeDate);
        if (Array.isArray(data)) {
          setSlots(data);
        }
      }
    } catch (e) {
      console.error('Failed to load slots:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeDate]);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    if (!profile) return;
    try {
      const res = await api.addAvailabilitySlot(activeDate, newSlotTime);
      if (res && !res.message) {
        setSuccessMsg(`Slot ${newSlotTime} added successfully!`);
        loadData();
      } else {
        setErrorMsg(res.message || 'Failed to add slot.');
      }
    } catch (err) {
      setErrorMsg('Error adding slot.');
    }
  };

  const handleRemoveSlot = async (timeSlot) => {
    if (!window.confirm(`Are you sure you want to remove the slot ${timeSlot}?`)) return;
    try {
      const res = await api.removeAvailabilitySlot(activeDate, timeSlot);
      if (res && !res.message) {
        alert('Slot removed successfully.');
        loadData();
      } else {
        alert(res.message || 'Failed to remove slot.');
      }
    } catch (err) {
      alert('Error removing slot.');
    }
  };

  const timePresets = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
    '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'
  ];

  if (loading && !profile) return <p className="text-slate-500 text-center py-10">Loading availability schedule...</p>;

  return (
    <div className="flex flex-col gap-8 font-body max-w-4xl mx-auto">
      <div className="page-header flex flex-col gap-1">
        <h2 className="page-title text-3xl font-bold text-slate-800">Manage Weekly Schedule</h2>
        <p className="page-subtitle text-slate-500">Configure consultation time slots and block dates.</p>
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
        
        {/* Left column: Pick Date & Configure */}
        <div className="card bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col gap-4">
          <h3 className="font-title text-lg font-bold text-slate-800 mb-2">Set Slot Date</h3>
          
          <div className="form-group mb-0">
            <label className="text-xs font-semibold text-slate-600">Select Date</label>
            <input 
              type="date"
              value={activeDate}
              onChange={(e) => setActiveDate(e.target.value)}
              className="form-control mt-1 text-sm py-2"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <h3 className="font-title text-lg font-bold text-slate-800 mb-2 mt-4">Add Timing Slot</h3>
          <form onSubmit={handleAddSlot} className="flex flex-col gap-3">
            <div className="form-group mb-0">
              <label className="text-xs font-semibold text-slate-600">Preset Slots</label>
              <select
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                className="form-control mt-1 text-sm py-2"
              >
                {timePresets.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary rounded-xl font-semibold text-sm w-full py-3">
              Add Available Slot
            </button>
          </form>
        </div>

        {/* Right column: Slots list (Span 2) */}
        <div className="md:col-span-2 card bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-title text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex justify-between items-center">
            <span>Availability Slots Configured</span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {new Date(activeDate).toLocaleDateString()}
            </span>
          </h3>

          {slots.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-10">No availability slots configured on this date. Select another date or add a slot on the left.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {slots.map(s => (
                <div 
                  key={s.id} 
                  className={`p-4 rounded-xl border flex flex-col justify-between items-center gap-3 relative ${
                    s.isBooked || s.is_booked
                      ? 'bg-slate-50 border-slate-200 opacity-70'
                      : 'bg-blue-50/20 border-blue-100'
                  }`}
                >
                  <span className="text-sm font-bold text-slate-700">{s.timeSlot || s.time_slot}</span>
                  <div className="flex gap-2 w-full">
                    {s.isBooked || s.is_booked ? (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/50 py-1.5 w-full text-center rounded-lg">
                        BOOKED
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleRemoveSlot(s.timeSlot || s.time_slot)}
                        className="btn btn-danger btn-sm w-full py-1 text-[10px] rounded-lg"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DoctorAvailability;
