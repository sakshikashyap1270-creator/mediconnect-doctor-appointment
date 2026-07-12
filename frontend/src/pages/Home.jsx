import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';

export const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await api.getDoctors({ status: 'approved' });
        if (Array.isArray(data)) {
          setDoctors(data.slice(0, 3)); // show top 3
        }
      } catch (e) {
        console.error('Failed to fetch doctors:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/login?redirect=appointments&search=${searchQuery}&spec=${specialization}`);
  };

  const departments = [
    { name: 'Cardiology', icon: '❤️' },
    { name: 'Neurology', icon: '🧠' },
    { name: 'Orthopedics', icon: '🦴' },
    { name: 'Pediatrics', icon: '👶' },
    { name: 'Dermatology', icon: '🧴' },
    { name: 'Gynecology', icon: '🤰' },
    { name: 'Psychiatry', icon: '🗣️' },
    { name: 'Dentistry', icon: '🦷' },
    { name: 'General Physician', icon: '🩺' }
  ];

  const services = [
    { title: 'Online Consultation', desc: 'Secure video calls and chat with top doctors anywhere, anytime.', icon: '💻' },
    { title: 'Emergency Support', desc: '24/7 emergency response and priority appointment booking.', icon: '🚨' },
    { title: 'Laboratory Information', desc: 'Secure medical upload, storage, and automated digital prescriptions.', icon: '🧪' },
    { title: 'Health Checkups', desc: 'Custom checkup packages and chronic disease tracking widgets.', icon: '📈' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <h3 className="font-title text-2xl font-extrabold text-blue-600 flex items-center gap-2">
          🩺 MediConnect
        </h3>
        <div className="flex gap-6 items-center">
          <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium">Home</Link>
          <a href="#services" className="text-slate-600 hover:text-blue-600 font-medium">Services</a>
          <a href="#departments" className="text-slate-600 hover:text-blue-600 font-medium">Departments</a>
          <a href="#doctors" className="text-slate-600 hover:text-blue-600 font-medium">Doctors</a>
          <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20 px-8 text-center relative overflow-hidden flex-grow-0">
        <div className="max-w-4xl mx-auto z-10 relative">
          <h1 className="font-title text-5xl md:text-6xl font-extrabold text-slate-800 leading-tight mb-6">
            Find and Book <span className="text-blue-600">Expert Doctors</span> Near You
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            MediConnect matches you with approved physicians for digital and physical checkups, complete with online prescription management and instant consults.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
            <input 
              type="text" 
              placeholder="Search by Doctor Name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none text-slate-700"
            />
            <select 
              value={specialization} 
              onChange={(e) => setSpecialization(e.target.value)}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none text-slate-600"
            >
              <option value="">All Specializations</option>
              {departments.map(d => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary px-8 rounded-xl py-3 font-semibold">
              Search Doctors
            </button>
          </form>
        </div>
      </header>

      {/* Services Section */}
      <section id="services" className="py-20 px-8 max-w-7xl mx-auto text-center">
        <h2 className="font-title text-3xl md:text-4xl font-bold text-slate-800 mb-4">Our Services</h2>
        <p className="text-slate-500 mb-12 max-w-xl mx-auto">Providing advanced tools to manage patient-doctor relationships and streamline health records.</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {services.map((s, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left">
              <span className="text-4xl mb-4 block">{s.icon}</span>
              <h3 className="font-title text-xl font-bold text-slate-800 mb-2">{s.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="bg-slate-100/50 py-20 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-title text-3xl md:text-4xl font-bold text-slate-800 mb-4">Medical Departments</h2>
          <p className="text-slate-500 mb-12 max-w-xl mx-auto">Get specialist treatment under standard clinics and specialized divisions.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-6">
            {departments.map((d, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center hover:scale-105 transition-all cursor-pointer">
                <span className="text-3xl mb-2">{d.icon}</span>
                <span className="font-title text-sm font-semibold text-slate-700 text-center">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section id="doctors" className="py-20 px-8 max-w-7xl mx-auto">
        <h2 className="font-title text-3xl md:text-4xl font-bold text-slate-800 text-center mb-4">Featured Doctors</h2>
        <p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">Book sessions with our top verified medical consultants.</p>
        
        {loading ? (
          <p className="text-center text-slate-500">Loading physicians...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {doctors.map(d => (
              <div key={d.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex gap-4 items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl font-title">
                      {d.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-title text-lg font-bold text-slate-800">{d.name}</h4>
                      <span className="text-sm text-blue-600 font-semibold">{d.specialization}</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-3 mb-4">{d.bio || 'Experienced physician offering dedicated consultation slots.'}</p>
                  <div className="flex justify-between text-sm text-slate-600 border-t border-slate-100 pt-4 mb-4">
                    <span>⭐ {parseFloat(d.rating || 5.0).toFixed(1)} / 5</span>
                    <span>Fee: ${parseFloat(d.fee).toFixed(2)}</span>
                  </div>
                </div>
                <Link to="/login" className="btn btn-outline-primary w-full text-center py-2 font-semibold rounded-xl">
                  Book Appointment
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="bg-blue-600 py-20 px-8 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-title text-3xl md:text-4xl font-bold mb-12">What Our Patients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-800">
            <div className="bg-white p-8 rounded-2xl text-left">
              <p className="italic text-slate-600 mb-6">"Booking was super fast. I got an appointment approved by Dr. Sarah within 1 hour. Video consultation was extremely clear and download of prescription was instant."</p>
              <h5 className="font-title font-bold text-slate-800">- Jane Miller</h5>
            </div>
            <div className="bg-white p-8 rounded-2xl text-left">
              <p className="italic text-slate-600 mb-6">"As a busy professional, being able to chat with my primary care doctor and keep all my medical files uploaded in one secure dashboard has saved me hours of clinic waiting."</p>
              <h5 className="font-title font-bold text-slate-800">- David K.</h5>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-8 max-w-4xl mx-auto">
        <h2 className="font-title text-3xl md:text-4xl font-bold text-slate-800 text-center mb-12">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h4 className="font-title font-bold text-slate-800 mb-2">How do I join the video consultation?</h4>
            <p className="text-slate-500 text-sm">Once the doctor accepts your appointment, you can navigate to the appointment page inside your dashboard and click "Join Consultation" at the scheduled slot.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h4 className="font-title font-bold text-slate-800 mb-2">Can I download my prescription as a PDF?</h4>
            <p className="text-slate-500 text-sm">Yes, once the doctor updates your appointment status to Completed and writes your prescription details, a "Download PDF" button will immediately become active.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-title text-xl font-bold text-white mb-4">🩺 MediConnect</h3>
            <p className="text-sm">Modernizing patient healthcare delivery with digital appointments and secure records management.</p>
          </div>
          <div>
            <h4 className="font-title font-semibold text-white mb-4">Quick Links</h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li><Link to="/login" className="hover:text-white">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white">Register</Link></li>
              <li><a href="#services" className="hover:text-white">Services</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-title font-semibold text-white mb-4">Contact Details</h4>
            <p className="text-sm leading-relaxed">
              Email: support@mediconnect.com<br />
              Phone: +1 (555) 019-2834<br />
              Address: 100 Manhattan Health Plz, NY
            </p>
          </div>
          <div>
            <h4 className="font-title font-semibold text-white mb-4">Social Media</h4>
            <div className="flex gap-4">
              <span className="cursor-pointer hover:text-white">Facebook</span>
              <span className="cursor-pointer hover:text-white">Twitter</span>
              <span className="cursor-pointer hover:text-white">LinkedIn</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-slate-800 pt-8 text-center text-xs">
          © {new Date().getFullYear()} MediConnect. All rights reserved. | Terms & Conditions | Privacy Policy
        </div>
      </footer>
    </div>
  );
};

export default Home;
