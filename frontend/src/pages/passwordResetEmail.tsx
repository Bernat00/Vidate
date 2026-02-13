import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { sendPasswordResetEmail } from '../helpers.ts'; // Assuming this helper exists
import AuthCardLayout from '../components/auth/AuthCardLayout';
import FormAlert from '../components/form/FormAlert';
import PrimaryButton from '../components/form/PrimaryButton';
import RHFTextInput from '../components/form/RHFTextInput';
import { useApiError } from '../hooks/useApiError';

type ForgotPasswordFormValues = {
  email: string;
};

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormValues>();
  const [apiError, setApiError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { getErrorMessage } = useApiError();

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setApiError('');
    setIsSuccess(false);

    try {
      await sendPasswordResetEmail(data.email);
      setIsSuccess(true);
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  return (
    <AuthCardLayout
      subtitle={isSuccess ? "Check your inbox" : "Enter your email to reset your password"}
    >
      {/* Show Error Alert */}
      {apiError && <FormAlert variant="error">{apiError}</FormAlert>}

      {/* Show Success State */}
      {isSuccess ? (
        <div className="space-y-6 text-center">
          <p className="text-textSecondary">
            We've sent a password reset link to your email address. Please follow the instructions in the email to continue.
          </p>
          <Link to="/login">
            <PrimaryButton className="w-full">Back to login</PrimaryButton>
          </Link>
        </div>
      ) : (
        /* Show Request Form */
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

  <PrimaryButton
    type="submit"
    disabled={isSubmitting}
    className={isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
  >
    {isSubmitting ? 'Sending...' : 'Send reset link'}
  </PrimaryButton>

  <p className="text-textSecondary text-sm text-center">
    Remembered your password?{' '}
    <Link to="/login" className="text-textAccent hover:underline">
      Back to login
    </Link>
  </p>
</form>
      )}
    </AuthCardLayout>
  );
};

export default ForgotPassword;