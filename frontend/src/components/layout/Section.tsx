import type { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'screen-xl' | 'none';
}

export default function Section({ children, className = '', maxWidth = 'screen-xl' }: SectionProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    'screen-xl': 'max-w-screen-xl',
    none: '',
  };

  return (
    <div className={`w-full mx-auto ${maxWidthClasses[maxWidth]} ${className}`.trim()}>
      {children}
    </div>
  );
}
