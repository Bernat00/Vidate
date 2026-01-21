import { Label, TextInput } from 'flowbite-react';
import type { ChangeEventHandler } from 'react';
import { commonInputClasses, commonLabelClasses } from './form/formStyles';

type DateFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
};

export default function DateField({ id, label, value, onChange }: DateFieldProps) {
  return (
    <div>
      <Label htmlFor={id} className={commonLabelClasses}>{label}</Label>
      <TextInput
        id={id}
        type="date"
        value={value}
        onChange={onChange as ChangeEventHandler<HTMLInputElement> | undefined}
        className={commonInputClasses}
      />
    </div>
  );
}
