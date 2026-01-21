import type { ReactElement } from 'react';
import { useState } from 'react';
import Sidebar from "../components/sidebar.tsx";
import MessageBubble from "../components/messageBubble.tsx";
import ChatInput from "../components/ChatInput.tsx";
import Navbar from "../components/navbar.tsx";
import { Menu } from 'lucide-react';

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
    <div className="bg-gradient-to-t from-bgAccentPrimary to-bgAccentSecondary min-h-screen">
      <div className="flex min-h-screen relative">

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="flex-1 w-full lg:ml-56">

          <header className="flex items-center justify-between p-2 text-textPrimary bg-bgPrimary border-b border-borderAccentLight lg:hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="hover:text-borderAccent p-1 rounded-lg"
            >
            <Menu />
            </button>
            <span className="font-bold text-textAccent">Vidate</span>
            <div className="w-6" />
          </header>

          <main className="flex justify-center items-center min-h-[calc(100vh-4rem)] mx-2">
            <div className="w-full lg:w-1/2">
              <div className="flex flex-col min-h-[calc(100vh-4rem)] mx-2 pt-4">

                <div className="flex flex-col gap-6 justify-start items-start">
                  {DUMMY_MESSAGES.map((msg) => (
                    <li key={msg.id}>
                      <MessageBubble message={msg} />
                    </li>
                  ))}
                </div>

                <ChatInput />

              </div>
            </div>
          </main>

          <Navbar/>

        </div>
      </div>
    </div>
  );
}
