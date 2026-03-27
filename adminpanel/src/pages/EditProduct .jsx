import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../component/Sidebar';

// ─── Icons ───────────────────────────────────────────────────────────────────
const ExcelIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18" />
    <path d="M12 12l3 3M15 12l-3 3" strokeWidth="1.5" />
  </svg>
);
const CloseIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Small UI helpers ────────────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const Input = ({ error, ...props }) => (
  <>
    <input
      {...props}
      className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition
        dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500
        ${error
          ? 'border-red-400 focus:ring-red-400'
          : 'border-gray-200 focus:ring-blue-500 dark:border-gray-600'}`}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </>
);

const Textarea = ({ error, ...props }) => (
  <>
    <textarea
      {...props}
      className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition resize-none
        dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500
        ${error
          ? 'border-red-400 focus:ring-red-400'
          : 'border-gray-200 focus:ring-blue-500 dark:border-gray-600'}`}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </>
);

const Select = ({ error, children, ...props }) => (
  <>
    <select
      {...props}
      className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 transition
        dark:bg-gray-800 dark:text-gray-200
        ${error
          ? 'border-red-400 focus:ring-red-400'
          : 'border-gray-200 focus:ring-blue-500 dark:border-gray-600'}`}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </>
);

// ─── Toast ───────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => (
  <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl shadow-lg px-5 py-3.5 text-sm font-medium text-white
    ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
    {type === 'success' ? (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )}
    {message}
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
  </div>
);

// ─── Excel Upload Section ─────────────────────────────────────────────────────
const ExcelSection = ({
  existingExcel,       // object from API: { original_name, size, url, download_url } | null
  newExcelFile,        // File | null
  removeExcel,         // bool
  onFileSelect,        // (File) => void
  onRemoveNew,         // () => void
  onToggleRemoveExisting, // () => void
  dragActive,
  onDragEnter,
  onDragLeave,
  onDrop,
  error,
}) => {
  const fileRef = useRef(null);

  const EXCEL_EXTENSIONS = ['.xlsx', '.xls', '.csv'];
  const isValidExcel = (file) => EXCEL_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));

  const getExtBadge = (name) => {
    const ext = (name ?? '').split('.').pop().toUpperCase();
    const colors = {
      XLSX: 'bg-green-100 text-green-700',
      XLS:  'bg-green-100 text-green-700',
      CSV:  'bg-blue-100  text-blue-700',
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[ext] ?? 'bg-gray-100 text-gray-600'}`}>
        {ext}
      </span>
    );
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!isValidExcel(file)) { alert('Only .xlsx, .xls, or .csv files are allowed.'); return; }
      if (file.size > 20 * 1024 * 1024) { alert('Excel file must be under 20 MB.'); return; }
      onFileSelect(file);
    }
    e.target.value = '';
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-5">
        Excel / Data File
      </h2>

      {/* ── Existing file from server ── */}
      {existingExcel && !newExcelFile && (
        <div className={`mb-4 rounded-xl border-2 p-4 transition-all
          ${removeExcel
            ? 'border-red-300 bg-red-50/60 dark:bg-red-900/20 opacity-60'
            : 'border-green-200 bg-green-50/50 dark:bg-green-900/10'}`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 shrink-0">
              <ExcelIcon />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[160px]">
                  {existingExcel.original_name}
                </p>
                {getExtBadge(existingExcel.original_name)}
                {removeExcel && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                    Marked for removal
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(existingExcel.size)}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
            {/* Download current file */}
            {!removeExcel && (
              <a
                href={existingExcel.download_url ?? existingExcel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-green-200 text-green-700 bg-white hover:bg-green-50 transition-colors font-medium dark:bg-gray-700 dark:border-green-700 dark:text-green-400"
              >
                <DownloadIcon /> Download
              </a>
            )}
            {/* Replace */}
            {!removeExcel && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-xs px-3 py-1.5 rounded-lg border border-dashed border-green-300 text-green-600 bg-white hover:bg-green-50 transition-colors font-medium dark:bg-gray-700 dark:border-green-700 dark:text-green-400"
              >
                ↺ Replace
              </button>
            )}
            {/* Toggle remove */}
            <button
              type="button"
              onClick={onToggleRemoveExisting}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors
                ${removeExcel
                  ? 'border-green-300 text-green-600 bg-white hover:bg-green-50 dark:bg-gray-700 dark:text-green-400'
                  : 'border-red-200 text-red-500 bg-white hover:bg-red-50 dark:bg-gray-700 dark:text-red-400'}`}
            >
              {removeExcel ? '↩ Keep file' : '× Remove'}
            </button>
          </div>
        </div>
      )}

      {/* ── New file selected ── */}
      {newExcelFile && (
        <div className="mb-4 rounded-xl border-2 border-blue-200 bg-blue-50/50 p-4 dark:bg-blue-900/10 dark:border-blue-700">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
              <ExcelIcon />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[160px]">
                  {newExcelFile.name}
                </p>
                {getExtBadge(newExcelFile.name)}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">New</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(newExcelFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={onRemoveNew}
              className="w-7 h-7 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"
            >
              <CloseIcon />
            </button>
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-3 w-full text-xs py-1.5 rounded-lg border border-dashed border-blue-300 text-blue-600 bg-white hover:bg-blue-50 transition-colors font-medium dark:bg-gray-700"
          >
            ↺ Replace file
          </button>
        </div>
      )}

      {/* ── Drop zone (shown when no new file selected) ── */}
      {!newExcelFile && (
        <div
          onDragEnter={onDragEnter}
          onDragOver={e => e.preventDefault()}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-7 cursor-pointer transition-all
            ${dragActive
              ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-200 dark:border-gray-600 hover:border-green-400 hover:bg-green-50/30 dark:hover:border-green-600 dark:hover:bg-green-900/10'}`}
        >
          <div className="text-green-400 dark:text-green-500"><ExcelIcon /></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="text-green-600 font-medium dark:text-green-400">
              {dragActive ? 'Drop file here…' : existingExcel ? 'Upload replacement' : 'Click or drag & drop'}
            </span>
          </p>
          <p className="text-xs text-gray-400">.xlsx · .xls · .csv &nbsp;·&nbsp; max 20 MB</p>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        className="hidden"
        onChange={handleChange}
      />

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  // Images
  const [existingImages, setExistingImages] = useState([]);
  const [removeImageIds, setRemoveImageIds] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  // Excel
  const [existingExcel, setExistingExcel] = useState(null); // from API
  const [newExcelFile,  setNewExcelFile]  = useState(null); // File | null
  const [removeExcel,   setRemoveExcel]   = useState(false);
  const [excelDragActive, setExcelDragActive] = useState(false);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [form, setForm] = useState({
    name: '', slug: '', code: '', published_in: '', format: '',
    total_projects: '', description: '', highlights: '',
    status: 'active', price: '', quantity: '',
  });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Fetch product ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/products/${id}`);
        const p = data.data;
        setForm({
          name:           p.name           ?? '',
          slug:           p.slug           ?? '',
          code:           p.code           ?? '',
          published_in:   p.published_in   ?? '',
          format:         p.format         ?? '',
          total_projects: p.total_projects ?? '',
          description:    p.description    ?? '',
          highlights:     p.highlights     ?? '',
          status:         p.status         ?? 'active',
          price:          p.price          ?? '',
          quantity:       p.quantity       ?? '',
        });
        setExistingImages(p.images ?? []);
        setExistingExcel(p.excel_file ?? null); // ← load existing excel info
      } catch {
        showToast('Failed to load product.', 'error');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, showToast]);

  // ── Field handlers ───────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({
      ...prev,
      name: value,
      slug: slugManuallyEdited
        ? prev.slug
        : value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
    if (errors.name) setErrors(prev => ({ ...prev, name: null }));
  };

  const handleSlugChange = (e) => {
    setSlugManuallyEdited(true);
    handleChange(e);
  };

  // ── Image handlers ───────────────────────────────────────────────────────
  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        showToast(`"${file.name}" exceeds 10 MB and was skipped.`, 'error');
        return false;
      }
      return true;
    });
    const totalAllowed = 10 - ((existingImages.length - removeImageIds.length) + newImageFiles.length);
    if (totalAllowed <= 0) { showToast('Maximum 10 images allowed.', 'error'); e.target.value = ''; return; }
    const allowed = validFiles.slice(0, totalAllowed);
    setNewImageFiles(prev => [...prev, ...allowed]);
    setNewImagePreviews(prev => [...prev, ...allowed.map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRemoveExisting = (imgId) => {
    setRemoveImageIds(prev =>
      prev.includes(imgId) ? prev.filter(x => x !== imgId) : [...prev, imgId]
    );
  };

  // ── Excel handlers ───────────────────────────────────────────────────────
  const handleExcelSelect = (file) => {
    setNewExcelFile(file);
    setRemoveExcel(false); // uploading a replacement implicitly keeps intent to replace
    setErrors(prev => ({ ...prev, excel_file: null }));
  };

  const handleExcelDrop = (e) => {
    e.preventDefault();
    setExcelDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleExcelSelect(file);
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())         e.name         = 'Product name is required.';
    if (!form.code.trim())         e.code         = 'Product code is required.';
    if (!form.slug.trim())         e.slug         = 'Slug is required.';
    if (!form.published_in.trim()) e.published_in = 'Published In is required.';
    if (!form.status)              e.status       = 'Status is required.';
    if (form.price === '' || isNaN(form.price) || Number(form.price) < 0)
                                   e.price        = 'Enter a valid price.';
    if (form.quantity === '' || isNaN(form.quantity) || Number(form.quantity) < 0)
                                   e.quantity     = 'Enter a valid quantity.';
    return e;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      showToast('Please fix the highlighted errors.', 'error');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');

      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') formData.append(k, v);
      });
      if (form.quantity === 0 || form.quantity === '0') formData.set('quantity', 0);
      if (form.total_projects === 0 || form.total_projects === '0') formData.set('total_projects', 0);

      removeImageIds.forEach(imgId => formData.append('remove_images[]', imgId));
      newImageFiles.forEach(file  => formData.append('images[]', file));

      // ── Excel fields ──
      if (newExcelFile) formData.append('excel_file', newExcelFile);
      if (removeExcel)  formData.append('remove_excel', '1');

      await axios.post(
        `${import.meta.env.VITE_API_URL}/products/${id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      showToast('Product updated successfully!', 'success');
      setTimeout(() => navigate('/allProduct'), 1500);
    } catch (err) {
      if (err.response?.status === 422) {
        const mapped = {};
        Object.entries(err.response.data.errors ?? {}).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v[0] : v;
        });
        setErrors(mapped);
        showToast('Please fix the highlighted errors.', 'error');
      } else {
        showToast('Something went wrong. Please try again.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (fetching) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <svg className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading product...
          </div>
        </main>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="flex-1 overflow-y-auto p-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-5 dark:text-gray-400">
          <button onClick={() => navigate('/dashboard')} className="hover:text-blue-600 transition">Dashboard</button>
          <span>/</span>
          <button onClick={() => navigate('/products')} className="hover:text-blue-600 transition">Products</button>
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Edit Product</span>
        </nav>

        {/* Page header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Product</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update the product details below.</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left column ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Basic Info */}
              <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-5">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  <div className="sm:col-span-2">
                    <Label required>Product Name</Label>
                    <Input name="name" value={form.name} onChange={handleNameChange}
                      placeholder="e.g. Andhra Pradesh Projects Tracker" error={errors.name} />
                  </div>

                  <div>
                    <Label required>Slug</Label>
                    <Input name="slug" value={form.slug} onChange={handleSlugChange}
                      placeholder="auto-generated-from-name" error={errors.slug} />
                  </div>

                  <div>
                    <Label required>Product Code</Label>
                    <Input name="code" value={form.code} onChange={handleChange}
                      placeholder="e.g. APPT2026" error={errors.code} />
                  </div>

                  <div>
                    <Label required>Published In</Label>
                    <Input name="published_in" value={form.published_in} onChange={handleChange}
                      placeholder="e.g. January 2026" error={errors.published_in} />
                  </div>

                  <div>
                    <Label>Format</Label>
                    <Select name="format" value={form.format} onChange={handleChange} error={errors.format}>
                      <option value="">Select format</option>
                      <option value="Excel">Excel</option>
                      <option value="PDF">PDF</option>
                      <option value="Digital">Digital</option>
                      <option value="Physical">Physical</option>
                      <option value="Hybrid">Hybrid</option>
                    </Select>
                  </div>

                  <div>
                    <Label>Total Projects</Label>
                    <Input type="number" name="total_projects" value={form.total_projects}
                      onChange={handleChange} min="0" placeholder="0" error={errors.total_projects} />
                  </div>

                </div>
              </div>

              {/* Content */}
              <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-5">
                  Content
                </h2>
                <div className="space-y-5">
                  <div>
                    <Label>Description</Label>
                    <Textarea name="description" value={form.description} onChange={handleChange}
                      rows={5} placeholder="Detailed product description..." error={errors.description} />
                  </div>
                  <div>
                    <Label>Highlights</Label>
                    <Textarea name="highlights" value={form.highlights} onChange={handleChange}
                      rows={4} placeholder="• Key feature one&#10;• Key feature two" error={errors.highlights} />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-5">
                  Product Images
                </h2>

                {existingImages.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Existing images — click <strong>×</strong> to mark for removal, <strong>↩</strong> to undo
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {existingImages.map(img => {
                        const markedRemove = removeImageIds.includes(img.id);
                        return (
                          <div key={img.id} className="relative group">
                            <img
                              src={`${import.meta.env.VITE_SERVER_URL}/storage/${img.path}`}
                              alt={img.original_name}
                              className={`w-20 h-20 object-cover rounded-xl border-2 transition ${
                                markedRemove ? 'opacity-40 border-red-400 grayscale' : 'border-gray-200 dark:border-gray-600'
                              }`}
                            />
                            <button type="button" onClick={() => toggleRemoveExisting(img.id)}
                              className={`absolute -top-2 -right-2 w-6 h-6 rounded-full text-white text-xs flex items-center justify-center shadow transition
                                ${markedRemove ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                              {markedRemove ? '↩' : '×'}
                            </button>
                            {markedRemove && (
                              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] bg-red-500 text-white px-1 rounded">
                                Remove
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition dark:hover:border-blue-500 dark:hover:bg-blue-900/10">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4-4a3 3 0 014.243 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="text-blue-600 font-medium">Click to upload</span> new images
                  </p>
                  <p className="text-xs text-gray-400">JPEG, PNG, WebP · Max 10 MB each · Up to 10 total</p>
                </div>
                <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden" onChange={handleNewImages} />

                {newImagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {newImagePreviews.map((src, i) => (
                      <div key={i} className="relative">
                        <img src={src} alt="" className="w-20 h-20 object-cover rounded-xl border-2 border-blue-300" />
                        <button type="button" onClick={() => removeNewImage(i)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs flex items-center justify-center shadow">
                          ×
                        </button>
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] bg-blue-500 text-white px-1 rounded whitespace-nowrap">
                          New
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* ── Right column ── */}
            <div className="space-y-5">

              {/* Pricing & Stock */}
              <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-5">
                  Pricing & Stock
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label required>Price (₹)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                      <input type="number" name="price" value={form.price} onChange={handleChange}
                        min="0" step="0.01" placeholder="0.00"
                        className={`w-full rounded-xl border pl-8 pr-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 transition
                          dark:bg-gray-800 dark:text-gray-200
                          ${errors.price ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-blue-500 dark:border-gray-600'}`}
                      />
                    </div>
                    {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
                  </div>
                  <div>
                    <Label required>Quantity</Label>
                    <Input type="number" name="quantity" value={form.quantity} onChange={handleChange}
                      min="0" placeholder="0" error={errors.quantity} />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-5">
                  Status
                </h2>
                <div className="space-y-3">
                  {['active', 'inactive'].map(val => (
                    <label key={val}
                      className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition
                        ${form.status === val
                          ? val === 'active'
                            ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-400 bg-gray-50 dark:bg-gray-700/40'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'}`}>
                      <input type="radio" name="status" value={val} checked={form.status === val}
                        onChange={handleChange} className="sr-only" />
                      <span className={`w-3 h-3 rounded-full flex-shrink-0 ${val === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">{val}</span>
                    </label>
                  ))}
                  {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
                </div>
              </div>

              {/* ── Excel Upload ── */}
              <ExcelSection
                existingExcel={existingExcel}
                newExcelFile={newExcelFile}
                removeExcel={removeExcel}
                onFileSelect={handleExcelSelect}
                onRemoveNew={() => setNewExcelFile(null)}
                onToggleRemoveExisting={() => setRemoveExcel(prev => !prev)}
                dragActive={excelDragActive}
                onDragEnter={() => setExcelDragActive(true)}
                onDragLeave={() => setExcelDragActive(false)}
                onDrop={handleExcelDrop}
                error={errors.excel_file}
              />

              {/* Action buttons */}
              <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 dark:bg-gray-800 dark:border-gray-700 space-y-3">
                <button type="submit" disabled={saving}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60">
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
                <button type="button" onClick={() => navigate('/products')}
                  className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
                  Cancel
                </button>
              </div>

            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditProduct;