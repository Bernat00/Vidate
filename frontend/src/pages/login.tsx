import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { login } from '../helpers.ts';
import { useToast } from '../context/toastContext.tsx';
import { useAuth } from '../context/authContext.tsx';
import type { ToastStatus } from '../types/domain.ts';
import type { AxiosError } from 'axios';
import AuthCardLayout from '../components/auth/AuthCardLayout';
import FormAlert from '../components/form/FormAlert';
import PrimaryButton from '../components/form/PrimaryButton';
import RHFTextInput from '../components/form/RHFTextInput';
import RHFCheckbox from '../components/form/RHFCheckbox';

type LoginFormValues = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

type LoginLocationState = {
  toastMessage?: string;
  status?: ToastStatus;
};

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>();
  const [apiError, setApiError] = useState('');

  const navigate = useNavigate();
  const location = useLocation() as Location & { state?: LoginLocationState };
  const { showToast } = useToast();
  const { refresh } = useAuth() || {};

  useEffect(() => {
    if (location.state?.toastMessage) {
      const { toastMessage, status } = location.state;
      showToast(toastMessage, status);
      navigate(location.pathname, { replace: true, state: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: LoginFormValues) => {
    setApiError('');

    try {
      await login(data.email, data.password, Boolean(data.rememberMe));
      if (refresh) await refresh();
      navigate('/my-matches');
    } catch (err) {
      const axiosErr = err as AxiosError<unknown>;
      if (axiosErr.response?.status === 401) {
        setApiError('Email or password is incorrect.');
      } else {
        setApiError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <AuthCardLayout subtitle="Sign in to your account">
      {apiError && <FormAlert variant="error">{apiError}</FormAlert>}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <RHFTextInput
          id="email"
          label="Your email"
          placeholder="name@company.com"
          register={register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
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
          register={register('password', { required: 'Password is required' })}
          error={errors.password?.message}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <RHFCheckbox label="Remember me" registerProps={register('rememberMe')} />
          <Link to="/forgot-password" className="text-textAccent hover:underline text-sm">
            Forgot password?
          </Link>
        </div>

        <PrimaryButton type="submit">Sign in</PrimaryButton>

        <p className="text-textSecondary text-sm text-center">
          Don’t have an account?{' '}
          <Link to="/register" className="text-textAccent hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </AuthCardLayout>
  );
};

export default Login;
