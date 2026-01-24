'use client'

import { useEffect, useRef, useState } from 'react';

export default function MathRenderer({ children, className = '' }) {
  const containerRef = useRef(null);
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current) {
      setIsRendering(true);
      
      import('katex/contrib/auto-render').then((module) => {
        if (containerRef.current) {
          module.default(containerRef.current, {
            delimiters: [
              {left: '$$', right: '$$', display: true},
              {left: '$', right: '$', display: false}
            ],
            throwOnError: false
          });
          
          // Render complete hone ke baad show karo
          requestAnimationFrame(() => {
            setIsRendering(false);
          });
        }
      });
    }
  }, [children]);

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{
        opacity: isRendering ? 0 : 1,
        transition: 'opacity 0.15s ease-in'
      }}
    >
      {children}
    </div>
  );
}