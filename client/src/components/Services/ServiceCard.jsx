import React from 'react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ service, onEnquire }) => (
  <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-crimson/30 hover:shadow-2xl hover:shadow-crimson/8 transition-all duration-300 overflow-hidden flex flex-col">
    {/* Gradient accent bar — slides in from left on hover */}
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-crimson via-rose-400 to-indigo opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    {/* Faint background glow on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-crimson/[0.02] to-indigo/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

    <div className="relative p-6 flex flex-col flex-grow">
      {/* Icon + badge row */}
      <div className="flex items-start justify-between mb-5">
        <div className="w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-gradient-to-br from-indigo/8 to-indigo/4 border border-indigo/12 flex items-center justify-center text-2xl group-hover:from-crimson/10 group-hover:to-rose-500/5 group-hover:border-crimson/20 transition-all duration-300 shadow-sm">
          {service.icon || '📋'}
        </div>
        {service.category && (
          <span className="text-[10px] font-mono font-bold tracking-[0.15em] text-indigo/60 bg-indigo/5 px-3 py-1 rounded-full border border-indigo/10 uppercase group-hover:text-crimson/80 group-hover:bg-crimson/6 group-hover:border-crimson/15 transition-colors duration-200">
            {service.category}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display font-bold text-indigo text-[15px] mb-2.5 leading-snug group-hover:text-crimson transition-colors duration-200">
        {service.name}
      </h3>

      {/* Description */}
      <p className="text-steel text-sm flex-grow mb-5 leading-relaxed line-clamp-3">
        {service.description}
      </p>

      {/* Feature bullets */}
      {service.features?.length > 0 && (
        <ul className="space-y-1.5 mb-5">
          {service.features.slice(0, 3).map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-steel">
              <svg className="w-3.5 h-3.5 text-crimson flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="leading-relaxed">{f}</span>
            </li>
          ))}
          {service.features.length > 3 && (
            <li className="text-xs text-gray-400 pl-6">+{service.features.length - 3} more</li>
          )}
        </ul>
      )}

      {/* Actions */}
      <div className="flex gap-2.5 mt-auto pt-1">
        <Link
          to={`/services/${service.slug}`}
          className="flex-1 py-2.5 text-center rounded-xl border border-gray-200 text-indigo text-sm font-semibold hover:border-indigo/40 hover:bg-indigo/5 transition-all duration-200"
        >
          View Details
        </Link>
        <button
          onClick={() => onEnquire?.(service)}
          className="flex-1 py-2.5 rounded-xl bg-indigo hover:bg-crimson text-white text-sm font-semibold transition-all duration-200 shadow-md shadow-indigo/20 hover:shadow-crimson/25"
        >
          Get Quote
        </button>
      </div>
    </div>
  </div>
);

export default ServiceCard;
