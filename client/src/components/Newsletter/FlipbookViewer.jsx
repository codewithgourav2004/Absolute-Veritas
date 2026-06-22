import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Local copy in /public — avoids CDN latency and ESM MIME issues
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

// External PDFs need to be proxied through our server to bypass CORS
const toProxyUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/')) return url;
  return `/api/download?url=${encodeURIComponent(url)}&inline=1`;
};

const toDownloadUrl = (url) => {
  if (!url) return '#';
  if (url.startsWith('/')) return url;
  return `/api/download?url=${encodeURIComponent(url)}`;
};

// ── Loading skeleton ───────────────────────────────────────────────────────────
const PageSkeleton = ({ width, height }) => (
  <div
    style={{ width, height, background: '#1e2340', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}
  >
    <svg className="animate-spin" style={{ width: 36, height: 36, color: 'rgba(255,255,255,0.2)' }} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, fontFamily: 'monospace' }}>Loading page…</span>
  </div>
);

// ── FlipbookViewer ─────────────────────────────────────────────────────────────
const FlipbookViewer = ({ pdfUrl, title, onClose }) => {
  const [numPages,    setNumPages]    = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFlipping,  setIsFlipping]  = useState(false);
  const [flipDir,     setFlipDir]     = useState('next');
  const [pageWidth,   setPageWidth]   = useState(480);
  const [loadError,   setLoadError]   = useState(false);
  const [docLoaded,   setDocLoaded]   = useState(false);
  const touchStartX = useRef(null);

  const fileUrl = toProxyUrl(pdfUrl);

  // ── Responsive sizing ───────────────────────────────────────────────────────
  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxH = vh - 190;            // leave room for header + footer
      const maxW = Math.min(vw - 100, 680);
      setPageWidth(Math.min(maxW, Math.floor(maxH / 1.414)));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // ── Page flip ──────────────────────────────────────────────────────────────
  const flipTo = useCallback((newPage, dir) => {
    if (!numPages || newPage < 1 || newPage > numPages || isFlipping) return;
    setFlipDir(dir);
    setIsFlipping(true);
    // After half-flip, swap page; then complete flip back
    setTimeout(() => setCurrentPage(newPage), 280);
    setTimeout(() => setIsFlipping(false), 560);
  }, [numPages, isFlipping]);

  const goNext = useCallback(() => flipTo(currentPage + 1, 'next'), [flipTo, currentPage]);
  const goPrev = useCallback(() => flipTo(currentPage - 1, 'prev'), [flipTo, currentPage]);

  // ── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [goNext, goPrev, onClose]);

  // ── Touch / swipe ─────────────────────────────────────────────────────────
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (dx > 50) goNext();
    else if (dx < -50) goPrev();
    touchStartX.current = null;
  };

  const pageH = Math.round(pageWidth * 1.414);

  // ── Flip CSS ──────────────────────────────────────────────────────────────
  //   first half: rotate out; second half (after page swap): rotate back in
  const flipAngle = isFlipping
    ? (flipDir === 'next' ? '-90deg' : '90deg')
    : '0deg';

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ zIndex: 200, background: '#07080f' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ background: '#1A1F3C', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
           className="flex-shrink-0 px-5 py-3 flex items-center justify-between shadow-2xl">
        <div className="min-w-0 mr-4">
          <p className="text-white font-bold text-sm truncate max-w-[260px] md:max-w-md leading-tight">
            {title}
          </p>
          <p className="text-white/35 text-[11px] mt-0.5 font-mono tracking-wide">
            {docLoaded && numPages ? `Page ${currentPage} of ${numPages}` : 'Loading PDF…'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={toDownloadUrl(pdfUrl)}
            download
            className="hidden sm:inline-flex items-center gap-1.5 text-white/55 hover:text-white text-xs font-semibold transition-colors border border-white/15 hover:border-white/40 px-3 py-1.5 rounded-lg"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-white/55 hover:text-red-400 text-xs font-bold transition-colors border border-white/15 hover:border-red-400/50 px-3 py-1.5 rounded-lg"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close
          </button>
        </div>
      </div>

      {/* ── Viewer area ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center overflow-hidden px-3 relative">
        {/* Background ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(26,31,60,0.7) 0%, transparent 100%)'
        }} />

        {/* ← Prev */}
        <button
          onClick={goPrev}
          disabled={currentPage <= 1 || isFlipping}
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-20 disabled:cursor-default z-10 mr-3"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* ── Book page ─────────────────────────────────────────────────── */}
        <div className="relative z-10 flex-shrink-0" style={{ width: pageWidth, height: pageH }}>
          {/* Multi-layer book shadow */}
          <div style={{
            position: 'absolute', inset: 0,
            boxShadow: [
              '0 2px 4px rgba(0,0,0,0.8)',
              '6px 6px 30px rgba(0,0,0,0.7)',
              '0 0 0 1px rgba(255,255,255,0.04)',
              '-4px 0 12px rgba(0,0,0,0.5)',
            ].join(', '),
            borderRadius: 3,
            pointerEvents: 'none',
            zIndex: 2,
          }} />

          {/* 3-D flip wrapper */}
          <div style={{
            width: '100%', height: '100%',
            transform: `perspective(1800px) rotateY(${flipAngle})`,
            transition: isFlipping
              ? 'transform 0.28s cubic-bezier(0.4,0,0.6,1)'
              : 'transform 0.22s ease-out',
            transformStyle: 'preserve-3d',
            borderRadius: 3,
            overflow: 'hidden',
            background: '#fff',
          }}>
            {/* Error state */}
            {loadError ? (
              <div style={{ width: pageWidth, height: pageH, background: '#1e2340', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
                <svg style={{ width: 48, height: 48, color: 'rgba(230,57,70,0.6)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', lineHeight: 1.6 }}>
                  Could not embed this PDF.<br />Try opening it directly.
                </p>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                   style={{ color: '#E63946', fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(230,57,70,0.4)', padding: '8px 20px', borderRadius: 8 }}>
                  Open PDF ↗
                </a>
              </div>
            ) : (
              <Document
                file={fileUrl}
                onLoadSuccess={({ numPages }) => { setNumPages(numPages); setDocLoaded(true); }}
                onLoadError={() => setLoadError(true)}
                loading={<PageSkeleton width={pageWidth} height={pageH} />}
                error={null}
              >
                <Page
                  pageNumber={currentPage}
                  width={pageWidth}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading={<PageSkeleton width={pageWidth} height={pageH} />}
                />
              </Document>
            )}
          </div>

          {/* Page-corner fold (visual only) */}
          {numPages && currentPage < numPages && (
            <div style={{
              position: 'absolute', bottom: 0, right: 0, zIndex: 3, pointerEvents: 'none',
              width: 0, height: 0,
              borderStyle: 'solid', borderWidth: '0 0 30px 30px',
              borderColor: 'transparent transparent rgba(0,0,0,0.22) transparent',
            }} />
          )}
        </div>

        {/* → Next */}
        <button
          onClick={goNext}
          disabled={!numPages || currentPage >= numPages || isFlipping}
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-20 disabled:cursor-default z-10 ml-3"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ── Page dots / progress ──────────────────────────────────────────── */}
      <div className="flex-shrink-0 py-2.5 flex items-center justify-center gap-1.5 flex-wrap px-6">
        {numPages && numPages <= 30 ? (
          Array.from({ length: numPages }, (_, i) => (
            <button
              key={i}
              title={`Page ${i + 1}`}
              onClick={() => flipTo(i + 1, i + 1 > currentPage ? 'next' : 'prev')}
              style={{
                width: i + 1 === currentPage ? 28 : 8,
                height: 8,
                borderRadius: 9999,
                background: i + 1 === currentPage
                  ? '#E63946'
                  : i + 1 < currentPage
                    ? 'rgba(230,57,70,0.3)'
                    : 'rgba(255,255,255,0.18)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.25s ease',
                flexShrink: 0,
              }}
            />
          ))
        ) : numPages ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 180, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${(currentPage / numPages) * 100}%`, height: '100%', background: '#E63946', borderRadius: 2, transition: 'width 0.3s ease' }} />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'monospace' }}>
              {currentPage} / {numPages}
            </span>
          </div>
        ) : null}
      </div>

      {/* ── Footer nav ─────────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-5 py-2.5 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <button
          onClick={goPrev}
          disabled={currentPage <= 1}
          className="text-white/35 hover:text-white/80 text-xs font-semibold disabled:opacity-20 transition-colors"
        >
          ← Previous
        </button>
        <span className="text-white/20 text-[11px] hidden sm:block tracking-wide">
          ← → arrow keys &nbsp;·&nbsp; swipe on mobile
        </span>
        <button
          onClick={goNext}
          disabled={!numPages || currentPage >= numPages}
          className="text-white/35 hover:text-white/80 text-xs font-semibold disabled:opacity-20 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default FlipbookViewer;
