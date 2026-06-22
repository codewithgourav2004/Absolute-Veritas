require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Service = require('./models/Service');
const Blog = require('./models/Blog');
const Testimonial = require('./models/Testimonial');
const Stats = require('./models/Stats');
const News = require('./models/News');
const Newsletter = require('./models/Newsletter');

// ── Helper: build service entry ───────────────────────────────────────────────
const svc = (slug, name, category, subcategory, subcategoryIcon, subcategoryDesc, subcatOrder, icon, description, order, features = []) => ({
  slug, name, category,
  subcategory, subcategoryIcon, subcategoryDescription: subcategoryDesc, subcategoryOrder: subcatOrder,
  icon, description, order, features,
});

const services = [
  // ──────────────────────────── CERTIFICATION ──────────────────────────────────
  // BIS
  svc('bis-isi-mark','ISI Mark Certification','Certification','Bureau of Indian Standards (BIS)','🏛️','BIS ensures product quality, safety, and compliance with Indian standards.',1,'🔵','Mandatory certification mark for products to assure safety, reliability, and quality for consumers.',1,['ISI Mark licensing','Lab testing coordination','Factory audit support','Renewal management']),
  svc('bis-scheme-x','Scheme-X Certification','Certification','Bureau of Indian Standards (BIS)','🏛️','BIS ensures product quality, safety, and compliance with Indian standards.',1,'🔶','Special certification scheme under BIS for specific product categories with unique compliance requirements.',2,[]),
  svc('bis-crs','CRS Certification','Certification','Bureau of Indian Standards (BIS)','🏛️','BIS ensures product quality, safety, and compliance with Indian standards.',1,'🔷','Compulsory Registration Scheme (CRS) for electronics and IT products to meet Indian safety standards.',3,['CRS portal filing','Test report coordination','Renewal support']),
  svc('bis-foreign-mfr','BIS Foreign Manufacturers Certification','Certification','Bureau of Indian Standards (BIS)','🏛️','BIS ensures product quality, safety, and compliance with Indian standards.',1,'🌐','Certification for foreign manufacturers exporting products to India under BIS scheme.',4,['Authorised Indian Representative','Factory audit coordination']),

  // BEE
  svc('bee-star-rating','Star Rating Label','Certification','Bureau of Energy Efficiency (BEE)','⚡','BEE promotes energy efficiency and conservation in India.',2,'⭐','Energy star rating for appliances like ACs, refrigerators, fans, and TVs to indicate energy efficiency.',1,[]),
  svc('bee-registration','BEE Registration','Certification','Bureau of Energy Efficiency (BEE)','⚡','BEE promotes energy efficiency and conservation in India.',2,'📋','Mandatory registration for equipment manufacturers under the Standards & Labelling programme.',2,[]),
  svc('bee-led','BEE Certification for LED','Certification','Bureau of Energy Efficiency (BEE)','⚡','BEE promotes energy efficiency and conservation in India.',2,'💡','Certification for LED lighting products under BEE\'s mandatory scheme.',3,[]),

  // WPC
  svc('wpc-eta','Equipment Type Approval (ETA)','Certification','Wireless Planning and Coordination (WPC)','📡','WPC regulates the wireless spectrum and grants approvals for wireless devices in India.',3,'📻','Type approval for wireless and radio frequency devices before commercial sale in India.',1,['RF test coordination','Portal filing','DoT follow-up']),
  svc('wpc-il','Import License (IL)','Certification','Wireless Planning and Coordination (WPC)','📡','WPC regulates the wireless spectrum and grants approvals for wireless devices in India.',3,'🚢','Mandatory import license for restricted wireless equipment entering India.',2,[]),
  svc('wpc-sta','Short-Term Approval (STA)','Certification','Wireless Planning and Coordination (WPC)','📡','WPC regulates the wireless spectrum and grants approvals for wireless devices in India.',3,'⏱️','Temporary approval for wireless devices for demo, testing, or exhibition purposes.',3,[]),

  // TEC
  svc('tec-mandatory','Mandatory TEC Certification','Certification','Telecommunication Engineering Centre (TEC)','📶','TEC certifies telecom and network equipment for connection to Indian telecom networks.',4,'✅','Compulsory certification for telecom equipment connected to Indian public networks.',1,['MTCTE compliance','Lab testing support','DoT coordination']),
  svc('tec-voluntary','Voluntary TEC Certification','Certification','Telecommunication Engineering Centre (TEC)','📶','TEC certifies telecom and network equipment for connection to Indian telecom networks.',4,'🏅','Optional certification to demonstrate compliance with Indian telecom standards.',2,[]),
  svc('tec-interface','Interface Testing','Certification','Telecommunication Engineering Centre (TEC)','📶','TEC certifies telecom and network equipment for connection to Indian telecom networks.',4,'🔌','Testing of equipment interfaces as per DoT prescribed standards.',3,[]),

  // CDSCO
  svc('cdsco-medical-device','Medical Device Registration','Certification','Central Drugs Standard Control Organization (CDSCO)','⚕️','CDSCO regulates medical devices, diagnostics, and pharmaceutical products in India.',5,'🩺','Registration of medical devices under CDSCO\'s Medical Devices Rules 2017.',1,['SUGAM portal filing','Clinical data review','Import license']),
  svc('cdsco-ivd','In-Vitro Diagnostic Registration','Certification','Central Drugs Standard Control Organization (CDSCO)','⚕️','CDSCO regulates medical devices, diagnostics, and pharmaceutical products in India.',5,'🧪','Registration for diagnostic kits and reagents under CDSCO regulations.',2,[]),
  svc('cdsco-import-license','Import License for Devices','Certification','Central Drugs Standard Control Organization (CDSCO)','⚕️','CDSCO regulates medical devices, diagnostics, and pharmaceutical products in India.',5,'🚢','Mandatory import license for medical devices entering the Indian market.',3,[]),
  svc('cdsco-mfr-license','Manufacturing License','Certification','Central Drugs Standard Control Organization (CDSCO)','⚕️','CDSCO regulates medical devices, diagnostics, and pharmaceutical products in India.',5,'🏭','License for manufacturing medical devices in India.',4,[]),

  // FSSAI
  svc('fssai-basic','FSSAI Basic Registration','Certification','Food Safety and Standards Authority of India (FSSAI)','🍽️','FSSAI regulates food safety and quality standards across India.',6,'📝','For small food businesses with annual turnover up to ₹12 lakhs.',1,[]),
  svc('fssai-state','FSSAI State License','Certification','Food Safety and Standards Authority of India (FSSAI)','🍽️','FSSAI regulates food safety and quality standards across India.',6,'🏪','State-level license for mid-sized food businesses and manufacturers.',2,[]),
  svc('fssai-central','FSSAI Central License','Certification','Food Safety and Standards Authority of India (FSSAI)','🍽️','FSSAI regulates food safety and quality standards across India.',6,'🏢','Central license for large manufacturers, importers, and exporters of food products.',3,['FICS portal filing','Label compliance','Import clearance']),
  svc('fssai-import','Food Import Clearance','Certification','Food Safety and Standards Authority of India (FSSAI)','🍽️','FSSAI regulates food safety and quality standards across India.',6,'🚢','Clearance for imported food products through FSSAI\'s online portal.',4,[]),

  // EPR
  svc('epr-ewaste','E-Waste EPR Registration','Certification','Extended Producer Responsibility (EPR)','♻️','EPR compliance for e-waste, plastic waste, and battery waste under CPCB norms.',7,'💻','Registration on CPCB portal for producers and importers of electrical and electronic equipment.',1,['CPCB portal registration','Target setting','Annual return filing']),
  svc('epr-plastic','Plastic Waste EPR','Certification','Extended Producer Responsibility (EPR)','♻️','EPR compliance for e-waste, plastic waste, and battery waste under CPCB norms.',7,'🧴','Compliance for plastic packaging producers, importers, and brand owners.',2,[]),
  svc('epr-battery','Battery Waste EPR','Certification','Extended Producer Responsibility (EPR)','♻️','EPR compliance for e-waste, plastic waste, and battery waste under CPCB norms.',7,'🔋','EPR registration for portable, industrial, and automotive battery producers.',3,[]),
  svc('epr-annual-filing','Annual EPR Filing','Certification','Extended Producer Responsibility (EPR)','♻️','EPR compliance for e-waste, plastic waste, and battery waste under CPCB norms.',7,'📄','Yearly compliance returns and target fulfilment reporting to CPCB.',4,[]),

  // GMA
  svc('ce-marking','CE Marking (Europe)','Certification','Global Market Access (GMA)','🌍','International certifications for accessing global markets.',8,'🇪🇺','Conformity marking for products sold in the European Economic Area.',1,['Technical file','Notified body coordination','DoC drafting']),
  svc('fcc-authorization','FCC Authorization (USA)','Certification','Global Market Access (GMA)','🌍','International certifications for accessing global markets.',8,'🇺🇸','Federal Communications Commission authorization for US market entry.',2,['FCC ID registration','SDoC preparation','Lab coordination']),
  svc('ukca-marking','UKCA Marking (UK)','Certification','Global Market Access (GMA)','🌍','International certifications for accessing global markets.',8,'🇬🇧','UK Conformity Assessed marking for products placed on the UK market.',3,[]),
  svc('ic-certification','IC Certification (Canada)','Certification','Global Market Access (GMA)','🌍','International certifications for accessing global markets.',8,'🇨🇦','Innovation, Science and Economic Development Canada certification for radio devices.',4,[]),

  // Drone
  svc('drone-uin','Digital Sky UIN Registration','Certification','Drone Registration (DGCA)','🚁','End-to-end assistance for drone registration and UAS type certification under DGCA UAS Rules 2021.',9,'🌐','Unique Identification Number (UIN) registration for drones on the DGCA Digital Sky portal.',1,[]),
  svc('drone-rtc','RPAS Type Certificate (RTC)','Certification','Drone Registration (DGCA)','🚁','End-to-end assistance for drone registration and UAS type certification under DGCA UAS Rules 2021.',9,'📜','Type Certification for drone models from DGCA before commercial manufacture or import for sale in India.',2,[]),
  svc('drone-rpl','Remote Pilot Licence (RPL)','Certification','Drone Registration (DGCA)','🚁','End-to-end assistance for drone registration and UAS type certification under DGCA UAS Rules 2021.',9,'🎖️','Assistance with Remote Pilot Licence application, training coordination, and licence renewal.',3,[]),
  svc('drone-import','Drone Import Clearance','Certification','Drone Registration (DGCA)','🚁','End-to-end assistance for drone registration and UAS type certification under DGCA UAS Rules 2021.',9,'✈️','Guidance on import permissions, customs classification, and DGCA import authorisation for foreign-made drones.',4,[]),

  // ──────────────────────────── TESTING ────────────────────────────────────────
  // Safety
  svc('safety-electrical','Electrical Safety Testing','Testing','Safety Test (BIS)','🛡️','Safety testing of electrical and electronic products as per BIS/IS standards.',1,'⚡','Testing for electric shock, fire, and mechanical hazards per IS/IEC 60065, 60335, 62368 series.',1,[]),
  svc('safety-flammability','Flammability & Fire Testing','Testing','Safety Test (BIS)','🛡️','Safety testing of electrical and electronic products as per BIS/IS standards.',1,'🔥','Material and component flame retardancy testing as required under BIS product standards.',2,[]),
  svc('safety-mechanical','Mechanical Hazard Testing','Testing','Safety Test (BIS)','🛡️','Safety testing of electrical and electronic products as per BIS/IS standards.',1,'⚙️','Assessment of mechanical risks including sharp edges, moving parts, and structural integrity.',3,[]),
  svc('safety-rohs','Chemical & RoHS Testing','Testing','Safety Test (BIS)','🛡️','Safety testing of electrical and electronic products as per BIS/IS standards.',1,'🧪','Testing for restricted substances (lead, mercury, cadmium, etc.) under BIS chemical compliance.',4,[]),

  // EMC
  svc('emc-radiated','Radiated Emissions','Testing','EMC Test (TEC)','📡','Electromagnetic Compatibility testing for telecom and electronic products.',2,'📶','Measurement of unintentional electromagnetic energy radiated from equipment per CISPR/IS standards.',1,[]),
  svc('emc-conducted','Conducted Emissions','Testing','EMC Test (TEC)','📡','Electromagnetic Compatibility testing for telecom and electronic products.',2,'🔌','Testing of disturbances conducted onto the mains supply network.',2,[]),
  svc('emc-esd','ESD & Immunity Testing','Testing','EMC Test (TEC)','📡','Electromagnetic Compatibility testing for telecom and electronic products.',2,'⚡','Electrostatic discharge and electromagnetic immunity tests per IEC 61000 series.',3,[]),
  svc('emc-surge','Surge & EFT Testing','Testing','EMC Test (TEC)','📡','Electromagnetic Compatibility testing for telecom and electronic products.',2,'🌊','Surge immunity and electrical fast transient / burst testing.',4,[]),

  // RF
  svc('rf-frequency','Frequency & Spurious Emissions','Testing','RF Test (WPC)','📻','Radio Frequency testing for wireless devices seeking WPC Equipment Type Approval.',3,'📊','Verification of operating frequency accuracy and measurement of unwanted spurious emissions.',1,[]),
  svc('rf-power','RF Output Power','Testing','RF Test (WPC)','📻','Radio Frequency testing for wireless devices seeking WPC Equipment Type Approval.',3,'📡','Measurement of conducted and radiated transmit power levels against WPC-permitted limits.',2,[]),
  svc('rf-bandwidth','Occupied Bandwidth','Testing','RF Test (WPC)','📻','Radio Frequency testing for wireless devices seeking WPC Equipment Type Approval.',3,'📏','Measurement of signal bandwidth to confirm compliance with WPC spectrum allocations.',3,[]),
  svc('rf-sar','SAR Testing','Testing','RF Test (WPC)','📻','Radio Frequency testing for wireless devices seeking WPC Equipment Type Approval.',3,'🧠','Specific Absorption Rate testing for devices held close to the human body.',4,[]),

  // Performance
  svc('perf-lm79','LM-79 Photometric Testing','Testing','Performance & Efficiency Testing','🔆','Standardised performance testing for lighting and energy-using products.',4,'💡','Photometric testing for LED luminaires and lamps as per IES LM-79 standard — required for BEE star rating.',1,[]),
  svc('perf-lm80','LM-80 Lumen Maintenance','Testing','Performance & Efficiency Testing','🔆','Standardised performance testing for lighting and energy-using products.',4,'📉','Lumen maintenance testing for LED packages and modules per IES LM-80 for life prediction.',2,[]),
  svc('perf-ip','IP Rating Test','Testing','Performance & Efficiency Testing','🔆','Standardised performance testing for lighting and energy-using products.',4,'💧','Ingress Protection testing for dust and water resistance per IEC 60529.',3,[]),
  svc('perf-reach','REACH Testing','Testing','Performance & Efficiency Testing','🔆','Standardised performance testing for lighting and energy-using products.',4,'🧬','Testing for substances of very high concern (SVHC) under EU REACH regulation.',4,[]),

  // ──────────────────────────── INSPECTION ─────────────────────────────────────
  // Pre-shipment
  svc('psi-final','Final Random Inspection (FRI)','Inspection','Pre-Shipment Inspection','🔍','Independent product quality inspection before goods leave the factory.',1,'📦','Random sampling of finished goods to verify conformance with buyer specifications before shipment.',1,['AQL sampling','Defect classification','Inspection report within 24 hours']),
  svc('psi-container','Container Loading Supervision','Inspection','Pre-Shipment Inspection','🔍','Independent product quality inspection before goods leave the factory.',1,'🚢','Supervision of goods loading into container to ensure correct quantity and packaging.',2,[]),
  svc('psi-labelling','Product Label & Marking Verification','Inspection','Pre-Shipment Inspection','🔍','Independent product quality inspection before goods leave the factory.',1,'🏷️','Verification of product labels, barcodes, and statutory markings before export.',3,[]),

  // During Production
  svc('dupro-mid','During Production Inspection (DUPRO)','Inspection','During Production Inspection','🏭','Quality control checks during the manufacturing process before completion.',2,'⚙️','Inspection when 20–80% of production is complete to catch defects early and avoid mass rework.',1,[]),
  svc('dupro-material','Raw Material Inspection','Inspection','During Production Inspection','🏭','Quality control checks during the manufacturing process before completion.',2,'📋','Verification of incoming raw materials and components against approved specifications.',2,[]),

  // Factory Audit
  svc('audit-initial','Initial Factory Audit (IFA)','Inspection','Factory & Supplier Audit','🏢','Comprehensive assessment of supplier capability and compliance.',3,'🔎','Assess factory capacity, QMS, equipment, workforce, and compliance before placing orders.',1,['Facility inspection','QMS review','Audit report with rating']),
  svc('audit-social','Social Compliance Audit (CSR)','Inspection','Factory & Supplier Audit','🏢','Comprehensive assessment of supplier capability and compliance.',3,'🤝','Assessment of working conditions, labour practices, health & safety against SA8000 or equivalent standards.',2,[]),
  svc('audit-supplier','Supplier Evaluation Audit','Inspection','Factory & Supplier Audit','🏢','Comprehensive assessment of supplier capability and compliance.',3,'📊','Evaluate supplier financial stability, technical capabilities, and delivery track record.',3,[]),

  // ──────────────────────────── IT COMPLIANCE ──────────────────────────────────
  svc('iso-27001','ISO 27001 Implementation','IT Compliance','Information Security Management','🔒','End-to-end ISO 27001 ISMS implementation and certification support.',1,'🏅','Gap assessment, ISMS documentation, risk treatment plan, internal audit, and certification body liaison.',1,['Gap assessment','Risk treatment plan','Internal audit support']),
  svc('iso-27001-audit','ISO 27001 Internal Audit','IT Compliance','Information Security Management','🔒','End-to-end ISO 27001 ISMS implementation and certification support.',1,'🔍','Comprehensive internal audit of your ISMS against ISO 27001:2022 controls.',2,[]),
  svc('vapt-web','Web Application VAPT','IT Compliance','Vulnerability Assessment & Penetration Testing','🛡️','Manual and automated security testing of applications and infrastructure.',2,'🌐','In-depth penetration testing of web applications to identify OWASP Top 10 and beyond.',1,['Black/grey/white box testing','CVSS scoring','Remediation support']),
  svc('vapt-network','Network VAPT','IT Compliance','Vulnerability Assessment & Penetration Testing','🛡️','Manual and automated security testing of applications and infrastructure.',2,'🔗','External and internal network penetration testing for servers, firewalls, and endpoints.',2,[]),
  svc('vapt-mobile','Mobile App VAPT','IT Compliance','Vulnerability Assessment & Penetration Testing','🛡️','Manual and automated security testing of applications and infrastructure.',2,'📱','Security testing of Android and iOS apps per OWASP Mobile Testing Guide.',3,[]),
  svc('it-security-audit','IT Security Audit','IT Compliance','IT Audit & Compliance','🔐','Comprehensive IT infrastructure audits aligned to regulatory frameworks.',3,'🖥️','Infrastructure security review covering network, servers, cloud, policies, and access controls.',1,['CERT-In compliance','Gap report','Remediation roadmap']),
  svc('pci-dss','PCI DSS Compliance','IT Compliance','IT Audit & Compliance','🔐','Comprehensive IT infrastructure audits aligned to regulatory frameworks.',3,'💳','Payment Card Industry Data Security Standard compliance advisory and audit support.',2,[]),
];


