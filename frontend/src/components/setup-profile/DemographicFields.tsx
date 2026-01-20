import DateField from '../form/DateField';
import SelectField from '../form/SelectField';
import type { ChangeEvent } from 'react';
import type { ProfileOption, SetupProfileForm } from '../../types/domain';

type FieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

type SelectChangeEvent = ChangeEvent<HTMLSelectElement>;

type UpdateFn = <K extends keyof SetupProfileForm>(k: K) => (e: FieldChangeEvent) => void;

const asSelectHandler = (fn: (e: FieldChangeEvent) => void) => (e: SelectChangeEvent) => {
  fn(e as unknown as FieldChangeEvent);
};

export default function DemographicFields({
  form,
  update,
  genders,
  languages,
  religions,
}: {
  form: SetupProfileForm;
  update: UpdateFn;
  genders: ProfileOption[];
  languages: ProfileOption[];
  religions: ProfileOption[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <DateField id="birth_date" label="Birth date" value={form.birth_date} onChange={update('birth_date')} />
      <SelectField id="gender_id" label="Gender" value={form.gender_id} onChange={asSelectHandler(update('gender_id'))} options={genders} />
      <SelectField id="language_id" label="Language" value={form.language_id} onChange={asSelectHandler(update('language_id'))} options={languages} />
      <SelectField id="religion_id" label="Religion" value={form.religion_id} onChange={asSelectHandler(update('religion_id'))} options={religions} />
    </div>
  );
}
