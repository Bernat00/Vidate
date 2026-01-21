const ChatInput = () => {
  return (
      <form className="mt-auto w-full px-4 mb-16 lg:mb-4">
          <label htmlFor="chat" className="sr-only">Your message</label>
          <div className="relative">
                  <textarea
                      id="chat"
                      rows={1}
                      className="block w-full p-2.5 pr-12 text-sm text-textPrimary bg-bgSecondary border border-borderAccentLight rounded-lg shadow-md focus:ring-borderAccent placeholder-textSecondary resize-none"
                      placeholder="Your message..."
                  ></textarea>
              <button
                  type="submit"
                  className="absolute top-1/2 right-2 -translate-y-1/2 p-2 text-textPrimary hover:text-textAccent hover:bg-borderAccent rounded-full shadow transition"
              >
                  {/* replace font-awesome plane with inline SVG */}
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9-7-9-7-9 7 9 7z" />
                  </svg>
              </button>
          </div>
      </form>
  );
};

export default ChatInput;

