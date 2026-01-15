import { Label, TextInput } from 'flowbite-react';

export default function TextField({ id, label, value, onChange, type = 'text', placeholder = '', required = false }) {
  return (
    <div>
      <Label htmlFor={id} className="text-textSecondary mb-1">{label}</Label>
      <TextInput
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={onChange}
        className="w-full bg-bgSecondary text-textPrimary border-borderAccentLight focus:ring-borderAccent"
      />
    </div>
  );
}
