import React from 'react';
import { TICKER_ITEMS } from '../../utils/constants';

const TickerTape = () => (
  <div className="mt-10">
    <p className="text-gray-600 text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-4">
      Regulatory Expertise
    </p>
    <div className="flex flex-wrap gap-2">
      {TICKER_ITEMS.map((item, i) => (
        <span
          key={i}
          className="px-4 py-1.5 rounded-full text-[11px] font-mono font-bold tracking-[0.15em] uppercase text-gray-500 border border-white/[0.1] bg-white/[0.03] hover:border-crimson/35 hover:text-crimson/80 hover:bg-crimson/[0.06] transition-all duration-200 cursor-default select-none"
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

export default TickerTape;
