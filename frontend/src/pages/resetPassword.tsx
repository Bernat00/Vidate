import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { resetPassword } from '../helpers.ts';
import AuthCardLayout from '../components/auth/AuthCardLayout';
import FormAlert from '../components/form/FormAlert';
import PrimaryButton from '../components/form/PrimaryButton';
import RHFTextInput from '../components/form/RHFTextInput';
import { useApiError } from '../hooks/useApiError';

// 1. Define the form shape to fix TS2322
type ResetPasswordValues = {
  password: string;
  confirmPassword: string;
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { getErrorMessage } = useApiError();

  const [apiError, setApiError] = useState('');

  // 2. Pass the type to useForm
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordValues>();

  const password = watch("password");

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) {
      setApiError("Reset token is missing. Please check your email link.");
      return;
    }

    try {
      await resetPassword(token, data.password);
      navigate('/login', { state: { flash: "Password updated! You can now sign in." } });
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  if (!token) {
    return (
      <AuthCardLayout subtitle="Invalid Link">
        <FormAlert variant="error">This link appears to be invalid or broken.</FormAlert>
        <Link to="/login" className="text-textAccent block text-center mt-4 hover:underline">
          Back to Login
        </Link>
      </AuthCardLayout>
    );
  }

  return (
    <AuthCardLayout subtitle="Set your new password">
      {apiError && <FormAlert variant="error">{apiError}</FormAlert>}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <RHFTextInput
          id="password"
          label="New Password"
          type="password"
          placeholder="••••••••"
          register={register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters.' },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
              message: 'Must contain at least 1 uppercase, 1 lowercase, and 1 number.',
            }})}
          // 3. Ensure we pass a string, not a FieldError object
          error={errors.password?.message}
          autoComplete="new-password"
        />

        <RHFTextInput
          id="confirmPassword"
          label="Repeat Password"
          type="password"
          placeholder="••••••••"
          register={register('confirmPassword', {
            required: 'Please confirm your password',
            validate: value => value === password || "Passwords do not match"
          })}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
        />

        <PrimaryButton
          type="submit"
          disabled={isSubmitting}
          className={isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
        >
          {isSubmitting ? 'Updating...' : 'Reset Password'}
        </PrimaryButton>
      </form>
    </AuthCardLayout>
  );
};

export default ResetPassword;