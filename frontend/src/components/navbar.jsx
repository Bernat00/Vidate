import React from "react";

export default function Navbar() {
    return (
        <div className="fixed bottom-0 left-0 w-full h-16 bg-bgPrimary lg:hidden border-t border-borderAccentLight z-20">
            <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium text-textPrimary">
              <button className="flex flex-col items-center gap-1 justify-center px-5 hover:text-textAccent">
                <i className="fa-solid fa-house"></i>
                <span className="text-sm">Home</span>
              </button>
              <button className="flex flex-col items-center gap-1 justify-center px-5 text-textAccent">
                <i className="fa-solid fa-message"></i>
                <span className="text-sm">Messages</span>
              </button>
              <button className="flex flex-col items-center gap-1 justify-center px-5 hover:text-textAccent">
                <i className="fa-solid fa-circle-user"></i>
                <span className="text-sm">Profile</span>
              </button>
            </div>
          </div>
    )
}