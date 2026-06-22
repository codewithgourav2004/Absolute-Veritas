import React from 'react';

const SectionHeader = ({ tag, title, subtitle, light = false }) => (
  <div className="text-center mb-12">
    {tag && (
      <span className={`text-sm font-mono font-medium tracking-widest uppercase ${light ? 'text-gold' : 'text-crimson'}`}>
        {tag}
      </span>
    )}
    <h2 className={`font-display text-3xl md:text-4xl font-bold mt-2 mb-4 ${light ? 'text-white' : 'text-indigo'}`}>
      {title}
    </h2>
    {subtitle && (
      <p className={`text-lg max-w-2xl mx-auto ${light ? 'text-gray-300' : 'text-steel'}`}>
        {subtitle}
      </p>
    )}
  </div>
);

export default SectionHeader;
