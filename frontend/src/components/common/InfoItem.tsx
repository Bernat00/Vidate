import type { ReactNode } from 'react';

interface InfoItemProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export default function InfoItem({ label, value, className = '' }: InfoItemProps) {
  return (
    <div className={`rounded-xl border border-borderAccentLight bg-bgSecondary/40 p-4 ${className}`.trim()}>
      <p className="text-xs uppercase tracking-wide text-textSecondary">{label}</p>
      <div className="mt-2 text-sm font-semibold text-textPrimary">{value}</div>
    </div>
  );
}