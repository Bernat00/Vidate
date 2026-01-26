import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api.ts';
import { useToast } from '../context/toastContext.tsx';
import { useAuth } from '../context/authContext.tsx';
import NameFields from '../components/profile/NameFields.tsx';
import DemographicFields from '../components/profile/DemographicFields.tsx';
import type { ProfileMine, ProfileOption, SetupProfileForm, SetupProfilePayload } from '../types/domain.ts';
import GradientPage from '../components/layout/GradientPage';
import PrimaryButton from '../components/form/PrimaryButton';
import CenteredLoader from '../components/layout/CenteredLoader';
import Section from '../components/layout/Section';

const emptyForm: SetupProfileForm = {
  first_name: '',
  middle_name: '',
  last_name: '',
  birth_date: '',
  gender_id: '',
  language_id: '',
  religion_id: '',
};

export default function SetupProfile() {
  const { showToast } = useToast();
  const { refresh } = useAuth() || {};

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<SetupProfileForm>({
    defaultValues: emptyForm
  });

  const [genders, setGenders] = useState<ProfileOption[]>([]);
  const [languages, setLanguages] = useState<ProfileOption[]>([]);
  const [religions, setReligions] = useState<ProfileOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [g, l, r, myRes] = await Promise.all([
          api.get<ProfileOption[]>('/profile/genders'),
          api.get<ProfileOption[]>('/profile/languages'),
          api.get<ProfileOption[]>('/profile/religions'),
          api.get<ProfileMine | null>('/profile/mine').catch(() => ({ data: null } as { data: null }))
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

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload: SetupProfilePayload = {
        first_name: data.first_name.trim(),
        middle_name: data.middle_name.trim() || null,
        last_name: data.last_name.trim(),
        birth_date: new Date(data.birth_date).toISOString(),
        gender_id: Number(data.gender_id),
        language_id: Number(data.language_id),
        religion_id: Number(data.religion_id),
      } as unknown as SetupProfilePayload;

      await api.put('/profile/mine', payload);
      if (refresh) await refresh();
      showToast('Profile saved successfully!', 'success');
    } catch {
      showToast('Failed to save profile. Please try again.', 'error');
    }
  });

  if (loading) {
    return <CenteredLoader />;
  }

  return (
    <GradientPage className="flex items-center justify-center p-app-padding">
      <Section maxWidth="2xl">
        <form onSubmit={onSubmit} className="w-full bg-bgPrimary border border-borderAccent rounded-2xl shadow-2xl p-6">
          <h1 className="text-2xl font-bold text-textAccent mb-4">Complete your profile</h1>
          <NameFields register={register} errors={errors} />
          <DemographicFields register={register} errors={errors} genders={genders} languages={languages} religions={religions} validateAge={validateAge} />

          <PrimaryButton type="submit" disabled={isSubmitting} className="mt-app-gap">
            {isSubmitting ? 'Saving...' : 'Save and continue'}
          </PrimaryButton>
        </form>
      </Section>
    </GradientPage>
  );
}
