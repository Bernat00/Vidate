import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../api.ts';
import { useToast } from '../context/toastContext.tsx';
import { useAuth } from '../context/authContext.tsx';
import NameFields from '../components/profile/NameFields.tsx';
import DemographicFields from '../components/profile/DemographicFields.tsx';
import type { ProfileMine, ProfileOption, SetupProfileForm, SetupProfilePayload, PreferenceMine, SetupPreferencesPayload } from '../types/domain.ts';
import GradientPage from '../components/layout/GradientPage';
import PrimaryButton from '../components/form/PrimaryButton';
import CenteredLoader from '../components/layout/CenteredLoader';
import Section from '../components/layout/Section';
import FormField from '../components/form/FormField';
import { Select } from 'flowbite-react';
import { commonInputClasses } from '../components/form/formStyles';

interface CombinedFormFieldsProps {
  register: UseFormRegister<CombinedOnboardingForm>;
  errors: FieldErrors<CombinedOnboardingForm>;
  genders: ProfileOption[];
  languages: ProfileOption[];
  religions: ProfileOption[];
  selectedLanguageIds: string[];
  selectedPreferredGenderIds: string[];
  selectedPreferredReligionIds: string[];
  setValue: any;
  toggleSelection: (current: string[], val: string) => string[];
  validateAge: (date: string) => true | string;
  prefAgeMin: string;
  prefAgeMax: string;
}

