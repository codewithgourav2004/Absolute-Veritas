import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';
import Loader from '../components/Common/Loader';

const NEWS_CATEGORIES = ['All', 'Trending', 'BIS', 'WPC', 'TEC', 'CDSCO', 'EPR', 'FSSAI', 'CE', 'FCC', 'IT Compliance', 'General'];

const CATEGORY_COLORS = {
  BIS:            'bg-blue-100 text-blue-700',
  WPC:            'bg-purple-100 text-purple-700',
  TEC:            'bg-indigo-100 text-indigo-700',
  CDSCO:          'bg-green-100 text-green-700',
  EPR:            'bg-teal-100 text-teal-700',
  FSSAI:          'bg-orange-100 text-orange-700',
  CE:             'bg-sky-100 text-sky-700',
  FCC:            'bg-violet-100 text-violet-700',
  'IT Compliance':'bg-pink-100 text-pink-700',
  General:        'bg-gray-100 text-gray-600',
};

const normalizeImg = (url) => {
  if (!url) return null;
  return url.replace(/^https?:\/\/localhost:\d+/, '');
};

// ── Featured card (large horizontal) ─────────────────────────────────────────
const FeaturedNewsCard = ({ article }) => (
  <Link
    to={`/news/${article.slug}`}
    className="group flex flex-col md:flex-row bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
  >
    {/* Image */}
    <div className="md:w-2/5 h-56 md:h-auto bg-indigo flex-shrink-0 overflow-hidden relative">
      {article.coverImage ? (
        <img
          src={normalizeImg(article.coverImage)}
          alt={article.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-indigo to-indigo/70 flex items-center justify-center">
          <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6" />
          </svg>
        </div>
      )}
      {article.isTrending && (
        <span className="absolute top-4 left-4 bg-crimson text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">
          Trending
        </span>
      )}
    </div>

    {/* Content */}
    <div className="flex-1 p-7 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${CATEGORY_COLORS[article.category] || CATEGORY_COLORS.General}`}>
            {article.category}
          </span>
          <span className="text-xs text-steel">{formatDate(article.publishedAt)}</span>
        </div>
        <h2 className="font-display font-black text-indigo text-2xl md:text-3xl leading-snug mb-3 group-hover:text-crimson transition-colors duration-200">
          {article.title}
        </h2>
        <p className="text-steel text-sm leading-relaxed line-clamp-3">{article.excerpt}</p>
      </div>
      <div className="mt-5 flex items-center gap-2 text-crimson font-semibold text-sm">
        Read Article
        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </div>
  </Link>
);

// ── Grid card ─────────────────────────────────────────────────────────────────
const NewsCard = ({ article }) => (
  <Link
    to={`/news/${article.slug}`}
    className="group flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300"
  >
    {/* Image */}
    <div className="h-44 bg-indigo overflow-hidden relative flex-shrink-0">
      {article.coverImage ? (
        <img
          src={normalizeImg(article.coverImage)}
          alt={article.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-indigo to-indigo/70 flex items-center justify-center">
          <svg className="w-10 h-10 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6" />
          </svg>
        </div>
      )}
      {article.isTrending && (
        <span className="absolute top-3 left-3 bg-crimson text-white text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow">
          Trending
        </span>
      )}
    </div>

    {/* Content */}
    <div className="p-5 flex flex-col flex-1">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${CATEGORY_COLORS[article.category] || CATEGORY_COLORS.General}`}>
          {article.category}
        </span>
        <span className="text-xs text-steel">{formatDate(article.publishedAt)}</span>
      </div>
      <h3 className="font-display font-bold text-indigo text-base leading-snug mb-2 group-hover:text-crimson transition-colors duration-200 line-clamp-2">
        {article.title}
      </h3>
      <p className="text-steel text-sm leading-relaxed line-clamp-3 flex-1">{article.excerpt}</p>
      <div className="mt-4 flex items-center gap-1.5 text-crimson font-semibold text-xs">
        Read More
        <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </div>
  </Link>
);

// ── NewsPage ──────────────────────────────────────────────────────────────────
const NewsPage = () => {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery(
    ['news', category],
    () => {
      const params = new URLSearchParams({ limit: 100 });
      if (category === 'Trending') {
        params.set('isTrending', 'true');
      } else if (category !== 'All') {
        params.set('category', category);
      }
      return api.get(`/news?${params}`).then((r) => r.data);
    }
  );

  const allArticles = data?.news || [];

  const filtered = search.trim()
    ? allArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          (a.excerpt || '').toLowerCase().includes(search.toLowerCase())
      )
    : allArticles;

  const showFeatured = !search && filtered.length > 0;
  const [featured, ...rest] = filtered;
  const gridItems = showFeatured ? rest : filtered;

  return (
    <>
      <Helmet>
        <title>Trending News &amp; Updates | Absolute Veritas</title>
        <meta name="description" content="Stay current with regulatory compliance news — BIS, WPC, TEC, CDSCO, EPR, FSSAI, CE, FCC updates and more from Absolute Veritas." />
      </Helmet>

      <div className="pt-16">
        {/* Hero */}
        <div className="relative bg-indigo py-12 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 15% 70%, rgba(230,57,70,0.10) 0%, transparent 50%), radial-gradient(ellipse at 85% 15%, rgba(212,175,55,0.07) 0%, transparent 45%)',
            }}
          />
          <div className="relative z-10 container-max text-center">
            <span className="inline-block text-xs font-mono text-crimson uppercase tracking-[0.2em] mb-3">
              Knowledge Hub
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
              Trending News &amp; Updates
            </h1>
            <p className="text-gray-400 text-base max-w-lg mx-auto mb-7">
              Latest regulatory changes, compliance alerts, and industry developments — curated for Indian manufacturers and exporters.
            </p>
            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search news..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-5 py-3 rounded-full text-indigo bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-crimson text-sm"
              />
            </div>
          </div>
        </div>

        {/* Sticky category pills */}
        <div className="sticky top-16 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="container-max">
            <div className="flex flex-wrap justify-center gap-1 py-3">
              {NEWS_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => { setCategory(c); setSearch(''); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                    category === c
                      ? c === 'Trending'
                        ? 'bg-gold text-white shadow-md shadow-gold/30'
                        : 'bg-crimson text-white shadow-md shadow-crimson/25'
                      : c === 'Trending'
                        ? 'text-gold border border-gold/40 hover:bg-gold hover:text-white'
                        : 'text-steel hover:bg-indigo hover:text-white'
                  }`}
                >
                  {c === 'Trending' ? `🔥 ${c}` : c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <section className="bg-pearl">
          <div className="container-max section-padding">
            {isLoading ? (
              <Loader />
            ) : filtered.length === 0 ? (
              <div className="text-center text-steel py-20">
                {search ? `No results for "${search}"` : 'No news articles yet.'}
              </div>
            ) : (
              <>
                {/* Featured article */}
                {showFeatured && featured && (
                  <div className="mb-10">
                    <FeaturedNewsCard article={featured} />
                  </div>
                )}

                {/* 3-column grid */}
                {gridItems.length > 0 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gridItems.map((article) => (
                      <NewsCard key={article._id} article={article} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default NewsPage;
