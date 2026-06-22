import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-indigo text-white pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Top divider accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-crimson/50 to-transparent mb-12" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

        {/* Brand + Contact */}
        <div className="lg:col-span-1">
          <div className="font-display font-black text-2xl mb-2">
            Absolute <span className="text-crimson">Veritas</span>
          </div>
          <p className="text-xs font-mono tracking-widest uppercase text-gold/70 mb-5">
            TIC &amp; IT Compliance Consultancy
          </p>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            India's premier Testing, Inspection &amp; Certification consultancy. 15+ years of regulatory excellence across India and 12 Asian countries.
          </p>

          {/* Contact block */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold tracking-[0.2em] uppercase text-white/50 mb-3">Contact</h4>

            <a href="https://maps.google.com/?q=31A,Molar+Band+Extension,South+Delhi" target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-3 text-sm text-gray-400 hover:text-white transition-colors group">
              <span className="w-7 h-7 rounded-lg bg-white/6 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-crimson/15 group-hover:border-crimson/25 transition-colors">
                <svg className="w-3.5 h-3.5 text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <span>31A, Molar Band Extension,<br />South Delhi, India – 110044</span>
            </a>

            <a href="mailto:cs@absoluteveritas.com"
              className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors group">
              <span className="w-7 h-7 rounded-lg bg-white/6 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-crimson/15 group-hover:border-crimson/25 transition-colors">
                <svg className="w-3.5 h-3.5 text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              cs@absoluteveritas.com
            </a>

            <a href="tel:01294001010"
              className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors group">
              <span className="w-7 h-7 rounded-lg bg-white/6 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-crimson/15 group-hover:border-crimson/25 transition-colors">
                <svg className="w-3.5 h-3.5 text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
              0129-4001010
            </a>

            <a href="tel:+917303215033"
              className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors group">
              <span className="w-7 h-7 rounded-lg bg-white/6 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-crimson/15 group-hover:border-crimson/25 transition-colors">
                <svg className="w-3.5 h-3.5 text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </span>
              +91-7303215033
            </a>
          </div>
        </div>

        {/* Certifications */}
        <div>
          <h4 className="font-display font-bold text-white mb-5 text-sm tracking-wide">Certifications</h4>
          <ul className="space-y-2.5 text-sm text-gray-400">
            {[
              'BIS ISI Mark / CRS',
              'WPC Type Approval',
              'TEC Certification',
              'CDSCO Medical Device',
              'EPR Registration',
              'FSSAI License',
              'CE Marking',
              'FCC Authorization',
            ].map((s) => (
              <li key={s}>
                <Link to="/services?category=Certification" className="hover:text-gold transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-crimson/50 group-hover:bg-gold transition-colors flex-shrink-0" />
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Testing & Inspection */}
        <div>
          <h4 className="font-display font-bold text-white mb-5 text-sm tracking-wide">Testing &amp; Inspection</h4>
          <ul className="space-y-2.5 text-sm text-gray-400">
            {[
              'Safety Test (BIS)',
              'EMC Test (TEC)',
              'RF Test (WPC)',
              'IP Rating Test',
              'RoHS / REACH',
              'Pre-Shipment Inspection',
              'Factory Audit',
              'Lab Testing Coordination',
            ].map((s) => (
              <li key={s}>
                <Link to="/services?category=Testing" className="hover:text-gold transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-crimson/50 group-hover:bg-gold transition-colors flex-shrink-0" />
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* IT Compliance + Quick Links */}
        <div>
          <h4 className="font-display font-bold text-white mb-5 text-sm tracking-wide">IT Compliance</h4>
          <ul className="space-y-2.5 text-sm text-gray-400 mb-8">
            {[
              'ISO 27001 Audit',
              'VAPT Testing',
              'Cyber Security',
              'Payment Security',
              'Risk Management',
              'IT Compliance Audit',
            ].map((s) => (
              <li key={s}>
                <Link to="/services?category=IT+Compliance" className="hover:text-gold transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-crimson/50 group-hover:bg-gold transition-colors flex-shrink-0" />
                  {s}
                </Link>
              </li>
            ))}
          </ul>

          <h4 className="font-display font-bold text-white mb-4 text-sm tracking-wide">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            {[['About Us', '/about-us'], ['Our Services', '/services'], ['Blog', '/blog'], ['Contact Us', '/contact-us']].map(([label, path]) => (
              <li key={label}>
                <Link to={path} className="hover:text-gold transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-crimson/50 group-hover:bg-gold transition-colors flex-shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Absolute Veritas. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
          <a href="mailto:complaints@absoluteveritas.com" className="hover:text-white transition-colors">Complaints</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
