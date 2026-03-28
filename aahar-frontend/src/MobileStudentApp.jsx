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

export default function MobileStudentApp() {
  const [data, setData] = useState({ status: "Loading", mealType: "", dishes: [] });
  const [hasVoted, setHasVoted] = useState(false);
  
  const deviceId = getDeviceId();

  const fetchData = async () => {
    // You can demo any meal by appending ?demo=Lunch to the URL, but here we read standard live data
    const urlParams = new URLSearchParams(window.location.search);
    const demoQuery = urlParams.get('demo') ? `?demo=${urlParams.get('demo')}` : '';

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

    try {
      const res = await axios.get(`${API_URL}/api/menu/current${demoQuery}`);
      if (res.data.status === "Closed") {
        setData({ status: "Closed", mealType: "", dishes: [] });
      } else {
        const sorted = res.data.dishes.sort((a, b) => b.likes - a.likes);
        setData({ status: res.data.status, mealType: res.data.mealType, dishes: sorted });
        
        const voteRes = await axios.get(`${API_URL}/api/vote-status/${res.data.mealType}/${deviceId}`);
        setHasVoted(voteRes.data.hasVoted);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLike = async (dishId) => {
    if (hasVoted) return; // Ignore if already voted
    
    // Optimistic UI update
    setData(prev => ({
        ...prev,
        dishes: prev.dishes.map(d => d._id === dishId ? { ...d, likes: d.likes + 1 } : d)
    }));
    setHasVoted(true); // Lock voting instantly
    
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const demoQuery = urlParams.get('demo') ? `?demo=${urlParams.get('demo')}` : '';
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        await axios.post(`${API_URL}/api/like/${dishId}${demoQuery}`, { deviceId });
    } catch (e) {
        // Revert on error
        alert(e.response?.data?.error || "Error recording vote");
        fetchData();
    }
  };

  if (data.status === "Closed") {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-black text-gray-800 mb-2">Aahar</h1>
        <p className="text-gray-500">Meal voting is currently closed based on standard mess timings.</p>
        <span className="text-xs text-gray-400 mt-4">(Try ?demo=Lunch in URL for testing)</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-10">
      {/* Mobile Sticky Header */}
      <div className="bg-white px-6 py-4 shadow sticky top-0 z-10 flex justify-between items-center rounded-b-3xl">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight">Aahar</h1>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{data.currentDay} {data.mealType} Menu</p>
        </div>
        <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase shadow-sm">
          Voting Live
        </div>
      </div>

      {/* Main Content Area (Mobile Constrained) */}
      <div className="p-4 max-w-sm mx-auto mt-4">
        {hasVoted ? (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl mb-6 text-sm font-semibold flex items-center justify-center shadow-sm">
                ✅ You have successfully voted for this meal!
            </div>
        ) : (
            <p className="text-gray-600 text-sm mb-6 px-1 font-medium leading-relaxed">
                You can only vote <span className="text-red-500 font-bold">once</span> per meal. Pick your favorite dish down below!
            </p>
        )}

        <div className="space-y-4">
          {data.dishes.map((dish) => (
            <div key={dish._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
              
              {/* Dish & Chef Info */}
              <div className="pr-4">
                <h2 className="text-md font-bold text-gray-900 leading-snug">{dish.name}</h2>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-sm bg-gray-100 rounded p-1">{dish.chefId?.avatar}</span>
                  <span className="text-[11px] font-bold text-gray-400 tracking-wide uppercase">
                    {dish.chefId?.name}
                  </span>
                </div>
              </div>

              {/* Smaller Tactile 3D Like Button */}
              <button 
                onClick={() => handleLike(dish._id)}
                disabled={hasVoted}
                className={`
                  flex-shrink-0 flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-black transition-all duration-100
                  ${hasVoted 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" 
                    : "bg-red-500 text-white shadow-[0_5px_0_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_#991b1b] active:translate-y-1 active:shadow-[0_1px_0_0_#991b1b]"
                  }
                `}
              >
                <span>❤️</span> 
                {dish.likes}
              </button>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