const testimonials = [
  { name: 'Rajesh Kumar', company: 'TechCorp India Pvt Ltd', review: 'Absolute Veritas helped us achieve BIS certification in record time. Their team was professional, knowledgeable, and responsive throughout the process. Highly recommended for any compliance needs!', rating: 5 },
  { name: 'Priya Sharma', company: 'Innovate Electronics', review: 'Their WPC approval expertise is truly unmatched. They handled everything — from documentation to DoT coordination — without any hassle. We saved weeks of effort thanks to their streamlined process.', rating: 5 },
  { name: 'Arun Nair', company: 'Global Devices Ltd', review: 'CE marking support from Absolute Veritas was seamless. They understand European compliance deeply and guided us through the entire technical file preparation. Will use them again for sure.', rating: 5 },
  { name: 'Sonia Mehta', company: 'MedTech Solutions', review: 'CDSCO registration can be incredibly complex, but their team made it manageable. Their knowledge of the SUGAM portal and regulatory requirements saved us months of back-and-forth.', rating: 5 },
];

const blogs = [
  {
    title: 'BIS CRS Registration: Complete Guide for Electronics Manufacturers',
    slug: 'bis-crs-registration-complete-guide',
    category: 'Certification',
    excerpt: 'A step-by-step guide to obtaining BIS CRS (Compulsory Registration Scheme) certification for electronics products sold in India — covering eligible products, lab testing, and portal filing.',
    content: `<p>The Bureau of Indian Standards (BIS) Compulsory Registration Scheme (CRS) mandates that all electronics and IT products listed under the Electronics and Information Technology Goods (EITG) Order must be registered before they can be imported or sold in India.</p>
<p>Currently, over 70 product categories require CRS registration, including mobile phones, laptops, tablets, LED lights, power banks, CCTV cameras, and set-top boxes. The list is expanding annually, so manufacturers must monitor MEITY notifications closely.</p>
<h3>Step-by-Step CRS Process</h3>
<p><strong>Step 1 — Product Testing:</strong> Get your product tested at a BIS-empanelled laboratory. The lab issues a test report valid for two years confirming compliance with the relevant IS standard.</p>
<p><strong>Step 2 — Application on BIS Portal:</strong> Apply on the BIS Manak Online portal (manakonline.in). Upload the test report, factory details, authorised representative details, and product information.</p>
<p><strong>Step 3 — Factory Audit:</strong> BIS conducts a factory inspection (for domestic manufacturers) or an audit by an authorised Indian Representative (for foreign manufacturers).</p>
<p><strong>Step 4 — Grant of Registration:</strong> Upon successful verification, BIS grants the R-number (registration number), which must be marked on every unit and packaging.</p>
<h3>Key Compliance Points</h3>
<p>The CRS registration is valid for two years and must be renewed before expiry. Surveillance tests are conducted periodically. Selling unregistered products under EITG Order invites penalties under the BIS Act 2016, including fines up to ₹2 lakhs and imprisonment.</p>
<p>Absolute Veritas handles the entire CRS registration lifecycle — from lab testing coordination and application filing to renewal management and surveillance support.</p>`,
    tags: ['BIS', 'CRS', 'electronics', 'certification', 'India'],
    author: 'Absolute Veritas',
    isPublished: true,
    publishedAt: new Date('2025-03-10'),
  },
  {
    title: 'WPC Equipment Type Approval (ETA): Process, Documents & Timeline',
    slug: 'wpc-eta-process-documents-timeline',
    category: 'Certification',
    excerpt: 'Everything you need to know about getting WPC Equipment Type Approval for wireless devices in India — from RF lab testing to DoT submission and common rejection reasons.',
    content: `<p>Any wireless device operating in India — including Wi-Fi routers, Bluetooth accessories, smart meters, drones, and IoT devices — requires Equipment Type Approval (ETA) from the Wireless Planning and Coordination (WPC) Wing of the Department of Telecommunications (DoT).</p>
<p>The ETA certifies that the device operates within India's allocated frequency bands and does not cause harmful interference to other radio users.</p>
<h3>Documents Required for ETA</h3>
<p>The ETA application requires: RF test reports from a WPC-recognised laboratory, technical specifications and block diagram of the device, authorization letter from the foreign manufacturer (if applicable), and the applicant's GST and import-export code (IEC).</p>
<h3>ETA Application Process</h3>
<p><strong>RF Testing:</strong> The device must be tested at a lab recognised by WPC for conducted and radiated emissions, frequency accuracy, output power, and spurious emissions.</p>
<p><strong>Online Filing:</strong> The application is filed on the Wireless Monitoring Organisation (WMO) portal (wpc.gov.in) along with the test report, technical documents, and application fee.</p>
<p><strong>Grant of ETA:</strong> WPC reviews the application and issues the ETA certificate, typically within 4–8 weeks. The ETA number must be printed on the product label.</p>
<h3>Common Rejection Reasons</h3>
<p>Applications are rejected most often due to: RF parameters outside permitted limits, missing or incomplete test reports, and incorrect frequency declarations. Absolute Veritas pre-screens all applications to minimise rejection risk.</p>`,
    tags: ['WPC', 'ETA', 'wireless', 'DoT', 'India'],
    author: 'Absolute Veritas',
    isPublished: true,
    publishedAt: new Date('2025-04-02'),
  },
  {
    title: 'TEC Mandatory Testing and Certification Order (MTCTE): What Importers Must Know',
    slug: 'tec-mtcte-guide-for-importers',
    category: 'Certification',
    excerpt: 'The TEC MTCTE order makes certification mandatory for telecom equipment connected to Indian networks. This guide covers affected products, the certification process, and penalties for non-compliance.',
    content: `<p>The Telecom Engineering Centre (TEC), under the Department of Telecommunications (DoT), issued the Mandatory Testing and Certification of Telecom Equipment (MTCTE) Order in 2021. It requires all telecom and related IT equipment connected to public telecommunications networks in India to be certified before sale or import.</p>
<p>The MTCTE order currently covers over 15 product categories, including routers, Wi-Fi access points, DSL modems, IP phones, network switches, and optical fibre cables.</p>
<h3>Who Needs TEC Certification?</h3>
<p>Any manufacturer, importer, or distributor dealing in equipment listed under the MTCTE order must obtain TEC certification. The certificate is tied to the specific model and must be renewed every three years.</p>
<h3>Certification Process</h3>
<p><strong>Testing at Designated Labs:</strong> Products must be tested at TEC-designated test labs for essential requirements covering safety, EMC, and functional performance as per TEC standards.</p>
<p><strong>Application to TEC:</strong> Submit the test report, product technical specifications, and manufacturer declaration on the TEC portal. After review, TEC issues the Equipment Approval Certificate (EAC).</p>
<p><strong>Marking:</strong> The TEC certificate number must appear on the product label and all commercial documentation.</p>
<h3>Penalties</h3>
<p>Selling or importing uncertified MTCTE-listed equipment can result in fines up to ₹50 lakhs under the Indian Telegraph Act and seizure of goods at the port of entry. Customs authorities now actively check for MTCTE compliance.</p>`,
    tags: ['TEC', 'MTCTE', 'telecom', 'certification', 'DoT'],
    author: 'Absolute Veritas',
    isPublished: true,
    publishedAt: new Date('2025-04-20'),
  },
  {
    title: 'CDSCO Medical Device Registration in India: Class A to D Explained',
    slug: 'cdsco-medical-device-registration-class-guide',
    category: 'Certification',
    excerpt: 'India classifies medical devices into four risk classes under MDR 2017. This guide explains classification rules, registration timelines, and required documents for Class A, B, C, and D devices.',
    content: `<p>The Central Drugs Standard Control Organization (CDSCO) regulates medical devices in India under the Medical Devices Rules (MDR) 2017. All medical devices — from syringes and thermometers to MRI machines and implants — must be registered before they can be sold or imported in India.</p>
<h3>Risk-Based Classification</h3>
<p>India classifies medical devices into four risk classes based on intended use and risk to the patient:</p>
<p><strong>Class A (Low Risk):</strong> Surgical gloves, tongue depressors, examination gloves. Requires only a manufacturer's declaration and basic CDSCO registration.</p>
<p><strong>Class B (Low-Moderate Risk):</strong> Hypodermic needles, sutures, CT scan machines. Requires full CDSCO registration with test reports.</p>
<p><strong>Class C (Moderate-High Risk):</strong> Lung ventilators, bone fixation plates, haemodialysers. Requires clinical data and conformity assessment.</p>
<p><strong>Class D (High Risk):</strong> Heart valves, implantable defibrillators, CNS implants. Requires the most rigorous clinical evidence and post-market surveillance plan.</p>
<h3>Registration Process for Importers</h3>
<p>Foreign manufacturers must appoint an Indian Authorised Representative (AR). The AR submits the application on the SUGAM portal with technical documentation, performance test reports, and the manufacturing site's quality system certificate (e.g., ISO 13485).</p>
<p>Import licenses are granted by the Central Licensing Authority (CLA) and are valid for life (with no renewal required, unless the device is modified). Review timelines range from 30 days for Class A to 9–12 months for Class D devices.</p>`,
    tags: ['CDSCO', 'medical device', 'MDR 2017', 'import license', 'India'],
    author: 'Absolute Veritas',
    isPublished: true,
    publishedAt: new Date('2025-05-05'),
  },
  {
    title: 'EPR Registration for E-Waste: Compliance Checklist for Producers & Importers',
    slug: 'epr-registration-e-waste-compliance-checklist',
    category: 'Certification',
    excerpt: 'Extended Producer Responsibility (EPR) under E-Waste Management Rules 2022 is mandatory for all producers, importers, and brand owners of electrical equipment. Here is a compliance checklist to get started.',
    content: `<p>India's E-Waste (Management) Rules 2022 mandate that all Producers (manufacturers and importers) of electrical and electronic equipment (EEE) listed in Schedule I must register on the CPCB's EPR portal and fulfil annual e-waste recycling targets.</p>
<h3>Who Must Register?</h3>
<p>Any company that manufactures or imports Schedule I EEE products — including consumer electronics, IT equipment, large and small home appliances, lighting equipment, and power tools — must register for EPR. There is no minimum turnover threshold.</p>
<h3>EPR Registration Checklist</h3>
<p><strong>1. Determine product category</strong> under Schedule I and calculate annual sales quantity (previous financial year).</p>
<p><strong>2. Create account</strong> on the CPCB EPR Portal (epronline.cpcb.gov.in) as a Producer.</p>
<p><strong>3. Upload documents:</strong> GST certificate, IEC (for importers), product list with HSN codes, company incorporation certificate, and authorised signatory details.</p>
<p><strong>4. Set EPR target:</strong> CPCB assigns collection and recycling targets based on your sales volume under a phase-in schedule.</p>
<p><strong>5. Tie up with registered recyclers:</strong> Arrange e-waste collection through PROs (Producer Responsibility Organisations) or directly empanelled dismantlers/recyclers registered on the portal.</p>
<p><strong>6. File annual return:</strong> Submit the Annual EPR Return by 30 June every year with proof of target fulfilment.</p>
<h3>Penalties</h3>
<p>Non-compliance attracts environmental compensation under Environment (Protection) Act 1986. CPCB has imposed penalties ranging from ₹5 lakhs to ₹2 crores on defaulting companies in recent enforcement drives.</p>`,
    tags: ['EPR', 'e-waste', 'CPCB', 'compliance', 'India'],
    author: 'Absolute Veritas',
    isPublished: true,
    publishedAt: new Date('2025-05-22'),
  },
  {
    title: 'FSSAI License for Food Importers: Central vs State vs Basic Registration',
    slug: 'fssai-license-food-importers-guide',
    category: 'Certification',
    excerpt: 'Any food business importing or selling food products in India must hold a valid FSSAI license. This guide explains the three tiers of FSSAI registration and which one your business needs.',
    content: `<p>The Food Safety and Standards Authority of India (FSSAI) is the apex body governing food safety and standards in India. Every Food Business Operator (FBO) — whether manufacturer, importer, distributor, or retailer — must obtain an FSSAI license or registration before commencing operations.</p>
<h3>Three Tiers of FSSAI Authorisation</h3>
<p><strong>FSSAI Basic Registration</strong> applies to FBOs with an annual turnover up to ₹12 lakhs. It is a simple registration (not a license) valid for 1–5 years and renewed online. It covers small petty food vendors and home-based food businesses.</p>
<p><strong>FSSAI State License</strong> is required for FBOs with turnover between ₹12 lakhs and ₹20 crores, or manufacturers with installed capacity up to 2 MT/day. State licenses are issued by State Food Safety Commissioners and are valid for 1–5 years.</p>
<p><strong>FSSAI Central License</strong> is mandatory for: food importers (all importers regardless of turnover), large manufacturers, exporters, and FBOs operating in more than one state. Issued by FSSAI headquarters in Delhi, it is essential for customs clearance of food imports.</p>
<h3>Import Clearance Process</h3>
<p>Every food import consignment must be cleared through FSSAI's online Food Import Clearance System (FICS). The importer must hold a valid Central License and submit product details, test reports (if required), and a declaration of compliance with Indian food safety standards. FSSAI officers inspect consignments and may draw samples for testing before allowing clearance.</p>
<h3>Label Compliance</h3>
<p>Imported food products must carry a label in English with: product name, ingredients list, nutritional information, net weight, country of origin, importer's name and address, FSSAI license number, and best-before date. Non-compliant labels must be re-labelled before customs release.</p>`,
    tags: ['FSSAI', 'food import', 'Central License', 'compliance', 'India'],
    author: 'Absolute Veritas',
    isPublished: true,
    publishedAt: new Date('2025-06-01'),
  },
];

