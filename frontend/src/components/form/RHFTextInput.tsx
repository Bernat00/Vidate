import { Label, TextInput } from 'flowbite-react';
import type { HTMLInputTypeAttribute } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import FormErrorText from './FormErrorText';

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
  const inputClass =
    `w-full bg-bgSecondary text-textPrimary border-borderAccentLight focus:ring-borderAccent ` +
    (error ? 'border-textError focus:ring-textError' : '');

  return (
    <div>
      <Label htmlFor={id} className="block mb-2 text-sm font-medium text-textSecondary">
        {label}
      </Label>
      <TextInput
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={inputClass}
        color={error ? 'failure' : undefined}
        {...register}
      />
      <FormErrorText>{error}</FormErrorText>
    </div>
  );
}

