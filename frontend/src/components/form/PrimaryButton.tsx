import type { ButtonHTMLAttributes } from 'react';

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
};

export default function PrimaryButton({
  className = '',
  fullWidth = true,
  disabled,
  type = 'button',
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${
        fullWidth ? 'w-full' : ''
      } bg-bgAccentSecondary hover:bg-borderAccent text-textPrimary font-semibold rounded-lg py-2.5 transition hover:cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${className}`.trim()}
      {...rest}
    />
  );
}

