import type { ButtonHTMLAttributes } from 'react';

type DestructiveButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
};

export default function DestructiveButton({
  className = '',
  fullWidth = true,
  disabled,
  type = 'button',
  ...rest
}: DestructiveButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${
        fullWidth ? 'w-full' : ''
      } bg-red-600/90 hover:bg-red-600 text-white font-semibold rounded-xl py-3 px-4 shadow-lg shadow-red-500/20 border border-red-500/40 transition hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-70 disabled:cursor-not-allowed ${className}`.trim()}
      {...rest}
    />
  );
}