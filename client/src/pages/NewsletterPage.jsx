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
  const d = new Date(year, MONTH_IDX[month] ?? 0, 1);
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ── Newsletter Card ───────────────────────────────────────────────────────────
const NewsletterCard = ({ newsletter, onOpenFlipbook }) => {
  const hasImage = Boolean(newsletter.coverImage);
  const hasPdf   = Boolean(newsletter.pdfLink);

  const handleClick = (e) => {
    if (hasPdf) {
      e.preventDefault();
      onOpenFlipbook(newsletter);
    }
  };

  return (
    <Link
      to={`/newsletter/${newsletter._id}`}
      onClick={handleClick}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
    >
      {/* Cover image — portrait ratio fits PDF covers without cropping */}
      <div className="relative w-full flex-shrink-0 overflow-hidden border-b border-gray-100"
           style={{ aspectRatio: '3/4' }}>
        {hasImage ? (
          <img
            src={normalizeImg(newsletter.coverImage)}
            alt={newsletter.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-contain object-center bg-[#f8f7f4] transition-opacity duration-300 group-hover:opacity-90"
          />
        ) : (
          <div className="absolute inset-0 bg-indigo flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="w-10 h-0.5 bg-gold mb-1" />
            <span className="font-display font-black text-white text-xl leading-tight line-clamp-2">
              {newsletter.title}
            </span>
            <span className="text-gold font-mono text-xs uppercase tracking-[0.2em]">
              {newsletter.edition}
            </span>
            <div className="w-10 h-0.5 bg-gold mt-1" />
          </div>
        )}

        {/* Flipbook hover overlay */}
        {hasPdf && (
          <div className="absolute inset-0 bg-indigo/0 group-hover:bg-indigo/60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="flex items-center gap-2 bg-crimson text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Read Flipbook
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 text-xs text-steel mb-2.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {fmtDate(newsletter.month, newsletter.year)}
        </div>

        <h3 className="font-bold text-indigo text-[15px] leading-snug mb-4 group-hover:text-crimson transition-colors duration-200 line-clamp-3">
          {newsletter.title}
        </h3>

        <div className="mt-auto">
          <span className="text-sm text-crimson font-semibold group-hover:underline inline-flex items-center gap-1">
            {hasPdf ? 'Read Flipbook' : 'View newsletter'}
            <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

// ── Subscribe Section ─────────────────────────────────────────────────────────
const SubscribeSection = () => {
  const [email,   setEmail]   = useState('');
  const [name,    setName]    = useState('');
  const [mobile,  setMobile]  = useState('');
  const [status,  setStatus]  = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await api.post('/subscribers/subscribe', {
        email:  email.trim(),
        name:   name.trim(),
        mobile: mobile.trim(),
      });
      setStatus('success');
      setMessage(res.data.message || 'Successfully subscribed!');
      setEmail('');
      setName('');
      setMobile('');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <section className="bg-indigo py-16">
      <div className="container-max max-w-2xl px-4 text-center">
        <span className="inline-block text-xs font-mono font-semibold tracking-[0.2em] uppercase text-gold bg-gold/10 border border-gold/20 px-4 py-1.5 rounded-full mb-5">
          Stay Informed
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-3">
          Get Compliance Updates in Your Inbox
        </h2>
        <p className="text-gray-400 text-base mb-8 leading-relaxed">
          Subscribe to receive our monthly regulatory bulletins on BIS, WPC, TEC, CDSCO, EPR, FSSAI, CE, FCC, and IT Compliance — delivered straight to your email.
        </p>

        {status === 'success' ? (
          <div className="bg-green-900/30 border border-green-500/30 rounded-2xl px-8 py-8 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold text-lg">{message}</p>
            <p className="text-gray-400 text-sm">Check your inbox for a welcome email from us.</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-2 text-xs text-gold hover:underline font-medium"
            >
              Subscribe another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Row 1: Name + Mobile */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="flex-1 bg-white/10 border border-white/15 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
              />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Mobile number (optional)"
                className="flex-1 bg-white/10 border border-white/15 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
              />
            </div>

            {/* Row 2: Email + Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                placeholder="Your email address *"
                className="flex-1 bg-white/10 border border-white/15 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex-shrink-0 bg-crimson hover:bg-red-600 text-white font-bold px-8 py-3 rounded-xl transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
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

            {status === 'error' && (
              <p className="text-red-400 text-sm">{message}</p>
            )}
            <p className="text-gray-600 text-xs">No spam, ever. Unsubscribe with one click anytime.</p>
          </form>
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

  return (
    <>
      {flipbook && (
        <FlipbookViewer
          pdfUrl={flipbook.pdfLink}
          title={flipbook.title}
          onClose={() => setFlipbook(null)}
        />
      )}
      <Helmet>
        <title>Regulatory Compliance Bulletins | Absolute Veritas</title>
        <meta name="description" content="Monthly newsletters with regulatory insights on BIS, WPC, TEC, CDSCO, EPR, FSSAI, CE, FCC, and IT Compliance from Absolute Veritas." />
      </Helmet>

      <div className="pt-16">
        {/* Hero */}
        <div className="relative bg-indigo py-14 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 20% 80%, rgba(212,175,55,0.10) 0%, transparent 50%), radial-gradient(ellipse at 80% 10%, rgba(230,57,70,0.08) 0%, transparent 45%)',
            }}
          />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>

          <div className="relative z-10 container-max text-center">
            <span className="inline-block text-xs font-mono text-gold uppercase tracking-[0.25em] mb-3">
              Monthly Publications
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
              Regulatory Compliance Bulletins
            </h1>
            <p className="text-gray-400 text-base max-w-lg mx-auto">
              Monthly insights, regulatory updates, and compliance guidance from the Absolute Veritas research desk.
            </p>
          </div>
        </div>

        {/* Newsletters grid */}
        <section className="bg-pearl section-padding">
          <div className="container-max">
            {isLoading ? (
              <Loader />
            ) : newsletters.length === 0 ? (
              <div className="text-center py-24">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo/10 mb-5">
                  <svg className="w-8 h-8 text-indigo/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-steel text-lg font-medium mb-2">No newsletters published yet.</p>
                <p className="text-steel/60 text-sm">Check back soon for our monthly regulatory updates.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsletters.map((nl) => (
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
