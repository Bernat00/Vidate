import { Video, MessageSquare, User } from 'lucide-react';

export default function Navbar() {
    return (
        <div className="fixed bottom-0 left-0 w-full h-16 bg-bgPrimary">
            <div
                className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium text-textPrimary"
            >
                <button
                    type="button"
                    className="inline-flex flex-col items-center gap-1 justify-center px-5 hover:bg-bgAccentSecondary hover:text-bgPrimary"
                >
                    <Video />
                    Home
                </button>
                <button
                    type="button"
                    className="inline-flex flex-col items-center gap-1 justify-center px-5 hover:bg-bgAccentSecondary hover:text-bgPrimary"
                >
                    <MessageSquare />
                    <span className="text-sm">My Matches</span>
                </button>
                <button
                    type="button"
                    className="inline-flex flex-col items-center gap-1 justify-center px-5 hover:bg-bgAccentSecondary hover:text-bgPrimary"
                >
                    <User />
                    <span className="text-sm">Profile</span>
                </button>
            </div>
        </div>

    )
}
