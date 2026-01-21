import { Label, Select } from 'flowbite-react';
import type { ChangeEventHandler } from 'react';
import { commonInputClasses, commonLabelClasses } from './form/formStyles';

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
};

export default function SelectField({ id, label, value, onChange, options = [], placeholder = 'Select one' }: SelectFieldProps) {
  return (
    <div>
      <Label htmlFor={id} className={commonLabelClasses}>{label}</Label>
      <Select
        id={id}
        value={value}
        onChange={onChange}
        className={commonInputClasses}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => (
          <option key={(o.id ?? o.value) as string | number} value={String(o.id ?? o.value ?? '')}>
            {o.name ?? o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
