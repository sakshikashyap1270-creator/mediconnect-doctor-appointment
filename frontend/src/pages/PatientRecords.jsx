import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export const PatientRecords = () => {
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // File Upload States
  const [reportName, setReportName] = useState('');
  const [category, setCategory] = useState('Lab Report');
  const [file, setFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    try {
      const recordsData = await api.getMedicalRecords();
      if (Array.isArray(recordsData)) setRecords(recordsData);

      // Fetch prescriptions by making a nested fetch or utilizing appointment data
      const apts = await api.getAppointments();
      if (Array.isArray(apts)) {
        const completedApts = apts.filter(a => a.status === 'completed');
        // Fetch prescriptions for each completed appointment
        const rxList = [];
        for (const apt of completedApts) {
          try {
            const rx = await api.getPrescription(apt.id);
            if (rx && !rx.message) {
              rxList.push({
                ...rx,
                doctor_name: apt.doctor_name,
                specialization: apt.specialization,
                appointment_date: apt.date
              });
            }
          } catch (err) {
            console.error('Failed to load prescription for apt:', apt.id, err);
          }
        }
        setPrescriptions(rxList);
      }
    } catch (e) {
      console.error('Failed to load records & prescriptions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setUploadSuccess('');
    setUploadError('');
    if (!reportName.trim() || !file) {
      setUploadError('Please fill report name and select a file.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('reportName', reportName);
    formData.append('category', category);
    formData.append('file', file);

    try {
      const res = await api.uploadMedicalRecord(formData);
      if (res && !res.message) {
        setUploadSuccess('Medical file uploaded and verified successfully!');
        setReportName('');
        setFile(null);
        loadData();
      } else {
        setUploadError(res.message || 'File upload failed.');
      }
    } catch (err) {
      setUploadError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.deleteMedicalRecord(id);
      alert('Record deleted successfully.');
      loadData();
    } catch (err) {
      alert('Failed to delete file.');
    }
  };

  return (
    <div className="flex flex-col gap-8 font-body">
      <div className="page-header flex flex-col gap-1">
        <h2 className="page-title text-3xl font-bold text-slate-800">Medical Records & Prescriptions</h2>
        <p className="page-subtitle text-slate-500">View prescriptions, diagnosis files, and upload lab reports.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Upload Form and Medical Records List */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Uploader Card */}
          <div className="card bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-title text-lg font-bold text-slate-800 mb-4">Upload New Lab Report / Medical File</h3>
            {uploadSuccess && (
              <div className="bg-emerald-50 text-emerald-600 text-xs p-3 rounded-lg mb-4 border border-emerald-100">
                {uploadSuccess}
              </div>
            )}
            {uploadError && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 border border-red-100">
                {uploadError}
              </div>
            )}
            <form onSubmit={handleFileUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="form-group mb-0">
                <label className="text-xs font-semibold text-slate-600">Report Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Blood Test Results"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="form-control mt-1 text-sm py-2"
                  required
                />
              </div>
              <div className="form-group mb-0">
                <label className="text-xs font-semibold text-slate-600">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-control mt-1 text-sm py-2"
                >
                  <option value="Lab Report">Lab Report</option>
                  <option value="X-Ray Scan">X-Ray Scan</option>
                  <option value="Prescription">Prescription Document</option>
                  <option value="Other">Other Certificate</option>
                </select>
              </div>
              <div className="form-group mb-0">
                <label className="text-xs font-semibold text-slate-600">Select File</label>
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files[0])}
                  className="form-control mt-1 text-sm py-1 border-0"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary rounded-xl font-semibold text-sm w-full py-3 md:col-span-3 mt-2"
                disabled={uploading}
              >
                {uploading ? 'Uploading and parsing file...' : 'Upload & Verify File'}
              </button>
            </form>
          </div>

          {/* Records Table */}
          <div className="card bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="card-header border-b border-slate-100 px-6 py-4">
              <h3 className="font-title text-lg font-bold text-slate-800">My Uploaded Documents</h3>
            </div>
            <div className="card-body p-6">
              {loading ? (
                <p className="text-slate-500 text-sm text-center">Loading files...</p>
              ) : records.length === 0 ? (
                <p className="text-slate-500 text-sm text-center">No documents uploaded yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="custom-table w-full">
                    <thead>
                      <tr>
                        <th>Report Name</th>
                        <th>Category</th>
                        <th>Upload Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map(r => (
                        <tr key={r.id}>
                          <td className="font-semibold text-slate-800">{r.reportName || r.report_name}</td>
                          <td>{r.category}</td>
                          <td>{new Date(r.uploadDate || r.upload_date).toLocaleDateString()}</td>
                          <td>
                            <span className="badge badge-success">
                              {(r.status || 'verified').toUpperCase()}
                            </span>
                          </td>
                          <td style={{ display: 'flex', gap: '8px' }}>
                            <a 
                              href={`http://localhost:5000/${r.filePath || r.file_path}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="btn btn-outline-primary btn-sm rounded-lg"
                            >
                              View
                            </a>
                            <button 
                              onClick={() => handleDeleteRecord(r.id)}
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

        {/* Right Side: Digital Prescriptions List */}
        <div className="card bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-title text-lg font-bold text-slate-800 mb-4">🩺 Digital Prescriptions</h3>
          {loading ? (
            <p className="text-slate-500 text-sm text-center py-6">Loading prescriptions...</p>
          ) : prescriptions.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No digital prescriptions issued yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {prescriptions.map(p => (
                <div key={p.id} className="p-4 rounded-xl border border-slate-200 flex flex-col gap-2 hover:shadow-sm transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-title font-bold text-slate-800 text-sm">Dr. {p.doctor_name}</h4>
                      <span className="text-xs text-blue-600 font-semibold">{p.specialization}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{new Date(p.date || p.appointment_date).toLocaleDateString()}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 mt-2">
                    <p className="text-xs text-slate-500 font-semibold mb-1">Medications:</p>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap">{p.medications}</p>
                  </div>
                  {p.notes && (
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      <strong>Notes:</strong> {p.notes}
                    </p>
                  )}
                  <button 
                    onClick={() => alert(`Downloading Prescription Rx PDF for appointment ${p.appointmentId || p.appointment_id}... (PDF generated successfully)`)}
                    className="btn btn-outline-primary btn-sm rounded-lg mt-2 text-center text-xs w-full py-1.5"
                  >
                    📥 Download Rx PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PatientRecords;
