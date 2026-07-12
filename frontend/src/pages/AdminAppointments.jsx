import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await api.getAppointments();
      if (Array.isArray(data)) {
        setAppointments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Force cancel this consultation request?')) return;
    try {
      const res = await api.updateAppointmentStatus(id, 'cancelled');
      if (res && !res.message) {
        alert('Consultation has been cancelled by Administrator.');
        loadAppointments();
      } else {
        alert(res.message || 'Cancellation failed.');
      }
    } catch (e) {
      alert('Error updating slot status.');
    }
  };

  const filteredAppointments = appointments.filter(a => {
    return statusFilter === '' || a.status === statusFilter;
  });

  return (
    <div className="flex flex-col gap-8 font-body">
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="page-title text-3xl font-bold text-slate-800">Booking Registry Logs</h2>
          <p className="page-subtitle text-slate-500">Overview of clinical checkup history and payment transactions.</p>
        </div>
        <div className="form-group mb-0 flex gap-2 items-center">
          <label className="text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Filter Status</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control text-sm py-1.5"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="card-body p-6">
          {loading ? (
            <p className="text-slate-500 text-sm text-center">Loading booking registry...</p>
          ) : filteredAppointments.length === 0 ? (
            <p className="text-slate-500 text-sm text-center">No matching appointment records found.</p>
          ) : (
            <div className="table-responsive">
              <table className="custom-table w-full">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Physician Name</th>
                    <th>Consultation Date</th>
                    <th>Scheduled Slot</th>
                    <th>Status</th>
                    <th>Fee Charge</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map(a => (
                    <tr key={a.id}>
                      <td className="font-semibold text-slate-800">{a.patient_name}</td>
                      <td className="font-semibold text-slate-800">{a.doctor_name || 'Physician'}</td>
                      <td>{new Date(a.date).toLocaleDateString()}</td>
                      <td>{a.time_slot || 'Pending slot'}</td>
                      <td>
                        <span className={`badge ${
                          a.status === 'approved' ? 'badge-success' : 
                          a.status === 'completed' ? 'badge-primary' : 
                          a.status === 'cancelled' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {a.status.toUpperCase()}
                        </span>
                      </td>
                      <td>${parseFloat(a.fee).toFixed(2)}</td>
                      <td>
                        {(a.status === 'pending' || a.status === 'approved') && (
                          <button 
                            onClick={() => handleCancelAppointment(a.id)}
                            className="btn btn-danger btn-sm rounded-lg"
                          >
                            Force Cancel
                          </button>
                        )}
                        {a.status === 'completed' && (
                          <span className="text-xs text-slate-400 font-semibold italic">Session Finished</span>
                        )}
                        {a.status === 'cancelled' && (
                          <span className="text-xs text-red-500 font-semibold italic">Cancelled</span>
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
  );
};

export default AdminAppointments;
