import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar'; 
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import Backup from './pages/Backup';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import DisplayBill from './pages/DisplayBill';
import Register from './pages/Register';
import Footer from './components/Footer';

function App() {
  const location = useLocation();
  
  // Adjusted path logic to work with HashRouter
  const hideNavbarPaths = ["/login"];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}

      <Routes>
        {/* With HashRouter, paths will look like #/login or #/inventory */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path='/Billing' element={<Billing/>}/>
        <Route path='/display-bill' element={<DisplayBill/>}/>
        <Route path="/Inventory" element={<Inventory />} />
        <Route path="/Backup" element={<Backup/>} />
        // Inside your Routes block
        <Route path="/Register" element={<Register />} />
        {/* Optional: Add a catch-all redirect or 404 for desktop */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
      <Footer />
    </>
  );
}

export default function AppWithRouter() {
  return (
    <HashRouter>
      <App />
    </HashRouter>
  );
}