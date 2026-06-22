import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import ContactForm from '../components/Contact/ContactForm';

const INFO_ROWS = [
  { label: 'Email',  value: 'cs@absoluteveritas.com',    href: 'mailto:cs@absoluteveritas.com' },
  { label: 'Tel',    value: '0129-4001010',               href: 'tel:01294001010' },
  { label: 'Mobile', value: '+91-7303215033',             href: 'tel:+917303215033' },
];

const PARTNER_ROWS = [
  { label: 'Email', value: 'partners@absoluteveritas.com', href: 'mailto:partners@absoluteveritas.com' },
];

const COMPLAINT_ROWS = [
  { label: 'Email', value: 'complaints@absoluteveritas.com', href: 'mailto:complaints@absoluteveritas.com' },
];

const InfoTable = ({ rows }) => (
  <table className="w-full text-sm border-collapse">
    <tbody>
      {rows.map(({ label, value, href }, i) => (
        <tr key={label} className={i % 2 === 0 ? 'bg-blue-50/60' : 'bg-white'}>
          <td className="py-2.5 px-4 font-semibold text-indigo w-28 border border-gray-100">{label}:</td>
          <td className="py-2.5 px-4 border border-gray-100">
            {href ? (
              <a href={href} className="text-indigo hover:text-crimson transition-colors">{value}</a>
            ) : (
              <span className="text-indigo">{value}</span>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const SectionBlock = ({ title, children }) => (
  <div className="mb-5">
    <div className="border-l-4 border-gold bg-amber-50/50 px-4 py-2 mb-0">
      <h3 className="font-semibold text-indigo text-sm">{title}</h3>
    </div>
    {children}
  </div>
);

const ContactPage = () => (
  <>
    <Helmet>
      <title>Contact Us | Absolute Veritas</title>
      <meta name="description" content="Get in touch with Absolute Veritas for TIC & IT Compliance consultancy — BIS, WPC, TEC, CDSCO, ISO 27001, VAPT and more." />
    </Helmet>

    <div className="pt-16">
      {/* ── Hero with breadcrumb ── */}
      <div className="relative bg-indigo py-14 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(230,57,70,0.12) 0%, transparent 55%)' }} />
        <div className="relative z-10 container-max">
          <h1 className="font-display text-4xl md:text-5xl font-black text-white mb-3 uppercase tracking-wide">
            Contact Us
          </h1>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <Link to="/" className="hover:text-white transition-colors">HOME</Link>
            <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-300 font-medium">CONTACT US</span>
          </nav>
        </div>
      </div>

      {/* ── Main content ── */}
      <section className="section-padding bg-white">
        <div className="container-max grid lg:grid-cols-[1fr_420px] gap-10 items-start">

          {/* ── Left column ── */}
          <div>
            {/* LET'S TALK */}
            <p className="font-display font-black text-3xl text-gold mb-2">LET'S TALK</p>
            <p className="text-steel text-sm leading-relaxed mb-8 max-w-lg">
              Have questions? Need assistance? We're here to help! Share your contact info, and one of our experienced Absolute Veritas advisors will reach out to you shortly.
            </p>

            {/* Contact details card */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-6 shadow-sm">
              <div className="bg-indigo px-5 py-3">
                <h2 className="text-white font-semibold text-sm tracking-wide uppercase">Contact Details</h2>
              </div>

              <div className="p-5 space-y-5">
                <SectionBlock title="General Inquiries:">
                  <InfoTable rows={INFO_ROWS} />
                </SectionBlock>

                <SectionBlock title="Partnerships & Business Inquiries:">
                  <InfoTable rows={PARTNER_ROWS} />
                </SectionBlock>

                <SectionBlock title="Complaints & Feedback:">
                  <InfoTable rows={COMPLAINT_ROWS} />
                </SectionBlock>

                {/* Address cards */}
                <div>
                  <div className="border-l-4 border-gold bg-amber-50/50 px-4 py-2 mb-0">
                    <h3 className="font-semibold text-indigo text-sm">Our Offices:</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 mt-3">
                    <div className="border border-gray-100 rounded-lg p-4 bg-pearl/60">
                      <p className="text-xs font-bold text-crimson uppercase tracking-wide mb-2">Registered Address</p>
                      <p className="text-indigo text-sm leading-snug">31A, Molar Band Extension,</p>
                      <p className="text-indigo text-sm leading-snug">South Delhi – 110044</p>
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                        <p className="text-steel text-xs">
                          Mail: <a href="mailto:cs@absoluteveritas.com" className="text-indigo hover:text-crimson transition-colors">cs@absoluteveritas.com</a>
                        </p>
                        <p className="text-steel text-xs">
                          Mob: <a href="tel:+917303215033" className="text-indigo hover:text-crimson transition-colors">+91-7303215033</a>
                        </p>
                      </div>
                    </div>
                    <div className="border border-gray-100 rounded-lg p-4 bg-pearl/60">
                      <p className="text-xs font-bold text-crimson uppercase tracking-wide mb-2">Office Address</p>
                      <p className="text-indigo text-sm leading-snug">3C/19B, NIT Faridabad,</p>
                      <p className="text-indigo text-sm leading-snug">Delhi NCR, Haryana – 121001</p>
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                        <p className="text-steel text-xs">
                          Mail: <a href="mailto:cs@absoluteveritas.com" className="text-indigo hover:text-crimson transition-colors">cs@absoluteveritas.com</a>
                        </p>
                        <p className="text-steel text-xs">
                          Tel: <a href="tel:01294001010" className="text-indigo hover:text-crimson transition-colors">0129-4001010</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Map ── */}
            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200" style={{ height: 380 }}>
              <iframe
                title="Absolute Veritas Office — NIT Faridabad"
                src="https://www.google.com/maps/embed?pb=!1m13!1m8!1m3!1d12705.019175107574!2d77.288818!3d28.392819!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjjCsDIzJzM0LjIiTiA3N8KwMTcnMjkuMCJF!5e1!3m2!1sen!2sin!4v1781935418686!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* ── Right column — form ── */}
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm sticky top-24">
            <div className="bg-indigo px-5 py-3">
              <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">Reach Out</p>
              <h2 className="text-white font-display font-bold text-lg">CONTACT US</h2>
            </div>
            <div className="p-6">
              <ContactForm />
            </div>
          </div>

        </div>
      </section>

      {/* ── Bottom CTA strip ── */}
      <div className="bg-indigo py-10 text-center">
        <p className="text-gray-400 text-sm mb-1">Prefer to talk directly?</p>
        <a
          href="tel:+917303215033"
          className="font-display text-2xl font-black text-gold hover:text-white transition-colors"
        >
          +91-7303215033
        </a>
        <p className="text-gray-500 text-xs mt-2">Mon – Sat, 9 AM – 6 PM IST</p>
      </div>
    </div>
  </>
);

export default ContactPage;
