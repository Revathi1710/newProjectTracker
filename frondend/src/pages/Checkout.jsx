import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { selectCartItems, selectCartTotal, clearCartAsync } from '../store/cartSlice';
import { selectBuyNowProduct, clearBuyNow } from '../store/buyNowSlice';
import axios from 'axios';

// ─── DATA LISTS ───────────────────────────────────────────────────────────────
const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia",
  "Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Belarus","Belgium","Belize",
  "Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei",
  "Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Chad","Chile",
  "China","Colombia","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic",
  "Denmark","Djibouti","Dominican Republic","Ecuador","Egypt","El Salvador","Estonia",
  "Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana",
  "Greece","Guatemala","Guinea","Haiti","Honduras","Hungary","Iceland","India",
  "Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan",
  "Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Libya",
  "Lithuania","Luxembourg","Madagascar","Malaysia","Maldives","Mali","Malta","Mexico",
  "Moldova","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nepal",
  "Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","Norway","Oman",
  "Pakistan","Palestine","Panama","Paraguay","Peru","Philippines","Poland","Portugal",
  "Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia","Sierra Leone",
  "Singapore","Slovakia","Slovenia","Somalia","South Africa","South Korea","South Sudan",
  "Spain","Sri Lanka","Sudan","Sweden","Switzerland","Syria","Taiwan","Tajikistan",
  "Tanzania","Thailand","Togo","Tunisia","Turkey","Turkmenistan","Uganda","Ukraine",
  "United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan",
  "Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

const INDIA_STATES = [
  "Andaman and Nicobar Islands","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar",
  "Chandigarh","Chhattisgarh","Dadra and Nagar Haveli and Daman and Diu","Delhi",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand",
  "Karnataka","Kerala","Ladakh","Lakshadweep","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Puducherry","Punjab","Rajasthan","Sikkim",
  "Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"
];

