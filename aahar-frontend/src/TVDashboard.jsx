import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// A simple floating heart particle component
const FloatingHeart = ({ id, onComplete }) => {
  return (
    <div 
      className="absolute text-rose-500 font-extrabold text-3xl animate-float-up pointer-events-none drop-shadow-lg z-50"
      style={{
        left: `${Math.random() * 60 + 20}%`,
        animationDuration: `${1.5 + Math.random()}s`
      }}
      onAnimationEnd={() => onComplete(id)}
    >
      +1❤️
    </div>
  );
};

export default function TVDashboard() {
  const [data, setData] = useState({ status: "Loading", mealType: "", dishes: [] });
  const [particles, setParticles] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let oldDishes = [];
    
    const fetchLiveMenu = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const demoQuery = urlParams.get('demo') ? `?demo=${urlParams.get('demo')}` : '';

        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        try {
            const res = await axios.get(`${API_URL}/api/menu/current${demoQuery}`);
            if(res.data.status === "Closed") {
                setData({ status: "Closed", mealType: "", dishes: [] });
            } else {
                const sorted = res.data.dishes.sort((a, b) => b.likes - a.likes);
                
                // Compare with old dishes to trigger particles
                if (oldDishes.length > 0) {
                    sorted.forEach(newDish => {
                        const oldDish = oldDishes.find(d => d._id === newDish._id);
                        if(oldDish && newDish.likes > oldDish.likes) {
                            // Dish likes increased! Trigger a particle
                            const particleId = Date.now() + Math.random();
                            setParticles(prev => [...prev, { id: particleId, dishId: newDish._id }]);
                        }
                    });
                }
                oldDishes = sorted;

                setData({ status: "Open", mealType: res.data.mealType, currentDay: res.data.currentDay, dishes: sorted });
            }
        } catch(e) {
            console.error("TV Update Error", e);
        }
    };

    fetchLiveMenu();
    const interval = setInterval(fetchLiveMenu, 2500); 
    return () => clearInterval(interval);
  }, []);

  const removeParticle = (id) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Add listener to catch ESC key exits
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Conditionally hide .nav-container using pure DOM manipulation
      const navContainer = document.querySelector('.nav-container');
      if (navContainer) {
          navContainer.style.display = !!document.fullscreenElement ? 'none' : 'flex';
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if(data.status === "Closed") {
      return (
        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-black min-h-screen flex items-center justify-center font-sans">
            <h1 className="text-6xl text-white/50 font-black tracking-widest drop-shadow-2xl animate-pulse">MESS CLOSED</h1>
        </div>
      );
  }

  return (
    <div 
        ref={containerRef}
        className={`bg-gradient-to-br from-slate-900 via-[#1e1b4b] to-black min-h-screen flex flex-col items-center font-sans overflow-hidden relative ${isFullscreen ? 'pt-8' : 'pt-12'}`}
    >
      {/* Dynamic Background Panning Animation */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 animate-slide pointer-events-none"></div>
      
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-rose-600/20 rounded-full blur-[150px] pointer-events-none animate-pulse-slow" style={{animationDelay: '1s'}}></div>

      {/* Fullscreen Toggle (Disappears when hovering over if we wanted, but let's keep it minimal) */}
      <button 
        onClick={toggleFullscreen} 
        className="absolute top-6 right-6 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 backdrop-blur-md outline-none transition-transform active:scale-90"
        title="Toggle Fullscreen"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isFullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> // Actually a close icon but signifies exit
            ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            )}
        </svg>
      </button>

      {/* Header section */}
      <div className="z-10 w-full max-w-6xl text-center mb-10 flex-shrink-0">
        <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-500 tracking-tighter drop-shadow-sm mb-4 transform transition-all duration-1000">
            {data.currentDay} {data.mealType} Live
        </h1>
        <p className="text-2xl md:text-3xl text-indigo-200 font-medium tracking-wide drop-shadow-md">
            Scan QR via Student App to Vote for Best Dish!
        </p>
      </div>

      {/* Leaderboard Cards */}
      <div className="w-full max-w-6xl flex flex-col gap-6 z-10 perspective-[1200px] flex-grow mt-4 px-6 relative pb-28">
        {data.dishes.map((dish, index) => {
            // Top 3 distinct styles
            let rankColor = "border-white/10 text-white/50 bg-white/5";
            let heartColor = "text-rose-500/80";
            let scaleClass = "hover:scale-[1.01]";
            
            if(index === 0) {
                rankColor = "border-yellow-400 text-yellow-500 bg-yellow-400/20 shadow-[0_0_30px_rgba(250,204,21,0.2)]";
                heartColor = "text-rose-500 font-black animate-pulse drop-shadow-[0_0_15px_rgba(244,63,94,0.7)]";
                scaleClass = "scale-[1.04] z-20 hover:scale-[1.05]";
            }
            if(index === 1) {
                rankColor = "border-slate-300 text-slate-300 bg-slate-300/20";
                heartColor = "text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]";
                scaleClass = "scale-[1.02] z-10 hover:scale-[1.03]";
            }
            if(index === 2) {
                rankColor = "border-orange-600 text-orange-500 bg-orange-600/20";
                heartColor = "text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]";
            }

            return (
                <div key={dish._id} 
                     className={`backdrop-blur-xl bg-white/[0.04] border border-white/10 p-6 md:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex justify-between items-center transition-all duration-1000 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${scaleClass} relative overflow-hidden`}
                     style={{ transformOrigin: 'center' }}
                >
                    {/* Live background highlight effect for #1 */}
                    {index === 0 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent animate-pulse pointer-events-none"></div>
                    )}

                    <div className="flex items-center gap-6 md:gap-10 z-10">
                        <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-4xl md:text-5xl font-black border-2 ${rankColor}`}>
                            #{index + 1}
                        </div>
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-1 drop-shadow-md">{dish.name}</h2>
                            <p className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
                                👨‍🍳 Chef {dish.chefId?.name}
                            </p>
                        </div>
                    </div>

                    <div className="text-6xl md:text-7xl font-black flex items-center gap-4 relative z-10">
                        <span className={`${heartColor} transition-all duration-300`}>❤️</span>
                        <span className="text-white drop-shadow-lg tabular-nums tracking-tighter w-24 text-right">
                            {dish.likes}
                        </span>
                        
                        {/* Render particles specifically spawned for this dish */}
                        {particles.filter(p => p.dishId === dish._id).map(p => (
                            <FloatingHeart key={p.id} id={p.id} onComplete={removeParticle} />
                        ))}
                    </div>
                </div>
            );
        })}
      </div>

      {/* Marquee Ticker at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 border-t border-white/10 overflow-hidden z-20">
          <div className="whitespace-nowrap animate-marquee py-3 md:py-4">
              <span className="text-xl md:text-2xl font-bold text-white/80 mx-10">
                  🔥 BREAKING NEWS: {data.dishes[0]?.name} is currently leading with {data.dishes[0]?.likes} votes!
              </span>
              <span className="text-xl md:text-2xl font-bold text-amber-400 mx-10">
                  ⭐️ Keep voting to decide the Campus Development Award! 
              </span>
              <span className="text-xl md:text-2xl font-bold text-white/80 mx-10">
                  👨‍🍳 Chef {data.dishes[0]?.chefId?.name} is on fire!
              </span>
              <span className="text-xl md:text-2xl font-bold text-emerald-400 mx-10">
                  📱 Open Aahar App on your phone to cast your vote NOW!
              </span>
          </div>
      </div>

    </div>
  );
}
