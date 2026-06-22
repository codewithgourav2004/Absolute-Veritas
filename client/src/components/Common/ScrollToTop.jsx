import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  useEffect(() => {
    const handler = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-6 z-40 bg-indigo text-white p-3 rounded-full shadow-lg hover:bg-crimson transition-colors duration-200"
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
};

export default ScrollToTop;
