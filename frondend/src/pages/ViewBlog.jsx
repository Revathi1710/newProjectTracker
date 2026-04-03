import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ViewBlog = () => {
  const { slug }              = useParams();
  const navigate              = useNavigate();
  const [blog, setBlog]       = useState(null);
  const [recent, setRecent]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setNotFound(false);

    axios
      .get(`${import.meta.env.VITE_API_URL}/blogs/slug/${slug}`)
      .then((res) => {
        setBlog(res.data.data);
        return axios.get(`${import.meta.env.VITE_API_URL}/blogs?status=published&limit=6`);
      })
      .then((res) => {
        const all = Array.isArray(res.data.data) ? res.data.data : [];
        setRecent(all.filter((b) => b.slug !== slug).slice(0, 5));
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }) : '';

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <>
     
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <svg className="animate-spin" width="36" height="36" fill="none" viewBox="0 0 24 24" style={{ margin: '0 auto 12px', display: 'block' }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#1e40af" strokeWidth="4" />
            <path className="opacity-75" fill="#1e40af" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading blog…</p>
        </div>
      </div>
     
    </>
  );

  // ─── Not Found ─────────────────────────────────────────────────────────────
  if (notFound || !blog) return (
    <>
      <Header />
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <p style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🔍</p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Blog not found</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>This post doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/blogs')}
          style={{ background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
          ← Back to Blogs
        </button>
      </div>
      <Footer />
    </>
  );

  const hasProjects = blog.projects && blog.projects.length > 0;

  return (
    <>
    

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      {blog.featured_image && (
        <div style={{ width: '100%', height: 380, overflow: 'hidden', position: 'relative', background: '#0f172a' }}>
          <img
            src={`${import.meta.env.VITE_SERVER_URL}/storage/${blog.featured_image}`}
            alt={blog.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(15,23,42,0.85) 0%,rgba(15,23,42,0.15) 60%,transparent 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem 2.5rem' }}>
            <div className="max-w-6xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {blog.category && (
                <span style={{ display: 'inline-block', width: 'fit-content', background: '#1e40af', color: '#fff', fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.08em', padding: '4px 14px', borderRadius: 20, textTransform: 'uppercase' }}>
                  {blog.category}
                </span>
              )}
              <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2.1rem)', fontWeight: 800, color: '#fff', lineHeight: 1.3, margin: 0 }}>
                {blog.title}
              </h1>
            </div>
          </div>
        </div>
      )}

      {/* ── Page body ───────────────────────────────────────────────────── */}
      <div style={{ background: '#f8f9fb', minHeight: '60vh' }}>
        <div className="max-w-6xl mx-auto px-6 py-10"
          style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2.5rem', alignItems: 'start' }}>

          {/* ── LEFT: Article ───────────────────────────────────────────── */}
          <article style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e9f0', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

            {/* Title (when no hero image) */}
            {!blog.featured_image && (
              <div style={{ padding: '2.5rem 2.5rem 0' }}>
                {blog.category && (
                  <span style={{ display: 'inline-block', background: '#eff6ff', color: '#1e40af', fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.08em', padding: '4px 14px', borderRadius: 20, textTransform: 'uppercase', marginBottom: 14 }}>
                    {blog.category}
                  </span>
                )}
                <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, margin: '0 0 1rem' }}>
                  {blog.title}
                </h1>
              </div>
            )}

            {/* Meta bar */}
            <div style={{ padding: '1.1rem 2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {formatDate(blog.published_at || blog.created_at)}
              </span>
              <Dot />
              <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {blog.author || 'New Projects Tracker'}
              </span>
              {blog.blog_type && (<><Dot /><span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{blog.blog_type.replace('_', ' ')}</span></>)}
            </div>

            {/* ── CONTENT AREA ────────────────────────────────────────── */}
            <div style={{ padding: '2rem 2.5rem' }}>

              {/*
               * CASE A: blog_projects table has rows → render structured blocks
               * CASE B: blog_projects is empty → parse short_description by \n\n
               *         Each paragraph that starts with "Project Promoter" gets
               *         bold-label formatting; others render as normal paragraphs.
               */}
              {hasProjects
                ? <StructuredProjects projects={blog.projects} shortDesc={blog.short_description} />
                : <ParsedDescription text={blog.short_description} />
              }

              {/* Extra content / CTA */}
              {blog.content && (
                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9' }}>
                  <div
                    style={{ fontSize: '0.95rem', color: '#374151', lineHeight: 1.85 }}
                    dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br/>') }}
                  />
                </div>
              )}
            </div>

            {/* Back link */}
            <div style={{ padding: '0.5rem 2.5rem 2rem', borderTop: '1px solid #f1f5f9' }}>
              <Link to="/blogs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600, color: '#1e40af', textDecoration: 'none' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Back to blog
              </Link>
            </div>
          </article>

          {/* ── RIGHT: Sidebar ───────────────────────────────────────────── */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: 24 }}>

            {/* Recent Posts */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e9f0', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                Recent Blog Posts
              </h3>
              {recent.length === 0
                ? <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>No recent posts.</p>
                : (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {recent.map((rb) => (
                      <li key={rb.id}>
                        <Link to={`/blogs/${rb.slug}`} style={{ display: 'flex', gap: 10, textDecoration: 'none', alignItems: 'flex-start' }}>
                          <div style={{ width: 52, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#e2e8f0' }}>
                            {rb.featured_image
                              ? <img src={`${import.meta.env.VITE_SERVER_URL}/storage/${rb.featured_image}`} alt={rb.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <svg width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                </div>
                            }
                          </div>
                          <span style={{ fontSize: '0.82rem', color: '#1e293b', fontWeight: 600, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {rb.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )
              }
            </div>

            {/* Share */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e9f0', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Share</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: 'LinkedIn', color: '#0077b5', href: `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(blog.title)}` },
                  { label: 'Twitter',  color: '#000',    href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blog.title)}` },
                  { label: 'Copy',     color: '#475569', href: null },
                ].map((s) => (
                  <button key={s.label}
                    onClick={() => s.href ? window.open(s.href, '_blank') : navigator.clipboard.writeText(window.location.href)}
                    style={{ flex: 1, padding: '7px 4px', borderRadius: 8, border: '1px solid #e5e9f0', background: '#f8fafc', color: s.color, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </>
  );
};

// ── Dot ────────────────────────────────────────────────────────────────────────
const Dot = () => (
  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1', display: 'inline-block', flexShrink: 0 }} />
);

// ─────────────────────────────────────────────────────────────────────────────
// CASE A: Structured projects from blog_projects table
// Shows short_description intro + each project block
// ─────────────────────────────────────────────────────────────────────────────
const StructuredProjects = ({ projects, shortDesc }) => (
  <>
    {/* Intro paragraph only (first sentence of short_description) */}
    {shortDesc && (
      <p style={{ fontSize: '0.97rem', color: '#475569', lineHeight: 1.8, borderLeft: '3px solid #1e40af', paddingLeft: 18, marginBottom: '2rem', fontStyle: 'italic' }}>
        {shortDesc.replace(/(<([^>]+)>)/gi, '').replace(/\*+/g, '').split('\n')[0].trim()}
      </p>
    )}

    {projects.map((proj, i) => {
      const rows = [
        { label: 'Project Promoter',    value: proj.promoter },
        { label: 'Products & Capacity', value: proj.products_capacity },
        { label: 'Project Location',    value: proj.location },
        { label: 'Proposed Investment', value: proj.investment },
        { label: 'Project Completion',  value: proj.completion },
      ].filter(r => r.value);

      if (!rows.length && !proj.summary) return null;
      const isLast = i === projects.length - 1;

      return (
        <div key={proj.id ?? i} style={{ marginBottom: isLast ? 0 : '2.5rem', paddingBottom: isLast ? 0 : '2.5rem', borderBottom: isLast ? 'none' : '1px dashed #e2e8f0' }}>
          {rows.map(r => (
            <p key={r.label} style={{ margin: '0 0 8px', fontSize: '0.93rem', color: '#1e293b', lineHeight: 1.7 }}>
              <strong style={{ color: '#0f172a', fontWeight: 700 }}>{r.label}</strong> : <span style={{ color: '#374151' }}>{r.value}</span>
            </p>
          ))}
          {proj.summary && (
            <div style={{ marginTop: rows.length ? 12 : 0 }}>
              <p style={{ margin: '0 0 6px', fontSize: '0.93rem', color: '#0f172a', fontWeight: 700, lineHeight: 1.7 }}>Executive Summary :</p>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#475569', lineHeight: 1.85 }}>{proj.summary}</p>
            </div>
          )}
        </div>
      );
    })}
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
// CASE B: No blog_projects rows — parse short_description text
//
// The text stored in DB looks like:
//   "These are some of the top projects...\n\nProject Promoter : Shri. ...\nProducts & Capacity : ...\n..."
//
// Strategy:
//   1. Split by \n\n  → paragraph blocks
//   2. Each block: split by \n → lines
//   3. Lines that contain " : " → render as bold-label : value
//   4. Other lines → render as plain paragraph
// ─────────────────────────────────────────────────────────────────────────────
const ParsedDescription = ({ text }) => {
  if (!text) return null;

  // Strip HTML tags
  const clean = text.replace(/(<([^>]+)>)/gi, '').replace(/\*+/g, '');

  // Split into paragraph blocks by one or more blank lines
  const blocks = clean.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);

  // Known project labels (bold key)
  const LABELS = [
    'Project Promoter',
    'Products & Capacity',
    'Project Location',
    'Proposed Investment',
    'Project Completion',
    'Executive Summary',
  ];

  const isLabelLine = (line) => LABELS.some(lbl => line.startsWith(lbl));

  return (
    <div>
      {blocks.map((block, bi) => {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);

        // Check if this block is a "project block" (contains at least one label line)
        const isProjectBlock = lines.some(isLabelLine);

        if (!isProjectBlock) {
          // Plain intro / closing paragraph
          return (
            <p key={bi} style={{
              fontSize: '0.97rem', color: '#475569', lineHeight: 1.8,
              borderLeft: bi === 0 ? '3px solid #1e40af' : 'none',
              paddingLeft: bi === 0 ? 18 : 0,
              fontStyle: bi === 0 ? 'italic' : 'normal',
              marginBottom: '1.5rem',
            }}>
              {block}
            </p>
          );
        }

        // Project block — render label lines with bold key
        const isLast = bi === blocks.length - 1 || !blocks.slice(bi + 1).some(b => b.split('\n').some(isLabelLine));

        return (
          <div key={bi} style={{
            marginBottom: isLast ? '1rem' : '2.5rem',
            paddingBottom: isLast ? 0 : '2.5rem',
            borderBottom: isLast ? 'none' : '1px dashed #e2e8f0',
          }}>
            {lines.map((line, li) => {
              // Find matching label
              const matchedLabel = LABELS.find(lbl => line.startsWith(lbl));

              if (matchedLabel) {
                // Split on first " : "
                const colonIdx = line.indexOf(' : ');
                const label = colonIdx !== -1 ? line.substring(0, colonIdx) : matchedLabel;
                const value = colonIdx !== -1 ? line.substring(colonIdx + 3) : line.replace(matchedLabel, '').replace(/^[\s:]+/, '');

                // Executive Summary gets its own paragraph style
                if (label === 'Executive Summary') {
                  return (
                    <div key={li} style={{ marginTop: 12 }}>
                      <p style={{ margin: '0 0 6px', fontSize: '0.93rem', color: '#0f172a', fontWeight: 700, lineHeight: 1.7 }}>
                        Executive Summary :
                      </p>
                      <p style={{ margin: 0, fontSize: '0.92rem', color: '#475569', lineHeight: 1.85 }}>{value}</p>
                    </div>
                  );
                }

                return (
                  <p key={li} style={{ margin: '0 0 8px', fontSize: '0.93rem', color: '#1e293b', lineHeight: 1.7 }}>
                    <strong style={{ color: '#0f172a', fontWeight: 700 }}>{label}</strong>
                    {' : '}
                    <span style={{ color: '#374151' }}>{value}</span>
                  </p>
                );
              }

              // Regular line inside a project block
              return (
                <p key={li} style={{ margin: '0 0 6px', fontSize: '0.92rem', color: '#475569', lineHeight: 1.8 }}>
                  {line}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default ViewBlog;