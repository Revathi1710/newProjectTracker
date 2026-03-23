import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();

  // Step 1: fill form | Step 2: verify OTP
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ─── STEP 1: Submit registration form → backend sends OTP email ───
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/register/send-otp`, {
        name,
        email,
        mobile_number: mobileNumber,
        password,
        password_confirmation: confirmPassword,
      });
      setStep(2);
      setSuccess(`OTP sent to ${email}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.email?.[0] ||
          "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── STEP 2: Verify OTP → complete registration ───
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/register/verify-otp`,
        { email, otp: otpValue }
      );
      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid or expired OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend OTP ───
  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResendLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/register/resend-otp`, {
        email,
      });
      setSuccess("A new OTP has been sent to your email.");
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  // ─── OTP input box handler ───
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return; // digits only
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    // Auto-focus next box
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      document.getElementById("otp-5")?.focus();
    }
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-28">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-100 p-8">

            {/* Logo mark */}
            <div className="flex justify-center mb-6">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>

            {/* ── STEP INDICATOR ── */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className={`flex items-center gap-2 text-xs font-bold ${step === 1 ? "text-blue-600" : "text-slate-400"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${step === 1 ? "bg-blue-600 text-white" : "bg-green-500 text-white"}`}>
                  {step > 1 ? "✓" : "1"}
                </span>
                Details
              </div>
              <div className={`w-10 h-px ${step === 2 ? "bg-blue-300" : "bg-slate-200"}`}></div>
              <div className={`flex items-center gap-2 text-xs font-bold ${step === 2 ? "text-blue-600" : "text-slate-300"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${step === 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"}`}>
                  2
                </span>
                Verify OTP
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-5">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                {success}
              </div>
            )}

            {/* ══════════════════════════════════
                STEP 1 — Registration Form
            ══════════════════════════════════ */}
            {step === 1 && (
              <>
                <h1 className="text-2xl font-black text-slate-900 text-center mb-1">Create Account</h1>
                <p className="text-slate-400 text-sm text-center mb-7">Fill in your details to get started</p>

                <form onSubmit={handleRegister} className="flex flex-col gap-4">

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Full Name</label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Email Address</label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Mobile Number</label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>
                      </svg>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="+91 98765 43210"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Password</label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        required
                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword
                          ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required
                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showConfirm
                          ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md shadow-blue-200 active:scale-95 disabled:opacity-60 mt-2 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending OTP...
                      </>
                    ) : (
                      "SEND OTP & CONTINUE"
                    )}
                  </button>
                </form>

                <p className="text-center text-sm text-slate-400 mt-6">
                  Already have an account?{" "}
                  <Link to="/login" className="text-blue-600 font-bold hover:underline">
                    Log In
                  </Link>
                </p>
              </>
            )}

            {/* ══════════════════════════════════
                STEP 2 — OTP Verification
            ══════════════════════════════════ */}
            {step === 2 && (
              <>
                <h1 className="text-2xl font-black text-slate-900 text-center mb-1">Verify Your Email</h1>
                <p className="text-slate-400 text-sm text-center mb-7">
                  We sent a 6-digit OTP to<br />
                  <span className="text-blue-600 font-bold">{email}</span>
                </p>

                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
                  {/* OTP Boxes */}
                  <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, i)}
                        onKeyDown={(e) => handleOtpKeyDown(e, i)}
                        className="w-12 h-14 text-center text-xl font-black text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md shadow-blue-200 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Verifying...
                      </>
                    ) : (
                      "VERIFY & CREATE ACCOUNT"
                    )}
                  </button>
                </form>

                {/* Resend & Back */}
                <div className="flex items-center justify-between mt-5 text-sm">
                  <button
                    onClick={() => { setStep(1); setError(""); setSuccess(""); }}
                    className="text-slate-400 hover:text-slate-600 font-medium transition-colors"
                  >
                    ← Change Email
                  </button>
                  <button
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="text-blue-600 hover:text-blue-700 font-bold transition-colors disabled:opacity-50"
                  >
                    {resendLoading ? "Sending..." : "Resend OTP"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-slate-400 mt-6">
            By registering you agree to our{" "}
            <Link to="/terms" className="text-blue-500 hover:underline">Terms</Link> &{" "}
            <Link to="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;