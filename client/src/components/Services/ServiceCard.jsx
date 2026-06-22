import React from 'react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ service, onEnquire }) => (
  <div className="group relative bg-white rounded-2xl border border-gray-200 hover:border-crimson/40 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
    {/* Top accent bar */}
    <div className="h-0.5 bg-gradient-to-r from-indigo via-crimson to-indigo opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    <div className="p-6 flex flex-col flex-grow">
      {/* Icon + category badge */}
      <div className="flex items-start justify-between mb-5">
        <div className="w-12 h-12 rounded-xl bg-indigo/5 border border-indigo/10 flex items-center justify-center text-2xl group-hover:bg-crimson/6 group-hover:border-crimson/20 transition-colors duration-200">
          {service.icon || '📋'}
        </div>
        {service.category && (
          <span className="text-[10px] font-mono font-semibold tracking-wider text-crimson/70 bg-crimson/6 px-2.5 py-1 rounded-full border border-crimson/15 uppercase">
            {service.category}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display font-bold text-indigo text-base mb-2 leading-snug group-hover:text-crimson transition-colors duration-200">
        {service.name}
      </h3>

      {/* Description */}
      <p className="text-steel text-sm flex-grow mb-5 leading-relaxed">{service.description}</p>

      {/* Feature bullets */}
      {service.features?.length > 0 && (
        <ul className="space-y-2 mb-5">
          {service.features.slice(0, 3).map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-xs text-steel">
              <span className="w-4 h-4 rounded-full bg-crimson/10 border border-crimson/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-2.5 h-2.5 text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {f}
            </li>
          ))}
        </ul>
      )}

      {/* Actions */}
      <div className="flex gap-2.5 mt-auto">
        <Link
          to={`/services/${service.slug}`}
          className="flex-1 py-2.5 text-center rounded-xl border border-gray-200 text-indigo text-sm font-semibold hover:border-indigo/40 hover:bg-pearl transition-all duration-200"
        >
          View Details →
        </Link>
        <button
          onClick={() => onEnquire?.(service)}
          className="flex-1 py-2.5 rounded-xl bg-indigo hover:bg-crimson text-white text-sm font-semibold transition-colors duration-200"
        >
          Get Quote ✓
        </button>
      </div>
    </div>
  </div>
);

export default ServiceCard;
