import type { ReactElement, ReactNode } from 'react';

type GradientPageProps = {
  children: ReactNode;
  className?: string;
};

export default function GradientPage({ children, className = '' }: GradientPageProps): ReactElement {
  return (
    <div className={`bg-gradient-to-t from-bgAccentPrimary to-bgAccentSecondary min-h-screen ${className}`.trim()}>
      {children}
    </div>
  );
}