// ─── FIELD COMPONENT (must stay outside Checkout to avoid remount on keystroke) ──
const Field = ({ label, name, type = 'text', placeholder, span, as, children, value, onChange, error }) => (
  <div className={span ? 'md:col-span-2' : ''}>
    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
      {label}
    </label>
    {as === 'select' ? (
      <div className="relative">
        <select
          name={name} value={value} onChange={onChange}
          className={`w-full appearance-none bg-white border rounded-xl px-4 py-3 pr-10 text-sm text-slate-800 outline-none cursor-pointer transition-all
            ${error ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`}
        >
          {children}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>
    ) : (
      <input
        type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full bg-white border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 outline-none transition-all
          ${error ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`}
      />
    )}
    {error && <p className="text-red-500 text-[10px] mt-1 font-semibold">{error}</p>}
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Checkout() {
  const dispatch      = useDispatch();
  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();

  // ── Read both sources ──────────────────────────────────────────────────────
  const buyNowProduct = useSelector(selectBuyNowProduct);
  const cartItems     = useSelector(selectCartItems);
  const cartSubtotal  = useSelector(selectCartTotal);

  // ── Decide which flow we're in ─────────────────────────────────────────────
  // CRITICAL FIX: Flow is determined by the URL param ?flow=buynow, NOT Redux alone.
  //
  //   Buy Now button → navigate('/checkout?flow=buynow') → isBuyNow = true
  //   Cart checkout  → navigate('/checkout')             → isBuyNow = false  ✅
  //
  // Without this, a stale buyNowProduct in Redux would hijack every cart checkout
  // until the user refreshed the page.
  const isBuyNow = searchParams.get('flow') === 'buynow' && !!buyNowProduct;

  // On every URL change: if NOT buy-now flow, wipe any stale buyNow Redux state.
  // Using searchParams as dependency ensures this fires even if Checkout doesn't unmount
  // between navigations (e.g. user goes /checkout?flow=buynow → /checkout directly).
  useEffect(() => {
    if (searchParams.get('flow') !== 'buynow') {
      dispatch(clearBuyNow());
    }
  }, [searchParams]); // ← re-runs whenever URL params change

  // Normalise to a common shape so the rest of the component is flow-agnostic
  const orderItems = isBuyNow
    ? [{
        id:       buyNowProduct.id,
        name:     buyNowProduct.name,
        price:    Number(buyNowProduct.active_price || buyNowProduct.price || 0),
        quantity: 1,
        image:    buyNowProduct.image,
        code:     buyNowProduct.code,
      }]
    : cartItems.map(item => ({
        id:       item.product?.id    || item.product_id,
        name:     item.product?.name  || item.name,
        price:    Number(item.product?.active_price || item.product?.price || item.active_price || item.price || 0),
        quantity: item.quantity,
        image:    item.product?.images?.[0]?.path || item.image || null,
      }));

  const subtotal   = isBuyNow
    ? orderItems[0].price
    : cartSubtotal;

  const taxAmount  = subtotal * 0.18;
  const finalTotal = subtotal + taxAmount;

  // ── Form state ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', mobile: '',
    country: 'India', state: '', city: '', pincode: '', address: '',
  });
  const [errors,         setErrors        ] = useState({});
  const [loading,        setLoading       ] = useState(false);
  const [paymentSuccess, setPaymentSuccess ] = useState(false);
  const [paidEmail,      setPaidEmail     ] = useState('');

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'country' ? { state: '' } : {}),
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = 'Required';
    if (!formData.lastName.trim())  e.lastName  = 'Required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      e.email = 'Valid email required';
    if (!formData.mobile.trim())  e.mobile  = 'Required';
    if (!formData.country.trim()) e.country = 'Required';
    if (formData.country === 'India' && !formData.state)
      e.state = 'Please select your state';
    if (!formData.city.trim())    e.city    = 'Required';
    if (!formData.pincode.trim()) e.pincode = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const s   = document.createElement('script');
      s.src     = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload  = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  // ── After successful payment: save order, clear correct source ─────────────
  const completeOrder = async (paymentId) => {
    try {
      setLoading(true);
      const token     = localStorage.getItem('token');
      const sessionId = localStorage.getItem('cart_session_id');

      await axios.post(
        `${import.meta.env.VITE_API_URL}/orders`,
        {
          razorpay_payment_id: paymentId,
          shipping:  formData,
          is_buy_now: isBuyNow,           // lets backend know which flow
          items: orderItems.map(item => ({
            product_id: item.id,
            quantity:   item.quantity,
            price:      Math.round(item.price),
          })),
          subtotal: Math.round(subtotal),
          tax:      Math.round(taxAmount),
          total:    Math.round(finalTotal),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : { 'X-Session-Id': sessionId }),
          },
        }
      );

      // Clear the RIGHT source only
      if (isBuyNow) {
        dispatch(clearBuyNow());       // remove buyNow product from Redux
      } else {
        dispatch(clearCartAsync());    // clear actual cart via API
      }

      setPaidEmail(formData.email);
      setPaymentSuccess(true);
    } catch (err) {
      console.error('Order save failed:', err);
      alert('Payment processed but order saving failed. Payment ID: ' + paymentId);
    } finally {
      setLoading(false);
    }
  };

  // ── Open Razorpay ──────────────────────────────────────────────────────────
  const handlePayment = async () => {
    if (!validate()) return;

    const roundedTotal = Math.round(finalTotal);

    if (roundedTotal === 0) {
      if (!window.confirm('Total is ₹0. Proceed with free order?')) return;
      await completeOrder('pay_FREE_' + Math.random().toString(36).substr(2, 9));
      return;
    }

    setLoading(true);
    const ok = await loadRazorpay();
    setLoading(false);
    if (!ok) { alert('Razorpay SDK failed to load. Check your internet connection.'); return; }

    new window.Razorpay({
      key:         import.meta.env.VITE_RAZORPAY_KEY,
      amount:      roundedTotal * 100,
      currency:    'INR',
      name:        'New Project Tracker',
      description: isBuyNow ? orderItems[0].name : 'Project Data Reports',
      handler:     (res) => completeOrder(res.razorpay_payment_id),
      prefill: {
        name:    `${formData.firstName} ${formData.lastName}`,
        email:   formData.email,
        contact: formData.mobile,
      },
      theme: { color: '#2563eb' },
    }).open();
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-[#F4F7FC] flex flex-col items-center justify-center text-center p-4">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Order Confirmed! 🎉</h1>
        <p className="text-slate-500 mb-1 text-sm">Your reports are on their way to:</p>
        <p className="font-bold text-blue-600 text-lg mb-8">{paidEmail}</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-200"
          >
            Back to Store
          </button>
          <button
            onClick={() => navigate('/myAccount')}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-3 rounded-xl font-bold transition-all active:scale-95"
          >
            My Orders
          </button>
        </div>
      </div>
    );
  }

  // ── Main checkout UI ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F4F7FC] pb-16">
     

      <div className="max-w-6xl mx-auto px-4 pt-8 md:px-8" >

        {/* ── Flow indicator banner ── */}
        <div className={`mb-6 px-5 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold
          ${isBuyNow
            ? 'bg-blue-50 border border-blue-200 text-blue-700'
            : 'bg-slate-100 border border-slate-200 text-slate-600'
          }`}
        >
          {isBuyNow ? (
            <>
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              <span>
                <strong>Buy Now</strong> — Purchasing only:{' '}
                <span className="text-blue-800">{orderItems[0]?.name}</span>
                <span className="text-blue-500 font-normal ml-1">(your cart is untouched)</span>
              </span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
              </svg>
              <span>
                <strong>Cart Checkout</strong> — {orderItems.length} item{orderItems.length !== 1 ? 's' : ''} in your order
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── LEFT: Billing Form ── */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <h2 className="text-lg font-black text-slate-900 mb-1">Contact & Billing</h2>
              <p className="text-xs text-slate-400 mb-6">All fields marked are required for order processing.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <Field label="First Name" name="firstName" placeholder="John"
                  value={formData.firstName} onChange={handleInput} error={errors.firstName} />

                <Field label="Last Name" name="lastName" placeholder="Doe"
                  value={formData.lastName} onChange={handleInput} error={errors.lastName} />

                <Field label="Email Address" name="email" type="email" placeholder="john@example.com" span
                  value={formData.email} onChange={handleInput} error={errors.email} />

                <Field label="Mobile Number" name="mobile" type="tel" placeholder="9876543210" span
                  value={formData.mobile} onChange={handleInput} error={errors.mobile} />

                <Field label="Country" name="country" as="select" span
                  value={formData.country} onChange={handleInput} error={errors.country}>
                  <option value="">Select Country</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </Field>

                {formData.country === 'India' && (
                  <Field label="State" name="state" as="select" span
                    value={formData.state} onChange={handleInput} error={errors.state}>
                    <option value="">Select State</option>
                    {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </Field>
                )}

                <Field label="City" name="city" placeholder="Mumbai"
                  value={formData.city} onChange={handleInput} error={errors.city} />

                <Field label="Pincode" name="pincode" placeholder="400001"
                  value={formData.pincode} onChange={handleInput} error={errors.pincode} />

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Address <span className="normal-case tracking-normal text-slate-300">(optional)</span>
                  </label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleInput}
                    placeholder="House / Flat / Street / Area"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

              </div>
            </div>

            {/* Security note */}
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 font-medium px-1">
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Your information is encrypted and secured. We never store card details.
            </div>
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div className="lg:w-[400px] w-full" style={{ position: 'sticky', top: 100 }}>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-black text-slate-900">Order Summary</h2>
                {isBuyNow && (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Buy Now
                  </span>
                )}
                {!isBuyNow && (
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {orderItems.length} item{orderItems.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Items list */}
              <div className="space-y-3 mb-5 max-h-52 overflow-y-auto pr-1">
                {orderItems.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-slate-400 text-xs">No items found.</p>
                    <button
                      onClick={() => navigate('/reports')}
                      className="mt-2 text-blue-600 text-xs font-bold hover:underline"
                    >
                      Browse Reports →
                    </button>
                  </div>
                ) : orderItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={`${import.meta.env.VITE_SERVER_URL}/storage/${item.image}`}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      ) : (
                        <span className="text-lg">📊</span>
                      )}
                    </div>
                    {/* Name + price */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 leading-tight truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-900 flex-shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST (18%)</span>
                  <span>₹{Math.round(taxAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 pt-3 border-t text-base">
                  <span>Total</span>
                  <span className="text-blue-700">₹{Math.round(finalTotal).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Pay button */}
              <button
                onClick={handlePayment}
                disabled={loading || orderItems.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl mt-6 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>
                    </svg>
                    Pay ₹{Math.round(finalTotal).toLocaleString('en-IN')}
                  </>
                )}
              </button>

              {/* Razorpay trust badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/>
                </svg>
                Secured by Razorpay · 256-bit SSL
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}