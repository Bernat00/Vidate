import { Outlet } from 'react-router-dom';
import Navbar from '../navbar';

export default function ProtectedLayout() {
  return (
    <div className="min-h-screen bg-bgPrimary pb-16">
      <Outlet />
      <Navbar />
    </div>
  );
}
