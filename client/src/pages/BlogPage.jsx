import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import api from '../utils/api';
import BlogCard, { BlogCardFeatured } from '../components/Blog/BlogCard';
import Loader from '../components/Common/Loader';

const CATEGORIES = ['All', 'Certification', 'Testing', 'Compliance', 'Industry News', 'General'];

const BlogPage = () => {
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery(
    ['blogs', category, page],
    () => {
      const params = new URLSearchParams({ page, limit: 10 });
      if (category !== 'All') params.set('category', category);
      return api.get(`/blogs?${params}`).then((r) => r.data);
    }
  );

  const blogs = data?.blogs || [];
  const totalPages = data?.pages || 1;

  const filtered = search.trim()
    ? blogs.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          (b.excerpt || '').toLowerCase().includes(search.toLowerCase())
      )
    : blogs;

  const showFeatured = !search && page === 1 && filtered.length > 0;
  const [featured, ...rest] = filtered;
  const listItems = showFeatured ? rest : filtered;

  return (
    <>
      <Helmet>
        <title>Blog &amp; Insights | Absolute Veritas</title>
        <meta name="description" content="Regulatory compliance insights, certification guides, and industry news from Absolute Veritas." />
      </Helmet>

      <div className="pt-16">
        {/* Hero */}
        <div className="relative bg-indigo py-12 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 15% 70%, rgba(230,57,70,0.10) 0%, transparent 50%), radial-gradient(ellipse at 85% 15%, rgba(212,175,55,0.07) 0%, transparent 45%)' }} />
          <div className="relative z-10 container-max text-center">
            <span className="inline-block text-xs font-mono text-crimson uppercase tracking-[0.2em] mb-3">Knowledge Hub</span>
            <h1 className="font-display text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
              Blog &amp; Insights
            </h1>
            <p className="text-gray-400 text-base max-w-lg mx-auto mb-7">
              Expert guidance on BIS, WPC, CDSCO, FSSAI, EPR, ISO 27001 and more.
            </p>
            <div className="max-w-md mx-auto relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-11 pr-5 py-3 rounded-full text-indigo bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-crimson text-sm"
              />
            </div>
          </div>
        </div>

        {/* Sticky category bar */}
        <div className="sticky top-16 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="container-max">
            <div className="flex flex-wrap justify-center gap-1 py-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => { setCategory(c); setPage(1); }}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    category === c
                      ? 'bg-crimson text-white shadow-md shadow-crimson/25'
                      : 'text-steel hover:bg-indigo hover:text-white'
                  }`}
                >
                  {c}
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
              <div className="text-center text-steel py-20">No posts found.</div>
            ) : (
              <>
                {/* Featured post */}
                {showFeatured && featured && (
                  <div className="mb-10">
                    <BlogCardFeatured blog={featured} />
                  </div>
                )}

                {/* Numbered article list */}
                {listItems.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 px-6 py-2 shadow-sm">
                    {listItems.map((b, i) => (
                      <BlogCard
                        key={b._id}
                        blog={b}
                        index={showFeatured ? i + 1 : i}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && !search && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-indigo border border-gray-200 hover:bg-indigo hover:text-white hover:border-indigo disabled:opacity-30 transition-colors"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-lg font-semibold text-sm transition-colors border ${
                      page === p
                        ? 'bg-crimson text-white border-crimson shadow-md shadow-crimson/25'
                        : 'bg-white text-indigo border-gray-200 hover:bg-indigo hover:text-white hover:border-indigo'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-indigo border border-gray-200 hover:bg-indigo hover:text-white hover:border-indigo disabled:opacity-30 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default BlogPage;
