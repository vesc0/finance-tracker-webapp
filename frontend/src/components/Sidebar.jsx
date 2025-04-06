import { Link, useLocation } from "react-router-dom";
import { FiHome, FiList, FiLogOut } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Send logout request to the backend
      const response = await fetch('http://localhost:5277/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="sm:m-4 rounded-md dark:bg-gray-800 dark:text-white shadow-sm items-center w-64 bg-white text-black flex flex-col p-6">
      {/* Logo */}
      <h1 className="text-xl font-bold mb-8">Finance Tracker</h1>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-4">
          <li>
            <Link 
              to="/dashboard" 
              className={`flex items-center space-x-2 p-2 rounded-md ${location.pathname === "/dashboard" ? "bg-gray-300 dark:bg-gray-600" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}
            >
              <FiHome />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/transactions" 
              className={`flex items-center space-x-2 p-2 rounded-md ${location.pathname === "/transactions" ? "bg-gray-300 dark:bg-gray-600" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}
            >
              <FiList />
              <span>Transactions</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center space-x-3 mt-auto hover:text-red-500 cursor-pointer"
        disabled={loading}
      >
        <FiLogOut />
        <span>{loading ? 'Logging out...' : 'Logout'}</span>
      </button>
    </aside>
  );
};

export default Sidebar;