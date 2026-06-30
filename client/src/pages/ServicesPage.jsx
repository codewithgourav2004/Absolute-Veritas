import React, { useState, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../utils/api';
import { SERVICE_CATEGORIES } from '../utils/constants';
import ServiceCard from '../components/Services/ServiceCard';
import ServiceModal from '../components/Services/ServiceModal';
import Loader from '../components/Common/Loader';

const TAB_ICONS = {
  Certification:  '🏛️',
  Testing:        '🔬',
  Inspection:     '🔍',
  'IT Compliance':'🔐',
  Others:         '📋',
  All:            '✦',
};

const ServiceGroupPanel    = lazy(() => import('../components/Services/ServiceGroupPanel'));
const ServiceCategoryPanel = lazy(() => import('../components/Services/ServiceCategoryPanel'));

const ALL_TABS = ['Certification', ...SERVICE_CATEGORIES.filter((c) => c !== 'Certification'), 'All'];
const PANEL_TABS = new Set(['Certification', 'Testing', 'Inspection', 'IT Compliance', 'Others']);

const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedService, setSelectedService] = useState(null);
  const activeCategory = searchParams.get('category') || 'Certification';
  const isDark = PANEL_TABS.has(activeCategory);

  const { data: services = [], isLoading } = useQuery(
    ['services-all', activeCategory],
    () => {
      const url = activeCategory === 'All' ? '/services' : `/services?category=${encodeURIComponent(activeCategory)}`;
      return api.get(url).then((r) => r.data);
    },
    { enabled: activeCategory === 'All' }
  );

  const setCategory = (cat) => {
    searchParams.set('category', cat);
    setSearchParams(searchParams);
  };

  return (
    <>
      <Helmet>
        <title>Our Services | Absolute Veritas</title>
        <meta name="description" content="Comprehensive TIC & IT Compliance services — BIS, WPC, TEC, CDSCO, CE, FCC and more." />
      </Helmet>

      <div className="pt-16">
        {/* Hero */}
        <div className="relative bg-indigo py-20 text-center overflow-hidden">
          {/* Layered gradients */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 10% 80%, rgba(230,57,70,0.18) 0%, transparent 45%), radial-gradient(ellipse at 90% 15%, rgba(212,175,55,0.12) 0%, transparent 45%), radial-gradient(ellipse at 50% 110%, rgba(26,31,60,0.9) 0%, transparent 55%)' }} />
          {/* Dot grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          {/* Horizontal glow line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-crimson/30 to-transparent" />

          <div className="relative z-10 container-max">
            <span className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-crimson bg-crimson/10 border border-crimson/25 uppercase tracking-[0.25em] px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />
              TIC &amp; IT Compliance
            </span>
            <h1 className="font-display text-4xl md:text-[52px] font-black text-white mb-4 leading-[1.1] tracking-tight">
              Our Services
            </h1>
            <p className="text-gray-400 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
              End-to-end regulatory compliance across certifications, testing, inspection and IT security.
            </p>

            {/* Stat pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {[['15+', 'Regulatory Bodies'], ['50+', 'Service Types'], ['24h', 'Response Time'], ['500+', 'Clients Served']].map(([val, label]) => (
                <div key={label} className="flex items-center gap-3 bg-white/[0.05] border border-white/[0.1] backdrop-blur-sm px-5 py-2.5 rounded-full">
                  <span className="font-display text-lg font-black text-gold leading-none">{val}</span>
                  <span className="text-gray-500 text-xs tracking-wide">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky tab bar */}
        <div className={`sticky top-16 z-20 border-b transition-colors duration-300 ${isDark ? 'bg-[#0a0e26]/96 border-white/[0.07] backdrop-blur-md' : 'bg-white/95 border-gray-200/80 backdrop-blur-sm shadow-sm'}`}>
          <div className="container-max">
            <div className="flex flex-wrap justify-center gap-1.5 py-3">
              {ALL_TABS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-crimson text-white shadow-lg shadow-crimson/30 scale-[1.02]'
                      : isDark
                      ? 'text-gray-400 border border-white/10 bg-white/[0.02] hover:bg-crimson/15 hover:text-crimson hover:border-crimson/30'
                      : 'text-gray-600 border border-gray-200 hover:bg-crimson/10 hover:text-crimson hover:border-crimson/30 hover:shadow-sm'
                  }`}
                >
                  <span>{TAB_ICONS[cat] || '📋'}</span>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <section className={`transition-colors duration-300 ${isDark ? 'bg-indigo' : 'bg-pearl'}`}>
          <div className={`container-max ${isDark ? 'py-8 md:py-10' : 'section-padding'}`}>
            <Suspense fallback={<Loader />}>
              {(activeCategory === 'Certification' || activeCategory === 'Testing' || activeCategory === 'Inspection' || activeCategory === 'IT Compliance') ? (
                <ServiceGroupPanel key={activeCategory} category={activeCategory} onEnquire={setSelectedService} />
              ) : PANEL_TABS.has(activeCategory) ? (
                <ServiceCategoryPanel key={activeCategory} category={activeCategory} onEnquire={setSelectedService} />
              ) : isLoading ? (
                <Loader />
              ) : services.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-steel text-lg mb-2">No services found.</p>
                  <p className="text-gray-400 text-sm">Check back soon or contact us for a custom solution.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-display font-bold text-indigo text-xl mb-0.5">All Services</h2>
                      <p className="text-gray-500 text-sm">
                        <span className="font-semibold text-crimson">{services.length}</span> services available
                      </p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {services.map((s) => (
                      <ServiceCard key={s._id} service={s} onEnquire={setSelectedService} />
                    ))}
                  </div>
                </>
              )}
            </Suspense>
          </div>
        </section>
      </div>

      {selectedService && (
        <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />
      )}
    </>
  );
};

export default ServicesPage;
