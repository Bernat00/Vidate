import { Label, TextInput } from 'flowbite-react';
import type { HTMLInputTypeAttribute } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import FormErrorText from './FormErrorText';
import { commonInputClasses, commonLabelClasses } from './formStyles';

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
  const inputClass = commonInputClasses + (error ? ' border-textError focus:ring-textError' : '');

  return (
    <div>
      <Label htmlFor={id} className={`block ${commonLabelClasses} text-sm font-medium`}>
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

