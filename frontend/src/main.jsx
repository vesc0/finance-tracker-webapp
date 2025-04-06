import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout component handles the sidebar, navbar, and page layout
const Layout = ({ children, toggleTheme }) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    // Adjust sidebar visibility based on window size
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-700">
      {!isHomePage && isSidebarOpen && <Sidebar />}
      <div className="flex-1 flex flex-col h-full">
        {!isHomePage && (
          <Navbar
            onThemeToggle={toggleTheme}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
        )}
        <div className="flex-1 bg-gray-100 dark:bg-gray-700 overflow-auto sm:mr-3 scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
};

// MainApp component manages theme and routing
const MainApp = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    // Apply theme to the document
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Dashboard and Transactions wrapped with Layout */}
        <Route
          path="/dashboard"
          element={<Layout toggleTheme={toggleTheme}><Dashboard /></Layout>}
        />
        <Route
          path="/transactions"
          element={<Layout toggleTheme={toggleTheme}><Transactions /></Layout>}
        />
      </Routes>
      {/* Toast notifications */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={true}
        closeButton={true}
      />
    </Router>
  );
};

// Render the application
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);