import { Select } from 'flowbite-react';
import type { ChangeEventHandler } from 'react';
import { commonInputClasses } from './form/formStyles';
import FormField from './form/FormField';

type OptionLike = {
  id?: number | string;
  value?: number | string;
  name?: string;
  label?: string;
};

type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  options?: OptionLike[];
  placeholder?: string;
  error?: string;
};

export default function SelectField({ id, label, value, onChange, options = [], placeholder = 'Select one', error }: SelectFieldProps) {
  return (
    <FormField id={id} label={label} error={error}>
      <Select
        id={id}
        value={value}
        onChange={onChange}
        className={commonInputClasses}
        color={error ? 'failure' : undefined}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => (
          <option key={(o.id ?? o.value) as string | number} value={String(o.id ?? o.value ?? '')}>
            {o.name ?? o.label}
          </option>
        ))}
      </Select>
    </FormField>
  );
}
