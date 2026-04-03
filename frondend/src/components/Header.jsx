import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import React from "react";
import logo from "../assets/logo.avif";
import { selectCartCount, fetchCart } from "../store/cartSlice";
import { useSelector, useDispatch } from "react-redux";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Blog", to: "/blogs" },
  { label: "Contact Us", to: "/contact" },

];

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    label: "Twitter",
    href: "#",
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
 
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const dispatch = useDispatch();
  const cartCount = useSelector(selectCartCount);
  const location = useLocation();

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
     
      <header className="npt-header">
        {/* ── Top Utility Bar ── */}
        <div className="top-bar">
          <div className="top-bar-inner">
            {/* Contact Info */}
            <div className="top-contact">
              <a href="tel:+919171015659">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +919171015659
              </a>
              <span className="divider-dot hide-sm" />
              <a href="mailto:sales@newprojectstracker.com" className="hide-sm">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                sales@newprojectstracker.com
              </a>
            </div>

            {/* Social Links */}
            <div className="top-socials">
              {socialLinks.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} title={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Navigation ── */}
        <nav className={`main-nav${scrolled ? " scrolled" : ""}`}>
          <div className="main-nav-inner">
            {/* Brand */}
            <Link to="/" className="brand">
              <img src={logo} alt="NPT Store" className="brand-logo" />
              <div className="brand-text npt-brand-text">
                <span className="brand-name">NPT<span>STORE</span></span>
                <span className="brand-tagline">Industrial Intelligence</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="desktop-nav">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`nav-link${location.pathname === link.to ? " active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="nav-actions">
              {/* Search */}
              <button className="icon-btn" aria-label="Search">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>

              {/* Cart */}
              <Link to="/cart" className="icon-btn cart-btn" aria-label="Cart">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </Link>

              {/* Account */}
              <Link to="/myAccount" className="account-btn">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Account
              </Link>

              {/* Hamburger */}
              <button
                className="hamburger"
                onClick={() => setMobileMenu(true)}
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* ── Mobile Full-Screen Menu ── */}
      <div className={`mobile-menu${mobileMenu ? " open" : ""}`} role="dialog" aria-modal="true">
        {/* Header */}
        <div className="mobile-menu-header">
          <Link to="/" className="brand" onClick={() => setMobileMenu(false)}>
            <img src={logo} alt="NPT Store" className="brand-logo" style={{ filter: "brightness(0) invert(1)" }} />
            <div className="brand-text npt-brand-text" style={{ borderLeftColor: "#3b82f6" }}>
              <span className="brand-name" style={{ color: "#fff" }}>NPT<span style={{ color: "#60a5fa" }}>STORE</span></span>
              <span className="brand-tagline">Industrial Intelligence</span>
            </div>
          </Link>
          <button className="mobile-close" onClick={() => setMobileMenu(false)} aria-label="Close menu">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="mobile-nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`mobile-nav-link${location.pathname === link.to ? " active" : ""}`}
              onClick={() => setMobileMenu(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="mobile-menu-footer">
          <Link to="/myAccount" className="mobile-account-btn" onClick={() => setMobileMenu(false)}>
            My Account
          </Link>

          <div className="mobile-contact-info">
            <a href="tel:+919171015659">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +919171015659
            </a>
            <a href="mailto:sales@newprojectstracker.com">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              sales@newprojectstracker.com
            </a>
          </div>

          <div className="mobile-socials">
            {socialLinks.map((s) => (
              <a key={s.label} href={s.href} className="mobile-social-link">
                {s.icon}
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}