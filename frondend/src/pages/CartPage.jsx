import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  selectCartItems,
  selectCartTotal,
  selectCartCount,
  selectCartLoading,
  removeFromCart,
  updateQuantity,
  clearCartAsync,
  fetchCart,
} from "../store/cartSlice";

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);
  const loading = useSelector(selectCartLoading);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-slate-50 text-slate-700 flex flex-col items-center justify-center gap-6 px-4">
          <div className="text-7xl opacity-20">🛒</div>
          <h2 className="text-2xl font-black text-slate-800">Your cart is empty</h2>
          <Link
            to="/products"
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-8 py-3 rounded-xl transition-all shadow-md shadow-blue-200"
          >
            Browse Reports
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="min-h-screen bg-slate-50 text-slate-800 px-4 py-24">
        <div className="max-w-5xl mx-auto">

          {/* Page Title */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-black text-slate-900">Your Cart</h1>
              <p className="text-slate-400 text-sm mt-1">{count} {count === 1 ? "item" : "items"} in your cart</p>
            </div>
            <button
              onClick={() => dispatch(clearCartAsync())}
              className="text-xs text-red-500 border border-red-200 bg-white hover:bg-red-50 px-4 py-2 rounded-xl transition-all font-semibold"
            >
              Clear All
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* Cart Items */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {items.map((item) => {
                const price = Number(item.product?.active_price || item.product?.price || item.active_price || item.price || 0);
                const name = item.product?.name || item.name || "Product Report";
                const image = item.product?.images?.[0]?.path || item.image;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-blue-50 shrink-0">
                      {image ? (
                        <img
                          src={`${import.meta.env.VITE_SERVER_URL}/storage/${image}`}
                          className="w-full h-full object-cover"
                          alt={name}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl opacity-40">📊</div>
                      )}
                    </div>

                    {/* Name & Price */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-slate-800 font-bold text-sm line-clamp-2 leading-snug">{name}</h3>
                      <span className="text-blue-600 font-black text-base mt-1 block">₹{price.toLocaleString()}</span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                        className="w-8 h-8 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 rounded-lg font-bold transition-all"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-bold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                        className="w-8 h-8 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 rounded-lg font-bold transition-all"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="text-slate-400 hover:text-red-500 p-2 transition-colors shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M18 6 6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-28 shadow-sm">
                <h2 className="text-slate-900 font-black text-lg mb-4">Order Summary</h2>

                {/* Item breakdown */}
                <div className="flex flex-col gap-2 mb-4">
                  {items.map((item) => {
                    const price = Number(item.product?.active_price || item.product?.price || item.active_price || item.price || 0);
                    const name = item.product?.name || item.name || "Product Report";
                    return (
                      <div key={item.id} className="flex justify-between text-sm text-slate-500">
                        <span className="line-clamp-1 flex-1 mr-2">{name}</span>
                        <span className="font-semibold shrink-0">₹{(price * item.quantity).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-4 mb-6">
                  <span className="text-slate-500 font-bold">Total</span>
                  <span className="text-slate-900 font-black text-2xl">₹{Number(total).toLocaleString()}</span>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-xl transition-all shadow-md shadow-blue-200 active:scale-95"
                >
                  PROCEED TO CHECKOUT
                </button>

                <Link
                  to="/products"
                  className="block text-center text-sm text-slate-400 hover:text-blue-600 mt-4 transition-colors font-medium"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}