const newsArticles = [
  {
    title: 'BIS Expands CRS Mandatory List: 12 New Product Categories Added for 2025',
    slug: 'bis-crs-mandatory-list-2025-new-categories',
    excerpt: 'Bureau of Indian Standards has added 12 new product categories to the Compulsory Registration Scheme, including smart home devices, electric scooter chargers, and industrial power supplies — effective April 2025.',
    content: `<p>The Bureau of Indian Standards (BIS) has notified an expansion of the Compulsory Registration Scheme (CRS) under the Electronics and IT Goods (EITG) Order, adding 12 new product categories effective from 1 April 2025. Manufacturers and importers of these products must obtain BIS CRS registration before selling or distributing in India.</p>
<p><strong>New Categories Include:</strong> Smart home automation controllers, Electric vehicle (EV) charging accessories, Uninterrupted Power Supply (UPS) units above 5KVA, Solar microinverters, Industrial switching power supplies, Wi-Fi 6 routers, True wireless stereo (TWS) earbuds and headsets, Wearable fitness trackers, Smart door locks, Air quality monitors with PM2.5 sensors, USB-C multi-port chargers above 65W, and Portable power stations.</p>
<p>The transition period allows six months for existing stock already imported before the notification date. New imports and domestically manufactured products, however, require registration from the effective date.</p>
<p>Companies dealing in these product categories are advised to initiate BIS empanelled laboratory testing immediately, as lab slots are expected to fill quickly ahead of the deadline.</p>
<p>Absolute Veritas has already begun handling CRS applications for several of the new categories. Contact us for a fast-track assessment of your product's registration readiness.</p>`,
    category: 'BIS',
    tags: ['BIS', 'CRS', 'electronics', '2025', 'mandatory'],
    isTrending: true,
    isPublished: true,
    publishedAt: new Date('2025-03-18'),
  },
  {
    title: 'WPC Introduces New Online ETA Portal: Faster Approvals from May 2025',
    slug: 'wpc-new-online-eta-portal-2025',
    excerpt: 'The Wireless Planning and Coordination Wing has launched a revamped online portal for Equipment Type Approval (ETA), promising 40% faster processing and a single-window system for all wireless device approvals.',
    content: `<p>The Department of Telecommunications' Wireless Planning and Coordination (WPC) Wing has launched a redesigned online portal for Equipment Type Approval (ETA) applications, promising significantly reduced processing times and a unified dashboard for all wireless device submissions.</p>
<p>The new portal, accessible at wpc.gov.in, consolidates ETA, Import License (IL), and Short Term Approval (STA) applications into a single interface. Key improvements include: real-time application status tracking, automated document checklist validation before submission, digital fee payment integration, and direct communication channel between applicant and WPC officer.</p>
<p><strong>Processing Time Improvement:</strong> WPC officials have indicated that average ETA processing time is expected to drop from 8–12 weeks to 4–6 weeks under the new system, provided applications are complete and RF test reports meet all parameters.</p>
<p>Companies that previously submitted physical applications must now register on the new portal and link their existing approvals to the new system before 30 June 2025 to ensure continuity.</p>
<p>Absolute Veritas is fully onboarded on the new WPC portal and is accepting new ETA mandates under the improved process.</p>`,
    category: 'WPC',
    tags: ['WPC', 'ETA', 'portal', 'wireless', '2025'],
    isTrending: true,
    isPublished: true,
    publishedAt: new Date('2025-04-05'),
  },
  {
    title: 'TEC Extends MTCTE Deadline for Wi-Fi 6E and 5G CPE Devices',
    slug: 'tec-mtcte-deadline-wifi-6e-5g-cpe-extension',
    excerpt: 'Telecom Engineering Centre has granted a six-month extension for MTCTE certification of Wi-Fi 6E routers and 5G Customer Premises Equipment (CPE), giving importers until October 2025 to complete certification.',
    content: `<p>The Telecom Engineering Centre (TEC) has announced a six-month extension for Mandatory Testing and Certification of Telecom Equipment (MTCTE) compliance for two product categories: Wi-Fi 6E (6 GHz band) routers and access points, and 5G Customer Premises Equipment (CPE) including fixed wireless access (FWA) devices.</p>
<p>The extension, effective from April 2025, moves the mandatory compliance deadline to 1 October 2025. TEC cited the limited availability of accredited test labs capable of handling 6 GHz and 5G mmWave testing as the primary reason for the extension.</p>
<p><strong>What This Means for Importers:</strong> Products already under import customs clearance process before 1 October 2025 may be cleared without MTCTE certification, provided the importer files a self-undertaking to obtain certification within 90 days of import. After 1 October 2025, strict compliance will be enforced at all ports of entry.</p>
<p>TEC has also announced plans to add additional product categories to the MTCTE mandatory list by Q3 2025, including IoT gateways, private LTE equipment, and satellite communication terminals.</p>
<p>Manufacturers and importers are advised to begin TEC testing immediately to avoid a last-minute rush when the deadline approaches.</p>`,
    category: 'TEC',
    tags: ['TEC', 'MTCTE', '5G', 'Wi-Fi 6E', 'deadline'],
    isTrending: false,
    isPublished: true,
    publishedAt: new Date('2025-04-14'),
  },
  {
    title: 'CDSCO Notifies New Medical Device Classification Rules — 220 Devices Reclassified',
    slug: 'cdsco-medical-device-reclassification-2025',
    excerpt: 'CDSCO has updated risk-based classifications under MDR 2017, moving 220 medical device types to higher risk categories. Many Class B devices are now Class C, triggering stricter registration requirements.',
    content: `<p>The Central Drugs Standard Control Organization (CDSCO) has issued a gazette notification updating the risk classification of 220 medical device types under the Medical Devices Rules (MDR) 2017. The reclassification, which takes effect from 1 July 2025, primarily upgrades previously Class B devices to Class C, imposing more rigorous clinical data and conformity assessment requirements.</p>
<p><strong>Notable Reclassifications Include:</strong> Pulse oximeters (Class B → Class C), Non-invasive glucose monitors (Class B → Class C), Home blood pressure monitors with wireless connectivity (Class B → Class C), High-flow nasal cannula devices (Class B → Class C), and Continuous positive airway pressure (CPAP) machines (Class C → Class D).</p>
<p>Companies currently holding valid CDSCO import licenses for reclassified devices are required to upgrade their registration to the new class by 31 December 2025. During the transition period, existing licenses remain valid, but any renewal application must comply with the new class requirements.</p>
<p><strong>Impact on Importers:</strong> Class C registration requires clinical evaluation reports, ISO 13485 certification of the manufacturer, and post-market surveillance (PMS) plan. Companies should begin clinical data gap assessment immediately given the volume of documentation required.</p>
<p>Absolute Veritas offers a complete reclassification impact assessment and can prepare all documentation needed for upgrading existing CDSCO registrations.</p>`,
    category: 'CDSCO',
    tags: ['CDSCO', 'medical device', 'MDR 2017', 'classification', '2025'],
    isTrending: true,
    isPublished: true,
    publishedAt: new Date('2025-05-02'),
  },
  {
    title: 'EPR Plastic Waste Targets for 2025–26: CPCB Issues New Compliance Guidelines',
    slug: 'epr-plastic-waste-targets-2025-26-cpcb',
    excerpt: 'CPCB has released updated EPR plastic waste collection and recycling targets for FY 2025–26, with a 20% increase in mandatory recycling obligations for importers and brand owners under Plastic Waste Management Rules.',
    content: `<p>The Central Pollution Control Board (CPCB) has published revised Extended Producer Responsibility (EPR) targets for plastic waste under the Plastic Waste Management (PWM) Rules for the financial year 2025–26. The new targets represent a 20% increase in mandatory recycling obligations compared to FY 2024–25.</p>
<p><strong>Key Changes for 2025–26:</strong></p>
<p>Category I (rigid plastic packaging) — Recycling obligation increased from 45% to 55% of quantity sold. Category II (flexible plastic packaging) — Recycling obligation increased from 30% to 40%. Category III (multi-layer plastic packaging) — Producers must now fulfil 25% recycling obligation, up from 20%.</p>
<p>CPCB has also introduced a new obligation for producers dealing in Category IV (extended plastic applications like PVC pipes, synthetic textiles) to register on the EPR portal for the first time, with an initial recycling obligation of 15%.</p>
<p><strong>Enforcement Tightening:</strong> CPCB has announced that environmental compensation for non-fulfilment of EPR targets will be calculated at ₹150 per kg of shortfall for FY 2025–26, up from ₹100 per kg in the previous year. Repeated non-compliance for two consecutive years will attract licence suspension.</p>
<p>Companies that have not yet registered on CPCB's EPR portal or have not filed their FY 2024–25 annual return (due 30 June 2025) are advised to do so immediately to avoid penalties.</p>`,
    category: 'EPR',
    tags: ['EPR', 'plastic waste', 'CPCB', 'recycling', '2025-26'],
    isTrending: false,
    isPublished: true,
    publishedAt: new Date('2025-05-20'),
  },
  {
    title: 'CE Marking RED Directive Update: New Requirements for IoT and Smart Devices',
    slug: 'ce-marking-red-directive-iot-smart-devices-2025',
    excerpt: 'The EU Radio Equipment Directive (RED) now mandates cybersecurity and privacy requirements for all internet-connected radio devices sold in Europe. Delegated Regulation 2022/30 becomes fully applicable from August 2025.',
    content: `<p>The European Union's Delegated Regulation (EU) 2022/30, which extends cybersecurity and privacy requirements under the Radio Equipment Directive (RED) to all internet-connected radio equipment, becomes fully applicable from 1 August 2025. Indian exporters selling wireless or internet-enabled devices in Europe must now ensure compliance with these additional essential requirements to maintain valid CE marking.</p>
<p><strong>New Requirements Under RED Delegated Regulation 2022/30:</strong></p>
<p>Article 3(3)(d) — Network protection: Devices must not harm the network or its functioning, including prevention of unauthorized access, data exfiltration, and DoS attacks on the network. Article 3(3)(e) — Personal data protection: Devices must incorporate features to ensure protection of personal data and privacy of users, aligned with GDPR requirements. Article 3(3)(f) — Anti-fraud: Devices must incorporate safeguards to protect against fraudulent use, including unauthorized access to the device or its features.</p>
<p><strong>Affected Product Categories:</strong> Wi-Fi routers and access points, Smart home devices (speakers, displays, bulbs), Wearable health devices, Baby monitors with connectivity, Industrial IoT sensors, Smartphones and tablets, Smart toys and educational devices.</p>
<p>Indian manufacturers and exporters must update their technical files, conduct fresh conformity assessments covering the new cybersecurity requirements, and update their Declaration of Conformity (DoC) before August 2025.</p>
<p>Non-compliant products placed on the EU market after the deadline will be subject to market withdrawal and potential fines from national market surveillance authorities.</p>`,
    category: 'CE',
    tags: ['CE', 'RED', 'IoT', 'cybersecurity', 'Europe', '2025'],
    isTrending: true,
    isPublished: true,
    publishedAt: new Date('2025-06-10'),
  },
  {
    title: 'CERT-In Mandates New Cybersecurity Compliance for IT Companies — ISO 27001 Now Preferred Framework',
    slug: 'cert-in-cybersecurity-compliance-iso-27001-2025',
    excerpt: 'CERT-In has updated its Cyber Crisis Management Plan (CCMP) guidelines, designating ISO 27001:2022 as the preferred baseline for critical information infrastructure operators and IT service providers.',
    content: `<p>India's Computer Emergency Response Team (CERT-In) has updated its Cyber Crisis Management Plan (CCMP) 2024 guidelines, formally designating ISO/IEC 27001:2022 as the preferred baseline Information Security Management System (ISMS) framework for Critical Information Infrastructure (CII) operators, IT/ITeS companies above ₹100 crore revenue, and all government IT service providers.</p>
<p>The updated guidelines, effective from 1 April 2025, require covered entities to either hold a valid ISO 27001:2022 certification from an accredited certification body, or demonstrate equivalent controls through a CERT-In empanelled auditor assessment within 18 months.</p>
<p><strong>Key Compliance Milestones:</strong></p>
<p>Within 6 months (by October 2025): Conduct an ISO 27001:2022 gap assessment and submit findings to CERT-In's reporting portal. Within 12 months (by April 2026): Complete Statement of Applicability (SoA) and risk treatment plan. Within 18 months (by October 2026): Achieve ISO 27001:2022 certification or equivalent audit clearance.</p>
<p><strong>New Controls Under ISO 27001:2022:</strong> The 2022 revision introduced 11 new controls compared to the 2013 version, including threat intelligence (5.7), information security for cloud services (5.23), ICT readiness for business continuity (5.30), data masking (8.11), data leakage prevention (8.12), and web filtering (8.23).</p>
<p>Companies holding ISO 27001:2013 certification are required to transition to the 2022 version by October 2025, which is the global sunset date for the 2013 standard.</p>
<p>Absolute Veritas offers end-to-end ISO 27001:2022 implementation — from gap assessment and documentation to internal audit and certification body liaison.</p>`,
    category: 'IT Compliance',
    tags: ['CERT-In', 'ISO 27001', 'cybersecurity', 'ISMS', 'India', '2025'],
    isTrending: true,
    isPublished: true,
    publishedAt: new Date('2025-06-15'),
  },
  {
    title: 'FCC Proposes New Labelling Requirements for IoT Devices: Cyber Trust Mark Programme',
    slug: 'fcc-cyber-trust-mark-iot-labelling-programme',
    excerpt: 'The US FCC\'s voluntary IoT Cyber Trust Mark labelling programme is launching in 2025. Indian exporters to the US market should understand the security benchmarks required to display the new shield logo on IoT products.',
    content: `<p>The US Federal Communications Commission (FCC) has launched the IoT Cyber Trust Mark programme — a voluntary cybersecurity labelling scheme for consumer IoT devices sold in the United States. While voluntary initially, major US retailers are expected to make the Cyber Trust Mark a procurement requirement from late 2025.</p>
<p><strong>What Is the Cyber Trust Mark?</strong> It is a shield-shaped logo that manufacturers may affix to qualifying IoT products to signal that the device meets specific cybersecurity standards set by the National Institute of Standards and Technology (NIST). The label includes a QR code linking to a publicly accessible registry with device-specific security details.</p>
<p><strong>Minimum Requirements for the Mark:</strong> Unique and strong default passwords per device, Data encryption in transit and at rest, Regular security patch availability for a defined support period, Secure update mechanism with digital signature verification, Minimal data collection policy disclosure, Vulnerability disclosure programme in place.</p>
<p>Products that meet these requirements can apply to FCC-recognized Cyber Trust Mark administrators for certification. The FCC has designated Underwriters Laboratories (UL) and CSA Group as initial administrators.</p>
<p><strong>What Indian Exporters Should Do:</strong> Conduct a product security assessment against NIST SP 800-213 IoT baseline. Commission penetration testing for firmware and communication interfaces. Establish a Software Bill of Materials (SBOM) for all components. Set up a public vulnerability disclosure programme (VDP).</p>
<p>Absolute Veritas can coordinate FCC authorization and Cyber Trust Mark security assessments for Indian manufacturers targeting the US IoT market.</p>`,
    category: 'FCC',
    tags: ['FCC', 'IoT', 'Cyber Trust Mark', 'cybersecurity', 'USA', '2025'],
    isTrending: false,
    isPublished: true,
    publishedAt: new Date('2025-06-18'),
  },
];

