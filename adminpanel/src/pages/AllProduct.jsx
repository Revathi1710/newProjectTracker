import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Sidebar from '../component/Sidebar';

const AllProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
      setProducts(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.code?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Select all / individual ──
  const allSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.includes(p.id));
  const toggleAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(filteredProducts.map(p => p.id));
  };
  const toggleOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // ── Delete ──
  const openDelete = (product) => setDeleteModal({ open: true, product });
  const closeDelete = () => setDeleteModal({ open: false, product: null });

  const confirmDelete = async () => {
    if (!deleteModal.product) return;
    setDeleting(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/products/${deleteModal.product.id}`);
      setProducts(prev => prev.filter(p => p.id !== deleteModal.product.id));
      closeDelete();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(false);
    }
  };

  // ── Row action dropdown ──
  const [openDropdown, setOpenDropdown] = useState(null);
  const toggleDropdown = (id) => setOpenDropdown(prev => prev === id ? null : id);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Products List</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track your store's progress to boost your sales.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <button
              onClick={() => window.location.href = '/addProduct'}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          {/* Table toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            {/* Search */}
            <div className="relative w-72">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
              />
            </div>

            {/* Filter button */}
            <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2" />
              </svg>
              Filter
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
              <svg className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading products...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="px-5 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    {['Products', 'Category', 'Price', 'Stock', 'Created At', ''].map((h, i) => (
                      <th
                        key={i}
                        className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400"
                      >
                        <span className="flex items-center gap-1">
                          {h}
                          {h && h !== '' && (
                            <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-700/40"
                      >
                        {/* Checkbox */}
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggleOne(item.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        {/* Product name + image */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {item.images && item.images.length > 0 ? (
                                <img
                                  src={`${import.meta.env.VITE_SERVER_URL}/storage/${item.images[0].path}`}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">{item.name}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{item.code}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category / Format */}
                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {item.format ?? '—'}
                        </td>

                        {/* Price */}
                        <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white">
                          ₹{parseFloat(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Stock */}
                        <td className="px-5 py-4">
                          {item.quantity > 0 ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                              In Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                              Out of Stock
                            </span>
                          )}
                        </td>

                        {/* Created At */}
                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 relative">
                          <div className="relative inline-block">
                            <button
                              onClick={() => toggleDropdown(item.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition dark:hover:bg-gray-700 dark:hover:text-gray-200"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="5" cy="12" r="1.5" />
                                <circle cx="12" cy="12" r="1.5" />
                                <circle cx="19" cy="12" r="1.5" />
                              </svg>
                            </button>

                            {openDropdown === item.id && (
                              <>
                                {/* Backdrop */}
                                <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                                <div className="absolute right-0 mt-1 w-36 rounded-xl bg-white border border-gray-100 shadow-lg z-20 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                                  <button
                                    onClick={() => {
                                      setOpenDropdown(null);
                                      window.location.href = `/editProduct/${item.id}`;
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition dark:text-gray-300 dark:hover:bg-gray-700"
                                  >
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      setOpenDropdown(null);
                                      openDelete(item);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition dark:hover:bg-red-900/20"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
                                    </svg>
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
                          </svg>
                          <p className="text-sm">No products found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination footer */}
          {!loading && filteredProducts.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredProducts.length}</span> of{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-300">{products.length}</span> products
              </p>
              <div className="flex items-center gap-1">
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
                  Previous
                </button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white border border-blue-600">
                  1
                </button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Delete Confirmation Modal ── */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
              </svg>
            </div>
            <h3 className="text-center text-lg font-semibold text-gray-800 dark:text-white mb-1">Delete Product</h3>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-200">"{deleteModal.product?.name}"</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeDelete}
                disabled={deleting}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleting && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProduct;