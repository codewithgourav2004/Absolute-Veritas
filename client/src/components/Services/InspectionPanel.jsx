import React, { useState, useMemo, useRef, useEffect } from 'react';
import ServiceModal from './ServiceModal';

const INSPECTION_TYPES = [
  {
    id: 'psi',
    name: 'Pre-Shipment Inspection (PSI)',
    icon: '📦',
    description: 'Final quality check conducted when at least 80% of production is complete and goods are packed for shipment — the last gate before goods leave the factory.',
    subServices: [
      { name: 'Quantity Verification', icon: '🔢', description: 'Confirms actual shipped quantities match the purchase order and packing list exactly.' },
      { name: 'Workmanship & Visual Check', icon: '👁️', description: 'Detailed inspection for surface defects, finish quality, colour consistency, and assembly correctness.' },
      { name: 'AQL Sampling & Testing', icon: '📊', description: 'Random sample selection per ANSI/ASQ Z1.4 AQL tables with pass/fail evaluation against agreed criteria.' },
      { name: 'Packing & Labelling Compliance', icon: '🏷️', description: 'Verifies carton markings, inner packaging, barcodes, and regulatory labels meet buyer and customs requirements.' },
    ],
  },
  {
    id: 'dpi',
    name: 'During Production Inspection (DPI)',
    icon: '🏭',
    description: 'Mid-production audit conducted when 20–60% of goods are manufactured — catches defects early when correction is still cost-effective, avoiding costly rework at shipment stage.',
    subServices: [
      { name: 'In-Process Quality Audit', icon: '🔍', description: 'Spot-check of production line for process adherence, workstation compliance, and quality-control discipline.' },
      { name: 'Component & Material Check', icon: '🧱', description: 'Verification that raw materials and components being used match approved specs and BOM documentation.' },
      { name: 'Semi-Finished Product Sampling', icon: '🔬', description: 'Random sampling and basic testing of semi-finished units to identify defect trends before full production completion.' },
      { name: 'Production Schedule Review', icon: '📅', description: 'Assessment of on-time production progress against the delivery schedule with risk flag reporting.' },
    ],
  },
  {
    id: 'ipc',
    name: 'Initial Production Check (IPC)',
    icon: '🔍',
    description: 'Conducted within the first 20% of production — verifies the factory has the correct materials, tooling, and processes in place before bulk manufacturing begins.',
    subServices: [
      { name: 'Raw Material Verification', icon: '📋', description: 'Confirms received materials match purchase order specifications, certifications, and approved samples.' },
      { name: 'Equipment & Tooling Inspection', icon: '⚙️', description: 'Checks that production machinery, moulds, jigs, and tooling are correctly set up and calibrated.' },
      { name: 'First-Off Sample Review', icon: '🏷️', description: 'Evaluation of the very first produced unit against Golden Sample or approved design drawings.' },
      { name: 'Worker Skill Assessment', icon: '👷', description: 'Assessment of worker competency for critical production processes such as soldering, assembly, and finishing.' },
    ],
  },
  {
    id: 'cls',
    name: 'Container Loading Supervision (CLS)',
    icon: '🚢',
    description: 'On-site supervision of goods being loaded into the shipping container to ensure correct quantity, correct product, and safe stacking — preventing transit damage and short-shipment disputes.',
    subServices: [
      { name: 'Loading Quantity Verification', icon: '🔢', description: 'Physical count of cartons, pallets, or units as they are loaded to confirm shipment quantity matches documents.' },
      { name: 'Container Condition Check', icon: '🧐', description: 'Pre-loading inspection of the container interior for cleanliness, moisture, pests, structural damage, and seal integrity.' },
      { name: 'Stacking & Blocking Audit', icon: '📦', description: 'Ensures goods are stacked safely and secured with appropriate dunnage, strapping, and anti-tipping measures.' },
      { name: 'Photo & Video Evidence Report', icon: '📷', description: 'Timestamped photographic documentation of the loading process for dispute resolution and cargo insurance purposes.' },
    ],
  },
  {
    id: 'factory-audit',
    name: 'Factory & Supplier Audit',
    icon: '🏗️',
    description: 'Comprehensive on-site evaluation of a supplier\'s manufacturing capabilities, quality management systems, and compliance posture — used for new supplier qualification and periodic re-qualification.',
    subServices: [
      { name: 'Quality Management System Audit', icon: '📋', description: 'Assessment against ISO 9001 or buyer-specific QMS requirements — document review, process walkthrough, and gap analysis.' },
      { name: 'Production Capability Assessment', icon: '⚙️', description: 'Evaluation of machinery, capacity, technology, and workforce capability to fulfil the order requirements reliably.' },
      { name: 'Supplier Qualification Report', icon: '📄', description: 'Scored audit report with pass/fail/conditional rating, corrective action requirements, and approval recommendation.' },
      { name: 'Periodic Re-Qualification Audit', icon: '🔄', description: 'Scheduled follow-up audits to confirm sustained compliance and verify closure of previously raised corrective actions.' },
    ],
  },
  {
    id: 'social-audit',
    name: 'Social Compliance Audit',
    icon: '🤝',
    description: 'Evaluation of a factory\'s labour practices, working conditions, and ethical compliance — required by global brands under SMETA, BSCI, SA8000, and similar frameworks.',
    subServices: [
      { name: 'SMETA 2-Pillar & 4-Pillar Audit', icon: '🏛️', description: 'Sedex Members Ethical Trade Audit covering Labour Standards, Health & Safety, Environment, and Business Ethics.' },
      { name: 'BSCI Audit', icon: '🌍', description: 'Business Social Compliance Initiative audit for factories supplying European brands and retailers.' },
      { name: 'SA8000 Assessment', icon: '📜', description: 'Social Accountability 8000 compliance assessment covering child labour, forced labour, discrimination, and freedom of association.' },
      { name: 'Worker Interview & Document Review', icon: '💬', description: 'Confidential worker interviews and payroll/hour document review to verify compliance with local labour law and code of conduct.' },
    ],
  },
  {
    id: 'lab-coordination',
    name: 'Lab Testing Coordination',
    icon: '🔬',
    description: 'End-to-end management of product testing through accredited laboratories — from sample dispatch and test plan design to report collection and regulatory submission.',
    subServices: [
      { name: 'Test Plan & Lab Selection', icon: '📐', description: 'Recommending the most appropriate accredited lab (NABL/ILAC) and defining the exact test suite required for certification.' },
      { name: 'Sample Collection & Dispatch', icon: '📮', description: 'Factory sample pickup, proper packaging, and courier coordination to domestic or international test laboratories.' },
      { name: 'Testing Progress Tracking', icon: '📡', description: 'Real-time status updates on test progress with escalation if labs delay beyond committed turnaround times.' },
      { name: 'Test Report Review & Submission', icon: '📄', description: 'Expert review of test reports for errors or borderline results before submission to the regulatory authority.' },
    ],
  },
  {
    id: 'product-inspection',
    name: 'Specialized Product Inspection',
    icon: '🎯',
    description: 'Industry-specific inspection services covering textiles, electronics, furniture, toys, food products, and industrial equipment — each conducted by domain-specialist inspectors.',
    subServices: [
      { name: 'Electronics & Electricals', icon: '🔌', description: 'PCB assembly quality, solder joint inspection, functional testing, ESD compliance, and safety spot-checks for consumer electronics.' },
      { name: 'Textiles & Garments', icon: '👗', description: 'GSM testing, colour fastness, stitching quality, measurement compliance, and trim/accessory verification.' },
      { name: 'Furniture & Home Goods', icon: '🪑', description: 'Structural integrity, finish quality, dimensional accuracy, and material spec verification for wood, metal, and upholstered goods.' },
      { name: 'Food & Agricultural Products', icon: '🌾', description: 'Visual grading, weight/count verification, packaging integrity, and cold-chain compliance inspection for perishable goods.' },
    ],
  },
];

