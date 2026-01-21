import { TextInput } from 'flowbite-react';
import type { ChangeEventHandler } from 'react';
import { commonInputClasses } from './form/formStyles';
import FormField from './form/FormField';

type DateFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
  error?: string;
};

export default function DateField({ id, label, value, onChange, error }: DateFieldProps) {
  return (
    <FormField id={id} label={label} error={error}>
      <TextInput
        id={id}
        type="date"
        value={value}
        onChange={onChange as ChangeEventHandler<HTMLInputElement> | undefined}
        className={commonInputClasses}
        color={error ? 'failure' : undefined}
      />
    </FormField>
  );
}
