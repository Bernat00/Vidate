import { LogIn } from 'lucide-react';
import GradientPage from '../components/layout/GradientPage';
import Hero from '../components/landing/Hero';
import FeatureButton from '../components/landing/FeatureButton';
import DeviceMockup from '../components/landing/DeviceMockup';
import Section from '../components/layout/Section';

const LandingPage = () => {
  return (
    <GradientPage className="flex items-center justify-center px-4 py-8">
      <Section className="grid lg:grid-cols-12 lg:gap-8 xl:gap-0 lg:py-16">
        <Hero
          title="Find Your Perfect Match, Live!"
          description="Vidate is the ultimate video dating app. Sign up now and start connecting instantly with matches in a fun and safe environment."
        >
          <FeatureButton to="/register" icon={<LogIn className="w-5 h-5" />}>
            Sign Up
          </FeatureButton>
          <FeatureButton to="/login" variant="secondary">
            Sign In
          </FeatureButton>
        </Hero>

        <DeviceMockup>
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
        </DeviceMockup>
      </Section>
    </GradientPage>
  );
};

export default LandingPage;
