/** @jsxImportSource react */
import React, { useEffect, useRef } from 'react';
import { render } from 'preact';

/**
 * A Higher-Order Component (HOC) to wrap Preact components for use in React.
 * 
 * @param PreactComponent - The Preact component to wrap.
 * @returns A React component that renders the Preact component.
 */
export function withPreact(PreactComponent: any) {
  return function PreactWrapper(props: any) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (ref.current) {
        // Manually mount the Preact component into the React DOM container
        render(<PreactComponent {...props} />, ref.current);
      }
      
      // Cleanup on unmount
      return () => {
        if (ref.current) {
          render(null, ref.current);
        }
      };
    }, [props]); // Re-render when props change

    return <div ref={ref} style={{ display: 'contents' }} />;
  };
}
