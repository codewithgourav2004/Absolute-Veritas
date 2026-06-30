import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../utils/api';
import ServiceModal from './ServiceModal';
import Loader from '../Common/Loader';

// ── Official certification body marks ─────────────────────────────────────────
const AUTHORITY_MARKS = [
  { match: ['BIS', 'Bureau of Indian Standards'],              abbr: 'BIS',   bg: '#1a3a8c' },
  { match: ['BEE', 'Bureau of Energy Efficiency'],             abbr: 'BEE',   bg: '#b45309' },
  { match: ['WPC', 'Wireless Planning'],                       abbr: 'WPC',   bg: '#15803d' },
  { match: ['TEC', 'Telecommunication Engineering'],           abbr: 'TEC',   bg: '#1d4ed8' },
  { match: ['STQC', 'Standardisation Testing'],               abbr: 'STQC',  bg: '#7e22ce' },
  { match: ['CE Marking', 'CE Mark', '(Europe)'],             abbr: 'CE',    bg: '#003399' },
  { match: ['FCC', '(USA)'],                                   abbr: 'FCC',   bg: '#b91c1c' },
  { match: ['UKCA', '(UK)'],                                   abbr: 'UKCA',  bg: '#00247d' },
  { match: ['CDSCO', 'Central Drugs Standard'],                abbr: 'CDSCO', bg: '#0e7490' },
  { match: ['FSSAI', 'Food Safety'],                           abbr: 'FSSAI', bg: '#c2410c' },
  { match: ['PESO', 'Petroleum and Explosives'],               abbr: 'PESO',  bg: '#991b1b' },
  { match: ['DGFT', 'Directorate General of Foreign Trade'],   abbr: 'DGFT',  bg: '#14532d' },
  { match: ['ARAI', 'Automotive Research'],                    abbr: 'ARAI',  bg: '#1e40af' },
  { match: ['EPR', 'Extended Producer'],                       abbr: 'EPR',   bg: '#166534' },
  { match: ['DGCA', 'Drone', 'Digital Sky'],                   abbr: 'DGCA',  bg: '#374151' },
  { match: ['DoT', 'Department of Telecommunication', 'OSP', 'VNO'], abbr: 'DoT', bg: '#1e3a5f' },
  { match: ['GMA', 'Global Market'],                           abbr: 'GMA',   bg: '#0f172a' },
  { match: ['ISI'],                                            abbr: 'ISI',   bg: '#1a3a8c' },
  { match: ['CRS'],                                            abbr: 'CRS',   bg: '#1a3a8c' },
  { match: ['ETA', 'Equipment Type Approval'],                 abbr: 'ETA',   bg: '#15803d' },
  { match: ['Legal Metrology', 'Consumer Affairs'],            abbr: 'LM',    bg: '#92400e' },
  { match: ['IC Certification', '(Canada)'],                   abbr: 'IC',    bg: '#d52b1e' },
  { match: ['IEC'],                                            abbr: 'IEC',   bg: '#14532d' },
  { match: ['SCOMET'],                                         abbr: 'SCMT',  bg: '#14532d' },
];

