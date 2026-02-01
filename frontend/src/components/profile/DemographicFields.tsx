import FormField from '../form/FormField';
import { TextInput, Select } from 'flowbite-react';
import { commonInputClasses } from '../form/formStyles';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { ProfileOption, SetupProfileForm } from '../../types/domain.ts';

export default function DemographicFields({
  register,
  errors,
  genders,
  religions,
  validateAge,
}: {
  register: UseFormRegister<SetupProfileForm>;
  errors: FieldErrors<SetupProfileForm>;
  genders: ProfileOption[];
  religions: ProfileOption[];
  validateAge: (dateString: string) => true | string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-app-gap mt-app-gap">
      <FormField id="birth_date" label="Birth date" error={errors.birth_date?.message}>
        <TextInput
          id="birth_date"
          type="date"
          {...register('birth_date', {
            required: 'Birth date is required',
            validate: validateAge
          })}
          className={commonInputClasses}
          color={errors.birth_date ? 'failure' : undefined}
        />
      </FormField>
      <FormField id="gender_id" label="Gender" error={errors.gender_id?.message}>
        <Select
          id="gender_id"
          {...register('gender_id', {
            required: 'Gender is required',
            validate: (val) => (val && val !== '') || 'Gender is required'
          })}
          className={commonInputClasses}
          color={errors.gender_id ? 'failure' : undefined}
        >
          <option value="" disabled>Select one</option>
          {genders.map(o => (
            <option key={o.id} value={String(o.id)}>
              {o.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField id="religion_id" label="Religion" error={errors.religion_id?.message}>
        <Select
          id="religion_id"
          {...register('religion_id')}
          className={commonInputClasses}
          color={errors.religion_id ? 'failure' : undefined}
        >
          <option value="">Prefer not to say</option>
          {religions.map(o => (
            <option key={o.id} value={String(o.id)}>
              {o.name}
            </option>
          ))}
        </Select>
      </FormField>
    </div>
  );
}
