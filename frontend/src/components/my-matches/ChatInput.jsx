const ChatInput = () => {
  return (
      <form className="mt-auto w-full px-4 mb-14 lg:mb-4">
          <label htmlFor="chat" className="sr-only">Your message</label>
          <div className="relative">
                  <textarea
                      id="chat"
                      rows="1"
                      className="block w-full p-2.5 pr-12 text-sm text-textPrimary bg-bgSecondary border border-borderAccentLight rounded-lg shadow-md focus:ring-borderAccent placeholder-textSecondary resize-none"
                      placeholder="Your message..."
                  ></textarea>
              <button
                  type="submit"
                  className="absolute top-1/2 right-2 -translate-y-1/2 p-2 text-textPrimary hover:text-textAccent hover:bg-borderAccent rounded-full shadow transition"
              >
                  <i className="fa-solid fa-paper-plane"></i>
              </button>
          </div>
      </form>
  );
};

export default ChatInput;