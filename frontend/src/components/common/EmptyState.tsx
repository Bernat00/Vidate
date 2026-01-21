import type { LucideIcon } from 'lucide-react';
import Icon from './Icon';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export default function EmptyState({ icon, title, description, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`.trim()}>
      {icon && (
        <div className="mb-4 p-4 rounded-full bg-bgSecondary border border-borderAccentLight">
          <Icon icon={icon} size={32} className="text-textAccent" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-textPrimary">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-textSecondary max-w-xs mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
