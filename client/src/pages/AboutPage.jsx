import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/Common/SectionHeader';

const stats = [
  { value: '15+',   label: 'Years of Experience', icon: '🏆', color: 'from-indigo to-[#2d3566]' },
  { value: '1600+', label: 'Happy Clients',        icon: '🤝', color: 'from-crimson to-[#c0303b]' },
  { value: '12',    label: 'Asian Countries',      icon: '🌏', color: 'from-[#1e3a5f] to-[#163049]' },
  { value: '1100+', label: 'Projects Completed',   icon: '✅', color: 'from-[#14532d] to-[#166534]' },
];

const expertise = [
  { label: 'Electronics',          icon: '💻' },
  { label: 'Toys',                  icon: '🧸' },
  { label: 'Batteries',             icon: '🔋' },
  { label: 'Medical Devices',       icon: '🏥' },
  { label: 'Automobiles',           icon: '🚗' },
  { label: 'Audio Video Equipment', icon: '📺' },
  { label: 'Lighting Products',     icon: '💡' },
  { label: 'Software Testing',      icon: '🖥️' },
  { label: 'VAPT',                  icon: '🔐' },
  { label: 'Cyber Security',        icon: '🛡️' },
];

const team = [
  { name: 'Ankit Verma',  role: 'CEO & Founder',              expertise: 'BIS, WPC, TEC',          initial: 'AV' },
  { name: 'Neha Gupta',   role: 'Director — Certifications',  expertise: 'CDSCO, FSSAI, EPR',       initial: 'NG' },
  { name: 'Rahul Singh',  role: 'Head — IT Compliance',       expertise: 'ISO 27001, VAPT, Audit',  initial: 'RS' },
  { name: 'Priya Joshi',  role: 'Senior Consultant',          expertise: 'CE, FCC, International',  initial: 'PJ' },
];

const milestones = [
  { year: '2009', icon: '🏢', title: 'Founded', event: 'Established in New Delhi as a full-service TIC consultancy, starting with BIS & WPC certifications.' },
  { year: '2013', icon: '🌏', title: 'Global Expansion', event: 'Extended operations across 6 Asian countries, partnering with international accredited labs.' },
  { year: '2017', icon: '🔐', title: 'IT Compliance Launch', event: 'Launched dedicated IT Compliance and ISO 27001 practice to serve the digital sector.' },
  { year: '2020', icon: '🛡️', title: 'Cyber Security Division', event: 'Added VAPT, Cyber Security, Risk Management, and Payment Security Testing to our portfolio.' },
  { year: '2023', icon: '🏆', title: '1000+ Projects', event: 'Crossed a milestone of 1000+ successfully completed compliance and certification projects.' },
  { year: '2025', icon: '🚀', title: '12 Asian Countries', event: 'Now serving clients across 12 Asian countries with end-to-end regulatory compliance solutions.' },
];

const values = [
  { icon: '⚡', title: 'Prompt Response',        desc: 'Quick turnaround on all queries and project milestones.' },
  { icon: '🔬', title: 'Advanced Technology',    desc: 'State-of-the-art testing equipment and digital workflows.' },
  { icon: '📋', title: 'End-to-End Support',     desc: 'Full regulatory support — from testing to certification.' },
  { icon: '🌐', title: 'Global Network',         desc: 'Accredited labs across India and key international markets.' },
];

