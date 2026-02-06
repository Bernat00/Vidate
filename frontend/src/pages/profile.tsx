import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {LogOut} from 'lucide-react';
import api from '../api.ts';
import Section from '../components/layout/Section';
import PrimaryButton from '../components/form/PrimaryButton';
import RHFTextInput from '../components/form/RHFTextInput';
import FormAlert from '../components/form/FormAlert';
import SetupProfile from './setupProfile';
import { useToast } from '../context/toastContext.tsx';
import { useAuth } from '../context/authContext.tsx';
import { logout } from '../helpers.ts';
import { useNavigate } from 'react-router-dom';

type AccountFormValues = {
  email: string;
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export default function ProfilePage() {
  const { showToast } = useToast();
  const { refresh } = useAuth() || {};
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const currentEmailRef = useRef<string>('');

  const { register, handleSubmit, getValues, setValue, formState: { errors, isSubmitting } } = useForm<AccountFormValues>();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/users/me');
        const email = res?.data?.email ?? '';
        currentEmailRef.current = email;
        setValue('email', email);
      } catch {
        // ignore
      }
    })();
  }, [setValue]);

  const onSubmit = async (data: AccountFormValues) => {
    setApiError('');
    const payload: Record<string, any> = {};

    const emailChanged = data.email && data.email !== currentEmailRef.current;
    if (emailChanged) payload.email = data.email;

    if (data.newPassword) {
      payload.password = data.newPassword;
      payload.old_password = data.oldPassword;
    }

    if (!emailChanged && !data.newPassword) {
      showToast('Nothing to update', 'info');
      return;
    }

    try {
      await api.patch('/users/me', payload);
      if (emailChanged) currentEmailRef.current = data.email;
      if (refresh) await refresh();
      showToast('Account updated successfully', 'success');
      setValue('oldPassword', '');
      setValue('newPassword', '');
      setValue('confirmNewPassword', '');
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Failed to update account';
      setApiError(detail);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      if (refresh) await refresh();
    } finally {
      showToast('Logged out successfully', 'success');
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="p-app-padding">
      <Section maxWidth="2xl">
        {/* Top actions */}
        <div className="w-full mb-4">
            <PrimaryButton type="button" onClick={handleLogout} className="bg-bgSecondary flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4"/>
                Log out
            </PrimaryButton>
        </div>
        <div className="w-full bg-bgPrimary border border-borderAccent rounded-2xl shadow-2xl p-6 mb-8">
          <h1 className="text-2xl font-bold text-textAccent mb-4">Account settings</h1>

          {apiError && <FormAlert variant="error" className="mb-4">{apiError}</FormAlert>}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <RHFTextInput
              id="email"
              label="Email"
              placeholder="name@company.tld"
              register={register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address.',
                },
              })}
              error={errors.email?.message}
              autoComplete="email"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RHFTextInput
                id="old-password"
                label="Old password"
                type="password"
                placeholder="••••••••"
                register={register('oldPassword', {
                  validate: (val) => {
                    if (getValues('newPassword') && !val) return 'Enter your old password';
                    return true;
                  }
                })}
                error={errors.oldPassword?.message}
                autoComplete="current-password"
              />
              <RHFTextInput
                id="new-password"
                label="New password"
                type="password"
                placeholder="••••••••"
                register={register('newPassword', {
                  minLength: { value: 8, message: 'Password must be at least 8 characters.' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                    message: 'Must contain at least 1 uppercase, 1 lowercase, and 1 number.',
                  },
                })}
                error={errors.newPassword?.message}
                autoComplete="new-password"
              />
            </div>

            <RHFTextInput
              id="confirm-new-password"
              label="Confirm new password"
              type="password"
              placeholder="••••••••"
              register={register('confirmNewPassword', {
                validate: (val) => {
                  const newPass = getValues('newPassword');
                  if (!newPass && !val) return true; // not changing password
                  return newPass === val ? true : 'Your passwords do not match.';
                },
              })}
              error={errors.confirmNewPassword?.message}
              autoComplete="new-password"
            />

            <PrimaryButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </PrimaryButton>
          </form>

        </div>

        {/* Profile Setup section (edit mode) */}
        <SetupProfile isNewUser={false} />
      </Section>
    </div>
  );
}
