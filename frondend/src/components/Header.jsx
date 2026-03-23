import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import React from "react";
import logo from "../assets/logo.avif";
import { selectCartCount, fetchCart } from "../store/cartSlice";
import { useSelector, useDispatch } from "react-redux";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Blog", to: "/blogs" },
  { label: "Buy Reports", to: "/blogs" },
  { label: "Subscription Products", to: "/about" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const dispatch = useDispatch();
  const cartCount = useSelector(selectCartCount);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 z-50 w-full px-4 py-3 md:px-8">
      <header
        className={`mx-auto max-w-7xl transition-all duration-500 rounded-2xl border ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-[0_4px_24px_0_rgba(0,0,0,0.08)] border-slate-200/80 py-3"
            : "bg-white/70 backdrop-blur-md border-slate-200/50 py-5"
        }`}
      >
        <div className="px-6 flex items-center justify-between gap-4">

          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-white">
                <img src={logo} alt="Logo" className="h-7 w-7 object-contain" />
              </div>
            </div>
            <div className="flex flex-col font-sans">
              <span className="text-slate-800 font-bold text-lg tracking-tight leading-none">
                NPT<span className="text-blue-600">STORE</span>
              </span>
              <span className="text-[9px] text-slate-400 font-medium tracking-[0.2em] uppercase mt-1">
                Industrial Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden sm:flex items-center bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5 focus-within:border-blue-400 focus-within:bg-white transition-all">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none w-24 xl:w-32 ml-2"
              />
            </div>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {cartCount || 0}
              </span>
            </Link>

            {/* Login */}
            <Link to="/login" className="p-2 text-slate-500 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 text-slate-500 hover:text-blue-600 transition-colors"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="lg:hidden mt-4 mx-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-lg flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="px-4 py-3 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                onClick={() => setMobileMenu(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </div>
  );
}