const SERVICE_MARKS = [
  { match: ['ISI Mark'],                   abbr: 'ISI',   bg: '#1a3a8c' },
  { match: ['Scheme-X', 'Scheme X'],       abbr: 'S-X',   bg: '#6d28d9' },
  { match: ['CRS'],                        abbr: 'CRS',   bg: '#1a3a8c' },
  { match: ['Foreign Manufacturers'],      abbr: 'FMCS',  bg: '#1a3a8c' },
  { match: ['Star Rating'],                abbr: '★★★',  bg: '#b45309' },
  { match: ['LED'],                        abbr: 'LED',   bg: '#b45309' },
  { match: ['ETA', 'Equipment Type'],      abbr: 'ETA',   bg: '#15803d' },
  { match: ['Import License'],             abbr: 'IL',    bg: '#15803d' },
  { match: ['Short-Term Approval'],        abbr: 'STA',   bg: '#15803d' },
  { match: ['Mandatory TEC'],              abbr: 'M‑TEC', bg: '#1d4ed8' },
  { match: ['Voluntary TEC'],              abbr: 'V‑TEC', bg: '#1d4ed8' },
  { match: ['Interface Testing'],          abbr: 'IFT',   bg: '#1d4ed8' },
  { match: ['CE Marking', 'CE Mark'],      abbr: 'CE',    bg: '#003399' },
  { match: ['FCC'],                        abbr: 'FCC',   bg: '#b91c1c' },
  { match: ['UKCA'],                       abbr: 'UKCA',  bg: '#00247d' },
  { match: ['IC Certification'],           abbr: 'IC',    bg: '#d52b1e' },
  { match: ['Medical Device'],             abbr: 'MDR',   bg: '#0e7490' },
  { match: ['In-Vitro', 'IVD'],           abbr: 'IVD',   bg: '#0e7490' },
  { match: ['Manufacturing License'],      abbr: 'ML',    bg: '#0e7490' },
  { match: ['FSSAI Basic'],               abbr: 'FSSAI', bg: '#c2410c' },
  { match: ['FSSAI State'],               abbr: 'FSL',   bg: '#c2410c' },
  { match: ['FSSAI Central'],             abbr: 'FCL',   bg: '#c2410c' },
  { match: ['Food Import'],               abbr: 'FIC',   bg: '#c2410c' },
  { match: ['OSP'],                        abbr: 'OSP',   bg: '#1e3a5f' },
  { match: ['VNO'],                        abbr: 'VNO',   bg: '#1e3a5f' },
  { match: ['IP-1'],                       abbr: 'IP‑1',  bg: '#1e3a5f' },
  { match: ['PESO License'],              abbr: 'PESO',  bg: '#991b1b' },
  { match: ['Gas Cylinder'],              abbr: 'GTA',   bg: '#991b1b' },
  { match: ['IEC Registration'],          abbr: 'IEC',   bg: '#14532d' },
  { match: ['SCOMET'],                    abbr: 'SCMT',  bg: '#14532d' },
  { match: ['Advance Authorization'],     abbr: 'AA',    bg: '#14532d' },
  { match: ['Vehicle Type'],              abbr: 'VTA',   bg: '#1e40af' },
  { match: ['AIS'],                        abbr: 'AIS',   bg: '#1e40af' },
  { match: ['E-Waste EPR'],               abbr: 'E-EPR', bg: '#166534' },
  { match: ['Plastic Waste'],             abbr: 'P-EPR', bg: '#166534' },
  { match: ['Battery Waste'],             abbr: 'B-EPR', bg: '#166534' },
  { match: ['Annual EPR'],               abbr: 'EPR',   bg: '#166534' },
  { match: ['UIN Registration', 'Digital Sky'], abbr: 'UIN', bg: '#374151' },
  { match: ['RPAS', 'RTC'],              abbr: 'RTC',   bg: '#374151' },
  { match: ['Remote Pilot', 'RPL'],      abbr: 'RPL',   bg: '#374151' },
  { match: ['Drone Import'],             abbr: 'DIC',   bg: '#374151' },
  { match: ['Legal Metrology'],          abbr: 'LM',    bg: '#92400e' },
  { match: ['Product Labelling'],        abbr: 'PLC',   bg: '#92400e' },
];

const findMark = (name, list) => {
  const n = name || '';
  return list.find((m) => m.match.some((k) => n.includes(k))) || null;
};

const CertMark = ({ name, fallback, size = 'md' }) => {
  const list  = size === 'sm' ? [...SERVICE_MARKS, ...AUTHORITY_MARKS] : AUTHORITY_MARKS;
  const mark  = findMark(name, list);
  if (!mark) {
    const emojiSize = size === 'header' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-lg';
    return <span className={emojiSize}>{fallback || '📋'}</span>;
  }
  const dim =
    size === 'sm'      ? 'w-8 h-8 text-[8px] rounded-lg' :
    size === 'header'  ? 'w-11 h-11 text-[10px] rounded-xl' :
    /* sidebar */        'w-7 h-7 text-[7px] rounded-md';
  return (
    <div
      style={{ background: mark.bg }}
      className={`${dim} flex items-center justify-center font-bold font-mono text-white tracking-tight leading-none flex-shrink-0 select-none`}
    >
      {mark.abbr}
    </div>
  );
};

const groupServices = (services) => {
  const map = new Map();
  services.forEach((s) => {
    const key = s.subcategory || 'General';
    if (!map.has(key)) {
      map.set(key, {
        id:          key,
        name:        key,
        icon:        s.subcategoryIcon || '📋',
        description: s.subcategoryDescription || '',
        order:       s.subcategoryOrder ?? 0,
        services:    [],
      });
    }
    map.get(key).services.push(s);
  });
  return Array.from(map.values()).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
};

