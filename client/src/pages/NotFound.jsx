import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const NotFound = () => (
  <>
    <Helmet><title>404 — Page Not Found | Absolute Veritas</title></Helmet>
    <div className="min-h-screen bg-pearl flex items-center justify-center px-4">
      <div className="text-center">
        <div className="font-display text-9xl font-black text-indigo/10 mb-4">404</div>
        <h1 className="font-display text-3xl font-bold text-indigo mb-4">Page Not Found</h1>
        <p className="text-steel mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/" className="btn-primary">Go to Home</Link>
          <Link to="/contact-us" className="btn-outline border-indigo text-indigo hover:bg-indigo hover:text-white">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  </>
);

export default NotFound;
