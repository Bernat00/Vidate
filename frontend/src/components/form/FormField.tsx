import type { ReactNode } from 'react';
import { Label } from 'flowbite-react';
import { commonLabelClasses } from './formStyles';
import FormErrorText from './FormErrorText';

interface FormFieldProps {
  id: string;
  label: string;
  children: ReactNode;
  error?: string;
  className?: string;
}

export default function FormField({ id, label, children, error, className = '' }: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={id} className={`block ${commonLabelClasses} text-sm font-medium mb-1`}>
        {label}
      </Label>
      {children}
      <FormErrorText>{error}</FormErrorText>
    </div>
  );
}
