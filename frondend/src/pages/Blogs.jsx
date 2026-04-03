import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BLOGS_PER_PAGE = 6;

const Blogs = () => {
  const [blogs, setBlogs]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const navigate                = useNavigate();

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/blogs?status=published`)
      .then(res => setBlogs(Array.isArray(res.data.data) ? res.data.data : []))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(blogs.length / BLOGS_PER_PAGE);
  const paginated  = blogs.slice((page - 1) * BLOGS_PER_PAGE, page * BLOGS_PER_PAGE);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: '2-digit', year: 'numeric'
    }).toUpperCase();
  };

  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/(<([^>]+)>)/gi, '').replace(/\*+/g, '').trim();
  };

  const excerpt = (text, len = 140) => {
    const clean = stripHtml(text);
    return clean.length > len ? clean.substring(0, len) + '…' : clean;
  };

  return (
    <>

      {/* ── Page Hero ─────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#f8f9fa 0%,#eef2f7 100%)', borderBottom: '1px solid #e5e9f0' }}
        className="px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            Blogs
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Latest project updates, industry insights and state reports from New Projects Tracker
          </p>
        </div>
      </div>

      {/* ── Blog Grid ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-10">

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm animate-pulse">
                <div style={{ height: 210, background: '#e2e8f0' }} />
                <div className="p-5">
                  <div style={{ height: 12, background: '#e2e8f0', borderRadius: 6, width: '40%', marginBottom: 12 }} />
                  <div style={{ height: 18, background: '#e2e8f0', borderRadius: 6, marginBottom: 8 }} />
                  <div style={{ height: 18, background: '#e2e8f0', borderRadius: 6, width: '70%', marginBottom: 16 }} />
                  <div style={{ height: 12, background: '#e2e8f0', borderRadius: 6, marginBottom: 6 }} />
                  <div style={{ height: 12, background: '#e2e8f0', borderRadius: 6, width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <svg className="w-14 h-14 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-semibold text-gray-500">No blogs published yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((blog) => (
              <BlogCard key={blog.id} blog={blog} formatDate={formatDate} excerpt={excerpt} navigate={navigate} />
            ))}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <PaginationBtn disabled={page === 1} onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}>
              ← Previous
            </PaginationBtn>

            {[...Array(totalPages)].map((_, i) => (
              <button key={i}
                onClick={() => { setPage(i + 1); window.scrollTo(0, 0); }}
                style={{
                  width: 38, height: 38, borderRadius: 8, border: 'none',
                  background: page === i + 1 ? '#1e40af' : '#f1f5f9',
                  color: page === i + 1 ? '#fff' : '#475569',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                {i + 1}
              </button>
            ))}

            <PaginationBtn disabled={page === totalPages} onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}>
              Next →
            </PaginationBtn>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

// ── Blog Card ──────────────────────────────────────────────────────────────────
const BlogCard = ({ blog, formatDate, excerpt, navigate }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => navigate(`/blogs/${blog.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 14, overflow: 'hidden', background: '#fff',
        border: '1px solid #e5e9f0', cursor: 'pointer',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.22s ease',
      }}
    >
      {/* Image */}
      <div style={{ height: 200, overflow: 'hidden', background: '#e2e8f0', position: 'relative' }}>
        {blog.featured_image ? (
          <img
            src={`${import.meta.env.VITE_SERVER_URL}/storage/${blog.featured_image}`}
            alt={blog.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover',
              transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.35s ease' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#dde3ee' }}>
            <svg width="40" height="40" fill="none" stroke="#94a3b8" strokeWidth="1.3" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
        {/* Category badge */}
        {blog.category && (
          <span style={{
            position: 'absolute', top: 12, left: 12,
            background: 'rgba(255,255,255,0.93)', color: '#1e40af',
            fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.07em',
            padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase',
            backdropFilter: 'blur(4px)',
          }}>
            {blog.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '18px 20px 22px' }}>
        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.06em' }}>
            {formatDate(blog.published_at || blog.created_at)}
          </span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#cbd5e1', display: 'inline-block' }} />
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {blog.author || 'New Projects Tracker'}
          </span>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '1.05rem', fontWeight: 700, color: hovered ? '#1e40af' : '#0f172a',
          lineHeight: 1.4, marginBottom: 10, transition: 'color 0.15s',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {blog.title}
        </h2>

        {/* Excerpt */}
        <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.65,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {excerpt(blog.short_description || blog.content)}
        </p>

        {/* Read more */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 4,
          fontSize: '0.78rem', fontWeight: 700, color: '#1e40af', letterSpacing: '0.01em' }}>
          Read more
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
            style={{ transform: hovered ? 'translateX(3px)' : 'translateX(0)', transition: 'transform 0.2s' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// ── Pagination Button ──────────────────────────────────────────────────────────
const PaginationBtn = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    style={{
      padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
      background: disabled ? '#f8fafc' : '#fff', color: disabled ? '#cbd5e1' : '#475569',
      fontSize: '0.82rem', fontWeight: 600, cursor: disabled ? 'default' : 'pointer',
      transition: 'all 0.15s',
    }}>
    {children}
  </button>
);

export default Blogs;