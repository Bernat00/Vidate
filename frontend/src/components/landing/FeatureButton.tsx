import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface FeatureButtonProps {
  to: string;
  variant?: 'primary' | 'secondary';
  children: ReactNode;
  icon?: ReactNode;
}

export default function FeatureButton({ to, variant = 'primary', children, icon }: FeatureButtonProps) {
  const baseClasses = "inline-flex items-center px-5 py-3 text-base font-medium text-center rounded-lg focus:ring-4 focus:ring-borderAccentLight gap-2";
  const variants = {
    primary: "text-textPrimary bg-bgAccentSecondary hover:bg-borderAccent",
    secondary: "text-textSecondary border border-borderAccentLight hover:bg-bgAccentPrimary"
  };

  return (
    <Link to={to} className={`${baseClasses} ${variants[variant]}`}>
      {children}
      {icon}
    </Link>
  );
}
