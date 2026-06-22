import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../../utils/constants';
import MobileMenu from './MobileMenu';

const Navbar = () => {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [openMenu,    setOpenMenu]    = useState(null); // tracks which dropdown label is open

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-indigo shadow-xl' : 'bg-indigo/95'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display font-bold text-xl text-white">
            Absolute <span className="text-crimson">Veritas</span>
          </span>
        </Link>

        <ul className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) =>
            link.children ? (
              <li
                key={link.label}
                className="relative"
                onMouseEnter={() => setOpenMenu(link.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button className="text-white/90 hover:text-white font-medium flex items-center gap-1 py-4">
                  {link.label} <span className="text-xs">▾</span>
                </button>

                <div className={`absolute top-full left-0 mt-0 bg-white rounded-lg shadow-2xl py-2 w-52 transition-all duration-200 ${
                  openMenu === link.label ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}>
                  {link.children.map((child) => (
                    <Link
                      key={child.label}
                      to={child.path}
                      onClick={() => setOpenMenu(null)}
                      className="block px-4 py-2 text-indigo hover:bg-pearl hover:text-crimson font-medium text-sm"
                    >
                      {child.label}
                    </Link>
                  ))}
                  {/* "All Services" footer only for Services dropdown */}
                  {link.label === 'Services' && (
                    <Link
                      to="/services"
                      onClick={() => setOpenMenu(null)}
                      className="block px-4 py-2 text-crimson font-semibold text-sm border-t mt-1"
                    >
                      All Services →
                    </Link>
                  )}
                </div>
              </li>
            ) : (
              <li key={link.label}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `font-medium transition-colors ${isActive ? 'text-gold' : 'text-white/90 hover:text-white'}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            )
          )}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/contact-us" className="btn-primary text-sm py-2 px-4">Get Quote</Link>
        </div>

        <button
          className="lg:hidden text-white p-2"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} links={NAV_LINKS} />
    </header>
  );
};

export default Navbar;
