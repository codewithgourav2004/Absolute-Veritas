import React from 'react';
import { useCountUp } from '../../hooks/useCountUp';
import { useFetch } from '../../hooks/useFetch';

const StatItem = ({ end, suffix = '+', label }) => {
  const { count, ref } = useCountUp(end);
  return (
    <div ref={ref} className="flex flex-col items-center justify-center py-10 px-6 text-center">
      <div className="font-display text-5xl md:text-6xl font-black text-white leading-none tracking-tight">
        {count}<span className="text-3xl md:text-4xl font-bold text-white/70">{suffix}</span>
      </div>
      <div className="text-white/60 font-body font-medium mt-3 text-sm md:text-base tracking-wide">{label}</div>
    </div>
  );
};

const Stats = () => {
  const { data } = useFetch('/stats');

  const items = [
    { end: data?.happyClients    || 1600, label: 'Happy Clients',    suffix: '+' },
    { end: data?.projectsCompleted || 1100, label: 'Projects',         suffix: '+' },
    { end: data?.yearsOfJourney  || 15,   label: 'Years of Journey', suffix: '+' },
    { end: data?.brandsServed    || 300,  label: 'Brands',            suffix: '+' },
  ];

  return (
    <section className="relative overflow-hidden bg-indigo">
      {/* Subtle topographic background pattern */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Ccircle cx='300' cy='300' r='80' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3Ccircle cx='300' cy='300' r='140' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3Ccircle cx='300' cy='300' r='200' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3Ccircle cx='300' cy='300' r='260' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3Ccircle cx='300' cy='300' r='320' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3Ccircle cx='300' cy='300' r='380' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '600px 600px',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10 container-max">
        {/* Heading */}
        <div className="pt-10 pb-2 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
            Some Count That Matters
          </h2>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div
              key={item.label}
              className={`${i < items.length - 1 ? 'border-r border-white/15' : ''} ${i >= 2 ? 'border-t border-white/15 lg:border-t-0' : ''}`}
            >
              <StatItem {...item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
