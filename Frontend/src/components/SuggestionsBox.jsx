import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initials } from '../utils/initials';
import { useToast } from '../context/ToastContext';

function authHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }
}

export function SuggestionsBox() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  async function loadDiscover() {
    setLoading(true);
    try {
      const response = await fetch("https://fast-connect-bay.vercel.app/friends/discover", { headers: authHeaders() })
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.slice(0, 3)); // Only show top 3 to keep it from being messy
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false);
  }

  useEffect(() => {
    loadDiscover();
  }, []);

  async function handleFollow(userId) {
    const response = await fetch(`https://fast-connect-bay.vercel.app/friends/requests/${userId}`, {
      method: "POST",
      headers: authHeaders(),
    });
    const data = await response.json();

    if (response.ok) {
      addToast(data.status === "accepted" ? "Now following!" : "Follow request sent!", "success");
      // Remove the person from suggestions
      setSuggestions(prev => prev.filter(p => p.id !== userId));
    } else {
      addToast("Could not send request.", "error");
    }
  }

  return (
    <div className="p-5 rounded-xl mt-4" style={{ backgroundColor: "var(--color-bg, #1a1a2e)", border: "1px solid var(--color-border, #333)" }}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-bold text-gray-400">Suggestions for you</h2>
        <Link to="/suggestions" className="text-xs font-semibold hover:opacity-70" style={{ color: "var(--color-primary)" }}>See All</Link>
      </div>
      
      <div className="flex flex-col gap-4">
        {loading ? (
          <p className="text-xs text-gray-500">Loading suggestions...</p>
        ) : suggestions.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No new suggestions at the moment.</p>
        ) : (
          suggestions.map(person => (
            <div key={person.id} className="flex items-center justify-between">
              <Link to={`/profile/${person.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                  style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
                >
                  {initials(person.name)}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{person.name}</span>
                  <span className="text-xs text-gray-500">Suggested for you</span>
                </div>
              </Link>
              <button 
                onClick={() => handleFollow(person.id)}
                className="text-xs font-bold transition-opacity hover:opacity-70" 
                style={{ color: "var(--color-accent, #38bdf8)" }}
              >
                Follow
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
