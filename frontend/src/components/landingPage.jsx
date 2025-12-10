import React from 'react';
import { Link } from 'react-router-dom';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRightToBracket} from "@fortawesome/free-solid-svg-icons";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-t from-bgAccentPrimary to-bgAccentSecondary">
      <div className="grid max-w-screen-xl lg:grid-cols-12 lg:gap-8 xl:gap-0 lg:py-16">
        {/* Hero Text */}
        <div className="mr-auto place-self-center lg:col-span-7">
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight text-textPrimary mb-4">
            Find Your Perfect Match, Live!
          </h1>
          <p className="text-textSecondary md:text-lg lg:text-xl mb-6">
            Vidate is the ultimate video dating app. Sign up now and start
            connecting instantly with matches in a fun and safe environment.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center px-5 py-3 text-base font-medium text-center text-textPrimary rounded-lg bg-bgAccentSecondary hover:bg-borderAccent focus:ring-4 focus:ring-borderAccentLight"
            >
              Sign Up <FontAwesomeIcon icon={faArrowRightToBracket} />
           </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-5 py-3 text-base font-medium text-textSecondary border border-borderAccentLight rounded-lg hover:bg-bgAccentPrimary focus:ring-4 focus:ring-borderAccentLight"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Right-side phone preview */}
        <div className="hidden lg:flex lg:col-span-5 lg:mt-0 justify-center items-center">
          <div className="relative w-64 h-96 bg-gradient-to-b from-bgAccentPrimary to-bgAccentSecondary rounded-3xl shadow-2xl flex flex-col items-center justify-center p-4 border border-borderAccentLight">
            {/* Top Profile */}
              <div className="flex flex-col items-center mb-4">
                  <img
                      src="/landing_page_profile2.png"
                      alt="Clara"
                      className="w-20 h-20 rounded-full object-cover"
                  />
                  <span className="text-textPrimary mt-2 font-medium">Clara, 24</span>
              </div>

              {/* Video Call Bubble */}
              <div
                  className="w-full h-40 bg-bgPrimary rounded-2xl border-2 border-borderAccent flex items-center justify-center text-textSecondary font-semibold">
                  Video Call
              </div>

              {/* Bottom Profile */}
              <div className="flex flex-col items-center mt-4">
                  <img
                      src="/landing_page_profile1.jpg"
                      alt="Ethan"
                      className="w-20 h-20 rounded-full object-cover"
                  />
                  <span className="text-textPrimary mt-2 font-medium">Ethan, 26</span>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;