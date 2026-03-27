import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../component/Sidebar';

// ─── Icons ────────────────────────────────────────────────────────────────────
const ExcelIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18" />
  </svg>
);

const AllProduct = () => {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [deleting, setDeleting]     = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filterOpen, setFilterOpen]           = useState(false);
  const [filterName, setFilterName]           = useState('');
  const [filterCode, setFilterCode]           = useState('');
  const [filterPublishedIn, setFilterPublishedIn] = useState('');
  const [filterStatus, setFilterStatus]       = useState('');
  const [filterExcel, setFilterExcel]         = useState(''); // 'yes' | 'no' | ''
  const filterRef = useRef(null);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
      setProducts(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // Close filter panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const activeFilterCount = [filterName, filterCode, filterPublishedIn, filterStatus, filterExcel].filter(Boolean).length;

  const filteredProducts = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.name?.toLowerCase().includes(q) ||
      p.code?.toLowerCase().includes(q);

    const matchName        = !filterName        || p.name?.toLowerCase().includes(filterName.toLowerCase());
    const matchCode        = !filterCode        || p.code?.toLowerCase().includes(filterCode.toLowerCase());
    const matchPublishedIn = !filterPublishedIn || String(p.published_in ?? '').toLowerCase().includes(filterPublishedIn.toLowerCase());
    const matchStatus      = !filterStatus      || p.status === filterStatus;
    const matchExcel       = !filterExcel       ||
      (filterExcel === 'yes' ? !!p.excel_file : !p.excel_file);

    return matchSearch && matchName && matchCode && matchPublishedIn && matchStatus && matchExcel;
  });

  const clearFilters = () => {
    setFilterName(''); setFilterCode(''); setFilterPublishedIn('');
    setFilterStatus(''); setFilterExcel('');
  };

  // ── Select all ────────────────────────────────────────────────────────────
  const allSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.includes(p.id));
  const toggleAll   = () => allSelected ? setSelectedIds([]) : setSelectedIds(filteredProducts.map(p => p.id));
  const toggleOne   = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const openDelete  = (product) => setDeleteModal({ open: true, product });
  const closeDelete = () => setDeleteModal({ open: false, product: null });

  const confirmDelete = async () => {
    if (!deleteModal.product) return;
    setDeleting(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/products/${deleteModal.product.id}`);
      setProducts(prev => prev.filter(p => p.id !== deleteModal.product.id));
      closeDelete();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(false);
    }
  };

  const toggleDropdown = (id) => setOpenDropdown(prev => prev === id ? null : id);

  // ── Excel download ────────────────────────────────────────────────────────
  const downloadExcel = async (product) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/products/${product.id}/download-excel`,
        { responseType: 'blob' }
      );
      const url      = window.URL.createObjectURL(new Blob([response.data]));
      const link     = document.createElement('a');
      link.href      = url;
      link.download  = product.excel_file?.original_name ?? `${product.code}-data.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download Excel file.');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
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
           {/*} <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>*/}
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

          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 gap-3 flex-wrap">
            {/* Search */}
            <div className="relative w-72">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Quick search..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
              />
            </div>

            <div className="flex items-center gap-2 relative" ref={filterRef}>
              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {filterName && (
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-full dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                      Name: {filterName}
                      <button onClick={() => setFilterName('')} className="hover:text-blue-900 font-bold">×</button>
                    </span>
                  )}
                  {filterCode && (
                    <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2 py-1 rounded-full dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                      Code: {filterCode}
                      <button onClick={() => setFilterCode('')} className="hover:text-purple-900 font-bold">×</button>
                    </span>
                  )}
                  {filterPublishedIn && (
                    <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded-full dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
                      Published: {filterPublishedIn}
                      <button onClick={() => setFilterPublishedIn('')} className="hover:text-amber-900 font-bold">×</button>
                    </span>
                  )}
                  {filterStatus && (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                      Status: {filterStatus}
                      <button onClick={() => setFilterStatus('')} className="hover:text-green-900 font-bold">×</button>
                    </span>
                  )}
                  {filterExcel && (
                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-full dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
                      Excel: {filterExcel === 'yes' ? 'Has file' : 'No file'}
                      <button onClick={() => setFilterExcel('')} className="hover:text-emerald-900 font-bold">×</button>
                    </span>
                  )}
                  <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium px-1">
                    Clear all
                  </button>
                </div>
              )}

              {/* Filter button */}
              <button
                onClick={() => setFilterOpen(prev => !prev)}
                className={`relative flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition
                  ${filterOpen || activeFilterCount > 0
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2" />
                </svg>
                Filter
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Filter dropdown panel */}
              {filterOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white border border-gray-200 shadow-xl z-30 p-5 dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">Filter Products</p>
                    {activeFilterCount > 0 && (
                      <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium">
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 dark:text-gray-400">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={filterName}
                        onChange={e => setFilterName(e.target.value)}
                        placeholder="e.g. Andhra Pradesh..."
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
                      />
                    </div>

                    {/* Product Code */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 dark:text-gray-400">
                        Product Code
                      </label>
                      <input
                        type="text"
                        value={filterCode}
                        onChange={e => setFilterCode(e.target.value)}
                        placeholder="e.g. PRD-001"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
                      />
                    </div>

                    {/* Published In */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 dark:text-gray-400">
                        Published In
                      </label>
                      <input
                        type="text"
                        value={filterPublishedIn}
                        onChange={e => setFilterPublishedIn(e.target.value)}
                        placeholder="e.g. 2026 or January 2026"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 dark:text-gray-400">
                        Status
                      </label>
                      <div className="flex gap-2">
                        {['', 'active', 'inactive'].map(val => (
                          <button
                            key={val}
                            onClick={() => setFilterStatus(val)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition
                              ${filterStatus === val
                                ? val === 'active'   ? 'bg-green-500 border-green-500 text-white'
                                : val === 'inactive' ? 'bg-gray-500 border-gray-500 text-white'
                                :                      'bg-blue-600 border-blue-600 text-white'
                                : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                          >
                            {val === '' ? 'All' : val.charAt(0).toUpperCase() + val.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Excel file */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 dark:text-gray-400">
                        Excel File
                      </label>
                      <div className="flex gap-2">
                        {[{ v: '', label: 'All' }, { v: 'yes', label: 'Has File' }, { v: 'no', label: 'No File' }].map(opt => (
                          <button
                            key={opt.v}
                            onClick={() => setFilterExcel(opt.v)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition
                              ${filterExcel === opt.v
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setFilterOpen(false)}
                    className="mt-5 w-full py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    Apply Filters
                  </button>
                </div>
              )}
            </div>
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
                      <input type="checkbox" checked={allSelected} onChange={toggleAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    </th>
                    {['Product', 'Code', 'Price', 'Stock', 'Excel', 'Action'].map((h, i) => (
                      <th key={i} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {filteredProducts.length > 0 ? filteredProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-700/40">
                      
                      {/* Checkbox */}
                      <td className="px-5 py-4 align-middle">
                        <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleOne(item.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                      </td>

                      {/* Product Name + Image */}
                      <td className="px-5 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {item.images && item.images.length > 0 ? (
                              <img src={`${import.meta.env.VITE_SERVER_URL}/storage/${item.images[0].path}`} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /></svg>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">{item.name}</p>
                            <p className="text-xs text-gray-400 mt-1">{item.format ?? '—'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Code & Published In */}
                      <td className="px-5 py-4 align-middle">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded w-fit">
                            {item.code}
                          </span>
                          <span className="text-[11px] text-gray-400 italic ml-0.5">
                            {item.published_in || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4 align-middle text-sm font-medium text-gray-800 dark:text-white">
                        ₹{parseFloat(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Stock Status */}
                      <td className="px-5 py-4 align-middle">
                        {item.quantity > 0 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Out of Stock
                          </span>
                        )}
                      </td>

                      {/* Excel Download */}
                      <td className="px-5 py-4 align-middle">
                        {item.excel_file ? (
                          <button onClick={() => downloadExcel(item)} className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-2.5 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 transition dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                            <ExcelIcon /> Download
                          </button>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </td>

                      {/* Action Dropdown */}
                      <td className="px-5 py-4 align-middle relative">
                        <div className="relative inline-block text-left">
                          <button onClick={() => toggleDropdown(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>
                          </button>
                          {openDropdown === item.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                              <div className="absolute right-0 mt-1 w-36 rounded-xl bg-white border border-gray-100 shadow-lg z-20 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                                <button onClick={() => { setOpenDropdown(null); window.location.href = `/editProduct/${item.id}`; }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">
                                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                  Edit
                                </button>
                                <button onClick={() => { setOpenDropdown(null); openDelete(item); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" /></svg>
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="py-16 text-center text-gray-400 text-sm">No products found.</td>
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

      {/* Delete Modal */}
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
              <button onClick={closeDelete} disabled={deleting}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-60">
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