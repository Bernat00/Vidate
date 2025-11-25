import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="bg-gradient-to-t from-bgAccentPrimary to-bgAccentSecondary flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-bgPrimary border border-borderAccent rounded-2xl shadow-2xl p-8 m-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img className="w-16 h-16 mb-2 rounded-4xl" src="/logo.png" alt="logo" />
          <h1 className="text-2xl font-bold text-textAccent">Vidate</h1>
        </div>

        {/* Title */}
        <h2 className="text-textPrimary text-xl font-semibold text-center mb-6">
          Create an account
        </h2>

        {/* Form */}
        <form className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-textSecondary"
            >
              Your email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="name@company.com"
              className="w-full p-2.5 rounded-lg bg-bgSecondary border border-borderAccentLight text-textPrimary focus:outline-none focus:ring-2 focus:ring-borderAccent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-textSecondary"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              className="w-full p-2.5 rounded-lg bg-bgSecondary border border-borderAccentLight text-textPrimary focus:outline-none focus:ring-2 focus:ring-borderAccent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block mb-2 text-sm font-medium text-textSecondary"
            >
              Confirm password
            </label>
            <input
              type="password"
              name="confirm-password"
              id="confirm-password"
              placeholder="••••••••"
              className="w-full p-2.5 rounded-lg bg-bgSecondary border border-borderAccentLight text-textPrimary focus:outline-none focus:ring-2 focus:ring-borderAccent"
              required
            />
          </div>

          {/*<div className="flex items-start">*/}
          {/*  <div className="flex items-center h-5">*/}
          {/*    <input*/}
          {/*      id="terms"*/}
          {/*      aria-describedby="terms"*/}
          {/*      type="checkbox"*/}
          {/*      className="w-4 h-4 rounded border-borderAccentLight bg-bgSecondary focus:ring-borderAccent"*/}
          {/*      required*/}
          {/*    />*/}
          {/*  </div>*/}
          {/*  <div className="ml-3 text-sm">*/}
          {/*    <label htmlFor="terms" className="font-light text-textSecondary">*/}
          {/*      I accept the{' '}*/}
          {/*      <a className="font-medium text-textAccent hover:underline" href="#">*/}
          {/*        Terms and Conditions*/}
          {/*      </a>*/}
          {/*    </label>*/}
          {/*  </div>*/}
          {/*</div>*/}

          <button
            type="submit"
            className="w-full bg-bgAccentSecondary hover:bg-borderAccent text-textPrimary font-semibold rounded-lg py-2.5 transition"
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