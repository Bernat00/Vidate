import { TextInput } from 'flowbite-react';
import type { HTMLInputTypeAttribute } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { commonInputClasses } from './formStyles';
import FormField from './FormField';

type RHFTextInputProps = {
  id: string;
  label: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  register: UseFormRegisterReturn;
  error?: string;
  autoComplete?: string;
};

export default function RHFTextInput({
  id,
  label,
  placeholder = '',
  type = 'text',
  register,
  error,
  autoComplete,
}: RHFTextInputProps) {
  return (
    <FormField id={id} label={label} error={error}>
      <TextInput
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={commonInputClasses}
        color={error ? 'failure' : undefined}
        {...register}
      />
    </FormField>
  );
}

