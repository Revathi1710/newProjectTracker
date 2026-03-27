import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import axios from 'axios';
import { 
  User, ShieldCheck, ShoppingBag, LogOut, 
  Mail, Phone, ChevronRight, CheckCircle2, 
  Lock, Eye, EyeOff, AlertCircle, CreditCard
} from 'lucide-react';

// --- Reusable Input Component for Cleanliness ---
const FormInput = ({ label, icon: Icon, type = "text", value, onChange, placeholder, disabled = false, error }) => (
  <div className="space-y-2 w-full">
    <label className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
      {label}
    </label>
    <div className="relative group">
      {Icon && <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${disabled ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-blue-600'}`} size={18} />}
      <input 
        type={type} 
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full ${Icon ? 'pl-12' : 'px-5'} pr-4 py-3.5 md:py-4 border-none rounded-2xl text-sm font-bold transition-all outline-none
          ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-100'}`}
      />
    </div>
    {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
  </div>
);

const MyAccount = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPwd, setShowPwd] = useState({ current: false, new: false });

  // Mock data for demo - replace with your useEffect logic
  useEffect(() => {
    setTimeout(() => {
      setUser({ name: "Revathi D", email: "revathi@example.com", mobile_number: "+91 9876543210", is_verified: true });
      setLoading(false);
    }, 800);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Security', icon: Lock },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, link: '/my-orders' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 md:pb-12">
      <Header />

      {/* --- Responsive Header Section --- */}
      <div className="bg-white border-b border-slate-200/60 pt-6 pb-6 md:pt-6 md:pb-6">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="relative">
               <div className="w-8 h-8 md:w-14 md:h-14 rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl md:text-3xl font-black shadow-xl shadow-blue-100">
  {user?.name
    ?.split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()}
</div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 bg-emerald-500 border-2 md:border-4 border-white rounded-full flex items-center justify-center text-white">
                  <ShieldCheck size={12} className="md:w-4 md:h-4" />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight truncate">{user?.name}</h1>
                <p className="text-xs md:text-sm font-medium text-slate-500 flex items-center gap-1.5 truncate">
                  <Mail size={14} className="shrink-0" /> {user?.email}
                </p>
              </div>
            </div>
            <button onClick={handleLogout} className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-100 text-red-600 font-bold text-sm hover:bg-red-50 transition-all">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
          
          {/* --- Responsive Sidebar/Nav --- */}
          <div className="lg:col-span-3">
            <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0 no-scrollbar">
              {navItems.map((item) => (
                item.link ? (
                  <Link key={item.id} to={item.link} className="flex items-center gap-3 px-5 py-3 md:py-4 rounded-xl md:rounded-2xl text-slate-500 hover:bg-slate-100 whitespace-nowrap min-w-max lg:min-w-0 transition-all">
                    <item.icon size={18} />
                    <span className="text-sm font-black">{item.label}</span>
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`flex items-center justify-between px-5 py-3 md:py-4 rounded-xl md:rounded-2xl transition-all whitespace-nowrap min-w-max lg:min-w-0
                      ${tab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} strokeWidth={2.5} />
                      <span className="text-sm font-black">{item.label}</span>
                    </div>
                    <ChevronRight size={16} className="hidden lg:block opacity-50" />
                  </button>
                )
              ))}
              <button onClick={handleLogout} className="flex md:hidden items-center gap-3 px-5 py-3 rounded-xl text-red-500 bg-red-50 whitespace-nowrap">
                <LogOut size={18} /> <span className="text-sm font-black">Sign Out</span>
              </button>
            </nav>
          </div>

          {/* --- Main Content Area --- */}
          <div className="lg:col-span-9">
            <div className="bg-white border border-slate-200/60 rounded-3xl md:rounded-[2.5rem] p-5 md:p-12 shadow-sm">
              
              {tab === 'profile' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="border-b border-slate-100 pb-6">
                    <h2 className="text-lg md:text-xl font-black text-slate-900">Personal Information</h2>
                    <p className="text-xs md:text-sm text-slate-500">Keep your contact details up to date for faster checkouts.</p>
                  </div>

                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInput label="Full Name" icon={User} value={user?.name} placeholder="Your Name" />
                      <FormInput label="Phone Number" icon={Phone} value={user?.mobile_number} placeholder="00000 00000" />
                      <div className="md:col-span-2">
                        <FormInput label="Email Address" icon={Mail} value={user?.email} disabled={true} />
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 active:scale-95 transition-all">
                        Update Profile
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {tab === 'password' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="border-b border-slate-100 pb-6">
                    <h2 className="text-lg md:text-xl font-black text-slate-900">Login & Security</h2>
                    <p className="text-xs md:text-sm text-slate-500">Manage your password and account protection.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                      <ShieldCheck size={20} className="text-emerald-600" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-emerald-600">Verification</p>
                        <p className="text-xs font-bold text-slate-700">Account Verified</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-3">
                      <CreditCard size={20} className="text-blue-600" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-blue-600">Payment</p>
                        <p className="text-xs font-bold text-slate-700">No Cards Saved</p>
                      </div>
                    </div>
                  </div>

                  <form className="space-y-6 max-w-xl">
                    <FormInput 
                      label="New Password" 
                      type={showPwd.new ? "text" : "password"} 
                      icon={Lock} 
                      placeholder="Min. 8 characters"
                    />
                    <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all">
                      Save New Password
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;