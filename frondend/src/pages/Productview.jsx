import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, selectCartCount } from "../store/cartSlice";

/* ─── tiny SVG icons ─────────────────────────────────────────────────────── */
const Svg = ({ children, size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {children}
  </svg>
);
const IconCart    = () => <Svg><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></Svg>;
const IconBolt    = () => <Svg><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></Svg>;
const IconCheck   = () => <Svg strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></Svg>;
const IconStar    = ({filled}) => <Svg fill={filled?"#f59e0b":"none"} stroke="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></Svg>;
const IconShare   = () => <Svg><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></Svg>;
const IconHeart   = ({on}) => <Svg fill={on?"#ef4444":"none"} stroke={on?"#ef4444":"currentColor"}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></Svg>;
const IconBack    = () => <Svg><path d="M19 12H5M5 12l7-7M5 12l7 7"/></Svg>;
const IconShield  = () => <Svg><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Svg>;
const IconDownload= () => <Svg><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Svg>;
const IconRefresh = () => <Svg><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></Svg>;
const IconZoom    = () => <Svg><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></Svg>;
const IconTag     = () => <Svg><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></Svg>;
const IconInfo    = () => <Svg><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Svg>;

/* ─── Spinner ────────────────────────────────────────────────────────────── */
const Spinner = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ animation: "spin .75s linear infinite" }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    <div className="h-14 bg-white border-b"/>
    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-4">
        <div className="aspect-square bg-gray-200 rounded-2xl"/>
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_,i)=><div key={i} className="aspect-square bg-gray-200 rounded-xl"/>)}
        </div>
      </div>
      <div className="space-y-5 pt-4">
        {[40,90,30,60,100,50,80].map((w,i)=>(
          <div key={i} style={{width:`${w}%`}} className="h-4 bg-gray-200 rounded-full"/>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Toast ──────────────────────────────────────────────────────────────── */
const Toast = ({ t }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold transition-all duration-400 ${
    t.msg ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
  } ${t.type==="success" ? "bg-white border-emerald-200 text-emerald-700 shadow-emerald-100" : "bg-white border-red-200 text-red-600 shadow-red-100"}`}>
    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black ${t.type==="success"?"bg-emerald-500":"bg-red-500"}`}>
      {t.type==="success" ? "✓" : "✕"}
    </span>
    {t.msg}
  </div>
);

/* ─── Spec Row ───────────────────────────────────────────────────────────── */
const Spec = ({ label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500 font-medium">{label}</span>
    <span className="text-sm text-gray-900 font-bold">{value || "—"}</span>
  </div>
);

/* ─── Feature Card ───────────────────────────────────────────────────────── */
const Feature = ({ icon, title, sub }) => (
  <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 shrink-0 shadow-sm">
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-gray-800">{title}</p>
      <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{sub}</p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function ProductView() {
  const { slug }     = useParams();
  const navigate     = useNavigate();
  const dispatch     = useDispatch();
  const cartCount    = useSelector(selectCartCount);

  const [product,  setProduct]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [mainImg,  setMainImg]  = useState(0);
  const [liked,    setLiked]    = useState(false);
  const [adding,   setAdding]   = useState(false);
  const [buying,   setBuying]   = useState(false);
  const [tab,      setTab]      = useState("description");
  const [zoom,     setZoom]     = useState(false);
  const [toast,    setToast]    = useState({ msg: "", type: "success" });
  const [qty,      setQty]      = useState(1);

  const flash = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3200);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/product-by-slug/${slug}`);
        setProduct(data.data);
      } catch {
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const doAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await dispatch(addToCart({
        product_id:   product.id,
        name:         product.name,
        price:        product.price,
        active_price: product.active_price,
        image:        product.images?.[0]?.path || null,
        quantity:     qty,
      })).unwrap();
      flash("Added to cart!");
    } catch {
      flash("Failed to add.", "error");
    } finally { setAdding(false); }
  };

  const doBuyNow = async () => {
    if (!product) return;
    setBuying(true);
    try {
      await dispatch(addToCart({
        product_id:   product.id,
        name:         product.name,
        price:        product.price,
        active_price: product.active_price,
        image:        product.images?.[0]?.path || null,
        quantity:     qty,
      })).unwrap();
      navigate("/cart");
    } catch {
      flash("Failed.", "error");
    } finally { setBuying(false); }
  };

  /* ── guards ── */
  if (loading) return <Skeleton />;
  if (error || !product) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-5">
      <p className="text-5xl opacity-20">📦</p>
      <p className="text-gray-500 font-medium">{error || "Something went wrong."}</p>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline">
        <IconBack /> Go back
      </button>
    </div>
  );

  const images      = product.images || [];
  const price       = Number(product.active_price || product.price);
  const origPrice   = Number(product.price);
  const hasDiscount = product.active_price && price < origPrice;
  const discountPct = hasDiscount ? Math.round((1 - price / origPrice) * 100) : 0;
  const inStock     = product.quantity > 0;
  const highlights  = (product.highlights || "").split("\n").filter(l => l.trim());

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <style>{`
        @keyframes spin   { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .ani   { animation: fadeIn .4s ease both; }
        .ani-1 { animation-delay:.04s }
        .ani-2 { animation-delay:.10s }
        .ani-3 { animation-delay:.16s }
        .ani-4 { animation-delay:.22s }
        .ani-5 { animation-delay:.28s }
      `}</style>

      <Toast t={toast} />

      {/* ── Zoom overlay ── */}
      {zoom && images[mainImg] && (
        <div onClick={() => setZoom(false)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-8 cursor-zoom-out">
          <img
            src={`${import.meta.env.VITE_SERVER_URL}/storage/${images[mainImg].path}`}
            alt="zoom"
            className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain"
          />
          <button onClick={() => setZoom(false)}
            className="absolute top-5 right-5 w-10 h-10 bg-white/10 text-white rounded-full text-lg hover:bg-white/20 transition flex items-center justify-center">
            ✕
          </button>
        </div>
      )}

      {/* ══ TOPBAR ══ */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span className="text-gray-300">›</span>
            <Link to="/products" className="hover:text-gray-700 transition-colors">Products</Link>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800 font-semibold truncate max-w-[180px]">{product.name}</span>
          </nav>
          <button onClick={() => navigate("/cart")}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition shadow-sm">
            <IconCart />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ══ MAIN ══ */}
      <main className="max-w-6xl mx-auto px-4 py-8 pb-24">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 font-semibold mb-6 transition-colors group">
          <span className="group-hover:-translate-x-0.5 transition-transform"><IconBack /></span>
          Back to Products
        </button>

        {/* ══ PRODUCT GRID ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-10 items-start">

          {/* LEFT: Images */}
          <div className="ani ani-1">
            {/* Main image */}
            <div
              className="relative bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden aspect-[4/3] group cursor-zoom-in mb-3"
              onClick={() => images.length > 0 && setZoom(true)}>
              {images.length > 0 ? (
                <img
                  src={`${import.meta.env.VITE_SERVER_URL}/storage/${images[mainImg].path}`}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-slate-100 flex flex-col items-center justify-center gap-3 text-slate-300">
                  <span className="text-6xl">📊</span>
                  <span className="text-sm font-medium opacity-60">No image</span>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {hasDiscount && (
                  <span className="px-2.5 py-1 bg-red-500 text-white text-[11px] font-black rounded-lg shadow-md">
                    -{discountPct}% OFF
                  </span>
                )}
                <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shadow-sm ${
                  inStock ? "bg-emerald-500 text-white" : "bg-gray-500 text-white"
                }`}>
                  {inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              {/* Zoom hint */}
              <div className="absolute bottom-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                <IconZoom />
              </div>

              {/* Like + Share */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <button onClick={(e) => { e.stopPropagation(); setLiked(l => !l); }}
                  className="w-9 h-9 bg-white/90 rounded-xl flex items-center justify-center shadow border border-gray-100 hover:scale-110 transition-transform">
                  <IconHeart on={liked} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(window.location.href); flash("Link copied!"); }}
                  className="w-9 h-9 bg-white/90 rounded-xl flex items-center justify-center shadow border border-gray-100 hover:scale-110 transition-transform text-gray-500">
                  <IconShare />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setMainImg(i)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      mainImg === i
                        ? "border-blue-500 scale-105 shadow-md shadow-blue-100"
                        : "border-gray-200 hover:border-blue-300 opacity-70 hover:opacity-100"
                    }`}>
                    <img
                      src={`${import.meta.env.VITE_SERVER_URL}/storage/${img.path}`}
                      alt={`img-${i}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Info */}
          <div className="flex flex-col gap-5">

            {/* Badges */}
            <div className="ani ani-1 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 text-[11px] font-bold rounded-lg border border-gray-200">
                <IconTag /> {product.code}
              </span>
              {product.format && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-lg border border-blue-100">
                  {product.format}
                </span>
              )}
              {product.status === "active"
                ? <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-100">● Available</span>
                : <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[11px] font-bold rounded-lg border border-gray-200">Unavailable</span>
              }
            </div>

            {/* Title */}
            <h1 className="ani ani-2 text-2xl font-black text-gray-900 leading-snug tracking-tight">
              {product.name}
            </h1>

            {/* Stars */}
            <div className="ani ani-2 flex items-center gap-1">
              {[...Array(5)].map((_,i) => <IconStar key={i} filled={true} />)}
              <span className="text-xs text-gray-400 ml-1.5 font-semibold">4.9 · 128 reviews</span>
            </div>

            <div className="border-t border-dashed border-gray-200"/>

            {/* Price */}
            <div className="ani ani-3">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-black text-gray-900">
                  ₹{price.toLocaleString("en-IN")}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-gray-400 line-through font-medium">
                      ₹{origPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="px-2.5 py-0.5 bg-red-100 text-red-600 text-xs font-black rounded-lg">
                      Save {discountPct}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Inclusive of all taxes · Digital delivery</p>
            </div>

            {/* Specs table */}
            <div className="ani ani-3 bg-white rounded-xl border border-gray-200 px-5 py-1 shadow-sm">
              <Spec label="Product Code"   value={product.code} />
              <Spec label="Published In"   value={product.published_in} />
              <Spec label="Format"         value={product.format} />
              <Spec label="Total Projects" value={product.total_projects ? `${product.total_projects} projects` : null} />
              <Spec label="Stock"          value={inStock ? `${product.quantity} copies available` : "Out of stock"} />
            </div>

            {/* Quantity */}
            <div className="ani ani-4 flex items-center gap-3">
              <span className="text-sm text-gray-600 font-semibold">Qty:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <button onClick={() => setQty(q => Math.max(1, q-1))}
                  className="w-10 h-10 text-gray-500 hover:bg-gray-100 transition text-lg font-bold">−</button>
                <span className="w-10 text-center text-sm font-bold text-gray-800">{qty}</span>
                <button onClick={() => setQty(q => q+1)}
                  className="w-10 h-10 text-gray-500 hover:bg-gray-100 transition text-lg font-bold">+</button>
              </div>
            </div>

            {/* CTA */}
            <div className="ani ani-4 flex flex-col gap-3">
              <button onClick={doAddToCart}
                disabled={adding || !inStock || product.status !== "active"}
                className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-black text-sm border-2 border-gray-900 text-gray-900 bg-white
                  hover:bg-gray-900 hover:text-white transition-all duration-200 active:scale-[0.98]
                  ${adding || !inStock || product.status !== "active" ? "opacity-50 cursor-not-allowed" : ""}`}>
                {adding ? <Spinner /> : <IconCart />}
                {adding ? "Adding…" : "Add to Cart"}
              </button>

              <button onClick={doBuyNow}
                disabled={buying || !inStock || product.status !== "active"}
                className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-black text-sm bg-blue-600 text-white
                  hover:bg-blue-700 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-blue-200
                  ${buying || !inStock || product.status !== "active" ? "opacity-50 cursor-not-allowed" : ""}`}>
                {buying ? <Spinner /> : <IconBolt />}
                {buying ? "Processing…" : "Buy It Now"}
              </button>
            </div>

            {/* Trust row */}
            <div className="ani ani-5 grid grid-cols-3 gap-2">
              <Feature icon={<IconShield />}   title="Verified"      sub="100% accurate data" />
              <Feature icon={<IconDownload />} title="Instant"       sub="Download after pay" />
              <Feature icon={<IconRefresh />}  title="Updates"       sub="Free within 30 days" />
            </div>

          </div>
        </div>

        {/* ══ TABS ══ */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200 bg-gray-50">
            {[
              { id: "description", label: "Description" },
              { id: "highlights",  label: "Highlights" },
              { id: "specs",       label: "Specifications" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                  tab === t.id
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-7 min-h-[180px]">
            {tab === "description" && (
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line max-w-3xl">
                {product.description || <span className="text-gray-400 italic">No description available.</span>}
              </div>
            )}

            {tab === "highlights" && (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
                {highlights.length > 0 ? highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <IconCheck />
                    </span>
                    {h.replace(/^[•\-\d.]+\s*/, "")}
                  </li>
                )) : (
                  <li className="text-gray-400 italic text-sm">No highlights listed.</li>
                )}
              </ul>
            )}

            {tab === "specs" && (
              <div className="max-w-lg">
                <Spec label="Product Code"   value={product.code} />
                <Spec label="Name"           value={product.name} />
                <Spec label="Published In"   value={product.published_in} />
                <Spec label="Format"         value={product.format} />
                <Spec label="Total Projects" value={product.total_projects} />
                <Spec label="Status"         value={product.status} />
                <Spec label="Price"          value={`₹${price.toLocaleString("en-IN")}`} />
              </div>
            )}
          </div>
        </div>

        {/* ══ INFO BANNER ══ */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <IconShield />,   t: "Secure Payment",   s: "256-bit SSL encryption on all transactions" },
            { icon: <IconDownload />, t: "Digital Delivery", s: "Instant download after successful payment" },
            { icon: <IconInfo />,     t: "Need help?",       s: "Contact support before purchasing" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">{item.t}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{item.s}</p>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}