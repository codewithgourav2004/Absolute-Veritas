import React from 'react';
import { Link } from 'react-router-dom';
import TickerTape from './TickerTape';

const Hero = () => (
  <section className="min-h-screen bg-indigo relative flex flex-col justify-center overflow-hidden">
    {/* Lightweight CSS radial gradient — no blur filter paint cost */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse at 15% 60%, rgba(230,57,70,0.08) 0%, transparent 50%), radial-gradient(ellipse at 85% 20%, rgba(212,175,55,0.06) 0%, transparent 45%)' }}
    />

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <div className="max-w-4xl hero-fade-up">
        <span className="inline-block bg-crimson/20 text-crimson border border-crimson/30 rounded-full px-4 py-1 text-sm font-mono font-medium mb-6 tracking-wider">
          India's Premier TIC Consultancy
        </span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
          Trusted TIC Partner Across{' '}
          <span className="text-crimson">India</span> &{' '}
          <span className="text-gold">12 Asian Countries</span>
        </h1>
        <p className="text-gray-300 text-xl leading-relaxed mb-10 max-w-2xl">
          15+ years of expertise in Testing, Inspection & Certification. We navigate complex regulatory landscapes so your products reach market faster.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/contact-us" className="btn-primary text-base px-8 py-4">
            Get Free Consultation
          </Link>
          <Link to="/services" className="btn-outline text-base px-8 py-4">
            Explore Services
          </Link>
        </div>

        <div className="flex gap-12 mt-14">
          {[
            { value: '1600+', label: 'Happy Clients' },
            { value: '1100+', label: 'Projects Done' },
            { value: '15+',   label: 'Years Experience' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-display text-3xl font-black text-gold">{stat.value}</div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <TickerTape />
  </section>
);

export default Hero;
