import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MobileStudentApp from './MobileStudentApp';
import TVDashboard from './TVDashboard';
import AdminPanel from './AdminPanel';
import ChefWebpage from './ChefWebpage';
import Navigation from './Navigation';

export default function App() {
  return (
    <BrowserRouter>
      {/* Global Navigation that sits over all pages */}
      <Navigation />
      
      <Routes>
        <Route path="/" element={<MobileStudentApp />} />
        <Route path="/tv" element={<TVDashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/chef" element={<ChefWebpage />} />
      </Routes>
    </BrowserRouter>
  );
}
