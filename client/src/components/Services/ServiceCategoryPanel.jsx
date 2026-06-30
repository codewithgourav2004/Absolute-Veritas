import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../utils/api';
import Loader from '../Common/Loader';
import ServiceModal from './ServiceModal';

const ServiceCategoryPanel = ({ category, onEnquire }) => {
  const [activeId,       setActiveId]       = useState(null);
  const [enquireService, setEnquireService] = useState(null);
  const [search,         setSearch]         = useState('');
  const contentRef = useRef(null);

  const openEnquiry = (name) => {
    if (onEnquire) onEnquire({ name });
    else setEnquireService({ name });
  };

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
      className="flex rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
      style={{ background: 'linear-gradient(135deg, rgba(11,15,36,0.99) 0%, rgba(17,21,48,0.99) 100%)', height: '640px' }}
    >
      {/* ── Sidebar ── */}
      <div className="w-[268px] flex-shrink-0 border-r border-white/[0.07] flex flex-col" style={{ background: 'rgba(8,11,30,0.6)' }}>
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-white/[0.07] flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-4 bg-crimson rounded-full" />
            <p className="text-[10px] font-mono font-bold text-crimson uppercase tracking-[0.2em]">{category}</p>
          </div>
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 focus-within:border-crimson/40 focus-within:bg-white/[0.06] transition-all duration-200">
            <svg className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-transparent text-white text-sm placeholder-gray-700 outline-none w-full"
            />
          </div>
        </div>

        {/* Service list */}
        <div className="overflow-y-auto flex-grow py-1">
          {filtered.map((service) => {
            const isActive = activeService?._id === service._id;
            return (
              <button
                key={service._id}
                onMouseEnter={() => setActiveId(service._id)}
                onClick={() => setActiveId(service._id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-crimson/20 to-crimson/5 text-white'
                    : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-200'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-crimson rounded-r-full" />
                )}
                <span className="text-xl flex-shrink-0 w-8 text-center leading-none">{service.icon || '📋'}</span>
                <span className={`text-[13px] font-medium leading-snug flex-grow truncate ${isActive ? 'text-white' : ''}`}>
                  {service.name}
                </span>
                <svg
                  className={`w-3 h-3 flex-shrink-0 transition-colors ${isActive ? 'text-crimson/60' : 'text-gray-700 group-hover:text-gray-500'}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-gray-700 text-sm">No results found</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/[0.07] flex-shrink-0">
          <p className="text-[10px] text-gray-700 text-center font-mono">{services.length} services</p>
        </div>
      </div>

      {/* ── Content panel ── */}
      {activeService && (
        <div ref={contentRef} className="flex-grow overflow-y-auto">
          {/* Sticky header */}
          <div
            className="sticky top-0 z-10 px-7 pt-6 pb-5 border-b border-white/[0.07]"
            style={{ background: 'linear-gradient(180deg, rgba(11,15,36,0.99) 85%, rgba(11,15,36,0) 100%)' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-crimson/20 to-crimson/5 border border-crimson/25 flex items-center justify-center text-2xl flex-shrink-0">
                {activeService.icon || '📋'}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                  <h2 className="text-white font-display font-bold text-lg leading-tight">{activeService.name}</h2>
                  {activeService.features?.length > 0 && (
                    <span className="text-[10px] font-mono text-crimson/80 bg-crimson/10 px-2 py-0.5 rounded-full border border-crimson/20">
                      {activeService.features.length} features
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{activeService.description}</p>
              </div>
            </div>
          </div>

          {/* Features grid */}
          <div className="px-7 py-6">
            {activeService.features?.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-3">Features & Scope</p>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {activeService.features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3.5 rounded-xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.055] hover:border-crimson/20 transition-all duration-200 group"
                    >
                      <span className="w-5 h-5 rounded-full bg-crimson/15 border border-crimson/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-2.5 h-2.5 text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-gray-400 text-sm leading-snug group-hover:text-gray-200 transition-colors">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="pt-5 border-t border-white/[0.07] flex flex-wrap items-center gap-3">
              <button
                onClick={() => openEnquiry(activeService.name)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-crimson hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-crimson/25 hover:shadow-crimson/40 hover:-translate-y-px"
              >
                Enquire About {activeService.name.split('(')[0].trim()}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <Link
                to={`/services/${activeService.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-300 border border-white/[0.12] rounded-xl hover:bg-white/10 hover:text-white hover:border-white/25 transition-all hover:-translate-y-px"
              >
                Learn More →
              </Link>
              <span className="text-gray-700 text-xs font-mono ml-auto">Response within 24 hours</span>
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
