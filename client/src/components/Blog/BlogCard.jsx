import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, truncate } from '../../utils/helpers';

const normalizeImg = (url) => url ? url.replace(/^https?:\/\/localhost:\d+/, '') : null;

const CATEGORY_COLORS = {
  Certification: 'bg-crimson/15 text-crimson border-crimson/25',
  Testing: 'bg-indigo/10 text-indigo border-indigo/20',
  Compliance: 'bg-emerald-500/10 text-emerald-700 border-emerald-400/25',
  'Industry News': 'bg-amber-400/10 text-amber-700 border-amber-400/25',
  General: 'bg-gray-200 text-gray-600 border-gray-300/40',
};

const Placeholder = () => (
  <div className="w-full h-full bg-gradient-to-br from-indigo to-[#2a3060] flex items-center justify-center">
    <svg className="w-10 h-10 text-white/20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  </div>
);

export const BlogCardFeatured = ({ blog }) => (
  <Link to={`/blog/${blog.slug}`} className="group block">
    <article className="flex flex-col md:flex-row rounded-2xl overflow-hidden border border-gray-200 bg-white hover:shadow-xl hover:border-gray-300 transition-all duration-300 min-h-[280px]">
      {/* Image frame — fixed aspect ratio, full image always visible */}
      <div className="relative md:w-[44%] flex-shrink-0 overflow-hidden bg-gray-50">
        {blog.coverImage ? (
          <>
            {/* Blurred background fill so letterbox gaps don't look empty */}
            <img
              src={normalizeImg(blog.coverImage)}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-30 pointer-events-none"
            />
            {/* Main image — fully visible, no cropping */}
            <img
              src={normalizeImg(blog.coverImage)}
              alt={blog.title}
              loading="lazy"
              decoding="async"
              className="relative z-10 w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-500 min-h-[220px] max-h-[340px]"
            />
          </>
        ) : (
          <Placeholder />
        )}
        <span className={`absolute top-4 left-4 z-20 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${CATEGORY_COLORS[blog.category] || 'bg-crimson/15 text-crimson border-crimson/25'}`}>
          {blog.category}
        </span>
      </div>

      {/* Text content */}
      <div className="flex flex-col justify-center p-7 md:p-10 flex-grow">
        <span className="text-xs font-mono text-gray-400 mb-3 tracking-wide">{formatDate(blog.publishedAt)}</span>
        <h2 className="font-display font-bold text-indigo text-2xl md:text-3xl leading-snug mb-4 group-hover:text-crimson transition-colors duration-200">
          {truncate(blog.title, 90)}
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
          {truncate(blog.excerpt || '', 200)}
        </p>
        <span className="inline-flex items-center gap-1.5 text-crimson font-semibold text-sm group-hover:gap-3 transition-all duration-200">
          Continue Reading <span aria-hidden>→</span>
        </span>
      </div>
    </article>
  </Link>
);

const BlogCard = ({ blog, index = 0, featured = false }) => {
  if (featured) return <BlogCardFeatured blog={blog} />;

  const num = String(index + 1).padStart(2, '0');

  return (
    <Link to={`/blog/${blog.slug}`} className="group block">
      <article className="flex items-start gap-5 py-6 border-b border-gray-100 hover:bg-gray-50/70 transition-colors duration-200 px-2 -mx-2 rounded-lg">
        {/* Number */}
        <span className="font-mono text-3xl font-bold text-gray-100 group-hover:text-crimson/20 transition-colors duration-300 select-none flex-shrink-0 w-12 text-right leading-none pt-1">
          {num}
        </span>

        {/* Thumbnail */}
        <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
          {blog.coverImage ? (
            <img src={normalizeImg(blog.coverImage)} alt={blog.title} loading="lazy" decoding="async" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <Placeholder />
          )}
        </div>

        {/* Content */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${CATEGORY_COLORS[blog.category] || 'bg-crimson/15 text-crimson border-crimson/25'}`}>
              {blog.category}
            </span>
            <span className="text-xs font-mono text-gray-400">{formatDate(blog.publishedAt)}</span>
          </div>
          <h3 className="font-display font-bold text-indigo text-base sm:text-lg leading-snug mb-1.5 group-hover:text-crimson transition-colors duration-200 line-clamp-2">
            {blog.title}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 hidden sm:block">
            {truncate(blog.excerpt || '', 120)}
          </p>
          <span className="inline-flex items-center gap-1 text-crimson text-xs font-semibold mt-2 group-hover:gap-2 transition-all duration-200">
            Continue Reading <span aria-hidden>→</span>
          </span>
        </div>
      </article>
    </Link>
  );
};

export default BlogCard;
