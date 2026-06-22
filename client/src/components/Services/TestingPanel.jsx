import React, { useState, useMemo, useRef, useEffect } from 'react';
import ServiceModal from './ServiceModal';

const TESTING_TYPES = [
  {
    id: 'safety-bis',
    name: 'Safety Test (BIS)',
    icon: '🛡️',
    description: 'Safety testing of electrical and electronic products as per BIS/IS standards to obtain ISI mark or CRS registration in India.',
    subServices: [
      { name: 'Electrical Safety Testing', icon: '⚡', description: 'Testing for electric shock, fire, and mechanical hazards per IS/IEC 60065, 60335, 62368 series.' },
      { name: 'Flammability & Fire Testing', icon: '🔥', description: 'Material and component flame retardancy testing as required under BIS product standards.' },
      { name: 'Mechanical Hazard Testing', icon: '⚙️', description: 'Assessment of mechanical risks including sharp edges, moving parts, and structural integrity.' },
      { name: 'Chemical & RoHS Testing', icon: '🧪', description: 'Testing for restricted substances (lead, mercury, cadmium, etc.) under BIS chemical compliance.' },
    ],
  },
  {
    id: 'emc-tec',
    name: 'EMC Test (TEC)',
    icon: '📡',
    description: 'Electromagnetic Compatibility testing to ensure telecom and electronic products do not cause or suffer interference, as required by TEC and BIS.',
    subServices: [
      { name: 'Radiated Emissions', icon: '📶', description: 'Measurement of unintentional electromagnetic energy radiated from equipment per CISPR/IS standards.' },
      { name: 'Conducted Emissions', icon: '🔌', description: 'Testing of disturbances conducted onto the mains supply network.' },
      { name: 'ESD & Immunity Testing', icon: '⚡', description: 'Electrostatic discharge and electromagnetic immunity tests per IEC 61000 series.' },
      { name: 'Surge & EFT Testing', icon: '🌊', description: 'Surge immunity and electrical fast transient / burst testing.' },
    ],
  },
  {
    id: 'rf-wpc',
    name: 'RF Test (WPC)',
    icon: '📻',
    description: 'Radio Frequency testing for wireless devices seeking WPC Equipment Type Approval (ETA) for the Indian market.',
    subServices: [
      { name: 'Frequency & Spurious Emissions', icon: '📊', description: 'Verification of operating frequency accuracy and measurement of unwanted spurious emissions.' },
      { name: 'RF Output Power', icon: '📡', description: 'Measurement of conducted and radiated transmit power levels against WPC-permitted limits.' },
      { name: 'Occupied Bandwidth', icon: '📏', description: 'Measurement of signal bandwidth to confirm compliance with WPC spectrum allocations.' },
      { name: 'SAR Testing', icon: '🧠', description: 'Specific Absorption Rate testing for devices held close to the human body (mobile phones, tablets).' },
    ],
  },
  {
    id: 'energy-bee',
    name: 'Energy Efficiency Test (BEE)',
    icon: '⚡',
    description: 'Energy performance testing of appliances and equipment under BEE\'s Standards & Labelling programme for Star Rating certification.',
    subServices: [
      { name: 'AC & Refrigerator Testing', icon: '❄️', description: 'Energy efficiency ratio (EER) and seasonal energy efficiency ratio (SEER) testing per IS 1391/1618.' },
      { name: 'LED & Lighting Testing', icon: '💡', description: 'Luminous efficacy, power factor, and THD testing for LED lamps and luminaires per IS 16102.' },
      { name: 'Fan & Motor Testing', icon: '🌀', description: 'Ceiling fan and pump efficiency testing per IS 374 and IS 8034 for BEE star rating.' },
      { name: 'TV & Set-Top Box Testing', icon: '📺', description: 'Standby and on-mode power consumption testing for consumer electronics per IS 616.' },
    ],
  },
  {
    id: 'environmental-auto',
    name: 'Environmental Test (Automobile)',
    icon: '🚗',
    description: 'Environmental and climatic stress testing for automotive components and vehicles as per AIS/IS/IEC standards and ARAI type-approval requirements.',
    subServices: [
      { name: 'Temperature & Humidity Testing', icon: '🌡️', description: 'Thermal cycling, damp heat, and humidity endurance tests for automotive components.' },
      { name: 'Vibration & Shock Testing', icon: '📳', description: 'Road simulation vibration and mechanical shock testing per AIS and ISO 16750.' },
      { name: 'IP Ingress Protection (Auto)', icon: '💧', description: 'Dust and water ingress testing for automotive lighting, connectors, and enclosures.' },
      { name: 'Corrosion & Salt Spray', icon: '🌊', description: 'Salt mist and corrosion resistance testing for metallic automotive parts per ISO 9227.' },
    ],
  },
  {
    id: 'lm79-lm80',
    name: 'LM-79 & LM-80',
    icon: '💡',
    description: 'IES photometric and lumen maintenance testing for LED lighting products — mandatory for many export markets and BEE certification.',
    subServices: [
      { name: 'LM-79 Photometric Testing', icon: '🔦', description: 'Total luminous flux, luminous intensity distribution, and efficacy measurement for LED luminaires.' },
      { name: 'LM-80 Lumen Depreciation', icon: '📉', description: 'Long-duration (6 000 h+) lumen maintenance testing for LED packages, arrays, and modules.' },
      { name: 'TM-21 Projection', icon: '📐', description: 'Projection of LED lumen maintenance beyond the LM-80 test period using IES TM-21.' },
      { name: 'Color Quality Testing', icon: '🎨', description: 'Color rendering index (CRI), correlated color temperature (CCT), and color stability testing.' },
    ],
  },
  {
    id: 'ip-rating',
    name: 'IP Rating Test',
    icon: '💧',
    description: 'Ingress Protection testing per IEC/IS 60529 to certify the degree of protection provided by enclosures against dust and water.',
    subServices: [
      { name: 'Dust Ingress (IP5X / IP6X)', icon: '🌫️', description: 'Testing for dust-protected (IP5X) and dust-tight (IP6X) ratings using talcum powder chambers.' },
      { name: 'Water Ingress (IPX1–IPX8)', icon: '🚿', description: 'Drip, splash, jet, immersion, and high-pressure water resistance testing.' },
      { name: 'IP69K (High-Pressure Steam)', icon: '♨️', description: 'High-pressure, high-temperature wash-down test for food-processing and automotive equipment.' },
      { name: 'IP Rating for Wearables', icon: '⌚', description: 'IP / ATM water resistance testing for smart watches, earbuds, and consumer electronics.' },
    ],
  },
  {
    id: 'rohs',
    name: 'RoHS Testing',
    icon: '♻️',
    description: 'Restriction of Hazardous Substances testing to verify compliance with EU RoHS Directive 2011/65/EU and India\'s E-Waste Management Rules.',
    subServices: [
      { name: 'XRF Screening', icon: '🔬', description: 'Rapid X-ray fluorescence screening for lead, mercury, cadmium, chromium, and bromine.' },
      { name: 'ICP-OES / ICP-MS Analysis', icon: '🧫', description: 'Accurate quantification of restricted heavy metals in homogeneous material samples.' },
      { name: 'Phthalate Testing (DEHP, BBP, DBP)', icon: '🧴', description: 'GC-MS testing for restricted phthalate plasticisers in polymeric components.' },
      { name: 'RoHS Declaration Support', icon: '📄', description: 'Assistance with Declaration of Conformity and technical documentation for RoHS compliance.' },
    ],
  },
  {
    id: 'reach',
    name: 'REACH Testing',
    icon: '⚗️',
    description: 'REACH SVHC (Substances of Very High Concern) screening and analysis for products exported to the EU market.',
    subServices: [
      { name: 'SVHC Screening (Candidate List)', icon: '🔍', description: 'Screening of articles for substances on the ECHA SVHC Candidate List using XRF and chemical analysis.' },
      { name: 'PAH Testing', icon: '🛢️', description: 'Testing for polycyclic aromatic hydrocarbons in rubber and plastic components per ECHA guidance.' },
      { name: 'Heavy Metal Analysis', icon: '⚖️', description: 'ICP analysis for heavy metals restricted under REACH Annex XVII (cadmium, lead, nickel, etc.).' },
      { name: 'REACH Compliance Documentation', icon: '📋', description: 'Supply chain communication and REACH compliance declarations for importers and exporters.' },
    ],
  },
  {
    id: 'medical-device',
    name: 'Medical Device Testing',
    icon: '🩺',
    description: 'Safety, performance, and biocompatibility testing for medical devices as required by CDSCO Medical Devices Rules 2017 and IEC standards.',
    subServices: [
      { name: 'Electrical Safety (IEC 60601)', icon: '💊', description: 'General and particular safety testing for medical electrical equipment per IEC 60601-1 series.' },
      { name: 'Biocompatibility (ISO 10993)', icon: '🧬', description: 'Cytotoxicity, sensitisation, and irritation testing for materials in contact with patients.' },
      { name: 'EMC for Medical Devices', icon: '🏥', description: 'Emissions and immunity testing for medical devices per IEC 60601-1-2.' },
      { name: 'Sterilisation Validation', icon: '✅', description: 'Validation of EO, steam, and radiation sterilisation processes per ISO 11135/11137.' },
    ],
  },
  {
    id: 'telecom-product',
    name: 'Telecom Product Testing',
    icon: '📶',
    description: 'End-to-end testing of telecom equipment for TEC Mandatory Testing and Certification Order (MTCTE) compliance.',
    subServices: [
      { name: 'Network Equipment Testing', icon: '🖥️', description: 'Testing of routers, switches, and broadband CPE against TEC Essential Requirements.' },
      { name: 'Mobile & Handset Testing', icon: '📱', description: 'RF, SAR, and interface testing for mobile terminals per TEC and WPC norms.' },
      { name: 'Optical Fibre & Accessories', icon: '🔭', description: 'Optical performance and mechanical testing of fibres, cables, and connectors per TEC standards.' },
      { name: 'VSAT & Satellite Equipment', icon: '🛰️', description: 'Functional and RF compliance testing for VSAT terminals and satellite communication gear.' },
    ],
  },
  {
    id: 'defense-product',
    name: 'Defense Product Testing',
    icon: '🎖️',
    description: 'Environmental, EMI/EMC, and reliability testing for defence equipment per MIL-STD and DRDO/DGQA requirements.',
    subServices: [
      { name: 'MIL-STD-810 Environmental', icon: '🏔️', description: 'Temperature, humidity, altitude, vibration, and shock testing per MIL-STD-810 test methods.' },
      { name: 'MIL-STD-461 EMI/EMC', icon: '📡', description: 'Conducted and radiated emissions and susceptibility testing for defence electronics.' },
      { name: 'IP & Waterproofing (Mil-Spec)', icon: '💦', description: 'High-specification ingress protection and submersion testing for field equipment.' },
      { name: 'HALT / HASS Testing', icon: '🔩', description: 'Highly Accelerated Life and Stress Screening tests to identify design and process weaknesses.' },
    ],
  },
  {
    id: 'toys-testing',
    name: 'Toys Testing',
    icon: '🧸',
    description: 'Safety testing for toys under India\'s Toy (Quality Control) Order 2020 and mandatory BIS IS 9873 certification.',
    subServices: [
      { name: 'Mechanical & Physical Safety', icon: '🔧', description: 'Sharp edges, points, small parts, and torque/tension testing per IS 9873-1.' },
      { name: 'Flammability of Toys', icon: '🔥', description: 'Flame propagation testing of toy materials per IS 9873-2.' },
      { name: 'Chemical Safety (Toy Migration)', icon: '🧪', description: 'Migration of elements (antimony, arsenic, lead, etc.) and restricted substances per IS 9873-3.' },
      { name: 'Electrical Toys Testing', icon: '🔌', description: 'Electrical safety, thermal, and current-carrying capacity testing for battery-operated toys.' },
    ],
  },
  {
    id: 'drone-testing',
    name: 'Drone Testing',
    icon: '🚁',
    description: 'Type certification testing for Unmanned Aircraft Systems (UAS) as per DGCA\'s UAS Rules 2021 and BIS quality requirements.',
    subServices: [
      { name: 'RF & Spectrum Testing', icon: '📻', description: 'WPC ETA compliance testing for drone communication frequencies (2.4 GHz / 5.8 GHz / 900 MHz).' },
      { name: 'Flight Performance Testing', icon: '✈️', description: 'Hover endurance, payload capacity, wind resistance, and GPS hold accuracy testing.' },
      { name: 'Structural & Drop Testing', icon: '🏗️', description: 'Frame integrity, propeller guard, and controlled-drop resilience testing.' },
      { name: 'Battery & Electrical Safety', icon: '🔋', description: 'LiPo battery safety, overcharge, thermal runaway, and charging system testing.' },
    ],
  },
];

const TestingPanel = ({ onEnquire }) => {
  const [activeId, setActiveId] = useState('safety-bis');
  const [search, setSearch] = useState('');
  const [enquireService, setEnquireService] = useState(null);
  const contentRef = useRef(null);

  const filtered = useMemo(
    () => TESTING_TYPES.filter((t) => t.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const active = TESTING_TYPES.find((t) => t.id === activeId) || TESTING_TYPES[0];

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
          <p className="text-xs font-mono text-crimson uppercase tracking-widest mb-2">Testing Types</p>
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

export default TestingPanel;
