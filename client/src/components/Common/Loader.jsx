import React from 'react';

const Loader = ({ full = false }) => (
  <div className={`flex items-center justify-center ${full ? 'min-h-screen' : 'py-20'}`}>
    <div className="w-12 h-12 border-4 border-pearl border-t-crimson rounded-full animate-spin" />
  </div>
);

export default Loader;
