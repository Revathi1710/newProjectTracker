import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import axios from 'axios';
import { 
  User, ShieldCheck, ShoppingBag, LogOut, 
  Mail, Phone, ChevronRight, Lock, CreditCard
} from 'lucide-react';

// --- Reusable Input Component ---
const FormInput = ({ label, icon: Icon, type = "text", value, onChange, placeholder, disabled = false, error, name }) => (
  <div className="space-y-2 w-full">
    <label className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
      {label}
    </label>
    <div className="relative group">
      {Icon && <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${disabled ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-blue-600'}`} size={18} />}
      <input 
        name={name}
        type={type} 
        disabled={disabled}
        placeholder={placeholder}
        value={value || ''}
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
  
  // State for Profile
  const [formData, setFormData] = useState({ name: '', mobile_number: '' });
  
  // State for Password - Added current_password to satisfy Laravel validation
  const [passwordData, setPasswordData] = useState({ 
    current_password: '', 
    new_password: '' 
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/profile`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        });
        setUser(res.data.user);
        setFormData({
            name: res.data.user.name,
            mobile_number: res.data.user.mobile_number || ''
        });
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
        await axios.post(`${import.meta.env.VITE_API_URL}/user/update`, formData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        alert("Profile updated successfully!");
    } catch (err) {
        alert(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
        // Sending both current and new password as required by your updateProfile controller logic
        await axios.post(`${import.meta.env.VITE_API_URL}/user/update`, {
            current_password: passwordData.current_password,
            new_password: passwordData.new_password
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        alert("Password updated successfully!");
        setPasswordData({ current_password: '', new_password: '' });
    } catch (err) {
        // This will now catch "Current password does not match" errors from Laravel
        alert(err.response?.data?.message || "Failed to update password.");
    }
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
    

      {/* --- Header --- */}
      <div className="bg-white border-b border-slate-200/60 pt-6 pb-6">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl font-black shadow-xl shadow-blue-100">
                {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || '??'}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight truncate">{user?.name}</h1>
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
          
          {/* --- Sidebar --- */}
          <div className="lg:col-span-3">
            <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0 no-scrollbar">
              {navItems.map((item) => (
                item.link ? (
                  <Link key={item.id} to={item.link} className="flex items-center gap-3 px-5 py-3 md:py-4 rounded-xl text-slate-500 hover:bg-slate-100 transition-all">
                    <item.icon size={18} />
                    <span className="text-sm font-black">{item.label}</span>
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`flex items-center justify-between px-5 py-3 md:py-4 rounded-xl transition-all whitespace-nowrap min-w-max lg:min-w-0
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
            </nav>
          </div>

          {/* --- Main Content --- */}
          <div className="lg:col-span-9">
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-10 shadow-sm">
              
              {tab === 'profile' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="border-b border-slate-100 pb-6">
                    <h2 className="text-lg md:text-xl font-black text-slate-900">Personal Information</h2>
                    <p className="text-xs md:text-sm text-slate-500">Update your account details below.</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInput label="Full Name" name="name" icon={User} value={formData.name} onChange={handleInputChange} />
                      <FormInput label="Phone Number" name="mobile_number" icon={Phone} value={formData.mobile_number} onChange={handleInputChange} />
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 active:scale-95 transition-all">
                      Update Profile
                    </button>
                  </form>
                </div>
              )}

              {tab === 'password' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="border-b border-slate-100 pb-6">
                    <h2 className="text-lg md:text-xl font-black text-slate-900">Security</h2>
                    <p className="text-xs md:text-sm text-slate-500">Ensure your account is using a strong password.</p>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-xl">
                    {/* Added Current Password field */}
                    <FormInput 
                      label="Current Password" 
                      name="current_password"
                      type="password"
                      icon={Lock} 
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                    />

                    <FormInput 
                      label="New Password" 
                      name="new_password"
                      type="password" 
                      icon={Lock} 
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      placeholder="Min. 8 characters"
                    />

                    <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all">
                      Update Password
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