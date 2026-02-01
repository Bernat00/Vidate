import type { ReactElement, ReactNode } from 'react';

type GradientPageProps = {
  children: ReactNode;
  className?: string;
  isScrollable?: boolean;
};

export default function GradientPage({ children, className = '', isScrollable = false }: GradientPageProps): ReactElement {
  return (
    <div
      className={`bg-gradient-to-t from-bgAccentPrimary to-bgAccentSecondary min-h-screen ${
        isScrollable ? 'overflow-y-auto' : 'overflow-hidden'
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
}