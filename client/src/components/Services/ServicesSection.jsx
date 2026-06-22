import React, { useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SERVICE_CATEGORIES } from '../../utils/constants';
import ServiceModal from './ServiceModal';

const CertificationsPanel  = lazy(() => import('./CertificationsPanel'));
const TestingPanel         = lazy(() => import('./TestingPanel'));
const InspectionPanel      = lazy(() => import('./InspectionPanel'));
const ServiceCategoryPanel = lazy(() => import('./ServiceCategoryPanel'));

const TAB_ICONS = {
  Certification:  '🏛️',
  Testing:        '🔬',
  Inspection:     '🔍',
  'IT Compliance':'🔐',
  Others:         '📋',
};

const ServicesSection = () => {
  const [hoveredTab,      setHoveredTab]      = useState(null);
  const [activePanel,     setActivePanel]     = useState(null); // tracks last hovered for rendering
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();

  const handleMouseEnter = (cat) => {
    setHoveredTab(cat);
    setActivePanel(cat);
  };

  const handleMouseLeave = () => {
    setHoveredTab(null);
  };

  const isOpen = hoveredTab !== null;

  return (
    <section className="bg-indigo" id="services">
      {/* Section header */}
      <div className="section-padding pb-0">
        <div className="container-max">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-mono font-semibold tracking-[0.2em] uppercase text-crimson bg-crimson/10 border border-crimson/20 px-4 py-1.5 rounded-full mb-5">
              What We Do
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-3">
              Comprehensive TIC &amp; Compliance Services
            </h2>
            <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
              From BIS certification to IT compliance audits — one trusted partner for all your regulatory needs.
            </p>
          </div>

          {/* Hover zone: tabs + panel share the same leave boundary */}
          <div onMouseLeave={handleMouseLeave}>

            {/* Tab bar */}
            <div className="flex flex-wrap justify-center gap-2 pb-8">
              {SERVICE_CATEGORIES.map((cat) => {
                const isActive = hoveredTab === cat;
                return (
                  <button
                    key={cat}
                    onMouseEnter={() => handleMouseEnter(cat)}
                    onClick={() => navigate(`/services?category=${encodeURIComponent(cat)}`)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-crimson text-white shadow-lg shadow-crimson/30 scale-[1.03]'
                        : 'text-gray-400 border border-white/10 bg-white/[0.04] hover:bg-white/10 hover:text-white hover:border-white/25'
                    }`}
                  >
                    <span className="text-base">{TAB_ICONS[cat] || '📋'}</span>
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Panel — animates in/out with max-height + opacity */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-[700px] opacity-100 pb-12' : 'max-h-0 opacity-0 pb-0'
              }`}
            >
              <Suspense fallback={
                <div className="h-96 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                {activePanel === 'Certification' ? (
                  <CertificationsPanel onEnquire={setSelectedService} />
                ) : activePanel === 'Testing' ? (
                  <TestingPanel onEnquire={setSelectedService} />
                ) : activePanel === 'Inspection' ? (
                  <InspectionPanel onEnquire={setSelectedService} />
                ) : activePanel ? (
                  <ServiceCategoryPanel key={activePanel} category={activePanel} />
                ) : null}
              </Suspense>
            </div>

          </div>{/* end hover zone */}
        </div>
      </div>

      {/* Footer link */}
      <div className="text-center pb-12">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white border border-white/10 hover:border-white/30 px-6 py-2.5 rounded-xl transition-all duration-200 hover:bg-white/5"
        >
          Explore all services
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
