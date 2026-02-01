import { Outlet } from 'react-router-dom';
import Navbar from '../navbar';
import GradientPage from './GradientPage';

export default function ProtectedLayout() {
  return (
    <GradientPage>
      <div className="min-h-screen pb-16 flex flex-col">
        <Outlet />
        <Navbar />
      </div>
    </GradientPage>
  );
}
