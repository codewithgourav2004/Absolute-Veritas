import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../utils/api';
import Loader from '../Common/Loader';
import ServiceModal from './ServiceModal';

const ServiceCategoryPanel = ({ category, onEnquire }) => {
  const [activeId, setActiveId] = useState(null);
  const [enquireService, setEnquireService] = useState(null);

  const openEnquiry = (name) => {
    if (onEnquire) onEnquire({ name });
    else setEnquireService({ name });
  };
  const [search, setSearch] = useState('');
  const contentRef = useRef(null);

  const { data: services = [], isLoading } = useQuery(
    ['services-panel', category],
    () => api.get(`/services?category=${encodeURIComponent(category)}`).then((r) => r.data)
  );

  const filtered = useMemo(
    () => services.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [services, search]
  );

  const activeService = services.find((s) => s._id === activeId) || services[0];

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeId]);

  if (isLoading) return <Loader />;

  if (services.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">No services in this category yet.</p>
        <Link to="/contact" className="text-crimson font-semibold text-sm hover:underline">
          Contact us to learn more →
        </Link>
      </div>
    );
  }

  return (
    <div
      className="flex rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
      style={{ background: 'rgba(13,17,40,0.98)', height: '620px' }}
    >
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-white/10 flex flex-col">
        {/* Sidebar header */}
        <div className="px-4 pt-4 pb-3 border-b border-white/10 flex-shrink-0">
          <p className="text-xs font-mono text-crimson uppercase tracking-widest mb-2">{category}</p>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus-within:border-crimson/50 transition-colors">
            <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-transparent text-white text-sm placeholder-gray-600 outline-none w-full"
            />
          </div>
        </div>

        {/* List — hover to select */}
        <div className="overflow-y-auto flex-grow">
          {filtered.map((service) => {
            const isActive = activeService?._id === service._id;
            return (
              <button
                key={service._id}
                onMouseEnter={() => setActiveId(service._id)}
                onClick={() => setActiveId(service._id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 border-b border-white/5 group relative ${
                  isActive ? 'bg-crimson/15 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isActive && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-crimson rounded-r" />}
                <span className="text-xl flex-shrink-0 w-8 text-center">{service.icon || '📋'}</span>
                <span className={`text-sm font-medium leading-snug flex-grow ${isActive ? 'text-white' : ''}`}>
                  {service.name}
                </span>
                <svg
                  className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${isActive ? 'text-crimson' : 'text-gray-700 group-hover:text-gray-500'}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-gray-600 text-sm">No results found</div>
          )}
        </div>
      </div>

      {/* Content panel — scrolls independently */}
      {activeService && (
        <div ref={contentRef} className="flex-grow overflow-y-auto">
          {/* Sticky header inside content */}
          <div className="sticky top-0 z-10 px-8 pt-7 pb-5 border-b border-white/8" style={{ background: 'rgba(13,17,40,0.98)' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-crimson/10 border border-crimson/20 flex items-center justify-center text-2xl flex-shrink-0">
                {activeService.icon || '📋'}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-white font-display font-bold text-lg leading-tight">{activeService.name}</h2>
                  {activeService.features?.length > 0 && (
                    <span className="flex-shrink-0 text-xs font-mono text-crimson/70 bg-crimson/10 px-2 py-0.5 rounded-full border border-crimson/20">
                      {activeService.features.length} services
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{activeService.description}</p>
              </div>
            </div>
          </div>

          {/* Features grid */}
          <div className="px-8 py-6">
            {activeService.features?.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {activeService.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-crimson/25 transition-all duration-200 group"
                  >
                    <span className="w-5 h-5 rounded-full bg-crimson/15 border border-crimson/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-gray-300 text-sm leading-snug group-hover:text-white transition-colors">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="pt-5 border-t border-white/8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => openEnquiry(activeService.name)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-crimson hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-crimson/20"
              >
                Enquire About {activeService.name.split('(')[0].trim()}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <Link
                to={`/services/${activeService.slug}`}
                className="px-5 py-2.5 text-sm font-semibold text-gray-300 border border-white/15 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
              >
                Learn More →
              </Link>
              <span className="text-gray-600 text-xs ml-auto">Response within 24 hours</span>
            </div>
          </div>
        </div>
      )}

      {enquireService && (
        <ServiceModal service={enquireService} onClose={() => setEnquireService(null)} />
      )}
    </div>
  );
};

export default ServiceCategoryPanel;
