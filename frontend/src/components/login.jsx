import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {login} from "../heplers.js";


const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data) => {    //WTF is this???? egy async function miert igy deklaraltal?? percekig tarott rajonnom h mi folyik itt
    setApiError('');

    const { rememberMe, ...loginPayload } = data;

    try {
      await login(data.email, data.password, rememberMe);

      navigate('/my-matches');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setApiError('Email or password is incorrect.');
      } else {
        setApiError('Something went wrong. Please try again.');
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
          Sign in to your account
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
              placeholder="name@company.com"
              className={`w-full p-2.5 rounded-lg bg-bgSecondary border text-textPrimary focus:outline-none focus:ring-2 ${
                errors.email 
                  ? 'border-textError focus:ring-textError' 
                  : 'border-borderAccentLight focus:ring-borderAccent'
              }`}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
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
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <span className="text-textError text-xs mt-1">{errors.password.message}</span>}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-textSecondary">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-borderAccentLight bg-bgSecondary focus:ring-borderAccent"
                {...register("rememberMe")}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-textAccent hover:underline text-sm">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-bgAccentSecondary hover:bg-borderAccent text-textPrimary font-semibold rounded-lg py-2.5 transition hover:cursor-pointer"
          >
            Sign in
          </button>

          <p className="text-textSecondary text-sm text-center">
            Don’t have an account?{' '}
            <Link to="/register" className="text-textAccent hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;