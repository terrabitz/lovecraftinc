/** @jsxImportSource react */
import { useEffect, useRef } from 'react';
import { render, h } from 'preact';

/**
 * A Higher-Order Component (HOC) to wrap Preact components for use in React.
 * Uses Preact's h() directly instead of JSX to avoid React's JSX runtime
 * creating frozen elements that Preact cannot modify.
 *
 * @param PreactComponent - The Preact component to wrap.
 * @returns A React component that renders the Preact component.
 */
export function withPreact(PreactComponent: any) {
  return function PreactWrapper(props: any) {
    const ref = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

  
    useEffect(() => {
      if (!ref.current || containerRef.current) {
        return;
      }
      const container = document.createElement('div');
      container.style.display = 'contents';
      ref.current.appendChild(container);
      containerRef.current = container;
      return () => {
        if (containerRef.current) {
          // Unmount Preact tree on unmount
          render(null, containerRef.current);
          if (ref.current && ref.current.contains(containerRef.current)) {
            ref.current.removeChild(containerRef.current);
          }
          containerRef.current = null;
        }
      };
    }, []);
    
    // Updates: re-render Preact component when props change without unmounting
    useEffect(() => {
      if (!containerRef.current) {
        return;
      }
      // Use Preact's h() to create a Preact VNode, NOT React's JSX
      render(h(PreactComponent, props), containerRef.current);
    }, [props]);

    return <div ref={ref} style={{ display: 'contents' }} />;
  };
}
