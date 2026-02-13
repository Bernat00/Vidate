import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { login } from '../helpers.ts';
import AuthCardLayout from '../components/auth/AuthCardLayout';
import FormAlert from '../components/form/FormAlert';
import PrimaryButton from '../components/form/PrimaryButton';
import RHFTextInput from '../components/form/RHFTextInput';
import RHFCheckbox from '../components/form/RHFCheckbox';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { useFlashToast } from '../hooks/useFlashToast';
import { useApiError } from '../hooks/useApiError';

type LoginFormValues = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>();
  const [apiError, setApiError] = useState('');

  const { handleAuthSuccess } = useAuthRedirect();
  const { getErrorMessage } = useApiError();
  useFlashToast();

  const onSubmit = async (data: LoginFormValues) => {
    setApiError('');

    try {
      await login(data.email, data.password, Boolean(data.rememberMe));
      await handleAuthSuccess('/my-matches');
    } catch (err) {
      setApiError(getErrorMessage(err));
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
          {/*<Link to="/forgot-password" className="text-textAccent hover:underline text-sm">*/}
          {/*  Forgot password?*/}
          {/*</Link>*/}
        </div>

        <PrimaryButton type="submit">Sign in</PrimaryButton>

        <div className="mt-6 space-y-2 text-center text-sm">
  <p className="text-textSecondary">
    Don’t have an account?{' '}
    <Link to="/register" className="text-textAccent hover:underline font-medium">
      Sign up
    </Link>
  </p>

  <p>
    <Link to="/forgot-password" className="text-textAccent hover:underline font-medium">
      Forgot your password?
    </Link>
  </p>
</div>
      </form>
    </AuthCardLayout>
  );
};

export default Login;
