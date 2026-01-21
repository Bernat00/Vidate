import TextField from '../TextField.tsx';
import type { ChangeEvent } from 'react';
import type { SetupProfileForm } from '../../types/domain.ts';

type FieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

export default function NameFields({
  form,
  update,
}: {
  form: SetupProfileForm;
  update: <K extends keyof SetupProfileForm>(k: K) => (e: FieldChangeEvent) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-app-gap">
      <TextField id="first_name" label="First name" value={form.first_name} onChange={update('first_name')} />
      <TextField id="middle_name" label="Middle name" value={form.middle_name} onChange={update('middle_name')} />
      <TextField id="last_name" label="Last name" value={form.last_name} onChange={update('last_name')} />
    </div>
  );
}
