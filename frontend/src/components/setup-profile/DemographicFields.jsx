import DateField from '../form/DateField.jsx';
import SelectField from '../form/SelectField.jsx';

export default function DemographicFields({ form, update, genders, languages, religions }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <DateField id="birth_date" label="Birth date" value={form.birth_date} onChange={update('birth_date')} />
      <SelectField id="gender_id" label="Gender" value={form.gender_id} onChange={update('gender_id')} options={genders} />
      <SelectField id="language_id" label="Language" value={form.language_id} onChange={update('language_id')} options={languages} />
      <SelectField id="religion_id" label="Religion" value={form.religion_id} onChange={update('religion_id')} options={religions} />
    </div>
  );
}
