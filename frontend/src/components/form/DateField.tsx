import { Label, TextInput } from 'flowbite-react';
import type { ChangeEventHandler } from 'react';

type DateFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
};

export default function DateField({ id, label, value, onChange }: DateFieldProps) {
  return (
    <div>
      <Label htmlFor={id} className="text-textSecondary mb-1">{label}</Label>
      <TextInput
        id={id}
        type="date"
        value={value}
        onChange={onChange as ChangeEventHandler<HTMLInputElement> | undefined}
        className="w-full bg-bgSecondary text-textPrimary border-borderAccentLight focus:ring-borderAccent"
      />
    </div>
  );
}
