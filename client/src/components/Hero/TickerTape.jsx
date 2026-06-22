import React from 'react';
import { TICKER_ITEMS } from '../../utils/constants';

const TickerTape = () => {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden bg-crimson/90 py-3 mt-8" style={{ contain: 'layout paint' }}>
      <div
        className="flex gap-8 whitespace-nowrap animate-marquee"
        style={{ willChange: 'transform' }}
      >
        {items.map((item, i) => (
          <span key={i} className="font-mono text-sm font-medium text-white tracking-widest uppercase flex-shrink-0">
            {item} <span className="text-white/50 mx-2">·</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default TickerTape;
