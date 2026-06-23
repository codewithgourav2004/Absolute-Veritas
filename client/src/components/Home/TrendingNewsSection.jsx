import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import normalizeImg from '../../utils/normalizeImg';

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

const TrendingNewsSection = () => {
  const { data, isLoading } = useQuery(
    'trending-news-home',
    () => api.get('/news?isTrending=true&limit=4').then((r) => r.data),
    { staleTime: 5 * 60 * 1000 }
  );

  const articles = data?.news || [];

  if (isLoading || articles.length === 0) return null;

  const [featured, ...rest] = articles;

  return (
    <section className="section-padding bg-indigo overflow-hidden">
      <div className="container-max">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="inline-block text-xs font-mono text-crimson uppercase tracking-[0.2em] mb-2">
              Knowledge Hub
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-black text-white leading-tight">
              Trending Regulatory Updates
            </h2>
          </div>
          <Link
            to="/news"
            className="hidden md:flex items-center gap-2 text-white/60 hover:text-crimson text-sm font-semibold transition-colors duration-200 group"
          >
            All News
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Grid: Featured large + 3 side cards */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Featured */}
          <Link
            to={`/news/${featured.slug}`}
            className="lg:col-span-3 group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-crimson/40 transition-all duration-300 flex flex-col min-h-[340px]"
          >
            {featured.coverImage ? (
              <img
                src={normalizeImg(featured.coverImage)}
                alt={featured.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-crimson/20 to-indigo" />
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-indigo via-indigo/60 to-transparent" />

            <div className="relative z-10 p-7 flex flex-col h-full justify-end">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-crimson text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Trending
                </span>
                <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${CATEGORY_COLORS[featured.category] || CATEGORY_COLORS.General}`}>
                  {featured.category}
                </span>
              </div>
              <h3 className="font-display font-black text-white text-xl md:text-2xl leading-snug mb-3 group-hover:text-crimson transition-colors duration-200 line-clamp-3">
                {featured.title}
              </h3>
              <p className="text-white/60 text-sm line-clamp-2 mb-4">{featured.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs">{formatDate(featured.publishedAt)}</span>
                <span className="flex items-center gap-1.5 text-crimson font-semibold text-sm">
                  Read More
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          {/* Side cards */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {rest.slice(0, 3).map((article) => (
              <Link
                key={article._id}
                to={`/news/${article.slug}`}
                className="group flex gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:border-crimson/40 hover:bg-white/10 transition-all duration-300"
              >
                {/* Small image */}
                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white/10">
                  {article.coverImage ? (
                    <img
                      src={normalizeImg(article.coverImage)}
                      alt={article.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${CATEGORY_COLORS[article.category] || CATEGORY_COLORS.General}`}>
                      {article.category}
                    </span>
                    <h4 className="font-display font-bold text-white text-sm mt-1.5 leading-snug line-clamp-2 group-hover:text-crimson transition-colors duration-200">
                      {article.title}
                    </h4>
                  </div>
                  <span className="text-white/40 text-xs mt-1">{formatDate(article.publishedAt)}</span>
                </div>
              </Link>
            ))}

            {/* View all link mobile */}
            <Link
              to="/news"
              className="md:hidden flex items-center justify-center gap-2 text-white/60 hover:text-crimson text-sm font-semibold mt-2 transition-colors duration-200"
            >
              View All News →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingNewsSection;
