import React, { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { FiSun, FiMoon, FiMenu, FiSearch, FiUser, FiX } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onThemeToggle, onToggleSidebar, isSidebarOpen  }) => {
  // State variables for managing user profile, theme, and search query
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [goalAmount, setGoalAmount] = useState(0);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize theme from localStorage and apply it to the document
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Fetch user profile data from the server
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://localhost:5277/api/auth/profile', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
          setUserName(data.name);
          setUserEmail(data.email);
          setGoalAmount(data.goalAmount);
        } else {
          toast.error(data.message || 'An error occurred while fetching profile');
        }
      } catch (error) {
        toast.error('An error occurred: ' + error.message);
      }
    };

    fetchUserProfile();
  }, []);

  // Toggle the visibility of the profile popup
  const toggleProfilePopup = () => {
    setIsProfilePopupOpen(!isProfilePopupOpen);
  };

  // Save updated profile data to the server
  const handleSaveProfile = async () => {
    try {
      const response = await fetch('http://localhost:5277/api/auth/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          passwordHash: userPassword,
          goalAmount: goalAmount,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setUserPassword('');
        setIsProfilePopupOpen(false);
      } else {
        toast.error(data.message || 'An error occurred while updating profile');
      }
    } catch (error) {
      toast.error('An error occurred: ' + error.message);
    }
  };

  // Handle theme toggle between light and dark modes
  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Handle search functionality
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/transactions?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <nav className="bg-white sm:mr-4 mb-2 sm:mt-4 rounded-md dark:bg-gray-800 dark:text-white shadow-sm p-4 flex items-center justify-between">

      {/* Sidebar Toggle Button */}
      <button onClick={onToggleSidebar} className="md:hidden p-2">
        {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          id="nav-search"
          name="search"
          placeholder="Search transactions"
          autoComplete="off"
          aria-label="Search"
          className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 dark:border-gray-500 bg-gray-100 dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <FiSearch
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300 cursor-pointer"
          onClick={handleSearch}
        />
      </div>

      {/* User Profile and Theme Switch */}
      <div className="flex items-center">
        {/* User Profile */}
        <div
          className="flex text-2xl bg-gray-100 dark:bg-gray-600 p-2 rounded-full items-center cursor-pointer"
          onClick={toggleProfilePopup}
        >
          <FiUser />
        </div>

        {/* Profile Popup */}
        {isProfilePopupOpen && (
          <div className="absolute top-16 right-4 bg-white border p-4 shadow-md rounded-md w-64 dark:bg-gray-800">
            {/* Profile editing form */}
            <p className="font-semibold text-center">Edit Profile</p>

            {/* Name input */}
            <div className="my-2">
              <label htmlFor="profile-name" className="block text-sm">Name</label>
              <input
                type="text"
                id="profile-name"
                name="name"
                autoComplete="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full p-2 rounded-md border border-gray-300"
              />
            </div>

            {/* Email input */}
            <div className="my-2">
              <label htmlFor="profile-email" className="block text-sm">Email</label>
              <input
                type="email"
                id="profile-email"
                name="email"
                autoComplete="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full p-2 rounded-md border border-gray-300"
              />
            </div>

            {/* Password input */}
            <div className="my-2">
              <label htmlFor="profile-password" className="block text-sm">Password</label>
              <input
                type="password"
                id="profile-password"
                name="password"
                autoComplete="new-password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="Change password"
                className="w-full p-2 rounded-md border border-gray-300"
              />
            </div>

            {/* Goal Amount input */}
            <div className="my-2">
              <label htmlFor="profile-goalAmount" className="block text-sm">Goal Amount ($)</label>
              <input
                type="number"
                id="profile-goalAmount"
                name="goalAmount"
                autoComplete="off"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                className="w-full p-2 rounded-md border border-gray-300"
              />
            </div>

            {/* Save button */}
            <button
              onClick={handleSaveProfile}
              className="mt-2 w-full bg-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Light/Dark Theme Switch */}
        <button
          onClick={handleThemeToggle}
          className="text-2xl ml-2 p-2 rounded-full bg-gray-200 dark:bg-gray-600 cursor-pointer"
        >
          {theme === "light" ? <FiSun /> : <FiMoon />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;