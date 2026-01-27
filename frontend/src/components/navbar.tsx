import { Video, MessageSquare, User } from 'lucide-react';
import NavButton from './common/NavButton';

export default function Navbar() {
    return (
        <div className="fixed bottom-0 left-0 w-full h-16 bg-bgPrimary border-t border-borderAccentLight">
            <div
                className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium"
            >
                <NavButton to="/my-matches" icon={MessageSquare} label="My Matches" />
                <NavButton to="/home" icon={Video} label="Home" />
                <NavButton to="/profile" icon={User} label="Me" />
            </div>
        </div>
    )
}
