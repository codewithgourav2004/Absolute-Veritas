import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../../utils/constants';
import MobileMenu from './MobileMenu';
import api from '../../utils/api';

// ── Compact subscribe modal ───────────────────────────────────────────────────
const SubscribeModal = ({ onClose }) => {
  const [name,    setName]    = useState('');
  const [mobile,  setMobile]  = useState('');
  const [email,   setEmail]   = useState('');
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
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-indigo rounded-2xl shadow-2xl w-full max-w-md p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <span className="inline-block text-xs font-mono font-semibold tracking-[0.2em] uppercase text-gold bg-gold/10 border border-gold/20 px-3 py-1 rounded-full mb-4">
          Stay Informed
        </span>
        <h2 className="font-display font-black text-white text-2xl mb-1 leading-tight">
          Get Compliance Updates in Your Inbox
        </h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Monthly bulletins on BIS, WPC, TEC, CDSCO, EPR, FSSAI, CE, FCC, and IT Compliance.
        </p>

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold">{message}</p>
            <p className="text-gray-400 text-sm">Check your inbox for a welcome email.</p>
            <button onClick={onClose} className="mt-2 text-xs text-gold hover:underline font-medium">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-3">
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="flex-1 bg-white/10 border border-white/15 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
              />
              <input
                type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)}
                placeholder="Mobile (optional)"
                className="flex-1 bg-white/10 border border-white/15 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <input
                type="email" value={email} onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                placeholder="Your email address *"
                required
                className="flex-1 bg-white/10 border border-white/15 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
              />
              <button
                type="submit" disabled={status === 'loading'}
                className="flex-shrink-0 bg-crimson hover:bg-crimson/90 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
              >
                {status === 'loading' ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                ) : 'Subscribe'}
              </button>
            </div>
            {status === 'error' && (
              <p className="text-crimson/90 text-xs font-medium">{message}</p>
            )}
            <p className="text-gray-500 text-xs">No spam, ever. Unsubscribe with one click anytime.</p>
          </form>
        )}
      </div>
    </div>
  );
};

const Navbar = () => {
  const [scrolled,       setScrolled]       = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [openMenu,       setOpenMenu]       = useState(null);
  const [subscribeOpen,  setSubscribeOpen]  = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-indigo shadow-xl' : 'bg-indigo/95'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display font-bold text-xl text-white">
            Absolute <span className="text-crimson">Veritas</span>
          </span>
        </Link>

        <ul className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) =>
            link.children ? (
              <li
                key={link.label}
                className="relative"
                onMouseEnter={() => setOpenMenu(link.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button className="text-white/90 hover:text-white font-medium flex items-center gap-1 py-4">
                  {link.label} <span className="text-xs">▾</span>
                </button>

                <div className={`absolute top-full left-0 mt-0 bg-white rounded-lg shadow-2xl py-2 w-52 transition-all duration-200 ${
                  openMenu === link.label ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}>
                  {link.children.map((child) => (
                    <Link
                      key={child.label}
                      to={child.path}
                      onClick={() => setOpenMenu(null)}
                      className="block px-4 py-2 text-indigo hover:bg-pearl hover:text-crimson font-medium text-sm"
                    >
                      {child.label}
                    </Link>
                  ))}
                  {/* "All Services" footer only for Services dropdown */}
                  {link.label === 'Services' && (
                    <Link
                      to="/services"
                      onClick={() => setOpenMenu(null)}
                      className="block px-4 py-2 text-crimson font-semibold text-sm border-t mt-1"
                    >
                      All Services →
                    </Link>
                  )}
                  {/* Subscribe CTA for Knowledge dropdown */}
                  {link.label === 'Knowledge' && (
                    <button
                      onClick={() => { setOpenMenu(null); setSubscribeOpen(true); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-crimson font-semibold text-sm border-t mt-1 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Subscribe to Newsletter
                    </button>
                  )}
                </div>
              </li>
            ) : (
              <li key={link.label}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `font-medium transition-colors ${isActive ? 'text-gold' : 'text-white/90 hover:text-white'}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            )
          )}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/contact-us" className="btn-primary text-sm py-2 px-4">Get Quote</Link>
        </div>

        <button
          className="lg:hidden text-white p-2"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} links={NAV_LINKS} onSubscribe={() => setSubscribeOpen(true)} />
    </header>

    {subscribeOpen && <SubscribeModal onClose={() => setSubscribeOpen(false)} />}
  </>
  );
};

export default Navbar;
