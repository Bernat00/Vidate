import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { AxiosError } from 'axios';
import api from '../../api';
import { login } from '../../helpers';
import { useAuth } from '../../context/authContext';
import type { ToastStatus } from '../../types/domain';

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
    <div className="bg-gradient-to-t from-bgAccentPrimary to-bgAccentSecondary flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-bgPrimary border border-borderAccent rounded-2xl shadow-2xl p-8 m-4">
        <div className="flex flex-col items-center mb-6">
          <img className="w-16 h-16 mb-2 rounded-4xl" src="/logo.png" alt="logo" />
          <h1 className="text-2xl font-bold text-textAccent">Vidate</h1>
        </div>

        <h2 className="text-textPrimary text-xl font-semibold text-center mb-6">Create an account</h2>

        {apiError && (
          <div className="mb-4 p-3 text-sm text-textError bg-bgSecondary border border-textError rounded-lg text-center">{apiError}</div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-textSecondary">Your email</label>
            <input id="email" placeholder="name@company.tld" className={`w-full p-2.5 rounded-lg bg-bgSecondary border text-textPrimary focus:outline-none focus:ring-2 ${errors.email ? 'border-textError focus:ring-textError' : 'border-borderAccentLight focus:ring-borderAccent'}`} {...reg('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address.' } })} />
            {errors.email && <span className="text-textError text-xs mt-1">{errors.email.message}</span>}
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-textSecondary">Password</label>
            <input type="password" id="password" placeholder="••••••••" className={`w-full p-2.5 rounded-lg bg-bgSecondary border text-textPrimary focus:outline-none focus:ring-2 ${errors.password ? 'border-textError focus:ring-textError' : 'border-borderAccentLight focus:ring-borderAccent'}`} {...reg('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters.' }, pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, message: 'Must contain at least 1 uppercase, 1 lowercase, and 1 number.' } })} />
            {errors.password && <span className="text-textError text-xs mt-1">{errors.password.message}</span>}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-textSecondary">Confirm password</label>
            <input type="password" id="confirm-password" placeholder="••••••••" className={`w-full p-2.5 rounded-lg bg-bgSecondary border text-textPrimary focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-textError focus:ring-textError' : 'border-borderAccentLight focus:ring-borderAccent'}`} {...reg('confirmPassword', {
              required: 'Please confirm your password',
              validate: (val) => (getValues('password') === val ? true : 'Your passwords do not match.')
            })} />
            {errors.confirmPassword && <span className="text-textError text-xs mt-1">{errors.confirmPassword.message}</span>}
          </div>

          <button type="submit" className="w-full bg-bgAccentSecondary hover:bg-borderAccent text-textPrimary font-semibold rounded-lg py-2.5 transition hover:cursor-pointer">Create an account</button>

          <p className="text-textSecondary text-sm text-center">Already have an account? <Link to="/login" className="text-textAccent hover:underline">Login here</Link></p>
        </form>
      </div>
    </div>
  );
};

export default Register;
