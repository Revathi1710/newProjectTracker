import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic for form submission would go here
    console.log("Form submitted:", formData);
  };

  return (
    <>
     
      <div className="bg-slate-50 min-h-screen">
        {/* Hero Header */}
        <section className="bg-slate-900 text-white py-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Get In Touch</h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Have questions about our industrial reports? Our team is here to provide the market intelligence you need.
            </p>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-6 -mt-12 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Contact Form Container */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <MessageSquare className="text-blue-600" />
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="john@company.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Subject</label>
                  <input 
                    type="text" 
                    placeholder="Inquiry about State Reports"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Message</label>
                  <textarea 
                    rows="5"
                    placeholder="How can we help you?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="w-full md:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group"
                >
                  Send Message
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            </div>

            {/* Contact Info Cards */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm group hover:border-blue-500 transition-colors">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Phone size={24} />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Call Us</h3>
                <p className="text-slate-500 text-sm mb-4">Monday - Friday, 9am - 6pm</p>
                <a href="tel:+919171015659" className="text-blue-600 font-bold hover:underline">+91 91710 15659</a>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm group hover:border-blue-500 transition-colors">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Mail size={24} />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Email Support</h3>
                <p className="text-slate-500 text-sm mb-4">We'll respond within 24 hours.</p>
                <a href="mailto:sales@newprojectstracker.com" className="text-blue-600 font-bold hover:underline">sales@newprojectstracker.com</a>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm group hover:border-blue-500 transition-colors">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <MapPin size={24} />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Our Office</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Plot No 7A, Chinmaya Nagar Stage II Extn, <br />
                  Chennai, Tamil Nadu 600092
                </p>
              </div>
            </div>

          </div>
        </main>
      </div>
     
    </>
  );
};

export default Contact;