const AboutPage = () => (
  <>
    <Helmet>
      <title>About Us | Absolute Veritas</title>
      <meta name="description" content="Premier TIC compliance provider with 15+ years of experience across India and 12 Asian countries." />
    </Helmet>

    <div className="pt-16">

      {/* ── Hero ── */}
      <div className="bg-indigo pt-24 pb-0 px-4 relative overflow-hidden">
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        {/* Glow top-right */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(230,57,70,0.18) 0%, transparent 70%)' }} />
        {/* Glow bottom-left */}
        <div className="absolute -bottom-20 -left-20 w-[350px] h-[350px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm px-5 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-white/70">
              Who We Are
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display font-black text-white leading-tight mb-6" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)' }}>
            India's Most Trusted<br />
            <span className="relative inline-block">
              <span className="text-crimson">TIC &amp; IT Compliance</span>
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-crimson/40 rounded-full" />
            </span>
            {' '}Partner
          </h1>

          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Trusted by industries across India and 12 Asian countries for over 15 years — navigating complex regulatory landscapes so your products reach market faster.
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/contact-us" className="bg-crimson hover:bg-[#c0303b] text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-crimson/25 inline-flex items-center gap-2">
              Get Free Consultation
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link to="/services" className="bg-white/10 hover:bg-white/15 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/20 hover:border-white/40 transition-all inline-flex items-center gap-2">
              Explore Services
            </Link>
          </div>

          {/* Trust pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {['BIS', 'WPC', 'TEC', 'CDSCO', 'EPR', 'FSSAI', 'CE', 'FCC', 'ISO 27001', 'VAPT'].map((c) => (
              <span key={c} className="text-xs font-semibold text-white/50 border border-white/10 px-3 py-1 rounded-full bg-white/5">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Stat band — flush to bottom of hero */}
        <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 rounded-t-2xl overflow-hidden border border-white/10 border-b-0">
          {stats.map((s, i) => (
            <div key={s.label}
              className={`px-6 py-7 text-center relative ${i < 3 ? 'border-r border-white/10' : ''}`}
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              {/* Top accent line per stat */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                style={{ backgroundColor: i === 0 ? '#D4AF37' : i === 1 ? '#E63946' : i === 2 ? '#60a5fa' : '#4ade80' }} />
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-display text-3xl font-black text-gold mb-1">{s.value}</div>
              <div className="text-gray-400 text-xs tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── About Content ── */}
      <section className="section-padding bg-pearl">
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left — text */}
            <div>
              <span className="inline-block bg-crimson/10 text-crimson border border-crimson/20 text-xs font-mono font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-5">
                About Us
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-indigo mb-6 leading-tight">
                A Trusted Partner for<br /><span className="text-crimson">Compliance Excellence</span>
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-[0.95rem]">
                <p>
                  At Absolute Veritas, we are a premier provider of comprehensive compliance services in the Testing, Inspection, and Certification (TIC) industry. With over 15 years of experience, we have established ourselves as a trusted partner for numerous industries across India and beyond.
                </p>
                <p>
                  Registered in New Delhi, our expertise extends beyond national borders, covering twelve Asian countries for Quality Control and Inspection Services. We provide end-to-end solutions — product testing, certifications, inspections, and regulatory compliance — with lab partnerships both in India and abroad.
                </p>
                <p>
                  Our inspection and audits are conducted onsite, allowing us to provide thorough and accurate assessments tailored to your specific needs. Our team consists of experts and veterans from both the private and government sectors.
                </p>
              </div>

              {/* Values grid */}
              <div className="grid grid-cols-2 gap-3 mt-8">
                {values.map((v) => (
                  <div key={v.title} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3 items-start hover:border-crimson/20 hover:shadow-md transition-all duration-200">
                    <span className="text-xl flex-shrink-0">{v.icon}</span>
                    <div>
                      <h4 className="font-display font-bold text-indigo text-sm mb-0.5">{v.title}</h4>
                      <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/contact-us" className="btn-primary mt-8 inline-flex">
                Get Free Consultation
              </Link>
            </div>

            {/* Right — visual cards */}
            <div className="space-y-5">

              {/* Expertise */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-5 rounded-full bg-crimson" />
                  <h3 className="font-display font-bold text-indigo text-base">Product Compliance Expertise</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {expertise.map((e) => (
                    <span key={e.label} className="flex items-center gap-1.5 bg-pearl text-indigo text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 hover:border-crimson/30 hover:bg-crimson/5 transition-colors cursor-default">
                      <span>{e.icon}</span> {e.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Services coverage */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-5 rounded-full bg-gold" />
                  <h3 className="font-display font-bold text-indigo text-base">Regulatory Certifications We Cover</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['BIS', 'WPC', 'TEC', 'CDSCO', 'EPR', 'FSSAI', 'CE Marking', 'FCC', 'ISO 27001', 'VAPT', 'BEE', 'PESO', 'ETA'].map((c) => (
                    <span key={c} className="bg-indigo/5 text-indigo text-xs font-bold px-3 py-1.5 rounded-full border border-indigo/10">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact card */}
              <div className="bg-indigo rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
                <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-crimson/10 translate-y-6 -translate-x-4" />
                <div className="relative z-10">
                  <h3 className="font-display font-bold text-gold text-base mb-4">Absolute Veritas</h3>
                  <div className="space-y-2.5 text-sm">
                    {[
                      { icon: '📍', text: '31A, Molar Band Extension, South Delhi – 110044' },
                      { icon: '📍', text: '3C/19B, NIT Faridabad, Delhi NCR, Haryana – 121001' },
                      { icon: '✉️', href: 'mailto:cs@absoluteveritas.com', text: 'cs@absoluteveritas.com' },
                      { icon: '☎️', href: 'tel:01294001010', text: '0129-4001010' },
                      { icon: '📱', href: 'tel:+917303215033', text: '+91-7303215033' },
                    ].map((item, i) =>
                      item.href ? (
                        <a key={i} href={item.href} className="flex items-start gap-2.5 text-gray-300 hover:text-white transition-colors">
                          <span className="flex-shrink-0">{item.icon}</span> {item.text}
                        </a>
                      ) : (
                        <p key={i} className="flex items-start gap-2.5 text-gray-300">
                          <span className="flex-shrink-0">{item.icon}</span> {item.text}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Journey ── */}
      <section className="section-padding bg-white overflow-hidden">
        <div className="container-max">
          <SectionHeader
            tag="Our Journey"
            title="Milestones That Define Us"
            subtitle="Over 15 years of building trust, expanding reach, and delivering compliance excellence."
          />

          {/* Timeline */}
          <div className="relative max-w-5xl mx-auto mt-12">
            {/* Center vertical line */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-crimson via-indigo/40 to-transparent hidden md:block" />

            <div className="space-y-10">
              {milestones.map((m, i) => {
                const isLeft = i % 2 === 0;
                return (
                  <div key={m.year} className="relative flex flex-col md:flex-row items-center gap-4 md:gap-0">

                    {/* Left card (even) / empty space (odd) */}
                    <div className={`w-full md:w-[45%] ${isLeft ? 'md:pr-10' : 'md:order-3'}`}>
                      {isLeft ? (
                        <div className="bg-pearl border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-crimson/20 transition-all duration-300 group md:text-right">
                          <div className={`flex items-center gap-3 mb-3 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                            <span className="text-2xl">{m.icon}</span>
                            <h3 className="font-display font-bold text-indigo text-base group-hover:text-crimson transition-colors">{m.title}</h3>
                          </div>
                          <p className="text-gray-500 text-sm leading-relaxed">{m.event}</p>
                        </div>
                      ) : null}
                    </div>

                    {/* Center dot + year */}
                    <div className="md:w-[10%] flex flex-col items-center z-10 order-first md:order-2">
                      <div className="w-12 h-12 rounded-full bg-indigo flex items-center justify-center shadow-lg border-4 border-white ring-2 ring-crimson/30">
                        <span className="text-lg">{m.icon}</span>
                      </div>
                      <span className="mt-2 text-xs font-black text-crimson tracking-wider font-mono">{m.year}</span>
                    </div>

                    {/* Right card (odd) / empty space (even) */}
                    <div className={`w-full md:w-[45%] ${!isLeft ? 'md:pl-10' : 'md:order-3'}`}>
                      {!isLeft ? (
                        <div className="bg-pearl border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-crimson/20 transition-all duration-300 group">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">{m.icon}</span>
                            <h3 className="font-display font-bold text-indigo text-base group-hover:text-crimson transition-colors">{m.title}</h3>
                          </div>
                          <p className="text-gray-500 text-sm leading-relaxed">{m.event}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Services ── */}
      <section className="section-padding bg-pearl">
        <div className="container-max">
          <div className="flex items-center gap-4 mb-12 justify-center">
            <div className="flex-1 h-px bg-indigo/20 max-w-xs" />
            <h2 className="font-display text-2xl font-bold text-indigo tracking-widest uppercase whitespace-nowrap px-4">Our Services</h2>
            <div className="flex-1 h-px bg-indigo/20 max-w-xs" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Product Inspection',    desc: 'Minimize import risks and ensure quality through rigorous on-site inspections across India and Asia.', link: '/services?category=Inspection',   bg: 'from-indigo to-[#2d3566]', emoji: '🔍' },
              { title: 'Supplier Audits',        desc: "Evaluate suppliers' capabilities and responsible business practices based on international standards.", link: '/services?category=Inspection',   bg: 'from-[#1e3a5f] to-indigo',    emoji: '🏭' },
              { title: 'Testing & Certification',desc: 'Ensure your products comply with BIS, WPC, TEC, CDSCO, CE, FCC, and other mandatory standards.',   link: '/services?category=Certification',bg: 'from-[#7f1d1d] to-crimson',    emoji: '🏅' },
            ].map((svc) => (
              <div key={svc.title} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100">
                <div className={`h-44 bg-gradient-to-br ${svc.bg} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-500 relative z-10">{svc.emoji}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-bold text-indigo mb-2 group-hover:text-crimson transition-colors">{svc.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{svc.desc}</p>
                  <Link to={svc.link} className="inline-flex items-center gap-1.5 text-crimson font-semibold text-sm hover:gap-3 transition-all duration-200">
                    Learn More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vision ── */}
      <section className="section-padding bg-indigo relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800'%3E%3Ccircle cx='400' cy='400' r='100' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3Ccircle cx='400' cy='400' r='220' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3Ccircle cx='400' cy='400' r='360' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: '800px 800px', backgroundPosition: 'right -200px center' }} />

        <div className="relative z-10 container-max">
          <div className="text-center mb-12">
            <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-gold">Our Vision</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Pioneering Excellence in TIC</h2>
          </div>

          <div className="grid lg:grid-cols-5 gap-10 items-start mb-12">
            <div className="lg:col-span-3 relative">
              <span className="absolute -top-4 -left-2 font-display text-[120px] leading-none text-crimson/20 select-none pointer-events-none">"</span>
              <div className="relative pl-6 border-l-2 border-crimson/40">
                <p className="font-display text-white text-xl md:text-2xl font-semibold leading-snug mb-4">
                  To be a pioneering leader in TIC — setting new benchmarks for quality, reliability, and innovation.
                </p>
                <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                  We aspire to be one of the largest technology companies in India, renowned for comprehensive compliance solutions. By embracing advanced technologies and fostering continuous improvement, we empower clients with the highest standards of service.
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {[
                { icon: '🏆', label: 'Industry Leader',   desc: 'Setting benchmarks for quality, reliability, and innovation in TIC.' },
                { icon: '🌐', label: 'Global Reach',      desc: 'Expanding across Asia and positioning India as a global compliance hub.' },
                { icon: '💻', label: 'Technology Driven', desc: 'Integrating VAPT, Cyber Security, and IT Compliance into our portfolio.' },
              ].map((v) => (
                <div key={v.label} className="flex items-start gap-4 p-5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-crimson/30 transition-all duration-200 group">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 text-xl group-hover:bg-gold/20 transition-colors">
                    {v.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-sm mb-1 group-hover:text-gold transition-colors">{v.label}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="section-padding bg-pearl">
        <div className="container-max">
          <SectionHeader
            tag="Our Team"
            title="Experts & Veterans You Can Trust"
            subtitle="Our team brings together seasoned professionals from both the private and government sectors."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.map((m) => (
              <div key={m.name} className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg hover:border-crimson/20 transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo to-[#2d3566] flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 group-hover:scale-105 transition-transform duration-300 shadow-md">
                  {m.initial}
                </div>
                <h3 className="font-display font-bold text-indigo">{m.name}</h3>
                <p className="text-crimson text-sm font-semibold mt-1">{m.role}</p>
                <p className="text-gray-400 text-xs mt-2 bg-pearl px-3 py-1 rounded-full inline-block">{m.expertise}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-crimson py-20 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative z-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Ready to Work With Us?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Get in touch with our experts for a free consultation on your compliance needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact-us" className="bg-white text-crimson font-bold px-8 py-4 rounded-xl hover:bg-pearl transition-colors inline-block shadow-lg">
              Contact Us Today
            </Link>
            <Link to="/services" className="bg-transparent text-white font-bold px-8 py-4 rounded-xl border-2 border-white/50 hover:border-white hover:bg-white/10 transition-all inline-block">
              Explore Services
            </Link>
          </div>
        </div>
      </section>

    </div>
  </>
);

export default AboutPage;
