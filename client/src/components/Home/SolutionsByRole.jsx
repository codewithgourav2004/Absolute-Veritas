import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ServiceModal from '../Services/ServiceModal';

const ROLES = [
  { id: 'manufacturer', label: 'I am a Manufacturer',         emoji: '🏭' },
  { id: 'importer',     label: 'I am an Importer / Foreign Brand', emoji: '🚢' },
  { id: 'retailer',     label: 'I am a Retailer / Seller',    emoji: '🛒' },
];

const ROLE_SERVICES = {
  manufacturer: [
    {
      emoji: '🏛️',
      title: 'BIS ISI Mark Certification',
      description: 'Mandatory quality certification for domestic manufacturers to use the ISI mark on products like cement, electronics, and steel.',
      link: '/services?category=Certification',
    },
    {
      emoji: '⚕️',
      title: 'CDSCO Medical Device License',
      description: 'Manufacturing license (Form MD-5/MD-9) from CDSCO for producing Class A, B, C, or D medical devices in India.',
      link: '/services?category=Certification',
    },
    {
      emoji: '♻️',
      title: 'EPR Registration (CPCB)',
      description: 'Extended Producer Responsibility compliance for manufacturers of plastic packaging, e-waste, and batteries.',
      link: '/services?category=Certification',
    },
    {
      emoji: '⚡',
      title: 'BEE Star Rating',
      description: "Mandatory energy-efficiency star rating for appliances like ACs, refrigerators, fans, and LEDs under BEE's S&L programme.",
      link: '/services?category=Certification',
    },
    {
      emoji: '📡',
      title: 'WPC Equipment Type Approval',
      description: 'Type approval for wireless and RF devices before commercial manufacture or sale in India.',
      link: '/services?category=Certification',
    },
    {
      emoji: '📶',
      title: 'TEC Mandatory Certification',
      description: 'Compulsory TEC certification for telecom equipment connected to Indian public networks.',
      link: '/services?category=Certification',
    },
  ],
  importer: [
    {
      emoji: '🌐',
      title: 'BIS FMCS Certification',
      description: 'Foreign Manufacturer Certification Scheme — required for international brands to export products to the Indian market legally.',
      link: '/services?category=Certification',
    },
    {
      emoji: '📱',
      title: 'BIS CRS Registration',
      description: 'Compulsory Registration Scheme for importers of electronics and IT products (laptops, adapters, smartwatches) into India.',
      link: '/services?category=Certification',
    },
    {
      emoji: '⚖️',
      title: 'LMPC Import License',
      description: 'Legal Metrology Packer/Importer Registration under Rule 27 for entities importing pre-packaged commodities into India.',
      link: '/services?category=Certification',
    },
    {
      emoji: '🇪🇺',
      title: 'CE Marking (Europe)',
      description: 'Conformity marking for products placed on the European Economic Area market — covers safety, EMC, and more.',
      link: '/services?category=Certification',
    },
    {
      emoji: '🇺🇸',
      title: 'FCC Authorization (USA)',
      description: 'Federal Communications Commission authorization for US market entry of electronic and wireless devices.',
      link: '/services?category=Certification',
    },
    {
      emoji: '🍽️',
      title: 'FSSAI Central License',
      description: 'Mandatory license for importers and large-scale food business operators entering the Indian food market.',
      link: '/services?category=Certification',
    },
  ],
  retailer: [
    {
      emoji: '💍',
      title: 'BIS Hallmarking',
      description: 'Compulsory registration for jewelers and retailers selling gold and silver artifacts to guarantee purity to consumers.',
      link: '/services?category=Certification',
    },
    {
      emoji: '📦',
      title: 'LMPC Packaged Commodities',
      description: 'Ensure retail shelves comply with Legal Metrology declarations on MRP, weight, and manufacturing details to avoid penalties.',
      link: '/services?category=Certification',
    },
    {
      emoji: '🏷️',
      title: 'Product Labelling Compliance',
      description: 'Mandatory labelling requirements for all packaged goods sold in India — MRP, ingredients, country of origin, and more.',
      link: '/services?category=Certification',
    },
    {
      emoji: '🛡️',
      title: 'ISI Mark Verification',
      description: 'Retailers selling ISI-marked products must verify authentic certification. We guide sellers on product compliance.',
      link: '/services?category=Certification',
    },
    {
      emoji: '🍽️',
      title: 'FSSAI Basic / State License',
      description: 'Food safety license for retail food businesses — Basic Registration up to ₹12L turnover, State License for larger operations.',
      link: '/services?category=Certification',
    },
    {
      emoji: '📋',
      title: 'Legal Metrology Registration',
      description: 'Registration of weights, measures, and packaging compliance for retailers dealing in measured or weighed commodities.',
      link: '/services?category=Certification',
    },
  ],
};

const SolutionsByRole = () => {
  const [activeRole, setActiveRole] = useState('manufacturer');
  const [enquireService, setEnquireService] = useState(null);

  const services = ROLE_SERVICES[activeRole];

  return (
    <section className="section-padding bg-pearl">
      <div className="container-max">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-crimson/10 text-crimson text-xs font-mono font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-4 border border-crimson/20">
            Solutions By Role
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-black text-indigo leading-tight mb-4">
            Tailored For{' '}
            <span className="text-crimson">Your Business</span>
          </h2>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Select your role to explore the most relevant regulatory certifications and compliance
            requirements for your operations.
          </p>
        </div>

        {/* Role tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {ROLES.map((role) => {
            const isActive = activeRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest border-2 transition-all duration-250 ${
                  isActive
                    ? 'bg-crimson text-white border-crimson shadow-lg shadow-crimson/25'
                    : 'bg-white text-indigo border-gray-200 hover:border-crimson hover:text-crimson hover:shadow-md'
                }`}
              >
                <span className="text-base">{role.emoji}</span>
                {role.label}
              </button>
            );
          })}
        </div>

        {/* Service cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div
              key={svc.title}
              className="group bg-white rounded-2xl border border-gray-100 hover:border-crimson/30 hover:shadow-xl transition-all duration-300 p-6 flex flex-col relative overflow-hidden"
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-crimson to-indigo opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

              {/* Decorative circle */}
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-pearl group-hover:bg-crimson/5 transition-colors duration-300" />

              {/* Icon */}
              <div className="relative z-10 w-13 h-13 rounded-xl bg-pearl border border-gray-200 group-hover:border-crimson/30 group-hover:bg-crimson/5 flex items-center justify-center text-2xl mb-5 transition-all duration-300"
                style={{ width: 52, height: 52 }}>
                {svc.emoji}
              </div>

              {/* Title */}
              <h3 className="font-display font-bold text-indigo text-[1rem] leading-snug mb-2 group-hover:text-crimson transition-colors duration-200">
                {svc.title}
              </h3>

              {/* Description */}
              <p className="text-gray-500 text-sm leading-relaxed flex-grow mb-6">
                {svc.description}
              </p>

              {/* Actions */}
              <div className="flex gap-3 mt-auto">
                <Link
                  to={svc.link}
                  className="flex-1 py-2.5 px-4 rounded-lg border-2 border-gray-200 text-indigo text-sm font-semibold text-center hover:border-indigo hover:bg-indigo hover:text-white transition-all duration-200"
                >
                  View Details →
                </Link>
                <button
                  onClick={() => setEnquireService({ name: svc.title })}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-crimson hover:bg-indigo text-white text-sm font-semibold text-center transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  Get Quote ✓
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {enquireService && (
        <ServiceModal service={enquireService} onClose={() => setEnquireService(null)} />
      )}
    </section>
  );
};

export default SolutionsByRole;
