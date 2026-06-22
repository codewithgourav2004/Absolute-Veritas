import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ServiceModal from './ServiceModal';

const toSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const CERTIFICATION_BODIES = [
  {
    id: 'bis',
    name: 'Bureau of Indian Standards (BIS)',
    icon: '🏛️',
    description: 'BIS ensures product quality, safety, and compliance with Indian standards.',
    subServices: [
      { name: 'ISI Mark Certification', icon: '🔵', description: 'Mandatory certification mark for products to assure safety, reliability, and quality for consumers.' },
      { name: 'Scheme-X Certification', icon: '🔶', description: 'Special certification scheme under BIS for specific product categories with unique compliance requirements.' },
      { name: 'CRS Certification', icon: '🔷', description: 'Compulsory Registration Scheme (CRS) for electronics and IT products to meet Indian safety standards.' },
      { name: 'BIS Foreign Manufacturers Certification', icon: '🌐', description: 'Certification for foreign manufacturers exporting products to India under BIS scheme.' },
    ],
  },
  {
    id: 'bee',
    name: 'Bureau of Energy Efficiency (BEE)',
    icon: '⚡',
    description: 'BEE promotes energy efficiency and conservation in India.',
    subServices: [
      { name: 'Star Rating Label', icon: '⭐', description: 'Energy star rating for appliances like ACs, refrigerators, fans, and TVs to indicate energy efficiency.' },
      { name: 'BEE Registration', icon: '📋', description: 'Mandatory registration for equipment manufacturers under the Standards & Labelling programme.' },
      { name: 'BEE Certification for LED', icon: '💡', description: 'Certification for LED lighting products under BEE\'s mandatory scheme.' },
    ],
  },
  {
    id: 'wpc',
    name: 'Wireless Planning and Coordination (WPC)',
    icon: '📡',
    description: 'WPC regulates the wireless spectrum and grants approvals for wireless devices in India.',
    subServices: [
      { name: 'Equipment Type Approval (ETA)', icon: '📻', description: 'Type approval for wireless and radio frequency devices before commercial sale in India.' },
      { name: 'Import License (IL)', icon: '🚢', description: 'Mandatory import license for restricted wireless equipment entering India.' },
      { name: 'Short-Term Approval (STA)', icon: '⏱️', description: 'Temporary approval for wireless devices for demo, testing, or exhibition purposes.' },
    ],
  },
  {
    id: 'tec',
    name: 'Telecommunication Engineering Centre (TEC)',
    icon: '📶',
    description: 'TEC certifies telecom and network equipment for connection to Indian telecom networks.',
    subServices: [
      { name: 'Mandatory TEC Certification', icon: '✅', description: 'Compulsory certification for telecom equipment connected to Indian public networks.' },
      { name: 'Voluntary TEC Certification', icon: '🏅', description: 'Optional certification to demonstrate compliance with Indian telecom standards.' },
      { name: 'Interface Testing', icon: '🔌', description: 'Testing of equipment interfaces as per DoT prescribed standards.' },
    ],
  },
  {
    id: 'stqc',
    name: 'Standardisation Testing and Quality Certification (STQC)',
    icon: '🔬',
    description: 'STQC provides quality assurance services for IT products and systems.',
    subServices: [
      { name: 'IT Product Certification', icon: '💻', description: 'Certification for IT hardware and software products against national and international standards.' },
      { name: 'IT Security Audit', icon: '🔐', description: 'STQC-empanelled audit for IT systems, websites, and applications for government compliance.' },
      { name: 'E-Governance Compliance', icon: '🏢', description: 'Testing and certification for e-governance and digital public infrastructure products.' },
    ],
  },
  {
    id: 'gma',
    name: 'Global Market Access (GMA)',
    icon: '🌍',
    description: 'International certifications for accessing global markets.',
    subServices: [
      { name: 'CE Marking (Europe)', icon: '🇪🇺', description: 'Conformity marking for products sold in the European Economic Area.' },
      { name: 'FCC Authorization (USA)', icon: '🇺🇸', description: 'Federal Communications Commission authorization for US market entry.' },
      { name: 'UKCA Marking (UK)', icon: '🇬🇧', description: 'UK Conformity Assessed marking for products placed on the UK market.' },
      { name: 'IC Certification (Canada)', icon: '🇨🇦', description: 'Innovation, Science and Economic Development Canada certification for radio devices.' },
    ],
  },
  {
    id: 'consumer-affairs',
    name: 'Consumer Affairs',
    icon: '🛡️',
    description: 'Compliance with Legal Metrology and consumer protection regulations.',
    subServices: [
      { name: 'Legal Metrology Registration', icon: '⚖️', description: 'Registration for packaged commodities, weights, and measures compliance under Legal Metrology Act.' },
      { name: 'Product Labelling Compliance', icon: '🏷️', description: 'Mandatory labelling requirements for packaged goods sold in India.' },
    ],
  },
  {
    id: 'cdsco',
    name: 'Central Drugs Standard Control Organization (CDSCO)',
    icon: '⚕️',
    description: 'CDSCO regulates medical devices, diagnostics, and pharmaceutical products in India.',
    subServices: [
      { name: 'Medical Device Registration', icon: '🩺', description: 'Registration of medical devices under CDSCO\'s Medical Devices Rules 2017.' },
      { name: 'In-Vitro Diagnostic Registration', icon: '🧪', description: 'Registration for diagnostic kits and reagents under CDSCO regulations.' },
      { name: 'Import License for Devices', icon: '🚢', description: 'Mandatory import license for medical devices entering the Indian market.' },
      { name: 'Manufacturing License', icon: '🏭', description: 'License for manufacturing medical devices in India.' },
    ],
  },
  {
    id: 'fssai',
    name: 'Food Safety and Standards Authority of India (FSSAI)',
    icon: '🍽️',
    description: 'FSSAI regulates food safety and quality standards across India.',
    subServices: [
      { name: 'FSSAI Basic Registration', icon: '📝', description: 'For small food businesses with annual turnover up to ₹12 lakhs.' },
      { name: 'FSSAI State License', icon: '🏪', description: 'State-level license for mid-sized food businesses and manufacturers.' },
      { name: 'FSSAI Central License', icon: '🏢', description: 'Central license for large manufacturers, importers, and exporters of food products.' },
      { name: 'Food Import Clearance', icon: '🚢', description: 'Clearance for imported food products through FSSAI\'s online portal.' },
    ],
  },
  {
    id: 'dot',
    name: 'Department of Telecommunication (DOT)',
    icon: '📞',
    description: 'DOT governs telecom policy, licensing, and spectrum management in India.',
    subServices: [
      { name: 'OSP Registration', icon: '☎️', description: 'Other Service Provider registration for BPO and call centre operations.' },
      { name: 'VNO License', icon: '📱', description: 'Virtual Network Operator license for telecom service resellers.' },
      { name: 'IP-1 Registration', icon: '🔗', description: 'Infrastructure Provider Category-1 registration for passive telecom infrastructure.' },
    ],
  },
  {
    id: 'peso',
    name: 'Petroleum and Explosives Safety Organization (PESO)',
    icon: '🔥',
    description: 'PESO regulates safety of petroleum, explosives, and compressed gases in India.',
    subServices: [
      { name: 'PESO License', icon: '🏭', description: 'License for manufacture, storage, and sale of explosives, petroleum, and compressed gases.' },
      { name: 'Gas Cylinder Type Approval', icon: '🫙', description: 'Type approval for compressed gas cylinders under Gas Cylinder Rules.' },
    ],
  },
  {
    id: 'dgft',
    name: 'Directorate General of Foreign Trade (DGFT)',
    icon: '🌐',
    description: 'DGFT manages India\'s foreign trade policy, import-export licences, and schemes.',
    subServices: [
      { name: 'IEC Registration', icon: '📋', description: 'Importer Exporter Code — mandatory for any entity engaged in import/export from India.' },
      { name: 'SCOMET Export Authorization', icon: '🔐', description: 'Authorization for export of Special Chemicals, Organisms, Materials, Equipment & Technologies.' },
      { name: 'Advance Authorization', icon: '🔄', description: 'Duty exemption scheme for import of inputs used in export production.' },
    ],
  },
  {
    id: 'arai',
    name: 'Automotive Research Association of India (ARAI)',
    icon: '🚗',
    description: 'ARAI provides type approval and testing for automotive vehicles and components.',
    subServices: [
      { name: 'Vehicle Type Approval', icon: '🚘', description: 'Mandatory type approval for vehicles and automotive components under CMVR.' },
      { name: 'AIS / IS Certification', icon: '🏆', description: 'Certification against Automotive Industry Standards for safety-critical components.' },
    ],
  },
  {
    id: 'epr',
    name: 'Extended Producer Responsibility (EPR)',
    icon: '♻️',
    description: 'EPR compliance for e-waste, plastic waste, and battery waste under CPCB norms.',
    subServices: [
      { name: 'E-Waste EPR Registration', icon: '💻', description: 'Registration on CPCB portal for producers and importers of electrical and electronic equipment.' },
      { name: 'Plastic Waste EPR', icon: '🧴', description: 'Compliance for plastic packaging producers, importers, and brand owners.' },
      { name: 'Battery Waste EPR', icon: '🔋', description: 'EPR registration for portable, industrial, and automotive battery producers.' },
      { name: 'Annual EPR Filing', icon: '📄', description: 'Yearly compliance returns and target fulfilment reporting to CPCB.' },
    ],
  },
  {
    id: 'drone-registration',
    name: 'Drone Registration (DGCA)',
    icon: '🚁',
    description: 'End-to-end assistance for drone registration, UAS type certification, and operator licensing under DGCA\'s UAS Rules 2021 and Digital Sky platform.',
    subServices: [
      { name: 'Digital Sky UIN Registration', icon: '🌐', description: 'Unique Identification Number (UIN) registration for drones on the DGCA Digital Sky portal, mandatory for all drones above 250 g.' },
      { name: 'RPAS Type Certificate (RTC)', icon: '📜', description: 'Type Certification for drone models from DGCA — required before commercial manufacture or import of UAS for sale in India.' },
      { name: 'Remote Pilot Licence (RPL)', icon: '🎖️', description: 'Assistance with Remote Pilot Licence application, training coordination at DGCA-authorised RTOs, and licence renewal.' },
      { name: 'Drone Import Clearance', icon: '✈️', description: 'Guidance on import permissions, customs classification (HS Code 8806), and DGCA import authorisation for foreign-made drones.' },
    ],
  },
];

