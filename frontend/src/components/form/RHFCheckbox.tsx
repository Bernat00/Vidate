import type { ReactNode } from 'react';

type RHFCheckboxProps = {
  label: ReactNode;
  registerProps?: Record<string, unknown>;
};

export default function RHFCheckbox({ label, registerProps }: RHFCheckboxProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-textSecondary">
      <input
        type="checkbox"
        className="w-4 h-4 rounded border-borderAccentLight bg-bgSecondary focus:ring-borderAccent"
        {...(registerProps ?? {})}
      />
      {label}
    </label>
  );
}