const newsletters = [
  {
    title: 'Absolute Veritas Regulatory Compliance Bulletin — Q1 2025',
    slug: 'av-bulletin-q1-2025',
    edition: 'Q1 2025 Edition',
    month: 'March',
    year: 2025,
    excerpt: 'BIS CRS expansion to 12 new categories, WPC portal update, TEC MTCTE enforcement update, and CDSCO medical device reclassification — all in one quarterly digest.',
    content: `<h2>Welcome to the Q1 2025 Edition</h2>
<p>This quarter brought significant regulatory movement across multiple compliance frameworks in India. Our team has compiled the key changes that affect manufacturers, importers, and exporters selling in and from India.</p>

<h2>BIS CRS — 12 New Categories Added</h2>
<p>The Bureau of Indian Standards has expanded the Compulsory Registration Scheme (CRS) under the EITG Order by adding 12 new product categories effective from 1 April 2025. The new additions include smart home devices, EV charging accessories, Wi-Fi 6 routers, true wireless stereo earbuds, and USB-C multi-port chargers above 65W.</p>
<p>Manufacturers and importers dealing in these categories are advised to initiate BIS empanelled laboratory testing immediately. Registration applications must be filed before products can be sold or distributed in India. A six-month transition window is available for existing stock imported before the notification date.</p>
<p><strong>Action Required:</strong> If your product falls under any of the 12 new CRS categories, contact us for a product classification assessment and fast-track registration support.</p>

<h2>WPC — New Online ETA Portal Launched</h2>
<p>The Wireless Planning and Coordination (WPC) Wing has launched a revamped portal for Equipment Type Approval (ETA) applications. The new system consolidates ETA, Import License, and Short-Term Approval into a single dashboard with real-time status tracking and automated document validation.</p>
<p>Processing time is expected to reduce from 8–12 weeks to 4–6 weeks. Companies must register on the new portal and link existing approvals before 30 June 2025.</p>

<h2>TEC MTCTE — Extension for Wi-Fi 6E and 5G CPE</h2>
<p>TEC has granted a six-month extension for MTCTE compliance for Wi-Fi 6E routers and 5G Customer Premises Equipment (CPE). The new mandatory deadline is 1 October 2025. This extension was granted due to limited lab capacity for 6 GHz and 5G mmWave testing. Importers should use this window to initiate TEC testing immediately rather than waiting for the deadline.</p>

<h2>CDSCO — 220 Devices Reclassified</h2>
<p>CDSCO has reclassified 220 medical device types to higher risk categories under MDR 2017. Key reclassifications include pulse oximeters, non-invasive glucose monitors, home blood pressure monitors with wireless connectivity, and CPAP machines. Companies with existing import licenses for reclassified devices must upgrade to the new class by 31 December 2025.</p>

<h2>Our Services This Quarter</h2>
<p>Absolute Veritas successfully completed over 150 compliance projects this quarter, including 62 BIS CRS registrations, 28 WPC ETA approvals, 15 TEC MTCTE certifications, and 12 CDSCO medical device registrations. Our average project timeline has decreased by 18% following our expanded team and process improvements.</p>

<p>For assistance with any of the regulatory changes mentioned in this bulletin, please reach out to us at cs@absoluteveritas.com or call +91-7303215033.</p>`,
    isPublished: true,
  },
  {
    title: 'IT Compliance & Cybersecurity Bulletin — May 2025',
    slug: 'it-compliance-bulletin-may-2025',
    edition: 'May 2025 Edition',
    month: 'May',
    year: 2025,
    excerpt: 'CERT-In mandates ISO 27001:2022, EPR plastic waste targets increase 20%, CE RED cybersecurity requirements for IoT devices, and FCC Cyber Trust Mark programme launch.',
    content: `<h2>IT Compliance & Cybersecurity Update — May 2025</h2>
<p>May 2025 has been a landmark month for IT compliance and cybersecurity regulation globally and in India. This special edition focuses exclusively on developments affecting IT companies, electronics exporters, and connected device manufacturers.</p>

<h2>CERT-In — ISO 27001:2022 Now Mandatory Baseline</h2>
<p>India's Computer Emergency Response Team (CERT-In) has updated its Cyber Crisis Management Plan (CCMP) to designate ISO/IEC 27001:2022 as the preferred baseline ISMS framework. The mandate applies to Critical Information Infrastructure operators, IT/ITeS companies with annual revenue above ₹100 crore, and all government IT service providers.</p>
<p><strong>Key Milestones:</strong></p>
<p>By October 2025: Complete ISO 27001:2022 gap assessment and submit to CERT-In portal. By April 2026: Complete Statement of Applicability and risk treatment plan. By October 2026: Achieve certification or equivalent audit clearance.</p>
<p>Companies holding ISO 27001:2013 certification must transition to the 2022 version by October 2025, which is the global sunset date for the 2013 standard. The 2022 revision adds 11 new controls, including threat intelligence, cloud service security, data masking, and web filtering.</p>

<h2>CE Marking — RED Cybersecurity Requirements for IoT (August 2025)</h2>
<p>EU Delegated Regulation 2022/30 becomes fully applicable from 1 August 2025. This extends the Radio Equipment Directive (RED) to mandate cybersecurity and privacy requirements for all internet-connected radio devices sold in Europe. Affected products include Wi-Fi routers, smart home devices, wearables, baby monitors, smartphones, and smart toys.</p>
<p>Indian exporters must update their technical files, Declaration of Conformity, and CE marking documentation before August 2025. Products without cybersecurity compliance documentation will be subject to market withdrawal by EU national authorities.</p>

<h2>FCC — Cyber Trust Mark Programme for IoT</h2>
<p>The US FCC has launched the IoT Cyber Trust Mark programme — a voluntary cybersecurity label for consumer IoT devices. Major US retailers are expected to make it a procurement requirement from late 2025. The mark requires unique device passwords, data encryption, regular security patches, and a public vulnerability disclosure programme.</p>
<p>Indian IoT device exporters targeting the US market should begin security assessments against NIST SP 800-213 baseline and establish an SBOM (Software Bill of Materials) for all components.</p>

<h2>EPR — Plastic Waste Targets Increased 20%</h2>
<p>CPCB has increased mandatory plastic waste recycling obligations by 20% for FY 2025–26. Category I rigid plastic packaging obligations move from 45% to 55%. Environmental compensation for non-compliance has been increased from ₹100 to ₹150 per kg of shortfall. Companies must also file FY 2024–25 annual returns by 30 June 2025.</p>

<p>For IT compliance readiness assessments, ISO 27001 implementation, VAPT, or CE/FCC certification support, contact Absolute Veritas at cs@absoluteveritas.com.</p>`,
    isPublished: true,
  },
  {
    title: 'Mid-Year Regulatory Roundup — June 2025',
    slug: 'mid-year-regulatory-roundup-june-2025',
    edition: 'June 2025 Edition',
    month: 'June',
    year: 2025,
    excerpt: 'Comprehensive mid-year review covering BIS, WPC, TEC, CDSCO, EPR, CE, and IT Compliance changes — what has changed in H1 2025 and what to prepare for in H2.',
    content: `<h2>Mid-Year Regulatory Roundup — H1 2025 Review</h2>
<p>As we reach the midpoint of 2025, this edition offers a comprehensive review of all major regulatory developments across India and globally that affect manufacturers, importers, and IT companies. We also highlight key deadlines approaching in H2 2025.</p>

<h2>H1 2025 at a Glance</h2>
<p>The first half of 2025 has seen unprecedented regulatory activity. BIS added 12 new CRS categories, WPC launched a new approval portal, TEC expanded MTCTE enforcement, CDSCO reclassified 220 medical devices, EPR targets were increased, and CERT-In mandated ISO 27001:2022. Globally, the EU RED cybersecurity mandate and FCC Cyber Trust Mark have reshaped requirements for connected device exports.</p>

<h2>Critical Deadlines in H2 2025</h2>
<p><strong>30 June 2025:</strong> EPR FY 2024–25 annual return filing deadline. File on CPCB EPR portal or face environmental compensation.</p>
<p><strong>1 August 2025:</strong> EU RED Delegated Regulation 2022/30 becomes mandatory. All CE-marked internet-connected radio devices must comply with new cybersecurity requirements.</p>
<p><strong>1 October 2025:</strong> TEC MTCTE mandatory deadline for Wi-Fi 6E routers and 5G CPE. No further extensions expected.</p>
<p><strong>October 2025:</strong> ISO 27001:2013 global sunset date. All companies must transition to ISO 27001:2022.</p>
<p><strong>31 December 2025:</strong> CDSCO reclassified device license upgrade deadline.</p>

<h2>BIS Update: CRS Lab Slot Availability</h2>
<p>Following the April 2025 addition of 12 new CRS categories, BIS empanelled labs are reporting 6–8 week waiting times for new testing bookings. Companies planning CRS registration for products in the new categories are advised to book lab slots immediately. Absolute Veritas has pre-booked lab capacity for priority clients.</p>

<h2>WPC Update: New Portal — 30 June Migration Deadline</h2>
<p>All companies with existing WPC approvals must migrate to the new online portal and link their existing ETA, Import License, and STA certificates before 30 June 2025. Approvals not migrated by this date will require re-filing. Absolute Veritas is handling portal migration for over 40 client accounts.</p>

<h2>FSSAI: Import Clearance System Update</h2>
<p>FSSAI has updated its Food Import Clearance System (FICS) with new product classification rules. Importers of nutraceuticals, functional foods, and novel food ingredients must now provide additional documentation including ingredient-level safety assessments and country-of-origin certificates for all components. The new requirements are effective from 1 July 2025.</p>

<h2>Looking Ahead: H2 2025 Forecast</h2>
<p>Expect further BIS CRS expansion (MEITY is expected to add 8–10 more product categories in Q3 2025), TEC coverage expansion to IoT gateways and satellite terminals, and increased customs enforcement for MTCTE-listed products at all major Indian ports.</p>

<p>For comprehensive compliance planning for H2 2025, schedule a consultation with our regulatory experts at cs@absoluteveritas.com or +91-7303215033.</p>`,
    isPublished: true,
  },
];

const seedDB = async () => {
  await connectDB();
  await Promise.all([
    Service.deleteMany({}),
    Testimonial.deleteMany({}),
    Stats.deleteMany({}),
    Blog.deleteMany({}),
    News.deleteMany({}),
    Newsletter.deleteMany({}),
  ]);

  await Service.insertMany(services);
  await Testimonial.insertMany(testimonials);
  await Stats.create({ happyClients: 500, projectsCompleted: 1200, yearsOfJourney: 15, brandsServed: 200 });
  await Blog.insertMany(blogs);
  await News.insertMany(newsArticles);
  await Newsletter.insertMany(newsletters);

  console.log('Database seeded successfully!');
  process.exit(0);
};

seedDB().catch((err) => { console.error(err); process.exit(1); });
