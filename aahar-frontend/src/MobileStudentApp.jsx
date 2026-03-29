import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Get or create unique device ID for voting restriction
const getDeviceId = () => {
  let id = localStorage.getItem('deviceId');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    localStorage.setItem('deviceId', id);
  }
  return id;
};

// Hypothetical Data for Chefs
const getChefStats = (index) => {
  const stats = [
    { age: 45, award: '🏆 3x Golden Spoon Winner' },
    { age: 38, award: '🥇 Master of Spices 2024' },
    { age: 42, award: '🌟 Quality Star Award' },
    { age: 50, award: '👨‍🍳 Lifetime Kitchen Award' },
  ];
  return stats[index % stats.length];
};

export default function MobileStudentApp() {
  const [menuData, setMenuData] = useState(null);
  const [chefs, setChefs] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const deviceId = getDeviceId();
  const mealOrder = ["Breakfast", "Lunch", "Snacks", "Dinner"];

  useEffect(() => {
    const fetchInitialData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const demoQuery = urlParams.get('demo') ? `?demo=${urlParams.get('demo')}` : '';
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://aahar-1.onrender.com';

      try {
        // Fetch Today's Full Menu
        const menuRes = await axios.get(`${API_URL}/api/menu/today${demoQuery}`);
        setMenuData(menuRes.data);
        const active = menuRes.data.activeMeal;
        setSelectedMeal(active !== "Closed" ? active : "Breakfast");
        
        // Fetch Chefs Leaderboard
        const chefRes = await axios.get(`${API_URL}/api/chefs/leaderboard`);
        setChefs(chefRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Check Vote Status whenever selected meal changes
  useEffect(() => {
    if (!selectedMeal) return;
    const checkVote = async () => {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://aahar-1.onrender.com';
      try {
        const voteRes = await axios.get(`${API_URL}/api/vote-status/${selectedMeal}/${deviceId}`);
        setHasVoted(voteRes.data.hasVoted);
      } catch (e) {
        console.error("Error checking vote status", e);
      }
    };
    checkVote();
  }, [selectedMeal, deviceId]);

  const handleLike = async (dishId) => {
    if (hasVoted) return;
    
    // Optimistic UI update inside menuData
    setMenuData(prev => {
      const updatedMenus = { ...prev.menus };
      updatedMenus[selectedMeal] = updatedMenus[selectedMeal].map(dish => 
        dish._id === dishId ? { ...dish, likes: dish.likes + 1 } : dish
      );
      return { ...prev, menus: updatedMenus };
    });
    setHasVoted(true);
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const demoQuery = urlParams.get('demo') ? `?demo=${urlParams.get('demo')}` : '';
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://aahar-1.onrender.com';
      await axios.post(`${API_URL}/api/like/${dishId}${demoQuery}`, { deviceId });
    } catch (e) {
      alert(e.response?.data?.error || "Error recording vote");
      // Fallback: reload data to revert optimistic update
      const menuRes = await axios.get(`${API_URL}/api/menu/today${demoQuery}`);
      setMenuData(menuRes.data);
    }
  };

  if (loading || !menuData) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center font-sans">
        <h1 className="text-2xl text-blue-600 font-bold animate-pulse">Loading Aahar...</h1>
      </div>
    );
  }

  const selectedDishes = menuData.menus[selectedMeal] || [];
  const sortedDishes = [...selectedDishes].sort((a,b) => b.likes - a.likes);
  const isActiveMeal = menuData.activeMeal === selectedMeal;

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-24 text-slate-800">
      
      {/* 1. Header & Chef Leaderboard */}
      <div className="bg-gradient-to-br from-indigo-800 to-blue-900 text-white rounded-b-[40px] px-6 pt-10 pb-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight mb-1">Aahar Top Chefs</h1>
          <p className="text-indigo-200 text-sm font-medium mb-6">Overall Campus Rating Board</p>
          
          {/* Leaderboard Cards via Horizontal Snap Scroll */}
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {chefs.map((chef, idx) => {
              const stats = getChefStats(idx);
              return (
                <div key={chef._id} className="snap-center shrink-0 w-64 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex flex-col relative shadow-xl">
                  {idx === 0 && (
                    <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                      #1 Ranked
                    </div>
                  )}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-4xl bg-white/20 p-2 rounded-2xl shadow-inner">{chef.avatar}</div>
                    <div>
                      <h2 className="text-lg font-bold leading-tight">{chef.name}</h2>
                      <p className="text-xs text-indigo-200 font-semibold">{chef.specialty}</p>
                    </div>
                  </div>
                  
                  <div className="bg-black/20 rounded-xl p-3 mb-3">
                    <p className="text-[11px] text-white/80 font-medium mb-1 flex justify-between">
                      <span>Age:</span> <span className="text-white font-bold">{stats.age} yrs</span>
                    </p>
                    <p className="text-[11px] text-white/80 font-medium flex justify-between">
                      <span>Accolade:</span> <span className="text-white font-bold max-w-[120px] text-right truncate">{stats.award}</span>
                    </p>
                  </div>
                  
                  <div className="mt-auto flex justify-between items-center text-sm font-black">
                    <span className="text-yellow-400 drop-shadow-md">Total Rating</span>
                    <span className="flex items-center gap-1 bg-white text-indigo-900 px-3 py-1 rounded-full shadow">
                      ❤️ {chef.totalLikes}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Menu Navigator Dropdown */}
      <div className="max-w-md mx-auto px-6 mt-8 relative z-20">
        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
          Select Menu
        </label>
        <div className="relative">
          <select 
            value={selectedMeal} 
            onChange={(e) => setSelectedMeal(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-200 text-slate-800 font-black text-xl px-5 py-4 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            {mealOrder.map(meal => (
              <option key={meal} value={meal}>
                {meal} {menuData.activeMeal === meal ? ' (Live Now)' : ''}
              </option>
            ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xl">
            ▾
          </div>
        </div>
      </div>

      {/* 3. Status Bar */}
      <div className="max-w-md mx-auto px-6 mt-6">
        {isActiveMeal ? (
          hasVoted ? (
            <div className="bg-green-100 border-2 border-green-200 text-green-800 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-sm">
              <span className="text-xl">✅</span> You have already voted for {selectedMeal}!
            </div>
          ) : (
            <div className="bg-blue-50 border-2 border-blue-200 text-blue-800 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-sm">
              <span className="text-xl animate-pulse">🛎️</span> Voting is OPEN! Pick your favorite.
            </div>
          )
        ) : (
          <div className="bg-slate-200/60 border-2 border-slate-200 text-slate-500 p-4 rounded-2xl text-sm font-bold flex items-start gap-3 shadow-sm">
            <span className="text-xl opacity-50 mt-0.5">⏳</span> 
            <p>Voting is closed for {selectedMeal}.<br/><span className="font-medium text-xs">Currently active: {menuData.activeMeal}</span></p>
          </div>
        )}
      </div>

      {/* 4. Dish List */}
      <div className="max-w-md mx-auto px-6 mt-6 space-y-4">
        {sortedDishes.length === 0 ? (
          <p className="text-center text-slate-400 font-medium py-10">No items available for this meal.</p>
        ) : (
          sortedDishes.map((dish) => (
            <div key={dish._id} className="bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex justify-between items-center transition-transform hover:scale-[1.02]">
              
              <div className="pr-4 flex-1">
                <h2 className="text-lg font-black text-slate-900 leading-tight mb-2 pr-2">{dish.name}</h2>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 rounded-lg p-1 text-sm">{dish.chefId?.avatar}</span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    {dish.chefId?.name}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => handleLike(dish._id)}
                disabled={hasVoted || !isActiveMeal}
                className={`
                  flex-shrink-0 flex items-center gap-1.5 px-4 py-3 rounded-2xl text-sm font-black transition-all duration-200
                  ${(!isActiveMeal || hasVoted)
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200" 
                    : "bg-gradient-to-t from-red-600 to-red-500 text-white shadow-[0_6px_0_0_#991b1b,0_15px_20px_rgba(239,68,68,0.3)] hover:-translate-y-1 hover:shadow-[0_8px_0_0_#991b1b,0_15px_20px_rgba(239,68,68,0.4)] active:translate-y-1.5 active:shadow-[0_0px_0_0_#991b1b,0_0px_0_rgba(239,68,68,0)]"
                  }
                `}
              >
                <span className={isActiveMeal && !hasVoted ? "animate-pulse" : ""}>❤️</span> 
                {dish.likes}
              </button>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
