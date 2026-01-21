import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import Icon from './Icon';

interface NavButtonProps {
  to: string;
  icon: LucideIcon;
  label: string;
}

export default function NavButton({ to, icon, label }: NavButtonProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `inline-flex flex-col items-center gap-1 justify-center px-5 transition-colors
        ${isActive 
          ? 'bg-bgAccentSecondary text-textPrimary' 
          : 'text-textSecondary hover:bg-bgSecondary hover:text-textPrimary'}`
      }
    >
      <Icon icon={icon} size={24} />
      <span className="text-xs">{label}</span>
    </NavLink>
  );
}
