import type { ReactNode } from 'react';

interface DeviceMockupProps {
  children: ReactNode;
}

export default function DeviceMockup({ children }: DeviceMockupProps) {
  return (
    <div className="hidden lg:flex lg:col-span-5 lg:mt-0 justify-center items-center">
      <div className="relative w-64 h-96 bg-gradient-to-b from-bgAccentPrimary to-bgAccentSecondary rounded-3xl shadow-2xl flex flex-col items-center justify-center p-4 border border-borderAccentLight">
        {children}
      </div>
    </div>
  );
}
