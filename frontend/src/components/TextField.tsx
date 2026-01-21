import { TextInput } from 'flowbite-react';
import type { ChangeEventHandler } from 'react';
import { commonInputClasses } from './form/formStyles';
import FormField from './form/FormField';

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
};

export default function TextField({ id, label, value, onChange, type = 'text', placeholder = '', required = false, error }: TextFieldProps) {
  return (
    <FormField id={id} label={label} error={error}>
      <TextInput
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={onChange as ChangeEventHandler<HTMLInputElement> | undefined}
        className={commonInputClasses}
        color={error ? 'failure' : undefined}
      />
    </FormField>
  );
}
