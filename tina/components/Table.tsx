import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
};

export default function Table({ children, className }: Props) {
  return (
    <div className={`sunken-panel ${className || ''}`}>
      <table>
        {children}
      </table>
    </div>
  );
}
