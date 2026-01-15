import { Label, TextInput } from 'flowbite-react';

export default function DateField({ id, label, value, onChange }) {
  return (
    <div>
      <Label htmlFor={id} className="text-textSecondary mb-1">{label}</Label>
      <TextInput
        id={id}
        type="date"
        value={value}
        onChange={onChange}
        className="w-full bg-bgSecondary text-textPrimary border-borderAccentLight focus:ring-borderAccent"
      />
    </div>
  );
}
