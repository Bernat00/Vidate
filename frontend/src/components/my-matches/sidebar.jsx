import React, {useEffect, useState} from "react";
import api from "../../api.js";
import {faXmark} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const Sidebar = ({ isOpen, onClose }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get('/matches');
        // Assuming response.data is the array of matches
        setMatches(response.data);
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <aside
      className={`fixed top-0 left-0 z-40 w-56 h-screen transition-transform bg-bgPrimary shadow-2xl border-r border-borderAccentLight ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      <div className="flex items-center justify-center h-16 border-b border-borderAccentLight relative">
        <span className="text-lg font-bold text-textAccent lg:me-0 me-10">My Matches</span>
        <button
          onClick={onClose}
          className="lg:hidden absolute right-4 hover:text-borderAccent text-textPrimary"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

      <ul className="space-y-3 mx-2 mt-4 font-medium text-textPrimary overflow-y-auto max-h-[calc(100vh-5rem)]">
        {loading ? (
           <li className="p-4 text-center text-textSecondary text-sm">Loading matches...</li>
        ) : matches.length === 0 ? (
           <li className="p-4 text-center text-textSecondary text-sm">No matches yet.</li>
        ) : (
          matches.map((match) => (
            <li key={match.id || match._id}>
              <a href="#" className="flex items-center p-2 rounded-lg hover:bg-bgSecondary transition">
                <img
                  // Adjust property names based on your actual API response
                  src={match.profilePicture || match.avatar || 'https://via.placeholder.com/32'}
                  className="w-8 h-8 rounded-full mr-3 object-cover"
                  alt={match.name}
                />
                <span>{match.name || match.username}</span>
              </a>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;