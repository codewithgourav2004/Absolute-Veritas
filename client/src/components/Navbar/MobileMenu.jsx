import React from 'react';
import { Link } from 'react-router-dom';

const MobileMenu = ({ open, onClose, links }) => (
  <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${open ? 'visible' : 'invisible'}`}>
    <div className={`absolute inset-0 bg-black/60 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
    <nav className={`absolute right-0 top-0 h-full w-72 bg-indigo pt-6 px-6 transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex justify-between items-center mb-8">
        <span className="font-display font-bold text-white text-lg">Menu</span>
        <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">✕</button>
      </div>
      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.path}
              onClick={onClose}
              className="block text-white/90 hover:text-gold font-medium py-2 border-b border-white/10 transition-colors"
            >
              {link.label}
            </Link>
            {link.children && (
              <ul className="pl-4 mt-2 space-y-2">
                {link.children.map((child) => (
                  <li key={child.label}>
                    <Link to={child.path} onClick={onClose} className="block text-white/70 hover:text-white text-sm py-1">
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <Link to="/contact-us" onClick={onClose} className="btn-primary mt-8 block text-center">
        Get Free Quote
      </Link>
    </nav>
  </div>
);

export default MobileMenu;
