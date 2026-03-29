import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPanel() {
  const [dishes, setDishes] = useState([]);
  const [chefs, setChefs] = useState([]);

  // Filtering state
  const [filterDay, setFilterDay] = useState('All');
  const [filterMeal, setFilterMeal] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [form, setForm] = useState({ id: null, name: '', chefId: '', mealType: 'Breakfast', dayOfWeek: 'Monday' });

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://aahar-1.onrender.com';

  const fetchData = async () => {
    try {
      const [dishRes, chefRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/dishes`),
        axios.get(`${API_URL}/api/admin/chefs`)
      ]);
      setDishes(dishRes.data);
      setChefs(chefRes.data);
    } catch(e) {
      console.error(e);
      alert("Error loading data. Make sure backend is running.");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await axios.post(`${API_URL}/api/admin/dishes`, form);
      } else {
        await axios.put(`${API_URL}/api/admin/dishes/${form.id}`, form);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Error saving dish.");
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setForm({ 
      id: null, 
      name: '', 
      chefId: chefs[0]?._id || '', 
      mealType: 'Breakfast', 
      dayOfWeek: 'Monday' 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (dish) => {
    setModalMode('edit');
    setForm({ 
      id: dish._id, 
      name: dish.name, 
      chefId: dish.chefId?._id || '', 
      mealType: dish.mealType || 'Breakfast', 
      dayOfWeek: dish.dayOfWeek || 'Monday' 
    });
    setIsModalOpen(true);
  };

  const filteredDishes = dishes.filter(d => {
    const matchDay = filterDay === 'All' || d.dayOfWeek === filterDay;
    const matchMeal = filterMeal === 'All' || d.mealType === filterMeal;
    const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDay && matchMeal && matchSearch;
  });

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-20">
      
      {/* Premium Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-8 py-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>⚙️</span> Admin Command Center
            </h1>
            <p className="text-sm font-medium text-slate-400 mt-2 uppercase tracking-widest">
              Manage the Aahar Menu Ecosystem
            </p>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <span>+</span> Add New Dish
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 mb-8 items-center justify-between">
          <div className="flex flex-wrap gap-4 flex-grow">
            <select 
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 font-semibold outline-none"
              value={filterDay} onChange={e => setFilterDay(e.target.value)}
            >
              <option value="All">All Days</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>

            <select 
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 font-semibold outline-none"
              value={filterMeal} onChange={e => setFilterMeal(e.target.value)}
            >
              <option value="All">All Meals</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Snacks">Snacks</option>
              <option value="Dinner">Dinner</option>
            </select>
            
            <input 
              type="text"
              placeholder="🔍 Search dishes..."
              className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 flex-grow font-medium outline-none"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-gray-400 text-sm font-bold bg-gray-100 px-3 py-1.5 rounded-md">
            Found: {filteredDishes.length}
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDishes.map(dish => (
            <div key={dish._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2 text-[10px] uppercase font-black tracking-wider">
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-sm">{dish.dayOfWeek.slice(0,3)}</span>
                  <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded-sm">{dish.mealType}</span>
                </div>
                
                {/* Likes badge */}
                <div className="flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                   ❤️ {dish.likes}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 leading-tight mb-4 pr-6">{dish.name}</h3>
              
              <div className="flex justify-between items-center mt-auto border-t pt-3">
                <span className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                  <span className="grayscale opacity-70">{dish.chefId?.avatar}</span> 
                  {dish.chefId?.name || 'Unassigned'}
                </span>
                
                <button 
                  onClick={() => openEditModal(dish)}
                  className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDishes.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <div className="text-5xl mb-4">🍽️</div>
                <h3 className="text-xl font-bold text-gray-400">No dishes found matching your criteria.</h3>
            </div>
        )}

      </div>

      {/* Adding / Editing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
            
            <div className="bg-indigo-600 px-8 py-6 text-white flex justify-between items-center">
              <h2 className="text-2xl font-black">
                {modalMode === 'add' ? 'Create New Dish' : 'Edit Dish Details'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-indigo-200 hover:text-white text-2xl outline-none">
                ✖
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-5">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Dish Name</label>
                <input 
                  required
                  type="text" 
                  className="bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 font-medium outline-none transition-colors"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="e.g., Paneer Butter Masala"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Day of Week</label>
                  <select 
                    className="bg-gray-50 border border-gray-200 text-gray-900 rounded-xl block w-full p-3 font-medium outline-none cursor-pointer"
                    value={form.dayOfWeek}
                    onChange={e => setForm({...form, dayOfWeek: e.target.value})}
                  >
                    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Meal Type</label>
                  <select 
                    className="bg-gray-50 border border-gray-200 text-gray-900 rounded-xl block w-full p-3 font-medium outline-none cursor-pointer"
                    value={form.mealType}
                    onChange={e => setForm({...form, mealType: e.target.value})}
                  >
                    {['Breakfast','Lunch','Snacks','Dinner'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Assigned Chef</label>
                <select 
                  required
                  className="bg-gray-50 border border-gray-200 text-gray-900 rounded-xl block w-full p-3 font-medium outline-none cursor-pointer"
                  value={form.chefId}
                  onChange={e => setForm({...form, chefId: e.target.value})}
                >
                  <option value="" disabled>Select a Chef</option>
                  {chefs.map(c => <option key={c._id} value={c._id}>{c.name} - {c.specialty}</option>)}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-colors"
                >
                  {modalMode === 'add' ? 'Publish Dish' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
