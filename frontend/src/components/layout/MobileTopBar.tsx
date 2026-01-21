import type { ReactNode } from 'react';

export type MobileTopBarProps = {
  left?: ReactNode;
  title?: ReactNode;
  right?: ReactNode;
  className?: string;
};

export default function MobileTopBar({ left, title, right, className = '' }: MobileTopBarProps) {
  return (
    <header
      className={`flex items-center justify-between p-2 text-textPrimary bg-bgPrimary border-b border-borderAccentLight lg:hidden ${className}`.trim()}
    >
      <div className="w-8 flex items-center justify-start">{left}</div>
      <div className="font-bold text-textAccent">{title}</div>
      <div className="w-8 flex items-center justify-end">{right}</div>
    </header>
  );
}

