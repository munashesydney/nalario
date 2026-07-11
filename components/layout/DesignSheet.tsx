import React from 'react';
import { cn } from '../../lib/utils';

interface DesignSheetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable paper-sheet container.
 * Provides the white background, shadow, and subtle rounding
 * that makes content feel like a physical design surface.
 */
export function DesignSheet({ children, className, style, ...props }: DesignSheetProps) {
  return (
    <div
      className={cn(
        'relative bg-white',
        className
      )}
      style={{
        boxShadow:
          '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1), 0 4px 6px -1px rgb(0 0 0 / 0.05)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
