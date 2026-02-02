import type { ReactNode } from 'react';
import { useState } from 'react';
import Sidebar from '../sidebar';
import SidebarOverlay from './SidebarOverlay';
import MobileTopBar from './MobileTopBar';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  selectedUserId?: string | null;
  onSelectUserId?: (userId: string | null) => void;
}

export default function DashboardLayout({
  children,
  title = 'Vidate',
  selectedUserId,
  onSelectUserId,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-1 relative min-h-0">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        selectedUserId={selectedUserId}
        onSelectUserId={onSelectUserId}
      />

      <SidebarOverlay open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 w-full lg:ml-56 flex flex-col">
        <MobileTopBar
            title={title}
            left={
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="hover:text-borderAccent p-1 rounded-lg"
                aria-label="Open sidebar"
              >
                <Menu />
              </button>
            }
          />

        <main className="flex-1 flex flex-col overflow-hidden ">
          {children}
        </main>

      </div>
    </div>
  );
}
