import React, { useState } from 'react';

export const AdminCMS = () => {
  const [faqs, setFaqs] = useState([
    { question: 'How do I join the video consultation?', answer: 'Once the doctor accepts your appointment, you can navigate to the appointment page inside your dashboard and click "Join Consultation" at the scheduled slot.' },
    { question: 'Can I download my prescription as a PDF?', answer: 'Yes, once the doctor updates your appointment status to Completed and writes your prescription details, a "Download PDF" button will immediately become active.' }
  ]);
  const [testimonials, setTestimonials] = useState([
    { name: 'Jane Miller', review: 'Booking was super fast. I got an appointment approved by Dr. Sarah within 1 hour. Video consultation was extremely clear and download of prescription was instant.' },
    { name: 'David K.', review: 'As a busy professional, being able to chat with my primary care doctor and keep all my medical files uploaded in one secure dashboard has saved me hours of clinic waiting.' }
  ]);

  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');

  const [newN, setNewN] = useState('');
  const [newR, setNewR] = useState('');

  const handleAddFaq = (e) => {
    e.preventDefault();
    if (!newQ.trim() || !newA.trim()) return;
    setFaqs([...faqs, { question: newQ, answer: newA }]);
    setNewQ('');
    setNewA('');
    alert('FAQ added successfully!');
  };

  const handleAddTestimonial = (e) => {
    e.preventDefault();
    if (!newN.trim() || !newR.trim()) return;
    setTestimonials([...testimonials, { name: newN, review: newR }]);
    setNewN('');
    setNewR('');
    alert('Testimonial added successfully!');
  };

  return (
    <div className="flex flex-col gap-8 font-body max-w-4xl mx-auto">
      <div className="page-header flex flex-col gap-1">
        <h2 className="page-title text-3xl font-bold text-slate-800">Content Management Settings</h2>
        <p className="page-subtitle text-slate-500">Edit homepage reviews, testimonials, and FAQs configuration blocks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* FAQs config */}
        <div className="card bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col gap-6">
          <h3 className="font-title text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">
            ❓ Manage FAQs
          </h3>
          <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
            {faqs.map((f, i) => (
              <div key={i} className="text-xs border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                <p className="font-bold text-slate-700">{f.question}</p>
                <p className="text-slate-500 mt-1 leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddFaq} className="flex flex-col gap-3 mt-2 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-600">Add New FAQ Card</h4>
            <input 
              type="text" 
              placeholder="Question details..."
              value={newQ} 
              onChange={(e) => setNewQ(e.target.value)}
              className="form-control text-sm"
              required 
            />
            <textarea 
              placeholder="Answer explanation..."
              value={newA} 
              onChange={(e) => setNewA(e.target.value)}
              className="form-control text-sm"
              rows="2"
              required 
            />
            <button type="submit" className="btn btn-primary rounded-xl font-semibold text-xs py-2 w-max self-end px-6">
              Add FAQ
            </button>
          </form>
        </div>

        {/* Testimonials config */}
        <div className="card bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col gap-6">
          <h3 className="font-title text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">
            ⭐ Patient Testimonials
          </h3>
          <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
            {testimonials.map((t, i) => (
              <div key={i} className="text-xs border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                <p className="font-bold text-slate-700">{t.name}</p>
                <p className="italic text-slate-500 mt-1 leading-relaxed">"{t.review}"</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddTestimonial} className="flex flex-col gap-3 mt-2 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-600">Add Patient Testimonial</h4>
            <input 
              type="text" 
              placeholder="Patient Full Name..."
              value={newN} 
              onChange={(e) => setNewN(e.target.value)}
              className="form-control text-sm"
              required 
            />
            <textarea 
              placeholder="Testimonial review text..."
              value={newR} 
              onChange={(e) => setNewR(e.target.value)}
              className="form-control text-sm"
              rows="2"
              required 
            />
            <button type="submit" className="btn btn-primary rounded-xl font-semibold text-xs py-2 w-max self-end px-6">
              Add Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCMS;
