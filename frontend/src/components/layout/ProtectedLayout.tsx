import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../navbar';
import GradientPage from './GradientPage';
import { useEffect, useState } from 'react';

export default function ProtectedLayout() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const location = useLocation();

  // Pages that are full-screen apps and handle their own scrolling
  const isAppPage = location.pathname === '/home' || location.pathname.startsWith('/my-matches');
  const isScrollable = !isAppPage;

  useEffect(() => {
    const handleFocus = () => {
      if (window.innerWidth < 768) setIsKeyboardOpen(true);
    };
    const handleBlur = () => setTimeout(() => setIsKeyboardOpen(false), 100);

    window.addEventListener('chat-input-focus', handleFocus);
    window.addEventListener('chat-input-blur', handleBlur);

    return () => {
      window.removeEventListener('chat-input-focus', handleFocus);
      window.removeEventListener('chat-input-blur', handleBlur);
    };
  }, []);

  return (
    <GradientPage isScrollable={isScrollable}>
      <div className={`flex-1 ${isScrollable ? 'min-h-0' : 'h-full'} flex flex-col ${isKeyboardOpen ? '' : 'pb-16'}`}>
        <div className={`flex-1 flex flex-col min-h-0 min-w-0 ${isScrollable ? 'overflow-y-auto' : ''}`}>
          <Outlet context={{ isKeyboardOpen }} />
        </div>
        {!isKeyboardOpen && <Navbar />}
      </div>
    </GradientPage>
  );
}
