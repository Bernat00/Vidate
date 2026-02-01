import type { ReactNode } from 'react';

interface InfoItemProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export default function InfoItem({ label, value, className = '' }: InfoItemProps) {
  return (
    <div className={`rounded-xl border border-borderAccentLight bg-bgSecondary/40 p-4 ${className}`.trim()}>
      <p className="text-xs font-semibold tracking-wide text-textSecondary/80">{label}</p>
      <div className="mt-2 text-sm font-semibold text-textPrimary">{value}</div>
    </div>
  );
}