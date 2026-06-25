import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useFetch } from '../hooks/useFetch';
import Loader from '../components/Common/Loader';
import { formatDate } from '../utils/helpers';
import normalizeImg from '../utils/normalizeImg';

const buildSrcDoc = (html) => {
  const isFullDoc = /<!doctype|<html/i.test(html);
  const resizeScript = `<script>(function(){function r(){var h=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);window.parent.postMessage({_svcH:h},'*');}window.addEventListener('load',r);if(typeof ResizeObserver!=='undefined')new ResizeObserver(r).observe(document.body);setTimeout(r,200);setTimeout(r,800);})();<\/script>`;
  if (isFullDoc) return /(<\/body>)/i.test(html) ? html.replace(/<\/body>/i, resizeScript + '</body>') : html + resizeScript;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*,*::before,*::after{box-sizing:border-box}body{margin:0;font-family:'DM Sans',system-ui,sans-serif;color:#374151;line-height:1.7}</style></head><body>${html}${resizeScript}</body></html>`;
};

const SandboxedContent = ({ html }) => {
  const [height, setHeight] = useState(600);
  const iframeRef = useRef(null);
  useEffect(() => {
    const onMsg = (e) => { if (e.data && typeof e.data._svcH === 'number' && e.data._svcH > 0) setHeight(Math.max(e.data._svcH + 48, 300)); };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [html]);
  const handleLoad = () => {
    try { const doc = iframeRef.current?.contentDocument; if (doc) { const h = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight); if (h > 50) setHeight(h + 48); } } catch {}
  };
  return <iframe ref={iframeRef} key={html} srcDoc={buildSrcDoc(html)} sandbox="allow-scripts allow-same-origin" onLoad={handleLoad} style={{ width: '100%', height, border: 'none', display: 'block', minHeight: 300 }} title="Blog Content" />;
};

const readingTime = (html) => {
  if (!html) return 1;
  const words = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

const BlogDetail = () => {
  const { slug } = useParams();
  const { data: blog, loading, error } = useFetch(`/blogs/${slug}`);

  if (loading) return <Loader full />;
  if (error || !blog) return (
    <div className="pt-32 text-center">
      <h2 className="font-display text-2xl text-indigo mb-4">Post not found</h2>
      <Link to="/blog" className="btn-primary">Back to Blog</Link>
    </div>
  );

  const mins = readingTime(blog.content);
  const isLiveContent = Boolean(blog.content?.trim()) &&
    /(<style|<script|<link|<div|<section|<header|<footer|<table|<form|class=|id=)/i.test(blog.content);

  return (
    <>
      <Helmet>
        <title>{blog.title} | Absolute Veritas Blog</title>
        <meta name="description" content={blog.excerpt} />
      </Helmet>

      <div className="pt-16">

        {/* ── Hero ── */}
        <div className="bg-indigo pt-14 pb-12">
          <div className="container-max max-w-3xl px-4">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-gray-500 text-xs font-mono mb-6">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-gray-400 truncate max-w-[200px]">{blog.title}</span>
            </nav>

            {/* Category */}
            <span className="inline-block text-xs font-mono font-semibold text-crimson bg-crimson/10 border border-crimson/25 uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-5">
              {blog.category}
            </span>

            {/* Title */}
            <h1 className="font-display text-3xl md:text-[2.6rem] font-black text-white leading-snug mb-6">
              {blog.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {blog.author}
              </span>
              <span className="text-gray-600">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(blog.publishedAt)}
              </span>
              <span className="text-gray-600">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {mins} min read
              </span>
            </div>

            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {blog.tags.map((t) => (
                  <span key={t} className="bg-white/8 border border-white/10 px-3 py-0.5 rounded-full text-xs text-gray-400">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Cover image ── */}
        {blog.coverImage && (
          <div className="bg-indigo pb-0">
            <div className="container-max max-w-3xl px-4">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 -mb-8">
                <img
                  src={normalizeImg(blog.coverImage)}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-30 pointer-events-none"
                />
                <img
                  src={normalizeImg(blog.coverImage)}
                  alt={blog.title}
                  loading="eager"
                  decoding="async"
                  className="relative z-10 w-full max-h-[420px] object-contain bg-black/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Article body ── */}
        <div className={`bg-pearl section-padding ${blog.coverImage ? 'pt-16' : ''}`}>
          <div className="container-max max-w-3xl px-4">

            {/* Excerpt pull-quote */}
            <p className="text-xl text-indigo/80 leading-relaxed mb-10 font-medium border-l-4 border-crimson pl-5 py-1 bg-crimson/5 rounded-r-xl pr-5">
              {blog.excerpt}
            </p>

            {/* Body content */}
            {isLiveContent ? (
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <SandboxedContent html={blog.content} />
              </div>
            ) : (
              <div className="blog-body" dangerouslySetInnerHTML={{ __html: blog.content }} />
            )}

            {/* Divider */}
            <div className="mt-14 pt-8 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-crimson font-semibold text-sm hover:gap-3 transition-all duration-200 group"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Back to Blog
              </Link>
              <span className="text-xs text-steel font-mono">{blog.category} · {mins} min read</span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default BlogDetail;
