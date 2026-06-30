import React, { useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SERVICE_CATEGORIES } from '../../utils/constants';
import ServiceModal from './ServiceModal';

const ServiceGroupPanel    = lazy(() => import('./ServiceGroupPanel'));
const ServiceCategoryPanel = lazy(() => import('./ServiceCategoryPanel'));

const PANEL_TABS = new Set(['Certification', 'Testing', 'Inspection', 'IT Compliance']);

const CATEGORY_META = {
  Certification: {
    icon: '🏛️',
    color: '#1a3a8c',
    tagline: 'BIS, WPC, TEC, CDSCO, FSSAI & more',
    stat: '15+',
    statLabel: 'Bodies',
  },
  Testing: {
    icon: '🔬',
    color: '#15803d',
    tagline: 'Safety, EMC, RF, Chemical & Performance',
    stat: '50+',
    statLabel: 'Test Types',
  },
  Inspection: {
    icon: '🔍',
    color: '#b45309',
    tagline: 'Factory, Pre-shipment & Surveillance',
    stat: '10+',
    statLabel: 'Schemes',
  },
  'IT Compliance': {
    icon: '🔐',
    color: '#7e22ce',
    tagline: 'VAPT, ISO 27001, CERT-In & SOC',
    stat: '8+',
    statLabel: 'Frameworks',
  },
  Others: {
    icon: '📋',
    color: '#0e7490',
    tagline: 'EPR, DGCA Drone, PESO, DGFT & more',
    stat: '20+',
    statLabel: 'Services',
  },
};

const ServicesSection = () => {
  const [activePanel,     setActivePanel]     = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();

  const togglePanel = (cat) => {
    setActivePanel((prev) => (prev === cat ? null : cat));
  };

  return (
    <section className="bg-indigo" id="services">
      {/* Section header */}
      <div className="section-padding pb-0">
        <div className="container-max">

          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-[10px] font-mono font-bold tracking-[0.25em] uppercase text-crimson bg-crimson/10 border border-crimson/20 px-4 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />
              What We Do
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4 leading-[1.1]">
              Comprehensive TIC &amp; Compliance
            </h2>
            <p className="text-gray-400 text-base max-w-lg mx-auto leading-relaxed">
              From BIS certification to IT compliance audits — one trusted partner for all your regulatory needs.
            </p>
          </div>

          {/* Category cards — always visible, click to expand panel */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {SERVICE_CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat] || { icon: '📋', color: '#374151', tagline: '', stat: '', statLabel: '' };
              const isActive = activePanel === cat;
              return (
                <button
                  key={cat}
                  onClick={() => togglePanel(cat)}
                  className={`relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-250 group overflow-hidden ${
                    isActive
                      ? 'border-crimson/40 bg-crimson/10 shadow-lg shadow-crimson/15 scale-[1.02]'
                      : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 hover:scale-[1.01]'
                  }`}
                >
                  {/* Background glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(circle at 30% 30%, ${meta.color}18 0%, transparent 70%)` }}
                  />
                  {isActive && (
                    <div
                      className="absolute inset-0 pointer-events-none rounded-2xl"
                      style={{ background: `radial-gradient(circle at 30% 30%, ${meta.color}25 0%, transparent 65%)` }}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 transition-all duration-200 ${isActive ? 'scale-105' : ''}`}
                    style={{ background: `${meta.color}25`, border: `1px solid ${meta.color}40` }}
                  >
                    {meta.icon}
                  </div>

                  <p className={`relative font-semibold text-[13px] leading-snug mb-1 transition-colors ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                    {cat}
                  </p>
                  <p className="relative text-[10px] text-gray-600 leading-relaxed line-clamp-2 flex-grow">
                    {meta.tagline}
                  </p>

                  {/* Stat pill */}
                  {meta.stat && (
                    <div className="relative flex items-center gap-1.5 mt-3">
                      <span className="font-display font-black text-sm" style={{ color: meta.color === '#1a3a8c' ? '#60a5fa' : meta.color === '#15803d' ? '#4ade80' : meta.color === '#b45309' ? '#fbbf24' : meta.color === '#7e22ce' ? '#c084fc' : '#22d3ee' }}>
                        {meta.stat}
                      </span>
                      <span className="text-[10px] text-gray-600">{meta.statLabel}</span>
                    </div>
                  )}

                  {/* Active indicator arrow */}
                  {isActive && (
                    <div className="absolute top-3 right-3">
                      <svg className="w-4 h-4 text-crimson rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Expandable panel */}
          <div
            className={`overflow-hidden transition-all duration-400 ease-in-out ${
              activePanel ? 'max-h-[700px] opacity-100 mb-10' : 'max-h-0 opacity-0 mb-0'
            }`}
            style={{ transitionDuration: '350ms' }}
          >
            <Suspense fallback={
              <div
                className="flex rounded-2xl items-center justify-center"
                style={{ background: 'rgba(11,15,36,0.99)', height: 640, border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="w-7 h-7 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              {activePanel && (
                PANEL_TABS.has(activePanel) ? (
                  <ServiceGroupPanel key={activePanel} category={activePanel} onEnquire={setSelectedService} />
                ) : (
                  <ServiceCategoryPanel key={activePanel} category={activePanel} onEnquire={setSelectedService} />
                )
              )}
            </Suspense>
          </div>

        </div>
      </div>

      {/* Footer CTA */}
      <div className="text-center pb-14 pt-2">
        <Link
          to="/services"
          className="inline-flex items-center gap-2.5 text-sm font-semibold text-gray-400 hover:text-white border border-white/[0.1] hover:border-white/25 px-7 py-3 rounded-xl transition-all duration-200 hover:bg-white/[0.05] group"
        >
          Explore all services
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {selectedService && (
        <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />
      )}
    </section>
  );
};

export default ServicesSection;
