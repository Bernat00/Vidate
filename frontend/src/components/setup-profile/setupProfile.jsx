import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useToast } from '../../context/toastcontext.jsx';
import { useAuth } from '../../context/authContext.jsx';
import NameFields from './NameFields.jsx';
import DemographicFields from './DemographicFields.jsx';

export default function SetupProfile() {
  const { showToast } = useToast();
  const { refresh } = useAuth();

  const [form, setForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    birth_date: '', // YYYY-MM-DD
    gender_id: '',
    language_id: '',
    religion_id: ''
  });

  const [genders, setGenders] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [religions, setReligions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [g, l, r, my] = await Promise.all([
          api.get('/profile/genders'),
          api.get('/profile/languages'),
          api.get('/profile/religions'),
          api.get('/profile/mine').catch(() => ({ data: null }))
        ]);
        setGenders(g.data || []);
        setLanguages(l.data || []);
        setReligions(r.data || []);

        if (my.data) {
          setForm(prev => ({
            ...prev,
            ...my.data,
            birth_date: my.data.birth_date?.slice(0, 10) || ''
          }));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        birth_date: new Date(form.birth_date).toISOString(), // ISO acceptable
        gender_id: Number(form.gender_id),
        language_id: Number(form.language_id),
        religion_id: Number(form.religion_id),
      };

      await api.put('/profile/mine', payload);
      await refresh(); // will reflect is_onboarded = true
      showToast('Profile saved successfully!', 'success');
    } catch (err) {
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