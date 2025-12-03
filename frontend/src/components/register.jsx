import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../api';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const password = watch("password");

  //todo TESTS

  const onSubmit = async (data) => {
    setApiError('');
    try {
      await api.post('/auth/register', {
        email: data.email,
        password: data.password
      });

      navigate('/login');
    } catch (err) { //todo fix error handleing sometimes makes frontend crash
      if (err.response && err.response.data && err.response.data.detail) {
        setApiError(err.response.data.detail);
      } else {
        setApiError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="bg-gradient-to-t from-bgAccentPrimary to-bgAccentSecondary flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-bgPrimary border border-borderAccent rounded-2xl shadow-2xl p-8 m-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img className="w-16 h-16 mb-2 rounded-4xl" src="/logo.png" alt="logo" />
          <h1 className="text-2xl font-bold text-textAccent">Vidate</h1>
        </div>

        <h2 className="text-textPrimary text-xl font-semibold text-center mb-6">
          Create an account
        </h2>

        {/* API Error Display */}
        {apiError && (
          <div className="mb-4 p-3 text-sm text-textError bg-bgSecondary border border-textError rounded-lg text-center">
            {apiError}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-textSecondary">
              Your email
            </label>
            <input
              id="email"
              placeholder="name@company.tld"
              className={`w-full p-2.5 rounded-lg bg-bgSecondary border text-textPrimary focus:outline-none focus:ring-2 ${
                errors.email 
                  ? 'border-textError focus:ring-textError' 
                  : 'border-borderAccentLight focus:ring-borderAccent'
              }`}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address."
                }
              })}
            />
            {errors.email && <span className="text-textError text-xs mt-1">{errors.email.message}</span>}
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-textSecondary">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              className={`w-full p-2.5 rounded-lg bg-bgSecondary border text-textPrimary focus:outline-none focus:ring-2 ${
                errors.password 
                  ? 'border-textError focus:ring-textError' 
                  : 'border-borderAccentLight focus:ring-borderAccent'
              }`}
              {...register("password", {
                required: "Password is required",
                minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters."
                },
                pattern: {
                    // Regex: At least one lowercase, one uppercase, and one digit
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                    message: "Must contain at least 1 uppercase, 1 lowercase, and 1 number."
                }
              })}
            />
            {errors.password && <span className="text-textError text-xs mt-1">{errors.password.message}</span>}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-textSecondary">
              Confirm password
            </label>
            <input
              type="password"
              id="confirm-password"
              placeholder="••••••••"
              className={`w-full p-2.5 rounded-lg bg-bgSecondary border text-textPrimary focus:outline-none focus:ring-2 ${
                errors.confirmPassword 
                  ? 'border-textError focus:ring-textError' 
                  : 'border-borderAccentLight focus:ring-borderAccent'
              }`}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (val) => {
                    if (watch('password') !== val) {
                        return "Your passwords do not match.";
                    }
                }
               })}
            />
            {errors.confirmPassword && <span className="text-textError text-xs mt-1">{errors.confirmPassword.message}</span>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-bgAccentSecondary hover:bg-borderAccent text-textPrimary font-semibold rounded-lg py-2.5 transition hover:cursor-pointer"
          >
            Create an account
          </button>

          <p className="text-textSecondary text-sm text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-textAccent hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;