const CertificationsPanel = ({ onEnquire }) => {
  const [activeId, setActiveId] = useState('bis');
  const [search, setSearch] = useState('');
  const [enquireService, setEnquireService] = useState(null);
  const contentRef = useRef(null);

  const filtered = useMemo(
    () => CERTIFICATION_BODIES.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const active = CERTIFICATION_BODIES.find((b) => b.id === activeId) || CERTIFICATION_BODIES[0];

  // Scroll content panel back to top whenever selection changes
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeId]);

  const openEnquiry = (serviceName) => {
    if (onEnquire) {
      onEnquire({ name: serviceName });
    } else {
      setEnquireService({ name: serviceName });
    }
  };

  return (
    <div
      className="flex rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
      style={{ background: 'rgba(13,17,40,0.98)', height: '620px' }}
    >
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-white/10 flex flex-col">
        {/* Sidebar header */}
        <div className="px-4 pt-4 pb-3 border-b border-white/10 flex-shrink-0">
          <p className="text-xs font-mono text-crimson uppercase tracking-widest mb-2">Certifications</p>
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
          {filtered.map((body) => {
            const isActive = activeId === body.id;
            return (
              <button
                key={body.id}
                onMouseEnter={() => setActiveId(body.id)}
                onClick={() => setActiveId(body.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 border-b border-white/5 group relative ${
                  isActive ? 'bg-crimson/15 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isActive && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-crimson rounded-r" />}
                <span className="text-lg flex-shrink-0 w-7 text-center">{body.icon}</span>
                <span className="text-sm font-medium leading-snug flex-grow">{body.name}</span>
                <svg
                  className={`w-3 h-3 flex-shrink-0 transition-colors ${isActive ? 'text-crimson' : 'text-gray-700 group-hover:text-gray-500'}`}
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
      <div ref={contentRef} className="flex-grow overflow-y-auto">
        {/* Sticky header inside content */}
        <div className="sticky top-0 z-10 px-8 pt-7 pb-5 border-b border-white/8" style={{ background: 'rgba(13,17,40,0.98)' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-crimson/10 border border-crimson/20 flex items-center justify-center text-2xl flex-shrink-0">
              {active.icon}
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-white font-display font-bold text-lg leading-tight">{active.name}</h2>
                <span className="flex-shrink-0 text-xs font-mono text-crimson/70 bg-crimson/10 px-2 py-0.5 rounded-full border border-crimson/20">
                  {active.subServices.length} services
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{active.description}</p>
            </div>
          </div>
        </div>

        {/* Sub-service cards */}
        <div className="px-6 py-6">
          <div className="grid sm:grid-cols-2 gap-3">
            {active.subServices.map((sub) => (
              <div
                key={sub.name}
                className="flex flex-col p-4 rounded-xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-crimson/30 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/6 group-hover:bg-crimson/15 flex items-center justify-center text-base flex-shrink-0 transition-colors duration-200">
                    {sub.icon}
                  </div>
                  <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-crimson/90 transition-colors duration-200">{sub.name}</h3>
                </div>
                <div className="flex items-center gap-3 mt-auto">
                  <button
                    onClick={() => openEnquiry(sub.name)}
                    className="flex items-center gap-1.5 text-xs text-crimson/70 hover:text-crimson font-medium transition-colors"
                  >
                    Enquire
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                  <span className="text-white/15 text-xs select-none">|</span>
                  <Link
                    to={`/services/${toSlug(sub.name)}`}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-white font-medium transition-colors"
                  >
                    View Full Page
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-6 pt-5 border-t border-white/8 flex items-center gap-4">
            <button
              onClick={() => openEnquiry(active.name)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-crimson hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-crimson/20"
            >
              Enquire About {active.name.split('(')[0].trim()}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <span className="text-gray-600 text-xs">Response within 24 hours</span>
          </div>
        </div>
      </div>

      {enquireService && (
        <ServiceModal service={enquireService} onClose={() => setEnquireService(null)} />
      )}
    </div>
  );
};

export default CertificationsPanel;
