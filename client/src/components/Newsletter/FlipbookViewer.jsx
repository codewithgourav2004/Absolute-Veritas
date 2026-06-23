import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const API_BASE = (process.env.REACT_APP_API_URL || '/api').replace(/\/$/, '');

const toProxyUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/')) return url;
  if (url.includes('cloudinary.com')) return url;
  return `${API_BASE}/download?url=${encodeURIComponent(url)}&inline=1`;
};

const toDownloadUrl = (url) => {
  if (!url) return '#';
  if (url.startsWith('/')) return url;
  return `${API_BASE}/download?url=${encodeURIComponent(url)}`;
};

const PageSkeleton = ({ width, height }) => (
  <div style={{ width, height, background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg style={{ width: 28, height: 28, color: '#ccc' }} className="animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  </div>
);

/* ─── CSS injected once ────────────────────────────────────────────────────── */
const FLIP_STYLE = `
  @keyframes flipNext {
    0%   { transform: perspective(2200px) rotateY(0deg);   }
    50%  { transform: perspective(2200px) rotateY(-90deg); }
    100% { transform: perspective(2200px) rotateY(0deg);   }
  }
  @keyframes flipPrev {
    0%   { transform: perspective(2200px) rotateY(0deg);  }
    50%  { transform: perspective(2200px) rotateY(90deg); }
    100% { transform: perspective(2200px) rotateY(0deg);  }
  }
  .flip-next { animation: flipNext 0.55s cubic-bezier(0.4,0,0.2,1) forwards; }
  .flip-prev { animation: flipPrev 0.55s cubic-bezier(0.4,0,0.2,1) forwards; }
`;

const FlipbookViewer = ({ pdfUrl, title, onClose }) => {
  const [numPages,    setNumPages]    = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [flipClass,   setFlipClass]   = useState('');
  const [pageWidth,   setPageWidth]   = useState(380);
  const [loadError,   setLoadError]   = useState(false);
  const [docLoaded,   setDocLoaded]   = useState(false);
  const touchStartX = useRef(null);
  const isFlipping  = flipClass !== '';

  const fileUrl = toProxyUrl(pdfUrl);

  /* inject keyframes once */
  useEffect(() => {
    if (document.getElementById('fb-flip-style')) return;
    const s = document.createElement('style');
    s.id = 'fb-flip-style';
    s.textContent = FLIP_STYLE;
    document.head.appendChild(s);
  }, []);

  /* ── Responsive sizing ─────────────────────────────────────────────────── */
  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const bookH = vh - 140;          // header + footer space
      const bookW = Math.min(vw - 80, 1160);
      const halfW = Math.floor((bookW - 24) / 2);   // 24 = spine width
      setPageWidth(Math.min(halfW, Math.floor(bookH / 1.414)));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  /* ── Navigate ──────────────────────────────────────────────────────────── */
  const flipTo = useCallback((newPage, dir) => {
    if (!numPages || newPage < 1 || newPage > numPages || isFlipping) return;
    const cls = dir === 'next' ? 'flip-next' : 'flip-prev';
    setFlipClass(cls);
    setTimeout(() => setCurrentPage(newPage), 275);   // swap at mid-flip
    setTimeout(() => setFlipClass(''),        560);
  }, [numPages, isFlipping]);

  const goNext = useCallback(() => flipTo(currentPage + 2, 'next'), [flipTo, currentPage]);
  const goPrev = useCallback(() => flipTo(currentPage - 2, 'prev'), [flipTo, currentPage]);

  /* ── Keyboard ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [goNext, goPrev, onClose]);

  /* ── Swipe ─────────────────────────────────────────────────────────────── */
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (dx > 50) goNext(); else if (dx < -50) goPrev();
    touchStartX.current = null;
  };

  const pageH     = Math.round(pageWidth * 1.414);
  const rightPage = currentPage + 1;
  const hasRight  = numPages != null && rightPage <= numPages;
  const totalW    = pageWidth * 2 + 24;   // 24px spine

  const nextDisabled = !numPages || currentPage + 1 >= numPages || isFlipping;
  const prevDisabled = currentPage <= 1 || isFlipping;

  // Spread label: "1–2 / 32"
  const label = docLoaded && numPages
    ? (hasRight ? `${currentPage} – ${rightPage}  /  ${numPages}` : `${currentPage}  /  ${numPages}`)
    : 'Loading…';

  return (
    <div
      className="fixed inset-0 flex flex-col select-none"
      style={{ zIndex: 200, background: '#c8cdd8' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div style={{ background: '#1A1F3C', borderBottom: '2px solid #E63946' }}
           className="flex-shrink-0 h-12 px-5 flex items-center justify-between">
        <span className="text-white font-bold text-sm truncate max-w-xs md:max-w-xl">{title}</span>
        <div className="flex items-center gap-2">
          <a href={toDownloadUrl(pdfUrl)} download
             className="hidden sm:inline-flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-semibold border border-white/20 hover:border-white/50 px-3 py-1.5 rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Download
          </a>
          <button onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-white/60 hover:text-crimson text-xs font-bold border border-white/20 hover:border-crimson px-3 py-1.5 rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Close
          </button>
        </div>
      </div>

      {/* ── Book stage ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center overflow-hidden"
           style={{ padding: '20px 16px' }}>

        {/* Nav arrow left */}
        <button onClick={goPrev} disabled={prevDisabled}
                className="flex-shrink-0 mr-4 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-default hover:scale-110"
                style={{ background: 'rgba(26,31,60,0.15)', border: '1px solid rgba(26,31,60,0.25)' }}>
          <svg className="w-5 h-5" style={{ color: '#1A1F3C' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* ── Open Book ──────────────────────────────────────────────────── */}
        <div
          className={flipClass}
          style={{
            width: totalW,
            height: pageH,
            flexShrink: 0,
            position: 'relative',
            /* Multi-layer shadow — book sitting on desk */
            filter: 'drop-shadow(0 20px 48px rgba(0,0,0,0.38)) drop-shadow(0 4px 12px rgba(0,0,0,0.28))',
          }}
        >
          {loadError ? (
            /* Error */
            <div style={{
              width: totalW, height: pageH, background: '#fff',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 14, padding: 32, textAlign: 'center', borderRadius: 2,
            }}>
              <svg style={{ width: 44, height: 44, color: '#E63946' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              <p style={{ color: '#1A1F3C', fontWeight: 700, fontSize: 15 }}>PDF cannot be loaded</p>
              <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6 }}>
                The PDF host blocks inline loading.<br/>Upload it via the admin panel.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                   style={{ color: '#E63946', fontSize: 13, fontWeight: 600, border: '1px solid rgba(230,57,70,0.4)', padding: '8px 18px', borderRadius: 8, textDecoration: 'none' }}>
                  Open in new tab ↗
                </a>
              </div>
            </div>
          ) : (
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages: n }) => { setNumPages(n); setDocLoaded(true); }}
              onLoadError={() => setLoadError(true)}
              loading={<PageSkeleton width={totalW} height={pageH} />}
              error={null}
            >
              <div style={{ display: 'flex', width: totalW, height: pageH }}>

                {/* ── LEFT PAGE ─────────────────────────────────────────── */}
                <div style={{
                  width: pageWidth,
                  height: pageH,
                  flexShrink: 0,
                  position: 'relative',
                  background: '#fff',
                  /* page stack depth on outer-left edge */
                  borderLeft: '1px solid #ddd',
                  /* inner shadow from spine on right edge */
                  boxShadow: 'inset -8px 0 18px rgba(0,0,0,0.10)',
                  overflow: 'hidden',
                }}>
                  <Page
                    pageNumber={currentPage}
                    width={pageWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={<PageSkeleton width={pageWidth} height={pageH} />}
                  />
                  {/* page-count badge bottom-left */}
                  <div style={{
                    position: 'absolute', bottom: 6, left: 10,
                    fontSize: 10, color: '#aaa', fontFamily: 'monospace',
                    pointerEvents: 'none',
                  }}>
                    {currentPage}
                  </div>
                </div>

                {/* ── SPINE ─────────────────────────────────────────────── */}
                <div style={{
                  width: 24,
                  flexShrink: 0,
                  background: 'linear-gradient(to right, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.18) 100%)',
                  position: 'relative',
                }}>
                  {/* Central spine line */}
                  <div style={{
                    position: 'absolute', top: 0, bottom: 0, left: '50%',
                    width: 1,
                    background: 'rgba(0,0,0,0.12)',
                    transform: 'translateX(-50%)',
                  }} />
                </div>

                {/* ── RIGHT PAGE ────────────────────────────────────────── */}
                <div style={{
                  width: pageWidth,
                  height: pageH,
                  flexShrink: 0,
                  position: 'relative',
                  background: hasRight ? '#fff' : '#f0ede8',
                  borderRight: '1px solid #ddd',
                  /* inner shadow from spine on left edge */
                  boxShadow: 'inset 8px 0 18px rgba(0,0,0,0.10)',
                  overflow: 'hidden',
                }}>
                  {hasRight ? (
                    <Page
                      pageNumber={rightPage}
                      width={pageWidth}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      loading={<PageSkeleton width={pageWidth} height={pageH} />}
                    />
                  ) : (
                    /* back cover / blank */
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f0ede8, #e8e4df)' }} />
                  )}
                  {/* page-count badge bottom-right */}
                  {hasRight && (
                    <div style={{
                      position: 'absolute', bottom: 6, right: 10,
                      fontSize: 10, color: '#aaa', fontFamily: 'monospace',
                      pointerEvents: 'none',
                    }}>
                      {rightPage}
                    </div>
                  )}
                </div>

              </div>
            </Document>
          )}

          {/* Book edge stack — left side (visual depth) */}
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: 1 + i * 0.7,
              left: -(i + 1) * 0.8,
              width: pageWidth,
              height: pageH - 1,
              background: i % 2 === 0 ? '#f0ede8' : '#e8e4df',
              zIndex: -1 - i,
              borderLeft: '1px solid #d0ccc6',
            }} />
          ))}

          {/* Book edge stack — right side */}
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: 1 + i * 0.7,
              right: -(i + 1) * 0.8,
              width: pageWidth,
              height: pageH - 1,
              background: i % 2 === 0 ? '#f0ede8' : '#e8e4df',
              zIndex: -1 - i,
              borderRight: '1px solid #d0ccc6',
            }} />
          ))}
        </div>

        {/* Nav arrow right */}
        <button onClick={goNext} disabled={nextDisabled}
                className="flex-shrink-0 ml-4 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-default hover:scale-110"
                style={{ background: 'rgba(26,31,60,0.15)', border: '1px solid rgba(26,31,60,0.25)' }}>
          <svg className="w-5 h-5" style={{ color: '#1A1F3C' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────── */}
      <div style={{ background: '#1A1F3C', borderTop: '1px solid rgba(255,255,255,0.07)' }}
           className="flex-shrink-0 h-14 px-5 flex items-center justify-between">

        <button onClick={goPrev} disabled={prevDisabled}
                className="flex items-center gap-1.5 text-white/45 hover:text-white text-xs font-semibold disabled:opacity-20 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
          </svg>
          Previous
        </button>

        {/* Page dots or progress */}
        <div className="flex items-center gap-1.5">
          {numPages && Math.ceil(numPages / 2) <= 20 ? (
            Array.from({ length: Math.ceil(numPages / 2) }, (_, i) => {
              const sp = i * 2 + 1;
              const active = currentPage === sp || currentPage === sp + 1;
              return (
                <button key={i}
                        onClick={() => flipTo(sp, sp > currentPage ? 'next' : 'prev')}
                        style={{
                          width: active ? 24 : 7, height: 7, borderRadius: 9999,
                          border: 'none', cursor: 'pointer', padding: 0,
                          background: active ? '#E63946' : 'rgba(255,255,255,0.2)',
                          transition: 'all 0.25s ease',
                        }} />
              );
            })
          ) : numPages ? (
            <div className="flex items-center gap-2.5">
              <div style={{ width: 160, height: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${(currentPage / numPages) * 100}%`, height: '100%', background: '#E63946', borderRadius: 2, transition: 'width 0.3s ease' }} />
              </div>
              <span className="text-white/40 text-[11px] font-mono tracking-wider">{label}</span>
            </div>
          ) : (
            <span className="text-white/30 text-xs font-mono">{label}</span>
          )}
        </div>

        <button onClick={goNext} disabled={nextDisabled}
                className="flex items-center gap-1.5 text-white/45 hover:text-white text-xs font-semibold disabled:opacity-20 transition-colors">
          Next
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FlipbookViewer;
