import { Label, TextInput } from 'flowbite-react';
import type { ChangeEventHandler } from 'react';
import { commonInputClasses, commonLabelClasses } from './form/formStyles';

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  type?: string;
  placeholder?: string;
  required?: boolean;
};

export default function TextField({ id, label, value, onChange, type = 'text', placeholder = '', required = false }: TextFieldProps) {
  return (
    <div>
      <Label htmlFor={id} className={commonLabelClasses}>{label}</Label>
      <TextInput
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={onChange as ChangeEventHandler<HTMLInputElement> | undefined}
        className={commonInputClasses}
      />
    </div>
  );
}
