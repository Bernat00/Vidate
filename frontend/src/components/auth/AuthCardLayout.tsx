import type { ReactNode } from 'react';
import GradientPage from '../layout/GradientPage';
import AuthHeader from './AuthHeader';

type AuthCardLayoutProps = {
  children: ReactNode;
  subtitle: string;
  headerTitle?: string;
};

export default function AuthCardLayout({ children, subtitle, headerTitle }: AuthCardLayoutProps) {
  return (
    <GradientPage className="flex items-center justify-center">
      <div className="w-full max-w-md bg-bgPrimary border border-borderAccent rounded-2xl shadow-2xl p-8 m-4">
        <AuthHeader title={headerTitle} />
        <h2 className="text-textPrimary text-xl font-semibold text-center mb-6">{subtitle}</h2>
        {children}
      </div>
    </GradientPage>
  );
}

