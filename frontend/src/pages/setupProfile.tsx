import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import api from '../api.ts';
import { useToast } from '../context/toastContext.tsx';
import { useAuth } from '../context/authContext.tsx';
import NameFields from '../components/NameFields.tsx';
import DemographicFields from '../components/DemographicFields.tsx';
import type { ProfileMine, ProfileOption, SetupProfileForm, SetupProfilePayload } from '../types/domain.ts';

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
    setSaving(true);
    try {
      const payload: SetupProfilePayload = {
        first_name: form.first_name || null,
        middle_name: form.middle_name || null,
        last_name: form.last_name || null,
        birth_date: form.birth_date ? new Date(form.birth_date).toISOString() : null,
        gender_id: toNumberOrNull(form.gender_id),
        language_id: toNumberOrNull(form.language_id),
        religion_id: toNumberOrNull(form.religion_id),
      };

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgPrimary text-textSecondary">Loading...</div>
    );
  }

  return (
    <div className="bg-gradient-to-t from-bgAccentPrimary to-bgAccentSecondary min-h-screen flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-2xl bg-bgPrimary border border-borderAccent rounded-2xl shadow-2xl p-6">
        <h1 className="text-2xl font-bold text-textAccent mb-4">Complete your profile</h1>
        <NameFields form={form} update={update} />
        <DemographicFields form={form} update={update} genders={genders} languages={languages} religions={religions} />
        <button type="submit" disabled={saving} className="mt-6 w-full bg-bgAccentSecondary hover:bg-borderAccent text-textPrimary font-semibold rounded-lg py-2.5 transition">
          {saving ? 'Saving...' : 'Save and continue'}
        </button>
      </form>
    </div>
  );
}
