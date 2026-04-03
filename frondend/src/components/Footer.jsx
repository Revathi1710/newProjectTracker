import React from 'react';
import { Link } from "react-router-dom";
import logo from "../assets/logo.avif";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f172a] text-slate-400 pt-20 pb-10 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Column 1 */}
          <div className="space-y-8">
            <Link to="/" className="inline-block hover:opacity-90">
              <img
                src={logo}
                alt="NPT Logo"
                className="h-16 w-auto object-contain rounded-lg p-2 bg-white"
              />
            </Link>

            <p className="text-sm leading-relaxed max-w-xs">
              Providing actionable industrial intelligence and project tracking
              for global manufacturers and engineering firms.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-blue-600 hover:text-white transition-all">
                <i className="bi bi-linkedin"></i>
              </a>

              <a href="#" className="w-10 h-10 flex items-center justify-center bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-blue-700 hover:text-white transition-all">
                <i className="bi bi-facebook"></i>
              </a>

              <a href="#" className="w-10 h-10 flex items-center justify-center bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-sky-500 hover:text-white transition-all">
                <i className="bi bi-twitter-x"></i>
              </a>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              Who Benefits
            </h3>

            <ul className="space-y-3 text-[15px]">
              {[
                "Process Equipment Mfrs",
                "Construction Services",
                "Engineering Providers",
                "Industrial Suppliers",
                "Financial Advisory"
              ].map((item) => (
                <li key={item} className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              Company
            </h3>

            <ul className="space-y-3 text-[15px]">
              <li><Link to="/about" className="hover:text-blue-400">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400">Contact Us</Link></li>
              <li><Link to="/terms" className="hover:text-blue-400">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-blue-400">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              Get In Touch
            </h3>

            <div className="space-y-5 text-[15px]">

              <div className="flex gap-4">
                <i className="bi bi-geo-alt text-blue-500"></i>
                <p>
                  Plot No 7A, Chinmaya Nagar Stage II Extn, Chennai 600092
                </p>
              </div>

              <div className="flex gap-4 items-center">
                <i className="bi bi-telephone text-blue-500"></i>
                <a href="tel:+919171015659" className="hover:text-white">
                  +91 91710 15659
                </a>
              </div>

              <div className="flex gap-4 items-center">
                <i className="bi bi-envelope text-blue-500"></i>
                <a
                  href="mailto:sales@newprojectstracker.com"
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  sales@newprojectstracker.com
                </a>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-6 text-xs">

          <p className="text-slate-500">
            © {currentYear} New Projects Tracker Research Information Services.
          </p>

          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/30 rounded-full border border-slate-700/50">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-slate-400 uppercase tracking-[0.1em] text-[10px]">
              Verified Industrial Intelligence
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;