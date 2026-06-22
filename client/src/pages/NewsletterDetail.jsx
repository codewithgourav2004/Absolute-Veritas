import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import api from '../utils/api';
import Loader from '../components/Common/Loader';
import FlipbookViewer from '../components/Newsletter/FlipbookViewer';

const normalizeImg = (url) => {
  if (!url) return null;
  return url.replace(/^https?:\/\/localhost:\d+/, '');
};

// For same-origin paths the browser handles download fine.
// For external URLs we route through our server proxy so the browser
// always triggers Save-As instead of just opening the file.
const downloadHref = (url) => {
  if (!url) return '#';
  if (url.startsWith('/')) return url; // local upload
  return `/api/download?url=${encodeURIComponent(url)}`;
};

// ── Embedded PDF viewer (collapsible) ────────────────────────────────────────
const PdfViewer = ({ url, onClose }) => {
  const [failed, setFailed] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white">
      {/* Toolbar */}
      <div className="bg-indigo px-5 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-white/70 text-xs font-mono uppercase tracking-widest">PDF Viewer</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-semibold transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open in new tab
          </a>
          <a
            href={downloadHref(url)}
            download
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-semibold transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
          {/* Close button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-white/60 hover:text-crimson text-xs font-bold transition-colors border border-white/20 hover:border-crimson px-3 py-1 rounded-lg"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close
          </button>
        </div>
      </div>

      {failed ? (
        <div className="p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-indigo font-bold text-lg mb-2">PDF cannot be embedded</p>
          <p className="text-steel text-sm mb-6">The PDF host does not allow inline preview. Please open it directly.</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2 px-8 py-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open PDF
          </a>
        </div>
      ) : (
        <iframe
          src={url}
          title="Newsletter PDF"
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '82vh', minHeight: 560, display: 'block', border: 'none' }}
        />
      )}
    </div>
  );
};

// ── NewsletterDetail ──────────────────────────────────────────────────────────
const NewsletterDetail = () => {
  const { id } = useParams();
  const [pdfOpen,     setPdfOpen]     = useState(false);
  const [flipbookOpen, setFlipbookOpen] = useState(false);

  const { data: newsletter, isLoading, isError } = useQuery(
    ['newsletter', id],
    () => api.get(`/newsletters/${id}`).then((r) => r.data),
    { retry: false }
  );

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

                {hasPdf && !pdfOpen && (
                  <button
                    onClick={() => { setPdfOpen(true); setTimeout(() => { document.getElementById('pdf-viewer-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100); }}
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/20 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Inline View
                  </button>
                )}

                {hasPdf && pdfOpen && (
                  <button
                    onClick={() => setPdfOpen(false)}
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/20 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Close Inline
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

            {/* PDF viewer — shown only when pdfOpen */}
            {hasPdf && pdfOpen && (
              <div id="pdf-viewer-section" className="mb-10">
                <PdfViewer url={newsletter.pdfLink} onClose={() => setPdfOpen(false)} />
              </div>
            )}

            {/* Written content */}
            {hasContent && (
              <div className="max-w-3xl mx-auto">
                {newsletter.coverImage && (
                  <div className="rounded-2xl overflow-hidden shadow-lg mb-10 border border-gray-100">
                    <img
                      src={normalizeImg(newsletter.coverImage)}
                      alt={newsletter.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full object-cover max-h-96"
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

            {/* If PDF-only and viewer is closed, show a prompt card */}
            {hasPdf && !hasContent && !pdfOpen && (
              <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo/10 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-indigo font-display font-bold text-xl mb-2">Available as PDF</p>
                <p className="text-steel text-sm mb-6">Click below to read this edition inline or download it.</p>
                <div className="flex justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => setFlipbookOpen(true)}
                    className="btn-primary inline-flex items-center gap-2 px-7 py-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Read as Flipbook
                  </button>
                  <a
                    href={downloadHref(newsletter.pdfLink)}
                    download
                    className="inline-flex items-center gap-2 border border-indigo text-indigo hover:bg-indigo hover:text-white font-semibold px-7 py-3 rounded-xl transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </a>
                </div>
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
