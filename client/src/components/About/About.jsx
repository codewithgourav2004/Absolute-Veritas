import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const usps = [
  { icon: '⚡', title: 'Prompt Response',      desc: 'Quick turnaround on all queries and project milestones.' },
  { icon: '🔬', title: 'Advanced Technology',  desc: 'State-of-the-art testing equipment and digital workflows.' },
  { icon: '📋', title: 'End-to-End Support',   desc: 'Full regulatory support with zero bureaucratic hassle.' },
  { icon: '🌐', title: 'Global Network',       desc: 'Accredited lab partnerships across India and 12 countries.' },
];

const About = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="section-padding bg-pearl">
      <div className="container-max">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div
            ref={ref}
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(-40px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <span className="inline-block bg-crimson/10 text-crimson border border-crimson/20 text-xs font-mono font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-5">
              About Us
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-black text-indigo leading-tight mb-5">
              India's Most Trusted<br />
              <span className="text-crimson">TIC & Compliance</span> Partner
            </h2>

            {/* Highlight strip */}
            <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 mb-6 shadow-sm">
              <div className="text-center flex-shrink-0">
                <div className="font-display font-black text-3xl text-gold">15+</div>
                <div className="text-gray-400 text-xs">Years</div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center flex-shrink-0">
                <div className="font-display font-black text-3xl text-crimson">12</div>
                <div className="text-gray-400 text-xs">Countries</div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center flex-shrink-0">
                <div className="font-display font-black text-3xl text-indigo">1600+</div>
                <div className="text-gray-400 text-xs">Clients</div>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed mb-8 text-[0.95rem]">
              Absolute Veritas has been India's go-to TIC consultancy since 2009. We specialize in navigating complex regulatory frameworks for BIS, WPC, TEC, CDSCO, EPR, FSSAI, CE, FCC, and more — across India and 12 Asian countries. Our team of 50+ seasoned experts ensures your products achieve compliance without delays.
            </p>

            <Link to="/about-us" className="btn-primary">
              Know More About Us →
            </Link>
          </div>

          {/* Right — USP cards */}
          <div className="grid grid-cols-2 gap-4">
            {usps.map((u, i) => (
              <div
                key={u.title}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-crimson/20 hover:shadow-lg transition-all duration-300 group"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: `opacity 0.6s ease ${i * 0.1 + 0.2}s, transform 0.6s ease ${i * 0.1 + 0.2}s`,
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-pearl flex items-center justify-center text-2xl mb-4 group-hover:bg-crimson/5 transition-colors duration-200 border border-gray-100">
                  {u.icon}
                </div>
                <h3 className="font-display font-bold text-indigo text-sm mb-1.5 group-hover:text-crimson transition-colors duration-200">
                  {u.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
