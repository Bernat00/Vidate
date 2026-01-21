import type { ReactNode } from 'react';

interface HeroProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export default function Hero({ title, description, children }: HeroProps) {
  return (
    <div className="mr-auto place-self-center lg:col-span-7">
      <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight text-textPrimary mb-4">
        {title}
      </h1>
      <p className="text-textSecondary md:text-lg lg:text-xl mb-6">
        {description}
      </p>
      {children && (
        <div className="flex flex-wrap gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
