import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../api.ts';
import { useToast } from '../context/toastContext.tsx';
import type { PreferenceMine, ProfileOption, SetupPreferencesForm, SetupPreferencesPayload } from '../types/domain.ts';
import GradientPage from '../components/layout/GradientPage';
import PrimaryButton from '../components/form/PrimaryButton';
import CenteredLoader from '../components/layout/CenteredLoader';
import Section from '../components/layout/Section';
import FormField from '../components/form/FormField';
import { Select } from 'flowbite-react';
import { commonInputClasses } from '../components/form/formStyles';

const emptyForm: SetupPreferencesForm = {
  wants_children: '',
  is_smoker: '',
  gender_ids: [],
  language_ids: [],
  religion_ids: [],
};

export default function SetupPreferences() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<SetupPreferencesForm>({
    defaultValues: emptyForm
  });

  const [genders, setGenders] = useState<ProfileOption[]>([]);
  const [languages, setLanguages] = useState<ProfileOption[]>([]);
  const [religions, setReligions] = useState<ProfileOption[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedGenderIds = watch('gender_ids');
  const selectedLanguageIds = watch('language_ids');
  const selectedReligionIds = watch('religion_ids');

  useEffect(() => {
    (async () => {
      try {
        const [g, l, r, prefRes] = await Promise.all([
          api.get<ProfileOption[]>('/profile/genders'),
          api.get<ProfileOption[]>('/profile/languages'),
          api.get<ProfileOption[]>('/profile/religions'),
          api.get<PreferenceMine | null>('/preferences').catch(() => ({ data: null } as { data: null }))
        ]);

        setGenders(g.data ?? []);
        setLanguages(l.data ?? []);
        setReligions(r.data ?? []);

        const pref = prefRes.data;
        if (pref) {
          setValue('wants_children', pref.wants_children != null ? String(pref.wants_children) : '');
          setValue('is_smoker', pref.is_smoker != null ? String(pref.is_smoker) : '');
          setValue('gender_ids', pref.genders?.map(g => String(g.id)) ?? []);
          setValue('language_ids', pref.languages?.map(l => String(l.id)) ?? []);
          setValue('religion_ids', pref.religions?.map(r => String(r.id)) ?? []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload: SetupPreferencesPayload = {
        wants_children: data.wants_children === '' ? null : data.wants_children === 'true',
        is_smoker: data.is_smoker === '' ? null : data.is_smoker === 'true',
        gender_ids: data.gender_ids.map(Number),
        language_ids: data.language_ids.map(Number),
        religion_ids: data.religion_ids.map(Number),
      };

      await api.put('/preferences', payload);
      showToast('Preferences saved successfully!', 'success');
      navigate('/');
    } catch {
      showToast('Failed to save preferences. Please try again.', 'error');
    }
  });

  const toggleSelection = (currentValues: string[], value: string) => {
    if (currentValues.includes(value)) {
      return currentValues.filter(v => v !== value);
    } else {
      return [...currentValues, value];
    }
  };

  if (loading) {
    return <CenteredLoader />;
  }

  return (
    <GradientPage className="flex items-center justify-center p-app-padding">
      <Section maxWidth="2xl">
        <form onSubmit={onSubmit} className="w-full bg-bgPrimary border border-borderAccent rounded-2xl shadow-2xl p-6">
          <h1 className="text-2xl font-bold text-textAccent mb-4">Set your preferences</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-app-gap">
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
            <FormField id="gender_ids" label="Preferred genders" error={errors.gender_ids?.message}>
              <div className="flex flex-wrap gap-2">
                {genders.map(gender => (
                  <button
                    key={gender.id}
                    type="button"
                    onClick={() => setValue('gender_ids', toggleSelection(selectedGenderIds, String(gender.id)))}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedGenderIds.includes(String(gender.id))
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
            <FormField id="language_ids" label="Preferred languages" error={errors.language_ids?.message}>
              <div className="flex flex-wrap gap-2">
                {languages.map(language => (
                  <button
                    key={language.id}
                    type="button"
                    onClick={() => setValue('language_ids', toggleSelection(selectedLanguageIds, String(language.id)))}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedLanguageIds.includes(String(language.id))
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
            <FormField id="religion_ids" label="Preferred religions" error={errors.religion_ids?.message}>
              <div className="flex flex-wrap gap-2">
                {religions.map(religion => (
                  <button
                    key={religion.id}
                    type="button"
                    onClick={() => setValue('religion_ids', toggleSelection(selectedReligionIds, String(religion.id)))}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedReligionIds.includes(String(religion.id))
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

          <PrimaryButton type="submit" disabled={isSubmitting} className="mt-app-gap">
            {isSubmitting ? 'Saving...' : 'Save and continue'}
          </PrimaryButton>
        </form>
      </Section>
    </GradientPage>
  );
}
