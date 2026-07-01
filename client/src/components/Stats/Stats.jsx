import React from 'react';
import { useCountUp } from '../../hooks/useCountUp';
import { useFetch } from '../../hooks/useFetch';

const STAT_CONFIGS = [
  { dataKey: 'yearsOfJourney',    fallback: 15,   suffix: '+', label: 'Years of Experience', emoji: '🏆', accent: '#D4AF37' },
  { dataKey: 'happyClients',      fallback: 1600, suffix: '+', label: 'Happy Clients',       emoji: '🤝', accent: '#E63946' },
  { dataKey: null,                fallback: 12,   suffix: '',  label: 'Asian Countries',     emoji: '🌍', accent: '#2563EB' },
  { dataKey: 'projectsCompleted', fallback: 1100, suffix: '+', label: 'Projects Completed',  emoji: '✅', accent: '#16A34A' },
];

const StatCard = ({ end, suffix, label, emoji, accent, isLast }) => {
  const { count, ref } = useCountUp(end);
  return (
    <div
      ref={ref}
      className={`flex flex-col items-center py-12 px-6 text-center relative group ${!isLast ? 'border-r border-white/[0.08]' : ''}`}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}14 0%, transparent 70%)` }}
      />

      {/* Accent line */}
      <div
        className="w-10 h-[3px] rounded-full mb-6 transition-all duration-300 group-hover:w-14"
        style={{ background: accent }}
      />

      {/* Emoji */}
      <span className="text-4xl mb-5 select-none leading-none">{emoji}</span>

      {/* Number */}
      <div className="font-display font-black leading-none mb-3" style={{ color: '#D4AF37' }}>
        <span className="text-5xl md:text-6xl">{count}</span>
        <span className="text-3xl md:text-4xl opacity-70">{suffix}</span>
      </div>

      {/* Label */}
      <p className="text-gray-400 text-sm font-medium tracking-wide">{label}</p>
    </div>
  );
};

const Stats = () => {
  const { data } = useFetch('/stats');

  const items = STAT_CONFIGS.map((cfg) => ({
    end:    cfg.dataKey ? (data?.[cfg.dataKey] ?? cfg.fallback) : cfg.fallback,
    suffix: cfg.suffix,
    label:  cfg.label,
    emoji:  cfg.emoji,
    accent: cfg.accent,
  }));

  return (
    <section className="relative overflow-hidden bg-indigo border-t border-white/[0.06]">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="relative z-10 container-max">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div
              key={item.label}
              className={i >= 2 ? 'border-t border-white/[0.08] lg:border-t-0' : ''}
            >
              <StatCard {...item} isLast={i === items.length - 1} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
