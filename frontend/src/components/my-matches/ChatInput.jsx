const ChatInput = () => {
  return (
    <form className="mt-auto w-full px-4 mb-14 lg:mb-4" onSubmit={(e) => e.preventDefault()}>
      <div className="relative">
        <textarea
          rows="1"
          className="block w-full p-2.5 pr-12 text-sm text-textPrimary bg-bgSecondary border border-borderAccentLight rounded-lg shadow-md focus:ring-borderAccent placeholder-textSecondary resize-none focus:outline-none focus:ring-1"
          placeholder="Your message..."
        />
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