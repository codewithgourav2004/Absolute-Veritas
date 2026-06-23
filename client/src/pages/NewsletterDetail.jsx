import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import api from '../utils/api';
import Loader from '../components/Common/Loader';
import FlipbookViewer from '../components/Newsletter/FlipbookViewer';
import normalizeImg from '../utils/normalizeImg';

const API_BASE = (process.env.REACT_APP_API_URL || '/api').replace(/\/$/, '');
const SERVER_BASE = API_BASE.replace(/\/api$/, '');

const downloadHref = (url) => {
  if (!url) return '#';
  if (url.startsWith('/')) return `${SERVER_BASE}${url}`;
  return `${API_BASE}/download?url=${encodeURIComponent(url)}`;
};

// ── NewsletterDetail ──────────────────────────────────────────────────────────
const NewsletterDetail = () => {
  const { id } = useParams();
  const [flipbookOpen, setFlipbookOpen] = useState(false);

  const { data: newsletter, isLoading, isError } = useQuery(
    ['newsletter', id],
    () => api.get(`/newsletters/${id}`).then((r) => r.data),
    { retry: false }
  );

  // Auto-open flipbook when newsletter loads and has a PDF
  useEffect(() => {
    if (newsletter?.pdfLink) setFlipbookOpen(true);
  }, [newsletter?.pdfLink]);

  if (isLoading) return <div className="pt-16"><Loader /></div>;

  if (isError || !newsletter) {
    return (
      <div className="pt-16 min-h-screen bg-pearl flex items-center justify-center">
        <div className="text-center">
          <p className="text-indigo font-display font-bold text-2xl mb-3">Newsletter not found</p>
          <Link to="/newsletter" className="text-crimson font-semibold hover:underline">← Back to Newsletters</Link>
        </div>
      </div>
    );
  }

  const hasContent = Boolean(newsletter.content?.trim());
  const hasPdf     = Boolean(newsletter.pdfLink);

  return (
    <>
      <Helmet>
        <title>{newsletter.title} | Absolute Veritas</title>
        <meta name="description" content={newsletter.excerpt || `${newsletter.edition} — ${newsletter.month} ${newsletter.year} regulatory compliance bulletin.`} />
      </Helmet>

      {/* Full-screen flipbook overlay */}
      {flipbookOpen && hasPdf && (
        <FlipbookViewer
          pdfUrl={newsletter.pdfLink}
          title={newsletter.title}
          onClose={() => setFlipbookOpen(false)}
        />
      )}

      <div className="pt-16">
        {/* ── Hero ── */}
        <div className="relative bg-indigo py-12 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 20% 80%, rgba(212,175,55,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 10%, rgba(230,57,70,0.08) 0%, transparent 50%)',
            }}
          />
          <div className="relative z-10 container-max">
            <Link
              to="/newsletter"
              className="inline-flex items-center gap-2 text-white/50 hover:text-crimson text-sm font-medium transition-colors duration-200 mb-8 group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              All Newsletters
            </Link>

            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono text-gold uppercase tracking-[0.2em]">Monthly Bulletin</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-xs font-mono text-white/40 uppercase tracking-widest">{newsletter.month} {newsletter.year}</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-black text-white leading-tight mb-4">
                {newsletter.title}
              </h1>
              {newsletter.excerpt && (
                <p className="text-gray-400 text-base leading-relaxed max-w-2xl">{newsletter.excerpt}</p>
              )}

              {/* Action buttons */}
              <div className="mt-6 flex items-center gap-3 flex-wrap">
                <span className="inline-block bg-crimson/20 text-crimson border border-crimson/30 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                  {newsletter.edition}
                </span>

                {hasPdf && (
                  <button
                    onClick={() => setFlipbookOpen(true)}
                    className="inline-flex items-center gap-2 bg-crimson hover:bg-red-600 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-colors shadow-lg"
                  >
                    {/* Book-flip icon */}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Read as Flipbook
                  </button>
                )}

                {hasPdf && (
                  <a
                    href={downloadHref(newsletter.pdfLink)}
                    download
                    className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/15 text-white/70 hover:text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/15 transition-colors duration-200"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="bg-pearl section-padding">
          <div className="container-max">

            {/* Written content */}
            {hasContent && (
              <div className="max-w-3xl mx-auto">
                {newsletter.coverImage && (
                  <div className="relative aspect-[16/7] rounded-2xl overflow-hidden shadow-lg mb-10 border border-gray-100">
                    <img
                      src={normalizeImg(newsletter.coverImage)}
                      alt={newsletter.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                  </div>
                )}
                <article
                  className="prose prose-lg prose-indigo max-w-none
                    prose-headings:font-display prose-headings:text-indigo
                    prose-h2:text-2xl prose-h3:text-xl
                    prose-p:text-gray-600 prose-p:leading-relaxed
                    prose-strong:text-indigo prose-a:text-crimson
                    prose-li:text-gray-600"
                  dangerouslySetInnerHTML={{ __html: newsletter.content }}
                />
              </div>
            )}

            {/* Empty state */}
            {!hasPdf && !hasContent && (
              <div className="max-w-3xl mx-auto text-center text-steel py-16">
                Content coming soon.
              </div>
            )}

            {/* PDF-only: flipbook opens automatically, show reopen option if closed */}
            {hasPdf && !hasContent && !flipbookOpen && (
              <div className="max-w-sm mx-auto text-center py-10">
                <button
                  onClick={() => setFlipbookOpen(true)}
                  className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Re-open Flipbook
                </button>
              </div>
            )}

            {/* Back link */}
            <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-gray-200">
              <Link
                to="/newsletter"
                className="inline-flex items-center gap-2 text-crimson hover:text-indigo font-semibold text-sm transition-colors duration-200 group"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Back to all newsletters
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsletterDetail;
