import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Hide entirely in full screen TV Dashboard (managed via CSS class on body later or simple check here)
  const isTV = location.pathname === '/tv';
  
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 transition-opacity duration-300 nav-container`}>
      {/* Menu Options */}
      <div 
        className={`flex flex-col gap-3 transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-50 opacity-0 pointer-events-none'
        }`}
      >
        <Link to="/" onClick={() => setIsOpen(false)} className="bg-white text-blue-600 px-4 py-2 rounded-full font-bold shadow-lg border hover:bg-blue-50 flex items-center gap-2">
          <span>📱</span> Student Vote
        </Link>
        <Link to="/chef" onClick={() => setIsOpen(false)} className="bg-white text-orange-600 px-4 py-2 rounded-full font-bold shadow-lg border hover:bg-orange-50 flex items-center gap-2">
          <span>👨‍🍳</span> Chef Panel
        </Link>
        <Link to="/tv" onClick={() => setIsOpen(false)} className="bg-white text-indigo-600 px-4 py-2 rounded-full font-bold shadow-lg border hover:bg-indigo-50 flex items-center gap-2">
          <span>📺</span> Live TV
        </Link>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-900 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all outline-none"
      >
        <span className="text-2xl">{isOpen ? '✖' : '🧭'}</span>
      </button>
    </div>
  );
}
