import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import Add_product from "./Add_product";

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the JWT token used in our desktop session
    localStorage.removeItem('stationary');
    navigate("/login");
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        {/* Left Side: Logo & Navigation */}
        <div className="flex items-center">
          <Link to={'/'} className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-9 w-9" />
            <span className="text-white font-bold hidden lg:block tracking-tight">InventoryManager</span>
          </Link>
          
          <div className="hidden md:flex space-x-8 ml-12 text-gray-400">  
            <Link to="/" className="text-sm font-medium hover:text-blue-400 transition-colors">
              Dashboard
            </Link>
            <Link to="/Billing" className="text-sm font-medium hover:text-blue-400 transition-colors">
              Billing
            </Link>
            <Link to="/display-bill" className="text-sm font-medium hover:text-blue-400 transition-colors">
              Search Bills
            </Link>
            <Link to="/Inventory" className="text-sm font-medium hover:text-blue-400 transition-colors">
              Stock
            </Link>
            <Link to="/Backup" className="text-sm font-medium hover:text-blue-400 transition-colors">
              Ledger
            </Link>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={openModal}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
          >
            + New Product
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-gray-600 text-gray-300 text-xs font-bold rounded-lg hover:bg-gray-700 hover:text-white transition-all"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden flex items-center text-gray-400 hover:text-white"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="flex flex-col space-y-2 p-4">
            <Link to="/" onClick={toggleMobileMenu} className="p-2 text-gray-300 hover:bg-gray-700 rounded">Dashboard</Link>
            <Link to="/Billing" onClick={toggleMobileMenu} className="p-2 text-gray-300 hover:bg-gray-700 rounded">Billing</Link>
            <Link to="/Inventory" onClick={toggleMobileMenu} className="p-2 text-gray-300 hover:bg-gray-700 rounded">Stock</Link>
            <Link to="/Backup" onClick={toggleMobileMenu} className="p-2 text-gray-300 hover:bg-gray-700 rounded">Ledger</Link>
            <div className="pt-4 flex flex-col gap-2">
              <button onClick={openModal} className="w-full py-2 bg-blue-600 text-white rounded">Add Product</button>
              <button onClick={handleLogout} className="w-full py-2 border border-gray-600 text-gray-300 rounded">Logout</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && <Add_product closeModal={closeModal} />}
    </nav>
  );
};

export default Navbar;