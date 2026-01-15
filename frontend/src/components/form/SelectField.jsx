import { Label, Select } from 'flowbite-react';

export default function SelectField({ id, label, value, onChange, options = [], placeholder = 'Select one' }) {
  return (
    <div>
      <Label htmlFor={id} className="text-textSecondary mb-1">{label}</Label>
      <Select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full bg-bgSecondary text-textPrimary border-borderAccentLight focus:ring-borderAccent"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => (
          <option key={o.id ?? o.value} value={o.id ?? o.value}>{o.name ?? o.label}</option>
        ))}
      </Select>
    </div>
  );
}
