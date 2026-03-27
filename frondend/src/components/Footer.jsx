import React from 'react';
import { Link } from "react-router-dom";
import logo from "../assets/logo.avif"; // Imported as requested

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Brand & Logo */}
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <Link to="/" className="inline-block group">
                <img 
                  src={logo} 
                  alt="NPT Logo" 
                  className="h-42 w-auto object-contain "
                />
              </Link>
            
            </div>
            
            {/* Social / Info Badges */}
            <div className="flex gap-3 pt-2">
              <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg hover:bg-blue-600 hover:text-white transition-all cursor-pointer text-xs">IN</span>
              <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg hover:bg-blue-600 hover:text-white transition-all cursor-pointer text-xs">FB</span>
              <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg hover:bg-blue-600 hover:text-white transition-all cursor-pointer text-xs">X</span>
            </div>
          </div>

          {/* Column 2: Industries */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
              Who Benefits
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-blue-400 transition-colors">• Process Equipment Mfrs</li>
              <li className="hover:text-blue-400 transition-colors">• Construction Services</li>
              <li className="hover:text-blue-400 transition-colors">• Engineering Providers</li>
              <li className="hover:text-blue-400 transition-colors">• Industrial Suppliers</li>
              <li className="hover:text-blue-400 transition-colors">• Financial Advisory</li>
            </ul>
          </div>

          {/* Column 3: Report Categories */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
               <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
               Market Intel
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/?category=state" className="hover:text-blue-400 transition-colors">State Reports</Link></li>
              <li><Link to="/?sort=latest" className="hover:text-blue-400 transition-colors">Monthly Updates</Link></li>
              <li><Link to="/?category=industry" className="hover:text-blue-400 transition-colors">Industry Leads</Link></li>
              <li className="pt-4">
                <span className="px-3 py-1 bg-blue-900/40 text-blue-300 border border-blue-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  No Subscription Required
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Information */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
               <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
               Get In Touch
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <span className="text-blue-500 shrink-0">📍</span>
                <p className="text-slate-400 leading-tight">Plot No 7A, Chinmaya Nagar Stage II Extn, Chennai 600092</p>
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-blue-500 shrink-0">📞</span>
                <p className="text-slate-400">+91 91710 15659</p>
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-blue-500 shrink-0">✉️</span>
                <a href="mailto:sales@newprojectstracker.com" className="text-blue-400 hover:underline">sales@newprojectstracker.com</a>
              </div>
            </div>
          </div>

        </div>

        {/* Legal Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-medium text-slate-500">
          <p>© 2026 New Projects Tracker Research Information Services.</p>
          <div className="flex gap-6 uppercase tracking-widest">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;