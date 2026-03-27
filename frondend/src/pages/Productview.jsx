import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/cartSlice";
import { setBuyNowProduct } from "../store/buyNowSlice"; // ← new slice
import Header from "../components/Header";

export default function ProductView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImg, setMainImg] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartAdded, setCartAdded] = useState(false); // ✅ shows tick after add
  const [buyingNow, setBuyingNow] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/product-by-slug/${slug}`
        );
        setProduct(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  // ─── ADD TO CART ──────────────────────────────────────────────────────────
  // Adds product to shared cart. User stays on this page and can keep shopping.
  // Cart badge in header will update via fetchCart (called inside addToCart thunk).
  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      await dispatch(
        addToCart({ product_id: product.id, quantity: 1 })
      ).unwrap();
      setCartAdded(true);
      showToast("Added to cart! Continue shopping or go to cart.", "success");
      // Reset tick after 3s so button is re-usable
      setTimeout(() => setCartAdded(false), 3000);
    } catch (err) {
      showToast(typeof err === "string" ? err : "Failed to add to cart", "error");
    } finally {
      setAddingToCart(false);
    }
  };

  // ─── BUY NOW ─────────────────────────────────────────────────────────────
  // Does NOT touch the cart at all.
  // Stores only this product in buyNow Redux slice → navigates to /checkout.
  // The checkout page reads from buyNow slice, not from the cart.
  const handleBuyNow = () => {
    if (!product) return;
    setBuyingNow(true);

    // Save this single product to the buyNow slice (bypasses cart entirely)
    dispatch(setBuyNowProduct({
      id:           product.id,
      name:         product.name,
      price:        product.price,
      active_price: product.active_price,
      image:        product.images?.[0]?.path || null,
      code:         product.code,
      format:       product.format,
    }));

    // Navigate directly to checkout — cart is untouched, no API call needed
    navigate("/checkout?flow=buynow");
    // Note: setBuyingNow(false) is intentionally NOT called — component will unmount on navigate
  };

  /* ── Loading ── */
  if (loading)
    return (
      <>
        <Header />
        <div style={{ paddingTop: 116 }} className="min-h-screen bg-[#F4F7FC] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-slate-500 font-medium text-sm tracking-wide">Loading product...</p>
          </div>
        </div>
      </>
    );

  if (!product)
    return (
      <>
        <Header />
        <div style={{ paddingTop: 116 }} className="min-h-screen bg-[#F4F7FC] flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-slate-500 font-semibold">Product not found.</p>
          </div>
        </div>
      </>
    );

  const images = product.images || [];
  const price = Number(product.active_price || product.price);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@700;800&display=swap');
        .pv-wrap * { font-family: 'Barlow', sans-serif; }

        /* Toast */
        .pv-toast {
          position: fixed; bottom: 32px; right: 32px; z-index: 9999;
          display: flex; align-items: center; gap: 12px;
          background: #fff; border-radius: 14px; padding: 14px 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          transform: translateY(80px); opacity: 0;
          transition: all 0.35s cubic-bezier(.34,1.56,.64,1);
          pointer-events: none;
        }
        .pv-toast.show { transform: translateY(0); opacity: 1; pointer-events: auto; }
        .pv-toast.success { border-left: 4px solid #22c55e; }
        .pv-toast.error   { border-left: 4px solid #ef4444; }

        /* Thumbnails scrollbar */
        .thumb-row::-webkit-scrollbar { height: 4px; }
        .thumb-row::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

        /* Sticky image panel */
        @media (min-width: 1024px) {
          .img-sticky { position: sticky; top: 100px; }
        }

        /* Add to cart hover */
        .btn-cart {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          flex: 1; padding: 15px 24px; border-radius: 12px;
          border: 2px solid #1e3a8a; color: #1e3a8a;
          font-size: 14px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
          background: #fff; cursor: pointer;
          transition: all 0.22s ease; position: relative; overflow: hidden;
        }
        .btn-cart:hover { background: #1e3a8a; color: #fff; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(30,58,138,0.25); }
        .btn-cart:active { transform: scale(0.97); }
        .btn-cart:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .btn-buy {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          flex: 1; padding: 15px 24px; border-radius: 12px;
          background: #2563eb; color: #fff;
          font-size: 14px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
          border: 2px solid transparent; cursor: pointer;
          transition: all 0.22s ease;
          box-shadow: 0 4px 18px rgba(37,99,235,0.35);
        }
        .btn-buy:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,99,235,0.45); }
        .btn-buy:active { transform: scale(0.97); }
        .btn-buy:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* Spec grid */
        .spec-item { padding: 14px 0; border-bottom: 1px solid #f1f5f9; }
        .spec-item:last-child { border-bottom: none; }

        /* Section heading */
        .sec-label {
          font-size: 10px; font-weight: 800; letter-spacing: 0.2em;
          text-transform: uppercase; color: #2563eb; margin-bottom: 12px;
        }

        /* Trust badges */
        .badge {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-radius: 10px;
          background: #f0f7ff; border: 1px solid #dbeafe;
          font-size: 12px; font-weight: 600; color: #1e40af;
        }

        /* Breadcrumb */
        .breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #94a3b8; font-weight: 500; margin-bottom: 28px; }
        .breadcrumb span { cursor: pointer; transition: color 0.2s; }
        .breadcrumb span:hover { color: #2563eb; }
        .breadcrumb-sep { color: #cbd5e1; }
      `}</style>

      {/* Toast */}
      <div className={`pv-toast ${toast.type} ${toast.show ? "show" : ""}`}>
        {toast.type === "success" ? (
          <div style={{ background: "#dcfce7", borderRadius: 8, padding: 6 }}>
            <svg width="16" height="16" fill="none" stroke="#16a34a" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div style={{ background: "#fee2e2", borderRadius: 8, padding: 6 }}>
            <svg width="16" height="16" fill="none" stroke="#dc2626" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0 }}>{toast.message}</p>
          {toast.type === "success" && (
            <button
              onClick={() => navigate("/cart")}
              style={{ fontSize: 12, color: "#2563eb", fontWeight: 700, background: "none", border: "none", padding: 0, cursor: "pointer", marginTop: 2 }}
            >
              View Cart →
            </button>
          )}
        </div>
      </div>

      <div className="pv-wrap bg-[#F4F7FC] min-h-screen">
        <Header />

        <main className="max-w-7xl mx-auto px-4 pt-6 md:px-8 pb-24">

          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <span onClick={() => navigate("/")}>Home</span>
          
            <span className="breadcrumb-sep">›</span>
            <span style={{ color: "#475569", cursor: "default" }}>{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* ── LEFT: Image Panel ── */}
            <div className="lg:col-span-5 img-sticky space-y-4">

              {/* Main Image */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 420,
                  padding: 24,
                }}
              >
                {images.length > 0 ? (
                  <img
                    src={`${import.meta.env.VITE_SERVER_URL}/storage/${images[mainImg].path}`}
                    alt={product.name}
                    style={{
                      maxWidth: "100%", maxHeight: 460,
                      width: "auto", height: "auto",
                      objectFit: "contain",
                      transition: "transform 0.4s ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  />
                ) : (
                  <div style={{ textAlign: "center", color: "#94a3b8" }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>📊</div>
                    <p style={{ fontSize: 13 }}>No image available</p>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="thumb-row" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setMainImg(i)}
                      style={{
                        flexShrink: 0,
                        width: 72, height: 72,
                        borderRadius: 12,
                        border: mainImg === i ? "2px solid #2563eb" : "2px solid #e2e8f0",
                        background: "#fff",
                        padding: 6,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: mainImg === i ? "0 0 0 3px rgba(37,99,235,0.15)" : "none",
                        opacity: mainImg === i ? 1 : 0.6,
                      }}
                    >
                      <img
                        src={`${import.meta.env.VITE_SERVER_URL}/storage/${img.path}`}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        alt=""
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badges */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingTop: 8 }}>
                <div className="badge">
                  <svg width="15" height="15" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Verified Data
                </div>
                <div className="badge">
                  <svg width="15" height="15" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Instant Download
                </div>
                <div className="badge">
                  <svg width="15" height="15" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Delivery
                </div>
                <div className="badge">
                  <svg width="15" height="15" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  24/7 Support
                </div>
              </div>
            </div>

            {/* ── RIGHT: Details ── */}
            <div className="lg:col-span-7">
              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 20px rgba(0,0,0,0.05)",
                  padding: "36px 36px",
                }}
              >
                {/* Code + Format badges */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                  <span style={{
                    background: "#1e3a8a", color: "#fff",
                    fontSize: 10, fontWeight: 800,
                    padding: "5px 12px", borderRadius: 6,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                  }}>
                    {product.code}
                  </span>
                  <span style={{
                    background: "#eff6ff", color: "#2563eb",
                    fontSize: 10, fontWeight: 700,
                    padding: "5px 12px", borderRadius: 6,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    border: "1px solid #bfdbfe",
                  }}>
                    {product.format || "Excel Report"}
                  </span>
                </div>

                {/* Product Name */}
                <h1 style={{
                  fontSize: 26, fontWeight: 800, color: "#0f172a",
                  lineHeight: 1.3, marginBottom: 20,
                }}>
                  {product.name}
                </h1>

                {/* Price */}
                <div style={{
                  display: "flex", alignItems: "baseline", gap: 12,
                  paddingBottom: 24, marginBottom: 24,
                  borderBottom: "2px solid #f1f5f9",
                }}>
                  <span style={{ fontSize: 38, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                    ₹{price.toLocaleString("en-IN")}
                  </span>
                  <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>incl. taxes</span>
                </div>

                {/* Specs Grid */}
                <div style={{ marginBottom: 28 }}>
                  <p className="sec-label">Specifications</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                    {[
                      { label: "Report Format", value: product.format || "Digital Download" },
                      { label: "Project Count",  value: product.total_projects || "Premium" },
                      { label: "Published",      value: product.published_in || "N/A" },
                      { label: "Project Code",   value: product.code },
                    ].map(({ label, value }) => (
                      <div key={label} className="spec-item">
                        <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "#94a3b8", marginBottom: 3 }}>
                          {label}
                        </p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── ACTION BUTTONS ── */}
                <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
                  {/* Add to Cart — stays on page, user keeps shopping */}
                  <button
                    className="btn-cart"
                    onClick={handleAddToCart}
                    disabled={addingToCart || buyingNow}
                    style={cartAdded ? { background: "#f0fdf4", borderColor: "#22c55e", color: "#16a34a" } : {}}
                  >
                    {addingToCart ? (
                      <>
                        <div style={{ width: 18, height: 18, border: "2px solid #1e3a8a", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                        Adding...
                      </>
                    ) : cartAdded ? (
                      <>
                        <svg width="18" height="18" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Added to Cart ✓
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>

                  {/* Buy Now — instant, bypasses cart, goes straight to /checkout */}
                  <button
                    className="btn-buy"
                    onClick={handleBuyNow}
                    disabled={addingToCart || buyingNow}
                  >
                    {buyingNow ? (
                      <>
                        <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                        Redirecting...
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                        </svg>
                        Buy It Now
                      </>
                    )}
                  </button>
                </div>

                <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, textAlign: "center", marginBottom: 32 }}>
                  🔒 Secure payment · Files delivered instantly to your email after purchase.
                </p>

                {/* Description */}
                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 28, marginBottom: 24 }}>
                  <p className="sec-label">Report Description</p>
                  <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.8, fontWeight: 400 }}>
                    {product.description || "Intelligence data and project leads tailored for industrial development."}
                  </p>
                </div>

                {/* Highlights */}
                {product.highlights && (
                  <div>
                    <p className="sec-label">Core Highlights</p>
                    <div style={{
                      background: "#f8faff",
                      border: "1px solid #e0eaff",
                      borderLeft: "4px solid #2563eb",
                      borderRadius: "0 12px 12px 0",
                      padding: "16px 20px",
                      fontSize: 14, color: "#334155",
                      lineHeight: 1.8,
                      whiteSpace: "pre-line",
                    }}>
                      {product.highlights}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}