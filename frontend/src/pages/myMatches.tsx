import type { ReactElement } from 'react';
import { useState } from 'react';
import Sidebar from "../components/sidebar.tsx";
import MessageBubble from "../components/messageBubble.tsx";
import ChatInput from "../components/ChatInput.tsx";
import Navbar from "../components/navbar.tsx";
import { Menu } from 'lucide-react';
import GradientPage from '../components/layout/GradientPage';
import MobileTopBar from '../components/layout/MobileTopBar';
import SidebarOverlay from '../components/layout/SidebarOverlay';
import ChatColumn from '../components/layout/ChatColumn';

const DUMMY_MESSAGES = [
    {
      id: 1,
      sender: 'Bonnie Green',
      avatar: 'https://i.pravatar.cc/150?u=1',
      text: 'Hello, how are you doing?',
      time: '11:46',
      isMe: false,
    },
    {
      id: 2,
      sender: 'You',
      avatar: 'https://i.pravatar.cc/150?u=99',
      text: "I'm doing great, thanks for asking! 😊",
      time: '11:48',
      isMe: true,
    },
  ];


export default function MyMatches(): ReactElement {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <GradientPage>
      <div className="flex min-h-screen relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <SidebarOverlay open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="flex-1 w-full lg:ml-56">
          <MobileTopBar
            title="Vidate"
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

          <ChatColumn>
            <div className="flex flex-col gap-6 justify-start items-start">
              {DUMMY_MESSAGES.map((msg) => (
                <li key={msg.id}>
                  <MessageBubble message={msg} />
                </li>
              ))}
            </div>

            <ChatInput />
          </ChatColumn>

          <Navbar/>
        </div>
      </div>
    </GradientPage>
  );
}
