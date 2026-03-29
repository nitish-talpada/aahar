import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ChefWebpage() {
  const [menuData, setMenuData] = useState(null);
  
  // By default, expand the active meal. But user can toggle manually if they want.
  const [expandedMeal, setExpandedMeal] = useState(null);

  useEffect(() => {
    const fetchTodayMenu = async () => {
      // Allow demo param so chefs can peek into what it will look like for dinner while it's morning
      const urlParams = new URLSearchParams(window.location.search);
      const demoMeal = urlParams.get('demoMeal');
      const demoDay = urlParams.get('demoDay');
      
      let queryStr = '';
      if(demoMeal) queryStr += `?demoMeal=${demoMeal}`;
      if(demoDay) queryStr += `${queryStr ? '&' : '?'}demoDay=${demoDay}`;

      const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://aahar-1.onrender.com';

      try {
        const res = await axios.get(`${API_URL}/api/menu/today${queryStr}`);
        setMenuData(res.data);
        if(!expandedMeal) {
          // Auto-expand active meal
          setExpandedMeal(res.data.activeMeal); 
        }
      } catch (err) {
        console.error("Failed to load chef menu data:", err);
      }
    };

    fetchTodayMenu();
    // Poll to keep likes updated (for the expanded active meal at least)
    const interval = setInterval(fetchTodayMenu, 3000);
    return () => clearInterval(interval);
  }, [expandedMeal]);

  if (!menuData) {
    return (
      <div className="bg-orange-50 min-h-screen flex items-center justify-center font-sans">
        <h1 className="text-3xl text-orange-400 font-bold animate-pulse">Loading Kitchen Data...</h1>
      </div>
    );
  }

  const toggleMeal = (meal) => {
    setExpandedMeal(expandedMeal === meal ? null : meal);
  };

  const mealOrder = ["Breakfast", "Lunch", "Snacks", "Dinner"];

  return (
    <div className="bg-orange-50 min-h-screen font-sans pb-24">
      {/* Header */}
      <div className="bg-orange-600 text-white px-8 py-6 shadow-md rounded-b-3xl">
        <h1 className="text-4xl font-black tracking-tight mb-2">Chef Command Center</h1>
        <p className="text-orange-100 font-semibold tracking-wide">
          Menu for {menuData.currentDay} | Shift: <span className="underline decoration-wavy decoration-orange-300">{menuData.activeMeal}</span>
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-6">
        {mealOrder.map((mealType) => {
          const isExpanded = expandedMeal === mealType;
          const isActive = menuData.activeMeal === mealType;
          const mealDishes = menuData.menus[mealType] || [];
          
          if (mealDishes.length === 0) return null; // No items for this meal

          return (
            <div key={mealType} className={`bg-white rounded-3xl overflow-hidden transition-all duration-300 border ${isActive ? 'border-orange-300 shadow-xl' : 'border-orange-100 shadow-sm'}`}>
              
              {/* Accordion Header */}
              <button 
                onClick={() => toggleMeal(mealType)}
                className={`w-full flex justify-between items-center px-6 py-5 outline-none transition-colors ${isActive ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-4">
                  <h2 className={`text-2xl font-black ${isActive ? 'text-orange-600' : 'text-gray-700'}`}>
                    {mealType}
                  </h2>
                  {isActive && (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      LIVE NOW
                    </span>
                  )}
                </div>
                
                <span className={`text-gray-400 text-2xl transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* Accordion Body */}
              <div 
                className={`transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 pb-6 pt-2">
                  <div className="w-full bg-gray-100 h-[1px] mb-4"></div>
                  
                  {isActive ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mealDishes.sort((a,b)=>b.likes - a.likes).map(dish => (
                        <div key={dish._id} className="bg-white border-2 border-orange-100 p-4 rounded-2xl flex justify-between items-center shadow-sm">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{dish.name}</h3>
                            <p className="text-sm text-gray-400 font-medium">Chef: {dish.chefId?.name}</p>
                          </div>
                          <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl">
                            <span className="text-2xl animate-bounce">❤️</span>
                            <span className="text-3xl font-black text-orange-600 tabular-nums leading-none tracking-tight">
                              {dish.likes}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {mealDishes.map(dish => (
                        <div key={dish._id} className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex flex-col justify-center items-start">
                          <h3 className="text-md font-bold text-gray-600">{dish.name}</h3>
                          <p className="text-xs text-gray-400">Chef: {dish.chefId?.name}</p>
                          <div className="mt-2 text-xs font-bold text-gray-300 flex items-center gap-1">
                            ❤️ {dish.likes} 
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                </div>
              </div>

            </div>
          );
        })}
      </div>
      
    </div>
  );
}
