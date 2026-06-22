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
        <div className="relative bg-indigo py-16 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 15% 70%, rgba(230,57,70,0.15) 0%, transparent 50%), radial-gradient(ellipse at 85% 20%, rgba(212,175,55,0.10) 0%, transparent 45%), radial-gradient(ellipse at 50% 100%, rgba(26,31,60,0.8) 0%, transparent 60%)' }} />
          {/* Dot grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="relative z-10 container-max">
            <span className="inline-block text-xs font-mono font-semibold text-crimson bg-crimson/10 border border-crimson/25 uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-5">
              TIC &amp; IT Compliance
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-black text-white mb-4 leading-tight">Our Services</h1>
            <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              End-to-end regulatory compliance across certifications, testing, inspection and IT security.
            </p>
            {/* Quick stats */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {[['15+', 'Bodies Covered'], ['50+', 'Service Types'], ['24h', 'Response Time']].map(([val, label]) => (
                <div key={label} className="text-center">
                  <div className="font-display text-xl font-black text-gold">{val}</div>
                  <div className="text-gray-500 text-xs mt-0.5 tracking-wide">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky tab bar */}
        <div className={`sticky top-16 z-20 border-b transition-colors duration-300 ${isDark ? 'bg-[#0d1128]/95 border-white/10 backdrop-blur-sm' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="container-max">
            <div className="flex flex-wrap justify-center gap-1.5 py-3">
              {ALL_TABS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-crimson text-white shadow-lg shadow-crimson/25'
                      : isDark
                      ? 'text-gray-400 border border-white/8 bg-white/[0.03] hover:bg-white/10 hover:text-white hover:border-white/20'
                      : 'text-steel border border-gray-200 hover:bg-indigo hover:text-white hover:border-indigo'
                  }`}
                >
                  <span className="text-sm">{TAB_ICONS[cat] || '📋'}</span>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <section className={`transition-colors duration-300 ${isDark ? 'bg-indigo' : 'bg-pearl'}`}>
          <div className="container-max section-padding">
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
                    <p className="text-steel text-sm">
                      Showing <span className="font-semibold text-indigo">{services.length}</span> services
                    </p>
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