const InspectionPanel = ({ onEnquire }) => {
  const [activeId, setActiveId] = useState('psi');
  const [search, setSearch] = useState('');
  const [enquireService, setEnquireService] = useState(null);
  const contentRef = useRef(null);

  const filtered = useMemo(
    () => INSPECTION_TYPES.filter((t) => t.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const active = INSPECTION_TYPES.find((t) => t.id === activeId) || INSPECTION_TYPES[0];

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
        <div className="px-4 pt-4 pb-3 border-b border-white/10 flex-shrink-0">
          <p className="text-xs font-mono text-crimson uppercase tracking-widest mb-2">Inspection</p>
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

        <div className="overflow-y-auto flex-grow">
          {filtered.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onMouseEnter={() => setActiveId(item.id)}
                onClick={() => setActiveId(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 border-b border-white/5 group relative ${
                  isActive ? 'bg-crimson/15 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isActive && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-crimson rounded-r" />}
                <span className="text-lg flex-shrink-0 w-7 text-center">{item.icon}</span>
                <span className="text-sm font-medium leading-snug flex-grow">{item.name}</span>
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

      {/* Content panel */}
      <div ref={contentRef} className="flex-grow overflow-y-auto">
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

        <div className="px-6 py-6">
          <div className="grid sm:grid-cols-2 gap-3">
            {active.subServices.map((sub) => (
              <div
                key={sub.name}
                className="flex flex-col p-4 rounded-xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-crimson/30 transition-all duration-200 group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/6 group-hover:bg-crimson/15 flex items-center justify-center text-base flex-shrink-0 transition-colors duration-200">
                    {sub.icon}
                  </div>
                  <h3 className="text-white font-semibold text-sm leading-snug pt-1 group-hover:text-crimson/90 transition-colors duration-200">{sub.name}</h3>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed flex-grow mb-3">{sub.description}</p>
                <button
                  onClick={() => openEnquiry(sub.name)}
                  className="self-start flex items-center gap-1.5 text-xs text-crimson/70 hover:text-crimson font-medium transition-colors"
                >
                  Enquire
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

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

export default InspectionPanel;
