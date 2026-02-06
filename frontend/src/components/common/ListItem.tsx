import type { ReactNode } from 'react';

interface ListItemProps {
  avatar?: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  rightElement?: ReactNode;
  active?: boolean;
  className?: string;
}

export default function ListItem({
  title,
  subtitle,
  onClick,
  rightElement,
  active = false,
  className = '',
}: ListItemProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`flex items-center w-full p-2 rounded-lg transition-colors text-left group
        ${active ? 'bg-bgSecondary text-textAccent' : 'text-textPrimary hover:bg-bgSecondary'}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}`}
    >
      {/*{avatar && (*/}
      {/*  <img*/}
      {/*    src={avatar}*/}
      {/*    alt={title}*/}
      {/*    className="w-10 h-10 rounded-full mr-3 object-cover border border-borderAccentLight group-hover:border-borderAccent transition-colors"*/}
      {/*  />*/}
      {/*)}*/}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${active ? 'text-textAccent' : 'text-textPrimary'}`}>
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-textSecondary truncate">
            {subtitle}
          </p>
        )}
      </div>
      {rightElement && (
        <div className="ml-2 text-xs text-textSecondary">
          {rightElement}
        </div>
      )}
    </div>
  );
}
