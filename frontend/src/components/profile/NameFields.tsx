import FormField from '../form/FormField';
import { TextInput } from 'flowbite-react';
import { commonInputClasses } from '../form/formStyles';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { SetupProfileForm } from '../../types/domain.ts';

export default function NameFields({
  register,
  errors,
}: {
  register: UseFormRegister<SetupProfileForm>;
  errors: FieldErrors<SetupProfileForm>;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-app-gap">
      <FormField id="first_name" label="First name" error={errors.first_name?.message}>
        <TextInput
          id="first_name"
          placeholder=""
          {...register('first_name', {
            required: 'First name is required',
            validate: (val) => val.trim().length > 0 || 'First name is required'
          })}
          className={commonInputClasses}
          color={errors.first_name ? 'failure' : undefined}
        />
      </FormField>
      <FormField id="middle_name" label="Middle name" error={errors.middle_name?.message}>
        <TextInput
          id="middle_name"
          placeholder=""
          {...register('middle_name')}
          className={commonInputClasses}
          color={errors.middle_name ? 'failure' : undefined}
        />
      </FormField>
      <FormField id="last_name" label="Last name" error={errors.last_name?.message}>
        <TextInput
          id="last_name"
          placeholder=""
          {...register('last_name', {
            required: 'Last name is required',
            validate: (val) => val.trim().length > 0 || 'Last name is required'
          })}
          className={commonInputClasses}
          color={errors.last_name ? 'failure' : undefined}
        />
      </FormField>
    </div>
  );
}