function CombinedFormFields({
  register, errors, genders, languages, religions,
  selectedLanguageIds, selectedPreferredGenderIds, selectedPreferredReligionIds,
  setValue, toggleSelection, validateAge, prefAgeMin, prefAgeMax
}: CombinedFormFieldsProps) {
  return (
    <>
      <NameFields
        register={register as any}
        errors={errors as any}
      />
      <DemographicFields
        register={register as any}
        errors={errors as any}
        genders={genders}
        religions={religions}
        validateAge={validateAge}
      />

      <div className="mt-app-gap">
        <FormField id="language_ids" label="Languages" error={errors.language_ids?.message}>
          <input
            type="hidden"
            {...register('language_ids', {
              validate: (val: string[]) => (val && val.length > 0) || 'Select at least one language'
            })}
          />
          <div className="flex flex-wrap gap-2">
            {languages.map(language => (
              <button
                key={language.id}
                type="button"
                onClick={() => setValue('language_ids', toggleSelection(selectedLanguageIds, String(language.id)), { shouldValidate: true })}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedLanguageIds.includes(String(language.id))
                    ? 'bg-bgAccentPrimary text-textPrimary border-borderAccent'
                    : 'bg-bgPrimary text-textSecondary border-borderAccentLight hover:border-borderAccent'
                }`}
              >
                {language.name}
              </button>
            ))}
          </div>
        </FormField>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-textAccent mb-3">About you</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-app-gap">
        <FormField id="self_is_smoker" label="Are you a smoker?" error={errors.self_is_smoker?.message}>
          <Select
            id="self_is_smoker"
            {...register('self_is_smoker', { required: 'Please select an option' })}
            className={commonInputClasses}
            color={errors.self_is_smoker ? 'failure' : undefined}
          >
            <option value="" disabled>Select one</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
        </FormField>

        <FormField id="self_wants_children" label="Do you want children?" error={errors.self_wants_children?.message}>
          <Select
            id="self_wants_children"
            {...register('self_wants_children')}
            className={commonInputClasses}
            color={errors.self_wants_children ? 'failure' : undefined}
          >
            <option value="">Prefer not to say</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
        </FormField>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-textAccent mb-3">Preferences</h2>
        <p className="text-textSecondary text-sm mb-4">These are your preferences for potential matches.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-app-gap">
        <FormField id="pref_age_min" label="Preferred minimum age" error={errors.pref_age_min?.message}>
          <input
            id="pref_age_min"
            type="number"
            min={18}
            placeholder="Any"
            className={`${commonInputClasses} p-2`}
            {...register('pref_age_min', {
              validate: (val: string) => {
                if (!val) return true;
                const num = Number(val);
                if (num < 18) return 'Minimum age cannot be less than 18';
                if (prefAgeMax && num >= Number(prefAgeMax)) return 'Min age must be less than max age';
                return true;
              }
            })}
          />
        </FormField>

        <FormField id="pref_age_max" label="Preferred maximum age" error={errors.pref_age_max?.message}>
          <input
            id="pref_age_max"
            type="number"
            placeholder="Any"
            className={`${commonInputClasses} p-2`}
            {...register('pref_age_max', {
              validate: (val: string) => {
                if (!val) return true;
                const num = Number(val);
                if (prefAgeMin && num <= Number(prefAgeMin)) return 'Max age must be greater than min age';
                return true;
              }
            })}
          />
        </FormField>

        <FormField id="pref_wants_children" label="Should they want children?" error={errors.pref_wants_children?.message}>
          <Select id="pref_wants_children" {...register('pref_wants_children')} className={commonInputClasses}>
            <option value="">Prefer not to say</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
        </FormField>

        <FormField id="pref_is_smoker" label="Should they be a smoker?" error={errors.pref_is_smoker?.message}>
          <Select id="pref_is_smoker" {...register('pref_is_smoker')} className={commonInputClasses}>
            <option value="">Prefer not to say</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
        </FormField>
      </div>

      <div className="mt-app-gap">
        <FormField id="preferred_gender_ids" label="Preferred genders" error={errors.preferred_gender_ids?.message}>
          <div className="flex flex-wrap gap-2">
            {genders.map(gender => (
              <button
                key={gender.id}
                type="button"
                onClick={() => setValue('preferred_gender_ids', toggleSelection(selectedPreferredGenderIds, String(gender.id)))}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedPreferredGenderIds.includes(String(gender.id))
                    ? 'bg-bgAccentPrimary text-textPrimary border-borderAccent'
                    : 'bg-bgPrimary text-textSecondary border-borderAccentLight hover:border-borderAccent'
                }`}
              >
                {gender.name}
              </button>
            ))}
          </div>
        </FormField>
      </div>

      <div className="mt-app-gap">
        <FormField id="preferred_religion_ids" label="Preferred religions" error={errors.preferred_religion_ids?.message}>
          <div className="flex flex-wrap gap-2">
            {religions.map(religion => (
              <button
                key={religion.id}
                type="button"
                onClick={() => setValue('preferred_religion_ids', toggleSelection(selectedPreferredReligionIds, String(religion.id)))}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedPreferredReligionIds.includes(String(religion.id))
                    ? 'bg-bgAccentPrimary text-textPrimary border-borderAccent'
                    : 'bg-bgPrimary text-textSecondary border-borderAccentLight hover:border-borderAccent'
                }`}
              >
                {religion.name}
              </button>
            ))}
          </div>
        </FormField>
      </div>
    </>
  );
}

type CombinedOnboardingForm = SetupProfileForm & {
  self_wants_children: string; // "true" | "false" | ""
  self_is_smoker: string; // "true" | "false" | "" (required)
  pref_age_min: string; // "" or number as string
  pref_age_max: string; // "" or number as string
  pref_wants_children: string; // "true" | "false" | ""
  pref_is_smoker: string; // "true" | "false" | ""
  preferred_gender_ids: string[];
  preferred_religion_ids: string[];
};

const emptyForm: CombinedOnboardingForm = {
  first_name: '',
  middle_name: '',
  last_name: '',
  birth_date: '',
  gender_id: '',
  language_ids: [],
  religion_id: '',
  self_wants_children: '',
  self_is_smoker: '',
  pref_age_min: '',
  pref_age_max: '',
  pref_wants_children: '',
  pref_is_smoker: '',
  preferred_gender_ids: [],
  preferred_religion_ids: [],
};

interface SetupProfileProps {
    isNewUser?: boolean;
}

export default function SetupProfile({isNewUser = true}: SetupProfileProps) {
  const { showToast } = useToast();
  const { refresh } = useAuth() || {};
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<CombinedOnboardingForm>({
    defaultValues: emptyForm
  });

  const selectedPreferredGenderIds = watch('preferred_gender_ids');
  const selectedLanguageIds = watch('language_ids');
  const selectedPreferredReligionIds = watch('preferred_religion_ids');
  const prefAgeMin = watch('pref_age_min');
  const prefAgeMax = watch('pref_age_max');

  const [genders, setGenders] = useState<ProfileOption[]>([]);
  const [languages, setLanguages] = useState<ProfileOption[]>([]);
  const [religions, setReligions] = useState<ProfileOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (isNewUser) {
          const [g, l, r, myRes] = await Promise.all([
            api.get<ProfileOption[]>('/profile/genders'),
            api.get<ProfileOption[]>('/profile/languages'),
            api.get<ProfileOption[]>('/profile/religions'),
            api.get<ProfileMine | null>('/profile/mine').catch(() => ({ data: null } as { data: null })),
          ]);

          setGenders(g.data ?? []);
          setLanguages(l.data ?? []);
          setReligions(r.data ?? []);

          const my = myRes.data as (ProfileMine & { is_smoker?: boolean | null; wants_children?: boolean | null; language_id?: number | null }) | null;
          if (my) {
            setValue('first_name', my.first_name ?? '');
            setValue('middle_name', my.middle_name ?? '');
            setValue('last_name', my.last_name ?? '');
            setValue('birth_date', my.birth_date ? my.birth_date.slice(0, 10) : '');
            setValue('gender_id', my.gender_id != null ? String(my.gender_id) : '');
            const myLanguages = my.languages?.map(language => String(language.id)) ?? [];
            if (myLanguages.length > 0) {
              setValue('language_ids', myLanguages);
            } else if (my.language_id != null) {
              setValue('language_ids', [String(my.language_id)]);
            }
            setValue('religion_id', my.religion_id != null ? String(my.religion_id) : '');
            setValue('self_is_smoker', my.is_smoker != null ? String(my.is_smoker) : '');
            setValue('self_wants_children', my.wants_children != null ? String(my.wants_children) : '');
          }
        } else {
          const [g, l, r, myRes, prefRes] = await Promise.all([
            api.get<ProfileOption[]>('/profile/genders'),
            api.get<ProfileOption[]>('/profile/languages'),
            api.get<ProfileOption[]>('/profile/religions'),
            api.get<ProfileMine | null>('/profile/mine').catch(() => ({ data: null } as { data: null })),
            api.get<PreferenceMine | null>('/preferences').catch(() => ({ data: null } as { data: null }))
          ]);

          setGenders(g.data ?? []);
          setLanguages(l.data ?? []);
          setReligions(r.data ?? []);

          const my = myRes.data as (ProfileMine & { is_smoker?: boolean | null; wants_children?: boolean | null; language_id?: number | null }) | null;
          const myLanguageIds = my?.languages?.map(language => String(language.id)) ?? [];
          if (my) {
            setValue('first_name', my.first_name ?? '');
            setValue('middle_name', my.middle_name ?? '');
            setValue('last_name', my.last_name ?? '');
            setValue('birth_date', my.birth_date ? my.birth_date.slice(0, 10) : '');
            setValue('gender_id', my.gender_id != null ? String(my.gender_id) : '');
            if (myLanguageIds.length > 0) {
              setValue('language_ids', myLanguageIds);
            } else if (my.language_id != null) {
              setValue('language_ids', [String(my.language_id)]);
            }
            setValue('religion_id', my.religion_id != null ? String(my.religion_id) : '');
            setValue('self_is_smoker', my.is_smoker != null ? String(my.is_smoker) : '');
            setValue('self_wants_children', my.wants_children != null ? String(my.wants_children) : '');
          }

          const pref = prefRes.data;
          if (pref) {
            setValue('pref_age_min', pref.age_min != null ? String(pref.age_min) : '');
            setValue('pref_age_max', pref.age_max != null ? String(pref.age_max) : '');
            setValue('pref_wants_children', pref.wants_children != null ? String(pref.wants_children) : '');
            setValue('pref_is_smoker', pref.is_smoker != null ? String(pref.is_smoker) : '');
            setValue('preferred_gender_ids', pref.genders?.map(g => String(g.id)) ?? []);
            setValue('preferred_religion_ids', pref.religions?.map(r => String(r.id)) ?? []);
            if (myLanguageIds.length === 0 && pref.languages?.length) {
              setValue('language_ids', pref.languages.map(language => String(language.id)));
            }
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [isNewUser, setValue]);

  const validateAge = (dateString: string): true | string => {
    const d = new Date(dateString);
    const isValid = !isNaN(d.getTime());
    if (!isValid) return 'Provide a valid date';
    
    const today = new Date();
    if (d > today) return 'Birth date cannot be in the future';
    
    const birth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const now = new Date();
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    let age = todayUtc.getUTCFullYear() - birth.getUTCFullYear();
    const m = todayUtc.getUTCMonth() - birth.getUTCMonth();
    if (m < 0 || (m === 0 && todayUtc.getUTCDate() < birth.getUTCDate())) {
      age--;
    }
    if (age < 18) return 'You must be at least 18 years old';
    
    return true;
  };

  const toggleSelection = (currentValues: string[], value: string) => {
    if (currentValues.includes(value)) {
      return currentValues.filter(v => v !== value);
    } else {
      return [...currentValues, value];
    }
  };

  const onSubmitProfile = async (data: CombinedOnboardingForm) => {
    try {
      const profilePayload: SetupProfilePayload = {
        first_name: data.first_name.trim(),
        middle_name: data.middle_name.trim() || null,
        last_name: data.last_name.trim(),
        birth_date: new Date(data.birth_date).toISOString(),
        gender_id: Number(data.gender_id),
        language_ids: data.language_ids.map(Number),
        religion_id: data.religion_id === '' ? null : Number(data.religion_id),
        is_smoker: data.self_is_smoker === '' ? false : data.self_is_smoker === 'true',
        wants_children: data.self_wants_children === '' ? null : data.self_wants_children === 'true',
      };

      const preferencesPayload: SetupPreferencesPayload = {
        age_min: data.pref_age_min === '' ? null : Number(data.pref_age_min),
        age_max: data.pref_age_max === '' ? null : Number(data.pref_age_max),
        wants_children: data.pref_wants_children === '' ? null : data.pref_wants_children === 'true',
        is_smoker: data.pref_is_smoker === '' ? null : data.pref_is_smoker === 'true',
        gender_ids: data.preferred_gender_ids.map(Number),
        language_ids: data.language_ids.map(Number),
        religion_ids: data.preferred_religion_ids.map(Number),
      };

      await Promise.all([
        api.put('/profile/mine', profilePayload),
        api.put('/preferences', preferencesPayload)
      ]);

      if (refresh) await refresh();
      showToast('Profile and preferences saved successfully!', 'success');
      if (isNewUser) {
        navigate('/home');
      }
    } catch {
      showToast('Failed to save profile. Please try again.', 'error');
    }
  };

  const sharedProps = {
    register, errors, genders, languages, religions,
    selectedLanguageIds, selectedPreferredGenderIds, selectedPreferredReligionIds,
    setValue, toggleSelection, validateAge, prefAgeMin, prefAgeMax
  };

  if (loading) {
    const loadingElem = (
      <div className="flex items-center justify-center py-8">
        <CenteredLoader />
      </div>
    );
    if (isNewUser) return <CenteredLoader />;
    return (
      <div className="w-full bg-bgPrimary border border-borderAccent rounded-2xl shadow-2xl p-6">
        <h1 className="text-2xl font-bold text-textAccent mb-6">Profile settings</h1>
        {loadingElem}
      </div>
    );
  }

  const formJsx = (
    <form onSubmit={handleSubmit(onSubmitProfile)}>
      <CombinedFormFields {...sharedProps} />
      <div className="flex gap-4 mt-app-gap">
        <PrimaryButton type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Saving...' : 'Save'}
        </PrimaryButton>
      </div>
    </form>
  );

  if (isNewUser) {
    return (
      <GradientPage className="flex items-center justify-center p-app-padding" isScrollable={true}>
        <Section maxWidth="2xl">
          <div className="w-full bg-bgPrimary border border-borderAccent rounded-2xl shadow-2xl p-6">
            <h1 className="text-2xl font-bold text-textAccent mb-6">Complete your profile</h1>
            {formJsx}
          </div>
        </Section>
      </GradientPage>
    );
  }

  return (
    <div className="w-full bg-bgPrimary border border-borderAccent rounded-2xl shadow-2xl p-6">
      <h1 className="text-2xl font-bold text-textAccent mb-6">Profile settings</h1>
      {formJsx}
    </div>
  );
}
