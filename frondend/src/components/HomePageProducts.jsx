import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import React from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, selectCartCount } from "../store/cartSlice";
import BannerSection from "./BannerSection";

export default function HomePageProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartCount = useSelector(selectCartCount);

  // Read values directly from URL
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("latest");
  const [meta, setMeta] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
          params: { search, category, sort, page },
        });
        const result = response.data;
        setProducts(Array.isArray(result.data) ? result.data : []);
        setMeta(result.meta || result);
      } catch (error) {
        console.error("Failed to load products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [search, category, sort, page]); // Effect runs whenever URL params change

  const handleAdd = async (product) => {
    try {
      setAddingId(product.id);
      await dispatch(
        addToCart({
          product_id: product.id,
          name: product.name,
          price: product.price,
          active_price: product.active_price,
          image: product.images?.[0]?.path || null,
        })
      ).unwrap();
      setToast({ message: "Product added successfully", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to add product", type: "error" });
    } finally {
      setAddingId(null);
      setTimeout(() => setToast({ message: "", type: "" }), 3000);
    }
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ ...Object.fromEntries(searchParams), page: newPage });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-200 selection:text-blue-900">

      {/* Toast Notification */}
      <div
        className={`fixed bottom-8 right-8 z-[60] transition-all duration-500 transform ${
          toast.message ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
        }`}
      >
        <div className={`border px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3 ${
          toast.type === "success"
            ? "bg-white border-green-200 shadow-green-100"
            : "bg-white border-red-200 shadow-red-100"
        }`}>
          <div className={`p-2 rounded-full ${toast.type === "success" ? "bg-green-100" : "bg-red-100"}`}>
            {toast.type === "success" ? (
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <p className="text-slate-700 font-semibold text-sm">{toast.message}</p>
        </div>
      </div>

<BannerSection/>
      {/* 2. MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-24">

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 py-6 border-b border-slate-200">
          <div className="flex items-center gap-4 shrink-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white border border-slate-200 text-slate-600 rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="latest">SORT: LATEST</option>
              <option value="price_asc">PRICE: LOW TO HIGH</option>
              <option value="price_desc">PRICE: HIGH TO LOW</option>
            </select>
          </div>

          {/* Cart Button */}
          <button
            onClick={() => navigate("/cart")}
            className="relative flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span className="text-slate-600 text-xs font-bold">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[400px] bg-slate-100 rounded-3xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="text-4xl mb-4 opacity-30">📂</div>
            <p className="text-slate-400 font-medium italic">No reports found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className="group relative bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:border-blue-300 hover:shadow-xl hover:shadow-blue-50 transition-all duration-500"
              >
                {/* Image */}
                <div className="relative overflow-hidden m-3 rounded-2xl bg-slate-100">
                  {p.images?.length > 0 ? (
                    <img
                      src={`${import.meta.env.VITE_SERVER_URL}/storage/${p.images[0].path}`}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-4xl opacity-60">
                      📊
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="px-6 pb-6 pt-2">
                  <Link to={`/product-view/${p.slug}`}>
                    <h3 className="text-slate-800 font-bold text-base leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem]">
                      {p.name}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Price</span>
                      <span className="text-slate-900 font-black text-xl">
                        ₹{Number(p.active_price || p.price).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAdd(p)}
                      disabled={addingId === p.id}
                      className="flex items-center justify-center h-12 w-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all active:scale-90 disabled:opacity-50 shadow-md shadow-blue-200"
                    >
                      {addingId === p.id ? (
                        <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex justify-center items-center gap-3 mt-16">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-30 transition-all shadow-sm"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex gap-2">
              {[...Array(meta.last_page)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-11 h-11 rounded-xl font-bold transition-all border text-sm ${
                    page === i + 1
                      ? "bg-blue-600 border-transparent text-white shadow-md shadow-blue-200"
                      : "bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page === meta.last_page}
              className="p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-30 transition-all shadow-sm"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}