'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransitionCurtain() {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  if (!isTransitioning) return null;

  return (
    <div
      aria-hidden="true"
      role="presentation"
      className="pointer-events-none fixed inset-0 z-50 bg-[#F3D9D6]/95 backdrop-blur-xs flex items-center justify-center transition-opacity duration-500"
    >
      <div className="text-center animate-pulse">
        <span className="font-serif text-2xl tracking-[0.24em] text-plum opacity-85">
          KALAJAY
        </span>
      </div>
    </div>
  );
}
