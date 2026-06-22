import { useEffect, useRef, useState } from 'react';

// Shared observer per threshold value to avoid N observers for N components
const observerCache = new Map();

const getSharedObserver = (threshold, callback) => {
  const key = String(threshold);
  if (!observerCache.has(key)) {
    const targets = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cb = targets.get(entry.target);
            if (cb) {
              cb();
              targets.delete(entry.target);
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold }
    );
    observerCache.set(key, { observer, targets });
  }
  const { observer, targets } = observerCache.get(key);
  return { observer, targets };
};

export const useScrollReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || isVisible) return;

    const { observer, targets } = getSharedObserver(threshold, null);
    targets.set(el, () => setIsVisible(true));
    observer.observe(el);

    return () => {
      targets.delete(el);
      observer.unobserve(el);
    };
  }, [threshold, isVisible]);

  return { ref, isVisible };
};