// ── Inline service detail view ─────────────────────────────────────────────────
const ServiceItemDetail = ({ service, onBack, onEnquire }) => (
  <div className="h-full overflow-y-auto">
    <div className="px-8 pt-6 pb-8">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-crimson text-sm font-medium mb-6 transition-colors duration-200 group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
        </svg>
        Back to services
      </button>

      {/* Header card */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-crimson/20 to-crimson/5 border border-crimson/25 flex items-center justify-center flex-shrink-0">
            <CertMark name={service.name} fallback={service.icon} size="header" />
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-[10px] font-mono text-crimson/80 uppercase tracking-[0.2em] mb-1">{service.category}</p>
            <h2 className="text-white font-display font-bold text-xl leading-tight mb-1">{service.name}</h2>
            {service.subcategory && (
              <span className="inline-block text-[10px] font-mono text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                {service.subcategory}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-2">Overview</p>
        <p className="text-gray-300 text-sm leading-relaxed">{service.description}</p>
      </div>

      {/* Features */}
      {service.features?.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-3">Key Features</p>
          <div className="grid gap-2">
            {service.features.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-crimson/20 hover:bg-white/[0.06] transition-all duration-200">
                <span className="w-5 h-5 rounded-full bg-crimson/15 border border-crimson/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-2.5 h-2.5 text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-gray-300 text-sm leading-snug">{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-5 border-t border-white/8">
        <button
          onClick={() => onEnquire(service.name)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-crimson hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-crimson/25 hover:shadow-crimson/40 hover:-translate-y-px"
        >
          Enquire Now
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
        <Link
          to={`/services/${service.slug}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-xl border border-white/10 hover:border-white/25 transition-all hover:-translate-y-px"
        >
          Full Page
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
        <span className="self-center ml-auto text-gray-600 text-xs">24h response</span>
      </div>
    </div>
  </div>
);

// ── ServiceGroupPanel ──────────────────────────────────────────────────────────
const ServiceGroupPanel = ({ category, onEnquire }) => {
  const [activeId,       setActiveId]       = useState(null);
  const [search,         setSearch]         = useState('');
  const [selectedSvc,    setSelectedSvc]    = useState(null);
  const [enquireService, setEnquireService] = useState(null);
  const contentRef = useRef(null);

  const { data, isLoading } = useQuery(
    ['services-grouped', category],
    () => api.get(`/services?category=${encodeURIComponent(category)}`).then((r) => r.data),
    { staleTime: 5 * 60 * 1000 }
  );

  const groups = useMemo(() => groupServices(data || []), [data]);

  useEffect(() => {
    if (groups.length > 0 && !activeId) setActiveId(groups[0].id);
  }, [groups, activeId]);

  useEffect(() => {
    setSelectedSvc(null);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeId]);

  const filtered = useMemo(
    () => groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase())),
    [groups, search]
  );

  const active = groups.find((g) => g.id === activeId) || groups[0];

  const openEnquiry = (name) => {
    if (onEnquire) onEnquire({ name });
    else setEnquireService({ name });
  };

  if (isLoading) {
    return (
      <div
        className="flex rounded-2xl overflow-hidden border border-white/10 shadow-2xl items-center justify-center"
        style={{ background: 'linear-gradient(135deg, rgba(13,17,40,0.99) 0%, rgba(18,22,50,0.99) 100%)', height: 640 }}
      >
        <Loader />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div
        className="flex rounded-2xl overflow-hidden border border-white/10 shadow-2xl items-center justify-center flex-col gap-3"
        style={{ background: 'linear-gradient(135deg, rgba(13,17,40,0.99) 0%, rgba(18,22,50,0.99) 100%)', height: 640 }}
      >
        <p className="text-gray-400 text-sm">No services configured for {category} yet.</p>
        <a href="/admin/services" className="text-crimson text-xs font-semibold hover:underline">Add via Admin Panel →</a>
      </div>
    );
  }

  return (
    <div
      className="flex rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
      style={{ background: 'linear-gradient(135deg, rgba(11,15,36,0.99) 0%, rgba(17,21,48,0.99) 100%)', height: 640 }}
    >
      {/* ── Sidebar ── */}
      <div className="w-[268px] flex-shrink-0 border-r border-white/[0.07] flex flex-col" style={{ background: 'rgba(8,11,30,0.6)' }}>
        {/* Sidebar header */}
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

        {/* Group list */}
        <div className="overflow-y-auto flex-grow py-1">
          {filtered.map((group, idx) => {
            const isActive = activeId === group.id;
            return (
              <button
                key={group.id}
                onMouseEnter={() => setActiveId(group.id)}
                onClick={() => setActiveId(group.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-crimson/20 to-crimson/5 text-white'
                    : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-200'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-crimson rounded-r-full" />
                )}
                <span className="flex-shrink-0">
                  <CertMark name={group.name} fallback={group.icon} size="sidebar" />
                </span>
                <div className="flex-grow min-w-0">
                  <span className={`text-[13px] font-medium leading-snug block truncate ${isActive ? 'text-white' : ''}`}>
                    {group.name}
                  </span>
                  <span className={`text-[10px] font-mono ${isActive ? 'text-crimson/70' : 'text-gray-700'}`}>
                    {group.services.length} service{group.services.length !== 1 ? 's' : ''}
                  </span>
                </div>
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
            <div className="px-4 py-10 text-center text-gray-700 text-sm">No results</div>
          )}
        </div>

        {/* Sidebar footer */}
        <div className="px-4 py-3 border-t border-white/[0.07] flex-shrink-0">
          <p className="text-[10px] text-gray-700 text-center font-mono">{groups.length} subcategories</p>
        </div>
      </div>

      {/* ── Content panel ── */}
      <div ref={contentRef} className="flex-grow overflow-y-auto">
        {selectedSvc ? (
          <ServiceItemDetail
            service={selectedSvc}
            onBack={() => setSelectedSvc(null)}
            onEnquire={openEnquiry}
          />
        ) : (
          active && (
            <>
              {/* Sticky header */}
              <div
                className="sticky top-0 z-10 px-7 pt-6 pb-5 border-b border-white/[0.07]"
                style={{ background: 'linear-gradient(180deg, rgba(11,15,36,0.99) 85%, rgba(11,15,36,0) 100%)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-crimson/20 to-crimson/5 border border-crimson/20 flex items-center justify-center flex-shrink-0">
                    <CertMark name={active.name} fallback={active.icon} size="header" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2.5 mb-0.5 flex-wrap">
                      <h2 className="text-white font-display font-bold text-lg leading-tight">{active.name}</h2>
                      <span className="text-[10px] font-mono text-crimson/80 bg-crimson/10 px-2 py-0.5 rounded-full border border-crimson/20">
                        {active.services.length} service{active.services.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {active.description && (
                      <p className="text-gray-500 text-xs leading-relaxed">{active.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sub-service card grid */}
              <div className="px-7 py-6">
                <div className="grid sm:grid-cols-2 gap-3">
                  {active.services.map((svc) => (
                    <button
                      key={svc._id}
                      onClick={() => setSelectedSvc(svc)}
                      className="flex flex-col p-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.055] hover:border-crimson/25 transition-all duration-200 group text-left relative overflow-hidden"
                    >
                      {/* Hover glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-crimson/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />

                      <div className="relative flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] group-hover:border-crimson/25 group-hover:bg-crimson/10 flex items-center justify-center flex-shrink-0 transition-all duration-200">
                          <CertMark name={svc.name} fallback={svc.icon} size="sm" />
                        </div>
                        <div className="flex-grow min-w-0 pt-0.5">
                          <h3 className="text-gray-200 font-semibold text-[13px] leading-snug group-hover:text-white transition-colors duration-200 line-clamp-2">
                            {svc.name}
                          </h3>
                        </div>
                      </div>

                      <p className="relative text-gray-600 text-xs leading-relaxed flex-grow mb-3 line-clamp-2">
                        {svc.description}
                      </p>

                      <div className="relative flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs text-crimson/60 group-hover:text-crimson font-semibold transition-colors duration-200">
                          View Details
                          <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                        {svc.features?.length > 0 && (
                          <span className="text-[10px] text-gray-700 font-mono">{svc.features.length} features</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-6 pt-5 border-t border-white/[0.07] flex items-center gap-4 flex-wrap">
                  <button
                    onClick={() => openEnquiry(active.name)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-crimson hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-crimson/25 hover:shadow-crimson/40 hover:-translate-y-px"
                  >
                    Enquire About {active.name.split('(')[0].trim()}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                  <span className="text-gray-700 text-xs font-mono">Response within 24 hours</span>
                </div>
              </div>
            </>
          )
        )}
      </div>

      {enquireService && (
        <ServiceModal service={enquireService} onClose={() => setEnquireService(null)} />
      )}
    </div>
  );
};

export default ServiceGroupPanel;
