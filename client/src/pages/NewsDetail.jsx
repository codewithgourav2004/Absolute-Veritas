import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useFetch } from '../hooks/useFetch';
import Loader from '../components/Common/Loader';
import { formatDate } from '../utils/helpers';

const normalizeImg = (url) => {
  if (!url) return null;
  return url.replace(/^https?:\/\/localhost:\d+/, '');
};

const buildSrcDoc = (html) => {
  if (/<!doctype|<html/i.test(html)) return html;
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>*, *::before, *::after { box-sizing: border-box; } body { margin: 0; font-family: 'DM Sans', system-ui, sans-serif; color: #374151; line-height: 1.7; }</style>
<script>
  window.addEventListener('load', function() {
    var h = document.body.scrollHeight;
    parent.postMessage({ type: 'resize', height: h }, '*');
  });
</script>
</head>
<body>${html}</body>
</html>`;
};

const SandboxedContent = ({ html }) => {
  const iframeRef = useRef(null);
  const [height, setHeight] = useState(600);
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'resize' && typeof e.data.height === 'number') {
        setHeight(Math.max(300, e.data.height + 32));
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);
  return (
    <iframe
      ref={iframeRef}
      srcDoc={buildSrcDoc(html)}
      sandbox="allow-scripts allow-same-origin"
      style={{ width: '100%', height, border: 'none', display: 'block', minHeight: 300 }}
      title="Article content"
      onLoad={() => {
        try {
          const doc = iframeRef.current?.contentDocument;
          if (doc) setHeight(Math.max(300, doc.body.scrollHeight + 32));
        } catch {}
      }}
    />
  );
};

const CATEGORY_COLORS = {
  BIS:            'text-blue-600 bg-blue-50 border-blue-200',
  WPC:            'text-purple-600 bg-purple-50 border-purple-200',
  TEC:            'text-indigo-600 bg-indigo-50 border-indigo-200',
  CDSCO:          'text-green-600 bg-green-50 border-green-200',
  EPR:            'text-teal-600 bg-teal-50 border-teal-200',
  FSSAI:          'text-orange-600 bg-orange-50 border-orange-200',
  CE:             'text-sky-600 bg-sky-50 border-sky-200',
  FCC:            'text-violet-600 bg-violet-50 border-violet-200',
  'IT Compliance':'text-pink-600 bg-pink-50 border-pink-200',
  General:        'text-gray-600 bg-gray-50 border-gray-200',
};

const NewsDetail = () => {
  const { slug } = useParams();
  const { data: article, loading, error } = useFetch(`/news/${slug}`);

  if (loading) return <Loader full />;
  if (error || !article) return (
    <div className="pt-32 text-center">
      <h2 className="font-display text-2xl text-indigo mb-4">Article not found</h2>
      <Link to="/news" className="btn-primary">Back to News</Link>
    </div>
  );

  const categoryClass = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.General;

  return (
    <>
      <Helmet>
        <title>{article.title} | Absolute Veritas News</title>
        <meta name="description" content={article.excerpt} />
      </Helmet>

      <div className="pt-16">
        {/* Hero header */}
        <div className="bg-indigo pt-12 pb-0">
          <div className="container-max max-w-3xl px-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-gray-500 text-xs font-mono mb-6">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link to="/news" className="hover:text-white transition-colors">News</Link>
              <span>/</span>
              <span className="text-gray-400 truncate max-w-[200px]">{article.title}</span>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="inline-block text-xs font-mono font-semibold text-crimson bg-crimson/10 border border-crimson/25 uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                {article.category}
              </span>
              {article.isTrending && (
                <span className="inline-block text-xs font-mono font-semibold text-gold bg-gold/10 border border-gold/25 uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                  Trending
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl md:text-4xl font-black text-white leading-snug mb-5">
              {article.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-gray-400 text-sm pb-10">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {article.author}
              </span>
              <span className="text-gray-600">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(article.publishedAt)}
              </span>
              {article.tags?.length > 0 && (
                <>
                  <span className="text-gray-600">·</span>
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags.map((t) => (
                      <span key={t} className="bg-white/8 border border-white/10 px-2.5 py-0.5 rounded-full text-xs text-gray-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Cover image */}
        {article.coverImage && (
          <div className="bg-pearl">
            <div className="container-max max-w-3xl px-4">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white -mt-px">
                <img
                  src={normalizeImg(article.coverImage)}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-20 pointer-events-none"
                />
                <img
                  src={normalizeImg(article.coverImage)}
                  alt={article.title}
                  loading="eager"
                  decoding="async"
                  className="relative z-10 w-full max-h-[420px] object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* Article body */}
        <article className="section-padding bg-pearl">
          <div className="container-max max-w-3xl px-4">
            <p className="text-xl text-steel leading-relaxed mb-8 font-medium border-l-4 border-crimson pl-5 py-1">
              {article.excerpt}
            </p>
            {article.content && /(<style|<script|<link|<div|<section|<header|<footer|<table|<form|class=|id=)/i.test(article.content) ? (
              <SandboxedContent html={article.content} />
            ) : (
              <div
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            )}
            <div className="mt-14 pt-6 border-t border-gray-200 flex items-center gap-4">
              <Link
                to="/news"
                className="inline-flex items-center gap-2 text-crimson font-semibold text-sm hover:gap-3 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Back to News
              </Link>
            </div>
          </div>
        </article>
      </div>
    </>
  );
};

export default NewsDetail;
