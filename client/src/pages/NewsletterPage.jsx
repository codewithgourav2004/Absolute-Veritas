import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import api from '../utils/api';
import Loader from '../components/Common/Loader';
import FlipbookViewer from '../components/Newsletter/FlipbookViewer';
import normalizeImg from '../utils/normalizeImg';

const MONTH_IDX = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

const fmtDate = (month, year) => {
  if (!month || !year) return '';
  return `${month} ${year}`;
};

// ── Newsletter Card ───────────────────────────────────────────────────────────
const NewsletterCard = ({ newsletter, onOpenFlipbook, featured = false }) => {
  const hasImage = Boolean(newsletter.coverImage);
  const hasPdf   = Boolean(newsletter.pdfLink);

  const handleClick = (e) => {
    if (hasPdf) { e.preventDefault(); onOpenFlipbook(newsletter); }
  };

  if (featured) {
    return (
      <Link
        to={`/newsletter/${newsletter._id}`}
        onClick={handleClick}
        className="group col-span-full flex flex-col md:flex-row rounded-3xl overflow-hidden border border-white/10 shadow-2xl hover:shadow-crimson/10 transition-all duration-500 cursor-pointer"
        style={{ background: 'linear-gradient(135deg, rgba(13,17,40,0.98) 0%, rgba(20,25,55,0.98) 100%)' }}
      >
        {/* Cover */}
        <div className="relative md:w-[340px] flex-shrink-0 overflow-hidden" style={{ aspectRatio: '3/4', maxHeight: 420 }}>
          {hasImage ? (
            <>
              <img src={normalizeImg(newsletter.coverImage)} alt="" aria-hidden
                className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-20 pointer-events-none" />
              <img src={normalizeImg(newsletter.coverImage)} alt={newsletter.title}
                loading="lazy" decoding="async"
                className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-700 group-hover:scale-[1.03]" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo via-[#1a1f5c] to-crimson/40 flex flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="w-12 h-0.5 bg-gold mb-2" />
              <span className="font-display font-black text-white text-2xl leading-tight">{newsletter.title}</span>
              <span className="text-gold font-mono text-xs uppercase tracking-[0.2em]">{newsletter.edition}</span>
              <div className="w-12 h-0.5 bg-gold mt-2" />
            </div>
          )}

          {/* Badges */}
          {newsletter.edition && (
            <span className="absolute top-4 left-4 bg-gold text-[#0a0e26] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
              {newsletter.edition}
            </span>
          )}
          {hasPdf && (
            <span className="absolute top-4 right-4 bg-crimson/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide backdrop-blur-sm flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Flipbook
            </span>
          )}

          {/* Hover overlay */}
          {hasPdf && (
            <div className="absolute inset-0 bg-indigo/0 group-hover:bg-indigo/70 transition-all duration-400 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="flex items-center gap-2 bg-crimson text-white text-sm font-bold px-6 py-3 rounded-full shadow-xl scale-90 group-hover:scale-100 transition-transform duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Read Flipbook
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col justify-center p-8 md:p-10 flex-grow">
          <span className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-gold uppercase tracking-[0.25em] mb-4">
            <span className="w-4 h-px bg-gold" />
            Latest Issue
          </span>
          <h2 className="font-display font-black text-white text-2xl md:text-3xl leading-tight mb-4 group-hover:text-gold transition-colors duration-300">
            {newsletter.title}
          </h2>
          {newsletter.excerpt && (
            <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">{newsletter.excerpt}</p>
          )}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-gray-500 text-xs font-mono flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {fmtDate(newsletter.month, newsletter.year)}
            </span>
          </div>
          <span className="inline-flex items-center gap-2 text-crimson font-bold text-sm group-hover:gap-3 transition-all duration-200">
            {hasPdf ? 'Read Flipbook' : 'View Issue'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/newsletter/${newsletter._id}`}
      onClick={handleClick}
      className="group flex flex-col rounded-2xl overflow-hidden border border-white/[0.07] hover:border-crimson/30 transition-all duration-300 hover:shadow-2xl hover:shadow-crimson/10 hover:-translate-y-1 cursor-pointer"
      style={{ background: 'linear-gradient(180deg, rgba(13,17,40,0.98) 0%, rgba(17,21,48,0.98) 100%)' }}
    >
      {/* Cover */}
      <div className="relative w-full overflow-hidden flex-shrink-0" style={{ aspectRatio: '3/4', maxHeight: 320 }}>
        {hasImage ? (
          <>
            <img src={normalizeImg(newsletter.coverImage)} alt="" aria-hidden
              className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-15 pointer-events-none" />
            <img src={normalizeImg(newsletter.coverImage)} alt={newsletter.title}
              loading="lazy" decoding="async"
              className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-[1.04]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d1136] via-indigo to-crimson/30 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="w-8 h-0.5 bg-gold mb-1" />
            <span className="font-display font-black text-white text-lg leading-tight line-clamp-3">{newsletter.title}</span>
            <span className="text-gold font-mono text-[10px] uppercase tracking-[0.2em]">{newsletter.edition}</span>
            <div className="w-8 h-0.5 bg-gold mt-1" />
          </div>
        )}

        {/* Edition badge */}
        {newsletter.edition && (
          <span className="absolute top-3 left-3 bg-gold text-[#0a0e26] text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-lg">
            {newsletter.edition}
          </span>
        )}
        {hasPdf && (
          <span className="absolute top-3 right-3 bg-indigo/80 border border-white/10 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide backdrop-blur-sm flex items-center gap-1">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            PDF
          </span>
        )}

        {/* Hover overlay */}
        {hasPdf && (
          <div className="absolute inset-0 bg-indigo/0 group-hover:bg-indigo/65 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="flex items-center gap-2 bg-crimson text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-xl scale-90 group-hover:scale-100 transition-transform duration-300">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Read Flipbook
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1 border-t border-white/[0.06]">
        <span className="text-gray-600 text-[10px] font-mono uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {fmtDate(newsletter.month, newsletter.year)}
        </span>
        <h3 className="font-display font-bold text-white text-[14px] leading-snug mb-4 group-hover:text-gold transition-colors duration-200 line-clamp-3 flex-grow">
          {newsletter.title}
        </h3>
        <span className="inline-flex items-center gap-1.5 text-crimson text-xs font-bold group-hover:gap-2.5 transition-all duration-200 mt-auto">
          {hasPdf ? 'Read Flipbook' : 'View Issue'}
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
};

// ── Subscribe Section ─────────────────────────────────────────────────────────
const SubscribeSection = () => {
  const [email,   setEmail]   = useState('');
  const [name,    setName]    = useState('');
  const [mobile,  setMobile]  = useState('');
  const [status,  setStatus]  = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await api.post('/subscribers/subscribe', {
        email: email.trim(), name: name.trim(), mobile: mobile.trim(),
      });
      setStatus('success');
      setMessage(res.data.message || 'Successfully subscribed!');
      setEmail(''); setName(''); setMobile('');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <section className="relative overflow-hidden bg-indigo py-20">
      {/* Bg accents */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(230,57,70,0.08) 0%, transparent 55%), radial-gradient(ellipse at 20% 50%, rgba(212,175,55,0.07) 0%, transparent 50%)' }} />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="relative z-10 container-max max-w-3xl px-4">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-gold bg-gold/10 border border-gold/20 uppercase tracking-[0.25em] px-4 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            Stay Informed
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
            Get Compliance Updates<br className="hidden md:block" /> in Your Inbox
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto">
            Monthly regulatory bulletins on BIS, WPC, TEC, CDSCO, EPR, FSSAI, CE, FCC, and IT Compliance — delivered to your email.
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-green-900/20 border border-green-500/25 rounded-2xl px-8 py-10 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center mb-2">
              <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-bold text-lg">{message}</p>
            <p className="text-gray-400 text-sm">Check your inbox for a welcome email from us.</p>
            <button onClick={() => setStatus('idle')} className="mt-3 text-xs text-gold hover:underline font-semibold">
              Subscribe another email →
            </button>
          </div>
        ) : (
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="flex-1 bg-white/[0.06] border border-white/[0.1] text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 focus:bg-white/[0.09] transition-all" />
                <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)}
                  placeholder="Mobile number (optional)"
                  className="flex-1 bg-white/[0.06] border border-white/[0.1] text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 focus:bg-white/[0.09] transition-all" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="email" required value={email}
                  onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                  placeholder="Your email address *"
                  className="flex-1 bg-white/[0.06] border border-white/[0.1] text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 focus:bg-white/[0.09] transition-all" />
                <button type="submit" disabled={status === 'loading'}
                  className="flex-shrink-0 bg-crimson hover:bg-red-600 text-white font-bold px-8 py-3 rounded-xl transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-crimson/25 hover:shadow-crimson/40 hover:-translate-y-px">
                  {status === 'loading' ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Subscribing…
                    </span>
                  ) : 'Subscribe'}
                </button>
              </div>
              {status === 'error' && <p className="text-red-400 text-sm">{message}</p>}
              <p className="text-gray-700 text-xs text-center pt-1">No spam, ever. Unsubscribe with one click anytime.</p>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

// ── NewsletterPage ────────────────────────────────────────────────────────────
const NewsletterPage = () => {
  const [flipbook, setFlipbook] = useState(null);

  const { data: newsletters = [], isLoading } = useQuery(
    'newsletters',
    () => api.get('/newsletters').then((r) => r.data)
  );

  const published = newsletters.filter((n) => n.isPublished !== false);
  const [featured, ...rest] = published;

  return (
    <>
      {flipbook && (
        <FlipbookViewer pdfUrl={flipbook.pdfLink} title={flipbook.title} onClose={() => setFlipbook(null)} />
      )}
      <Helmet>
        <title>Regulatory Compliance Bulletins | Absolute Veritas</title>
        <meta name="description" content="Monthly newsletters with regulatory insights on BIS, WPC, TEC, CDSCO, EPR, FSSAI, CE, FCC, and IT Compliance from Absolute Veritas." />
      </Helmet>

      <div className="pt-16">
        {/* ── Hero ── */}
        <div className="relative bg-indigo py-20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 15% 70%, rgba(212,175,55,0.10) 0%, transparent 50%), radial-gradient(ellipse at 85% 15%, rgba(230,57,70,0.08) 0%, transparent 45%), radial-gradient(ellipse at 50% 110%, rgba(26,31,60,0.9) 0%, transparent 55%)' }} />
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

          <div className="relative z-10 container-max text-center">
            <span className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-gold bg-gold/10 border border-gold/20 uppercase tracking-[0.25em] px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              Monthly Publications
            </span>
            <h1 className="font-display text-4xl md:text-[52px] font-black text-white mb-4 leading-[1.1] tracking-tight">
              Regulatory Compliance<br className="hidden sm:block" />
              <span className="text-gold"> Bulletins</span>
            </h1>
            <p className="text-gray-400 text-base max-w-lg mx-auto leading-relaxed">
              Monthly insights, regulatory updates, and compliance guidance from the Absolute Veritas research desk.
            </p>

            {/* Stats pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {[['📋', `${published.length || '10'}+`, 'Issues Published'], ['📅', 'Monthly', 'Frequency'], ['🔍', '15+', 'Topics Covered']].map(([icon, val, label]) => (
                <div key={label} className="flex items-center gap-2.5 bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm px-4 py-2 rounded-full">
                  <span>{icon}</span>
                  <span className="font-display text-sm font-black text-gold">{val}</span>
                  <span className="text-gray-500 text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Grid ── */}
        <section className="bg-[#080c22] py-14">
          <div className="container-max px-4">
            {isLoading ? (
              <Loader />
            ) : published.length === 0 ? (
              <div className="text-center py-24">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-5">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg font-medium mb-2">No newsletters published yet.</p>
                <p className="text-gray-600 text-sm">Check back soon for our monthly regulatory updates.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Featured first card */}
                {featured && (
                  <NewsletterCard newsletter={featured} onOpenFlipbook={setFlipbook} featured />
                )}
                {/* Rest of the cards */}
                {rest.map((nl) => (
                  <NewsletterCard key={nl._id} newsletter={nl} onOpenFlipbook={setFlipbook} />
                ))}
              </div>
            )}
          </div>
        </section>

        <SubscribeSection />
      </div>
    </>
  );
};

export default NewsletterPage;
