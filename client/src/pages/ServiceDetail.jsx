import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useFetch } from '../hooks/useFetch';
import Loader from '../components/Common/Loader';
import ServiceModal from '../components/Services/ServiceModal';

const SITE = 'https://absoluteveritas.com';

// Wraps plain HTML fragment in a full document if it isn't one already
const buildSrcDoc = (html) => {
  const isFullDoc = /<!doctype|<html/i.test(html);
  const resizeScript = `<script>
(function(){
  function report(){
    var h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    window.parent.postMessage({ _svcH: h }, '*');
  }
  window.addEventListener('load', report);
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(report).observe(document.body);
  setTimeout(report, 200);
  setTimeout(report, 800);
})();
<\/script>`;
  if (isFullDoc) {
    return /(<\/body>)/i.test(html)
      ? html.replace(/<\/body>/i, resizeScript + '</body>')
      : html + resizeScript;
  }
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font-family: 'DM Sans', system-ui, sans-serif; color: #374151; line-height: 1.7; }
</style>
</head>
<body>
${html}
${resizeScript}
</body>
</html>`;
};

const SandboxedContent = ({ html }) => {
  const [height, setHeight] = useState(600);
  const iframeRef = useRef(null);

  useEffect(() => {
    const onMsg = (e) => {
      if (e.data && typeof e.data._svcH === 'number' && e.data._svcH > 0) {
        setHeight(Math.max(e.data._svcH + 48, 300));
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [html]);

  // Fallback: try to read iframe body height directly after load
  const handleLoad = () => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc) {
        const h = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
        if (h > 50) setHeight(h + 48);
      }
    } catch {}
  };

  return (
    <iframe
      ref={iframeRef}
      key={html}
      srcDoc={buildSrcDoc(html)}
      sandbox="allow-scripts allow-same-origin"
      onLoad={handleLoad}
      style={{ width: '100%', height, border: 'none', display: 'block', minHeight: 300 }}
      title="Service Content"
    />
  );
};

const ServiceDetail = () => {
  const { slug } = useParams();
  const { data: service, loading, error } = useFetch(`/services/${slug}`);
  const [showModal, setShowModal] = useState(false);

  if (loading) return <Loader full />;
  if (error || !service) return (
    <div className="pt-32 text-center">
      <h2 className="font-display text-2xl text-indigo mb-4">Service not found</h2>
      <Link to="/services" className="btn-primary">Back to Services</Link>
    </div>
  );

  const hasContent = Boolean(service.content?.trim());
  // Use sandboxed iframe for any content that has HTML beyond simple <p>/<br>/<strong>/<em>/<ul>/<li>/<h2>/<h3>
  // (i.e., anything the admin wrote in HTML mode with CSS classes, divs, style/script tags, etc.)
  const isLiveContent = hasContent && /(<style|<script|<link|<div|<section|<header|<footer|<table|<form|class=|id=)/i.test(service.content);
  const imageUrl      = service.image ? `${SITE}${service.image}` : null;
  const canonical  = `${SITE}/services/${service.slug}`;

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    url: canonical,
    provider: {
      '@type': 'Organization',
      name: 'Absolute Veritas',
      url: SITE,
      telephone: '+91-7303215033',
      email: 'cs@absoluteveritas.com',
    },
    areaServed: { '@type': 'Country', name: 'India' },
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(service.features?.length ? { offers: { '@type': 'Offer', description: service.features.join(', ') } } : {}),
  };

  return (
    <>
      <Helmet>
        <title>{service.name} | Absolute Veritas</title>
        <meta name="description" content={service.description} />
        <link rel="canonical" href={canonical} />
        {/* Open Graph */}
        <meta property="og:type"        content="website" />
        <meta property="og:title"       content={`${service.name} | Absolute Veritas`} />
        <meta property="og:description" content={service.description} />
        <meta property="og:url"         content={canonical} />
        {imageUrl && <meta property="og:image" content={imageUrl} />}
        {/* Twitter */}
        <meta name="twitter:card"        content={imageUrl ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title"       content={`${service.name} | Absolute Veritas`} />
        <meta name="twitter:description" content={service.description} />
        {imageUrl && <meta name="twitter:image" content={imageUrl} />}
        {/* JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="pt-16">
        {/* ── Hero ── */}
        <div className="relative bg-indigo overflow-hidden">
          {/* Background: cover image with overlay or plain gradient */}
          {service.image ? (
            <>
              <img
                src={service.image}
                alt={service.name}
                className="absolute inset-0 w-full h-full object-cover opacity-20"
                loading="eager"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(26,31,60,0.97) 0%, rgba(26,31,60,0.85) 60%, rgba(26,31,60,0.6) 100%)' }} />
            </>
          ) : (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 15% 70%, rgba(230,57,70,0.12) 0%, transparent 50%), radial-gradient(ellipse at 85% 20%, rgba(212,175,55,0.08) 0%, transparent 45%)' }}
            />
          )}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div className="relative z-10 container-max py-16">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-6 flex-wrap">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link to="/services" className="hover:text-white transition-colors">Services</Link>
              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {service.subcategory && (
                <>
                  <Link
                    to={`/services?category=${encodeURIComponent(service.category)}`}
                    className="hover:text-white transition-colors"
                  >
                    {service.category}
                  </Link>
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
              <span className="text-white">{service.name}</span>
            </div>

            {/* Title block */}
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-4xl flex-shrink-0">
                {service.icon || '📋'}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="text-xs font-mono text-crimson uppercase tracking-[0.2em] bg-crimson/10 border border-crimson/20 px-3 py-1 rounded-full">
                    {service.category}
                  </span>
                  {service.subcategory && (
                    <span className="text-xs text-gray-400 border border-white/10 px-2 py-0.5 rounded-full">{service.subcategory}</span>
                  )}
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-black text-white mb-5 leading-tight">
                  {service.name}
                </h1>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Enquire Now
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                  <a
                    href="tel:+917303215033"
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <section className="bg-pearl section-padding">
          <div className="container-max">
            <div className="grid lg:grid-cols-3 gap-10">

              {/* Main content */}
              <div className="lg:col-span-2 space-y-10">

                {/* Cover image (if set — show as featured image in content area too) */}
                {service.image && (
                  <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100" style={{ maxHeight: 380 }}>
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}

                {/* Overview */}
                <div>
                  <p className="text-xs font-mono text-crimson uppercase tracking-widest mb-3">Overview</p>
                  <p className="text-steel leading-relaxed text-lg">{service.description}</p>
                </div>

              {/* Rich content */}
{hasContent && (
  <section className="mt-14">
    <div className="flex items-center gap-3 mb-8">
      <div className="w-1 h-8 bg-crimson rounded-full"></div>
      <h2 className="text-2xl font-bold text-indigo">Detailed Information</h2>
    </div>

    {isLiveContent ? (
      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
        <SandboxedContent html={service.content} />
      </div>
    ) : (
      <article
        className="
        svc-content
        bg-white rounded-3xl p-8 lg:p-12 shadow-lg border border-gray-100
        prose prose-lg max-w-none
        prose-headings:font-bold prose-headings:text-indigo
        prose-h2:text-3xl prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-3 prose-h2:mb-6
        prose-h3:text-2xl prose-h3:text-indigo prose-h3:mt-10
        prose-p:text-gray-700 prose-p:leading-8
        prose-ul:space-y-2 prose-li:text-gray-700 prose-li:marker:text-crimson
        prose-strong:text-indigo prose-a:text-crimson hover:prose-a:underline
        prose-table:border prose-table:border-gray-200 prose-th:bg-gray-50 prose-th:text-indigo
        "
        dangerouslySetInnerHTML={{ __html: service.content }}
      />
    )}
  </section>
)}
                {/* Bottom CTA */}
                <div className="bg-indigo rounded-2xl p-8 text-center">
                  <h3 className="font-display text-xl font-bold text-white mb-2">Ready to Get Compliant?</h3>
                  <p className="text-gray-400 text-sm mb-5">
                    Talk to our {service.name} experts — free consultation, response within 24 hours.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => setShowModal(true)}
                      className="btn-primary"
                    >
                      Request Free Consultation
                    </button>
                    <a
                      href="mailto:cs@absoluteveritas.com"
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 text-gray-300 hover:text-white text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Email Us
                    </a>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                {/* CTA card */}
                <div className="card p-7 sticky top-24">
                  <h3 className="font-display font-bold text-indigo text-lg mb-2">Get Started</h3>
                  <p className="text-steel text-sm mb-5 leading-relaxed">
                    Our compliance experts will guide you through every step of the {service.name} process — from documentation to approval.
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary w-full justify-center mb-3"
                  >
                    Request Consultation
                  </button>
                  <a
                    href="mailto:cs@absoluteveritas.com"
                    className="block text-center text-sm text-steel hover:text-indigo transition-colors py-2"
                  >
                    cs@absoluteveritas.com
                  </a>
                </div>

                {/* Phone card */}
                <div className="card p-6 bg-indigo text-white">
                  <h3 className="font-semibold mb-1.5">Need Quick Help?</h3>
                  <p className="text-gray-300 text-sm mb-3">Call our experts directly</p>
                  <a href="tel:+917303215033" className="font-mono text-gold font-bold text-lg hover:text-yellow-300 transition-colors">
                    +91-7303215033
                  </a>
                  <p className="text-gray-400 text-xs mt-2">Mon–Sat, 9 AM – 7 PM IST</p>
                </div>

                {/* Quick info */}
                {(service.subcategory || service.category) && (
                  <div className="card p-5 space-y-3">
                    <p className="text-xs font-mono text-steel uppercase tracking-widest">Quick Info</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-steel">Category</span>
                        <span className="font-semibold text-indigo">{service.category}</span>
                      </div>
                      {service.subcategory && (
                        <div className="flex items-start justify-between text-sm gap-2">
                          <span className="text-steel flex-shrink-0">Body</span>
                          <span className="font-semibold text-indigo text-right">{service.subcategory.split('(')[0].trim()}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-steel">Response</span>
                        <span className="font-semibold text-indigo">Within 24 hrs</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Back link */}
                <Link
                  to={`/services?category=${encodeURIComponent(service.category)}`}
                  className="flex items-center gap-2 text-steel hover:text-crimson text-sm font-medium transition-colors group"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  Back to {service.category}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {showModal && <ServiceModal service={service} onClose={() => setShowModal(false)} />}
    </>
  );
};

export default ServiceDetail;
