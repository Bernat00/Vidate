import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { AxiosError } from 'axios';
import api from '../api.ts';
import { login } from '../helpers.ts';
import { useAuth } from '../context/authContext.tsx';
import type { ToastStatus } from '../types/domain.ts';
import AuthCardLayout from '../components/auth/AuthCardLayout';
import FormAlert from '../components/form/FormAlert';
import PrimaryButton from '../components/form/PrimaryButton';
import RHFTextInput from '../components/form/RHFTextInput';

type RegisterFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

type RegisterErrorBody = { detail?: string };

type RegisterRouteState = {
  toastMessage: string;
  status: ToastStatus;
};

const Register = () => {
  const { register: reg, handleSubmit, getValues, formState: { errors } } = useForm<RegisterFormValues>();
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();
  const { refresh } = useAuth() || {};

  const onSubmit = async (data: RegisterFormValues) => {
    setApiError('');
    try {
      await api.post('/auth/register', {
        email: data.email,
        password: data.password
      });

      try {
        await login(data.email, data.password);
        if (refresh) await refresh();
        navigate('/setup-profile');
      } catch {
        navigate('/login', {
          state: {
            toastMessage: 'Account created! Please log in.',
            status: 'success'
          } satisfies RegisterRouteState
        });
      }
    } catch (err) {
      const axiosErr = err as AxiosError<RegisterErrorBody>;
      const detail = axiosErr.response?.data?.detail;

      if (detail) {
        setApiError(detail);
      } else {
        setApiError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <AuthCardLayout subtitle="Create an account">
      {apiError && <FormAlert variant="error">{apiError}</FormAlert>}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <RHFTextInput
          id="email"
          label="Your email"
          placeholder="name@company.tld"
          register={reg('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address.',
            },
          })}
          error={errors.email?.message}
          autoComplete="email"
        />

        <RHFTextInput
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          register={reg('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters.' },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
              message: 'Must contain at least 1 uppercase, 1 lowercase, and 1 number.',
            },
          })}
          error={errors.password?.message}
          autoComplete="new-password"
        />

        <RHFTextInput
          id="confirm-password"
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          register={reg('confirmPassword', {
            required: 'Please confirm your password',
            validate: (val) => (getValues('password') === val ? true : 'Your passwords do not match.'),
          })}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
        />

        <PrimaryButton type="submit">Create an account</PrimaryButton>

        <p className="text-textSecondary text-sm text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-textAccent hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </AuthCardLayout>
  );
};

export default Register;
