import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import axios from 'axios';
import { 
  User, ShieldCheck, ShoppingBag, LogOut, 
  ChevronRight, Package, MapPin, Receipt, 
  ChevronDown, CreditCard, Lock, AlertCircle 
} from 'lucide-react';

// --- Status Styles ---
const STATUS = {
  paid:     { label: 'Paid',      bg: 'bg-emerald-50',  text: 'text-emerald-700',  border: 'border-emerald-200', dot: 'bg-emerald-500' },
  pending:  { label: 'Pending',   bg: 'bg-amber-50',    text: 'text-amber-700',    border: 'border-amber-200',   dot: 'bg-amber-500'   },
  failed:   { label: 'Failed',    bg: 'bg-red-50',      text: 'text-red-700',      border: 'border-red-200',     dot: 'bg-red-500'     },
  refunded: { label: 'Refunded',  bg: 'bg-slate-100',   text: 'text-slate-600',    border: 'border-slate-200',   dot: 'bg-slate-400'   },
};

const fmt = (n) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const OrderCard = ({ order }) => {
  const [open, setOpen] = useState(false);
  const s = STATUS[order.status] || STATUS.pending;

  return (
    <div className={`bg-white border rounded-[2rem] overflow-hidden transition-all duration-300 ${open ? 'border-blue-200 shadow-xl shadow-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
      <button onClick={() => setOpen(!open)} className="w-full text-left p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-black text-slate-900">Order #{order.id}</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${s.bg} ${s.text} ${s.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/> {s.label}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400">{fmtDate(order.created_at)} • {order.items?.length || 0} Items</p>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-8 pt-4 md:pt-0 border-t md:border-none border-slate-50">
          <div className="md:text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Total Amount</p>
            <p className="text-xl font-black text-slate-900">₹{fmt(order.total)}</p>
          </div>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${open ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-50 text-slate-400'}`}>
            <ChevronDown size={20} strokeWidth={3} />
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-50 bg-white animate-in slide-in-from-top-2">
          <div className="p-6 md:p-8 space-y-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-xl border flex items-center justify-center text-xl shrink-0">📦</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-800 truncate">{item.product?.name || 'Product'}</p>
                  <p className="text-xs font-bold text-slate-400">Qty: {item.quantity} × ₹{fmt(item.price)}</p>
                </div>
                <p className="text-sm font-black text-slate-900">₹{fmt(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-slate-100">
            <div className="p-8 space-y-3 border-b md:border-b-0 md:border-r border-slate-100">
              <h4 className="text-[10px] font-black uppercase text-blue-600 mb-4 flex items-center gap-2"><Receipt size={14}/> Payment</h4>
              <div className="flex justify-between text-xs font-bold text-slate-500"><span>Subtotal</span><span>₹{fmt(order.subtotal)}</span></div>
              <div className="flex justify-between text-xs font-bold text-slate-500"><span>Tax</span><span>₹{fmt(order.tax)}</span></div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-dashed"><span>Total</span><span>₹{fmt(order.total)}</span></div>
            </div>
            <div className="p-8 bg-slate-50/30">
              <h4 className="text-[10px] font-black uppercase text-blue-600 mb-4 flex items-center gap-2"><MapPin size={14}/> Shipping</h4>
              <p className="text-sm font-black text-slate-800">{order.customer_name}</p>
              <p className="text-xs font-medium text-slate-500 leading-relaxed mt-2">{order.address}, {order.city}, {order.pincode}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const MyOrder = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/my-orders`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        setOrders(res.data.data || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User, link: '/myAccount' },
    { id: 'password', label: 'Security', icon: Lock, link: '/myAccount' },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, active: true },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200/60 pt-6 pb-6 md:pt-6 md:pb-6">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 md:gap-6">
             
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">My Orders</h1>
                <p className="text-xs md:text-sm font-medium text-slate-500">Track and manage your recent purchases</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Sidebar Nav (Same as Account Page) */}
          <div className="lg:col-span-3">
            <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-4 lg:pb-0 no-scrollbar">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.link ? navigate(item.link) : null}
                  className={`flex items-center justify-between px-5 py-3 md:py-4 rounded-xl md:rounded-2xl transition-all whitespace-nowrap min-w-max lg:min-w-0
                    ${item.active ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} strokeWidth={2.5} />
                    <span className="text-sm font-black">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="hidden lg:block opacity-50" />
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border"/>)}
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map(order => <OrderCard key={order.id} order={order} />)}
              </div>
            ) : (
              <div className="bg-white border rounded-[2.5rem] p-12 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300"><ShoppingBag size={40}/></div>
                <h3 className="text-xl font-black text-slate-800">No orders yet</h3>
                <Link to="/" className="mt-6 inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-sm">Start Shopping</Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyOrder;