import { useEffect, useRef, useState } from 'react';

export const useCountUp = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const ref = useRef(null);
  const rafId = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;

        const startTime = performance.now();
        let lastValue = start;

        const step = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const next = Math.floor(start + (end - start) * eased);

          // Only call setState when value actually changes — avoids redundant renders
          if (next !== lastValue) {
            lastValue = next;
            setCount(next);
          }

          if (progress < 1) {
            rafId.current = requestAnimationFrame(step);
          }
        };

        rafId.current = requestAnimationFrame(step);
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      observer.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [end, duration, start]);

  return { count, ref };
};
