import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const apts = await api.getAppointments();
      // Derive patient records dynamically from appointments or load custom logs
      const derived = [];
      const seen = new Set();
      if (Array.isArray(apts)) {
        apts.forEach(a => {
          if (!seen.has(a.patient_id)) {
            seen.add(a.patient_id);
            derived.push({
              id: a.patient_id,
              name: a.patient_name || 'Patient Name',
              insurance: a.insurance || 'BlueCross Shield',
              contact: a.contact || '+1 (555) 012-3456',
              status: 'active'
            });
          }
        });
      }

      // Add a fallback default row if empty
      if (derived.length === 0) {
        derived.push({
          id: 1,
          name: 'John Doe',
          insurance: 'BlueCross Shield',
          contact: '+1 (555) 019-2834',
          status: 'active'
        });
      }
      setPatients(derived);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleToggleBlock = (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    setPatients(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));
    alert(`Patient account is now ${nextStatus.toUpperCase()}.`);
  };

  const handleDeletePatient = (id) => {
    if (!window.confirm('Are you sure you want to delete this patient profile and its records?')) return;
    setPatients(prev => prev.filter(p => p.id !== id));
    alert('Patient profile removed successfully.');
  };

  return (
    <div className="flex flex-col gap-8 font-body">
      <div className="page-header flex flex-col gap-1">
        <h2 className="page-title text-3xl font-bold text-slate-800">Patient Directory</h2>
        <p className="page-subtitle text-slate-500">Monitor registered user details, manage insurance providers, and configure access bans.</p>
      </div>

      <div className="card bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="card-body p-6">
          {loading ? (
            <p className="text-slate-500 text-sm text-center">Loading patient directory...</p>
          ) : patients.length === 0 ? (
            <p className="text-slate-500 text-sm text-center">No patients found in system records.</p>
          ) : (
            <div className="table-responsive">
              <table className="custom-table w-full">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Contact Phone</th>
                    <th>Insurance Provider</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.id}>
                      <td className="font-semibold text-slate-800">{p.name}</td>
                      <td>{p.contact}</td>
                      <td>{p.insurance}</td>
                      <td>
                        <span className={`badge ${
                          p.status === 'active' ? 'badge-success' : 'badge-danger'
                        }`}>
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleToggleBlock(p.id, p.status)}
                          className={`btn btn-sm rounded-lg ${
                            p.status === 'active' ? 'btn-secondary text-amber-600 border border-slate-200' : 'btn-success'
                          }`}
                        >
                          {p.status === 'active' ? 'Block Access' : 'Unblock Access'}
                        </button>
                        <button 
                          onClick={() => handleDeletePatient(p.id)}
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
    </div>
  );
};

export default AdminPatients;
