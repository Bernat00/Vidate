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

type CombinedOnboardingForm = SetupProfileForm & {
  wants_children: string;
  is_smoker: string;
  preferred_gender_ids: string[];
  preferred_language_ids: string[];
  preferred_religion_ids: string[];
};

const emptyForm: CombinedOnboardingForm = {
  first_name: '',
  middle_name: '',
  last_name: '',
  birth_date: '',
  gender_id: '',
  language_id: '',
  religion_id: '',
  wants_children: '',
  is_smoker: '',
  preferred_gender_ids: [],
  preferred_language_ids: [],
  preferred_religion_ids: [],
};

export default function SetupProfile() {
  const { showToast } = useToast();
  const { refresh } = useAuth() || {};
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<CombinedOnboardingForm>({
    defaultValues: emptyForm
  });

  const selectedPreferredGenderIds = watch('preferred_gender_ids');
  const selectedPreferredLanguageIds = watch('preferred_language_ids');
  const selectedPreferredReligionIds = watch('preferred_religion_ids');

  const [genders, setGenders] = useState<ProfileOption[]>([]);
  const [languages, setLanguages] = useState<ProfileOption[]>([]);
  const [religions, setReligions] = useState<ProfileOption[]>([]);
  const [loading, setLoading] = useState(true);
  // Single-page onboarding (no stages)

  useEffect(() => {
    (async () => {
      try {
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

        const my = myRes.data;
        if (my) {
          setValue('first_name', my.first_name ?? '');
          setValue('middle_name', my.middle_name ?? '');
          setValue('last_name', my.last_name ?? '');
          setValue('birth_date', my.birth_date ? my.birth_date.slice(0, 10) : '');
          setValue('gender_id', my.gender_id != null ? String(my.gender_id) : '');
          setValue('language_id', my.language_id != null ? String(my.language_id) : '');
          setValue('religion_id', my.religion_id != null ? String(my.religion_id) : '');
        }

        const pref = prefRes.data;
        if (pref) {
          setValue('wants_children', pref.wants_children != null ? String(pref.wants_children) : '');
          setValue('is_smoker', pref.is_smoker != null ? String(pref.is_smoker) : '');
          setValue('preferred_gender_ids', pref.genders?.map(g => String(g.id)) ?? []);
          setValue('preferred_language_ids', pref.languages?.map(l => String(l.id)) ?? []);
          setValue('preferred_religion_ids', pref.religions?.map(r => String(r.id)) ?? []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const validateAge = (dateString: string): true | string => {
    const d = new Date(dateString);
    const isValid = !isNaN(d.getTime());
    if (!isValid) return 'Provide a valid date';
    
    const today = new Date();
    if (d > today) return 'Birth date cannot be in the future';
    
    // Age must be at least 18
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
      // Save profile data
      const profilePayload: SetupProfilePayload = {
        first_name: data.first_name.trim(),
        middle_name: data.middle_name.trim() || null,
        last_name: data.last_name.trim(),
        birth_date: new Date(data.birth_date).toISOString(),
        gender_id: Number(data.gender_id),
        language_id: Number(data.language_id),
        religion_id: Number(data.religion_id),
        // Include smoker/children flags here too because backend ProfileCreate requires them
        // (extra fields are casted for TS to match SetupProfilePayload)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        is_smoker: data.is_smoker === '' ? false : data.is_smoker === 'true',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        wants_children: data.wants_children === '' ? null : data.wants_children === 'true',
      } as unknown as SetupProfilePayload;

      // Save preferences data
      const preferencesPayload: SetupPreferencesPayload = {
        wants_children: data.wants_children === '' ? null : data.wants_children === 'true',
        is_smoker: data.is_smoker === '' ? null : data.is_smoker === 'true',
        gender_ids: data.preferred_gender_ids.map(Number),
        language_ids: data.preferred_language_ids.map(Number),
        religion_ids: data.preferred_religion_ids.map(Number),
      };

      // Submit both in parallel
      await Promise.all([
        api.put('/profile/mine', profilePayload),
        api.put('/preferences', preferencesPayload)
      ]);

      if (refresh) await refresh();
      showToast('Profile and preferences saved successfully!', 'success');
      navigate('/my-matches');
    } catch {
      showToast('Failed to save profile. Please try again.', 'error');
    }
  };

  // No special key handling needed in single-page flow

  if (loading) {
    return <CenteredLoader />;
  }

  return (
    <GradientPage className="flex items-center justify-center p-app-padding">
      <Section maxWidth="2xl">
        <form onSubmit={handleSubmit(onSubmitProfile)} className="w-full bg-bgPrimary border border-borderAccent rounded-2xl shadow-2xl p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-textAccent">Complete your profile</h1>
          </div>

          {/* Personal Information */}
          <NameFields
            register={register as unknown as UseFormRegister<SetupProfileForm>}
            errors={errors as unknown as FieldErrors<SetupProfileForm>}
          />
          <DemographicFields
            register={register as unknown as UseFormRegister<SetupProfileForm>}
            errors={errors as unknown as FieldErrors<SetupProfileForm>}
            genders={genders}
            languages={languages}
            religions={religions}
            validateAge={validateAge}
          />

          {/* Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-app-gap mt-app-gap">
            <FormField id="wants_children" label="Do you want children?" error={errors.wants_children?.message}>
              <Select
                id="wants_children"
                {...register('wants_children')}
                className={commonInputClasses}
                color={errors.wants_children ? 'failure' : undefined}
              >
                <option value="">Prefer not to say</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </FormField>

            <FormField id="is_smoker" label="Do you smoke?" error={errors.is_smoker?.message}>
              <Select
                id="is_smoker"
                {...register('is_smoker')}
                className={commonInputClasses}
                color={errors.is_smoker ? 'failure' : undefined}
              >
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
                        ? 'bg-accentPrimary text-white border-accentPrimary'
                        : 'bg-bgPrimary text-textSecondary border-borderAccent hover:border-accentPrimary'
                    }`}
                  >
                    {gender.name}
                  </button>
                ))}
              </div>
            </FormField>
          </div>

          <div className="mt-app-gap">
            <FormField id="preferred_language_ids" label="Preferred languages" error={errors.preferred_language_ids?.message}>
              <div className="flex flex-wrap gap-2">
                {languages.map(language => (
                  <button
                    key={language.id}
                    type="button"
                    onClick={() => setValue('preferred_language_ids', toggleSelection(selectedPreferredLanguageIds, String(language.id)))}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedPreferredLanguageIds.includes(String(language.id))
                        ? 'bg-accentPrimary text-white border-accentPrimary'
                        : 'bg-bgPrimary text-textSecondary border-borderAccent hover:border-accentPrimary'
                    }`}
                  >
                    {language.name}
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
                        ? 'bg-accentPrimary text-white border-accentPrimary'
                        : 'bg-bgPrimary text-textSecondary border-borderAccent hover:border-accentPrimary'
                    }`}
                  >
                    {religion.name}
                  </button>
                ))}
              </div>
            </FormField>
          </div>

          <div className="flex gap-4 mt-app-gap">
            <PrimaryButton type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : 'Save'}
            </PrimaryButton>
          </div>
        </form>
      </Section>
    </GradientPage>
  );
}
