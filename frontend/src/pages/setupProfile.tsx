import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
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

type FieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

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

  const [form, setForm] = useState<SetupProfileForm>(emptyForm);

  const [genders, setGenders] = useState<ProfileOption[]>([]);
  const [languages, setLanguages] = useState<ProfileOption[]>([]);
  const [religions, setReligions] = useState<ProfileOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SetupProfileForm, string>>>({});

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
          setForm((prev) => ({
            ...prev,
            first_name: my.first_name ?? '',
            middle_name: my.middle_name ?? '',
            last_name: my.last_name ?? '',
            birth_date: my.birth_date ? my.birth_date.slice(0, 10) : '',
            gender_id: my.gender_id != null ? String(my.gender_id) : '',
            language_id: my.language_id != null ? String(my.language_id) : '',
            religion_id: my.religion_id != null ? String(my.religion_id) : '',
          }));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const update =
    <K extends keyof SetupProfileForm>(k: K) =>
    (e: FieldChangeEvent) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
    };

  const toNumberOrNull = (v: string): number | null => {
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Validate form before submit
    const newErrors: Partial<Record<keyof SetupProfileForm, string>> = {};

    const isBlank = (s: string) => !s || s.trim().length === 0;

    if (isBlank(form.first_name)) newErrors.first_name = 'First name is required';
    if (isBlank(form.middle_name)) newErrors.middle_name = 'Middle name is required';
    if (isBlank(form.last_name)) newErrors.last_name = 'Last name is required';

    if (isBlank(form.birth_date)) {
      newErrors.birth_date = 'Birth date is required';
    } else {
      const d = new Date(form.birth_date);
      const isValid = !isNaN(d.getTime());
      const today = new Date();
      if (!isValid) newErrors.birth_date = 'Provide a valid date';
      else if (d > today) newErrors.birth_date = 'Birth date cannot be in the future';
    }

    if (!toNumberOrNull(form.gender_id)) newErrors.gender_id = 'Gender is required';
    if (!toNumberOrNull(form.language_id)) newErrors.language_id = 'Language is required';
    if (!toNumberOrNull(form.religion_id)) newErrors.religion_id = 'Religion is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showToast('Please fix the highlighted errors.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload: SetupProfilePayload = {
        // Backend requires non-null fields; we validated already
        first_name: form.first_name.trim(),
        middle_name: form.middle_name.trim(),
        last_name: form.last_name.trim(),
        birth_date: new Date(form.birth_date).toISOString(),
        gender_id: Number(form.gender_id),
        language_id: Number(form.language_id),
        religion_id: Number(form.religion_id),
      } as unknown as SetupProfilePayload;

      await api.put('/profile/mine', payload);
      if (refresh) await refresh();
      showToast('Profile saved successfully!', 'success');
    } catch {
      showToast('Failed to save profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <CenteredLoader />;
  }

  return (
    <GradientPage className="flex items-center justify-center p-app-padding">
      <Section maxWidth="2xl">
        <form onSubmit={onSubmit} className="w-full bg-bgPrimary border border-borderAccent rounded-2xl shadow-2xl p-6">
          <h1 className="text-2xl font-bold text-textAccent mb-4">Complete your profile</h1>
          <NameFields form={form} update={update} errors={errors} />
          <DemographicFields form={form} update={update} genders={genders} languages={languages} religions={religions} errors={errors} />

          <PrimaryButton type="submit" disabled={saving} className="mt-app-gap">
            {saving ? 'Saving...' : 'Save and continue'}
          </PrimaryButton>
        </form>
      </Section>
    </GradientPage>
  );
}
