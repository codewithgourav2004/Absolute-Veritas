import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useFetch } from '../hooks/useFetch';
import Loader from '../components/Common/Loader';
import { formatDate } from '../utils/helpers';

const normalizeImg = (url) => {
  if (!url) return null;
  return url.replace(/^https?:\/\/localhost:\d+/, '');
};

const readingTime = (html) => {
  if (!html) return 1;
  const words = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

const CATEGORY_COLORS = {
  BIS:            'text-blue-400 bg-blue-500/10 border-blue-500/25',
  WPC:            'text-purple-400 bg-purple-500/10 border-purple-500/25',
  TEC:            'text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
  CDSCO:          'text-green-400 bg-green-500/10 border-green-500/25',
  EPR:            'text-teal-400 bg-teal-500/10 border-teal-500/25',
  FSSAI:          'text-orange-400 bg-orange-500/10 border-orange-500/25',
  CE:             'text-sky-400 bg-sky-500/10 border-sky-500/25',
  FCC:            'text-violet-400 bg-violet-500/10 border-violet-500/25',
  'IT Compliance':'text-pink-400 bg-pink-500/10 border-pink-500/25',
  General:        'text-gray-400 bg-gray-500/10 border-gray-500/25',
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

  const mins = readingTime(article.content);
  const categoryClass = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.General;

  return (
    <>
      <Helmet>
        <title>{article.title} | Absolute Veritas News</title>
        <meta name="description" content={article.excerpt} />
      </Helmet>

      <div className="pt-16">

        {/* ── Hero ── */}
        <div className="bg-indigo pt-14 pb-12">
          <div className="container-max max-w-3xl px-4">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-gray-500 text-xs font-mono mb-6">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link to="/news" className="hover:text-white transition-colors">News</Link>
              <span>/</span>
              <span className="text-gray-400 truncate max-w-[200px]">{article.title}</span>
            </nav>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-5">
              <span className={`inline-block text-xs font-mono font-semibold border uppercase tracking-[0.2em] px-3 py-1 rounded-full ${categoryClass}`}>
                {article.category}
              </span>
              {article.isTrending && (
                <span className="inline-block text-xs font-mono font-semibold text-gold bg-gold/10 border border-gold/25 uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                  Trending
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl md:text-[2.6rem] font-black text-white leading-snug mb-6">
              {article.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
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
              <span className="text-gray-600">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {mins} min read
              </span>
            </div>

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {article.tags.map((t) => (
                  <span key={t} className="bg-white/8 border border-white/10 px-3 py-0.5 rounded-full text-xs text-gray-400">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Cover image ── */}
        {article.coverImage && (
          <div className="bg-indigo pb-0">
            <div className="container-max max-w-3xl px-4">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 -mb-8">
                <img
                  src={normalizeImg(article.coverImage)}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-30 pointer-events-none"
                />
                <img
                  src={normalizeImg(article.coverImage)}
                  alt={article.title}
                  loading="eager"
                  decoding="async"
                  className="relative z-10 w-full max-h-[420px] object-contain bg-black/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Article body ── */}
        <div className={`bg-pearl section-padding ${article.coverImage ? 'pt-16' : ''}`}>
          <div className="container-max max-w-3xl px-4">

            {/* Excerpt pull-quote */}
            <p className="text-xl text-indigo/80 leading-relaxed mb-10 font-medium border-l-4 border-crimson pl-5 py-1 bg-crimson/5 rounded-r-xl pr-5">
              {article.excerpt}
            </p>

            {/* Body content */}
            <div
              className="blog-body"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Footer */}
            <div className="mt-14 pt-8 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
              <Link
                to="/news"
                className="inline-flex items-center gap-2 text-crimson font-semibold text-sm hover:gap-3 transition-all duration-200 group"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Back to News
              </Link>
              <span className="text-xs text-steel font-mono">{article.category} · {mins} min read</span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default NewsDetail;
