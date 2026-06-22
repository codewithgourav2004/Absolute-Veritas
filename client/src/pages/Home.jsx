import React, { lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero/Hero';
import { INTERNATIONAL_AUDITS, CLIENT_LOGOS } from '../utils/constants';

// Below-fold sections — loaded only when the bundle is split
const ServicesSection  = lazy(() => import('../components/Services/ServicesSection'));
const SolutionsByRole  = lazy(() => import('../components/Home/SolutionsByRole'));
const Stats            = lazy(() => import('../components/Stats/Stats'));
const About           = lazy(() => import('../components/About/About'));
const Testimonials    = lazy(() => import('../components/Testimonials/Testimonials'));
const BlogSection          = lazy(() => import('../components/Blog/BlogSection'));
const TrendingNewsSection  = lazy(() => import('../components/Home/TrendingNewsSection'));

const ClientMarquee = () => {
  const items = [...CLIENT_LOGOS, ...CLIENT_LOGOS];
  return (
    <section className="py-12 bg-white overflow-hidden border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
        <p className="text-steel text-sm font-medium tracking-wider uppercase">Trusted by India's leading brands</p>
      </div>
      <div className="flex gap-12 animate-marquee whitespace-nowrap">
        {items.map((logo, i) => (
          <span key={i} className="font-display font-bold text-indigo/30 text-xl flex-shrink-0 uppercase tracking-wider">{logo}</span>
        ))}
      </div>
    </section>
  );
};

const InternationalAudits = () => (
  <section className="section-padding bg-white">
    <div className="container-max">
      <div className="text-center mb-12">
        <span className="text-sm font-mono font-medium tracking-widest uppercase text-crimson">Global Reach</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-indigo mt-2">International Audit Presence</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {INTERNATIONAL_AUDITS.map((a) => (
          <div key={a.country} className="card p-6 text-center hover:border-crimson border-2 border-transparent transition-colors">
            <div className="text-4xl mb-3">{a.flag}</div>
            <h3 className="font-display font-bold text-indigo text-xl mb-2">{a.country}</h3>
            <p className="text-steel text-sm">{a.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CTABanner = () => (
  <section className="bg-crimson py-16">
    <div className="container-max text-center">
      <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
        Schedule 30 Minutes Meeting With Us
      </h2>
      <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
        Discuss your compliance needs with our experts. No obligation, just clarity.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <a href="https://calendly.com/absoluteveritas" target="_blank" rel="noopener noreferrer" className="bg-white text-crimson font-bold px-8 py-4 rounded-lg hover:bg-pearl transition-colors">
          Book a Meeting
        </a>
        <Link to="/contact-us" className="border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white hover:text-crimson transition-colors">
          Send Enquiry
        </Link>
      </div>
    </div>
  </section>
);

const SectionFallback = () => <div className="h-32" />;

const Home = () => (
  <>
    <Helmet>
      <title>Absolute Veritas — TIC & IT Compliance Consultancy India</title>
      <meta name="description" content="India's premier TIC and IT Compliance consultancy. BIS, WPC, TEC, CDSCO, EPR, FSSAI, CE, FCC certifications and more." />
    </Helmet>

    {/* Hero is above-the-fold — always eager */}
    <Hero />

    {/* Everything below the fold is lazily loaded */}
    <div className="cv-auto">
      <Suspense fallback={<SectionFallback />}>
        <ServicesSection />
      </Suspense>
    </div>
    <div className="cv-auto">
      <Suspense fallback={<SectionFallback />}>
        <SolutionsByRole />
      </Suspense>
    </div>
    <div className="cv-auto">
      <Suspense fallback={<SectionFallback />}>
        <Stats />
      </Suspense>
    </div>
    <div className="cv-auto">
      <Suspense fallback={<SectionFallback />}>
        <About />
      </Suspense>
    </div>
    <div className="cv-auto"><InternationalAudits /></div>
    <ClientMarquee />
    <div className="cv-auto">
      <Suspense fallback={<SectionFallback />}>
        <Testimonials />
      </Suspense>
    </div>
    <div className="cv-auto">
      <Suspense fallback={<SectionFallback />}>
        <TrendingNewsSection />
      </Suspense>
    </div>
    <div className="cv-auto">
      <Suspense fallback={<SectionFallback />}>
        <BlogSection />
      </Suspense>
    </div>
    <CTABanner />
  </>
);

export default Home;
