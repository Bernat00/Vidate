import type { ReactNode } from 'react';

type FormAlertVariant = 'error' | 'success' | 'warning' | 'info';

type FormAlertProps = {
  children: ReactNode;
  variant?: FormAlertVariant;
  className?: string;
};

export default function FormAlert({ children, variant = 'info', className = '' }: FormAlertProps) {
  const styles: Record<FormAlertVariant, string> = {
    error: 'text-textError bg-bgSecondary border-textError',
    success: 'text-textSuccess bg-bgSecondary border-textSuccess',
    warning: 'text-textWarning bg-bgSecondary border-textWarning',
    info: 'text-textAccent bg-bgSecondary border-borderAccentLight',
  };

  return (
    <div
      className={`mb-4 p-3 text-sm border rounded-lg text-center ${styles[variant]} ${className}`.trim()}
      role="alert"
    >
      {children}
    </div>
  );
}

