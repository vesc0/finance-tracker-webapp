import React, { useState } from "react";
import LoginPopup from "../components/LoginPopup";

const Home = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="relative flex flex-col items-center justify-center text-center min-h-screen text-gray-800 overflow-hidden">

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="gradient"></div>
      </div>

      <h1 className="text-4xl font-bold mb-4">
        Welcome to{" "}
        <span className="text-5xl font-bold bg-gradient-to-r from-blue-700 via-green-600 to-indigo-500 inline-block text-transparent bg-clip-text">
          FINANCE TRACKER
        </span>
      </h1>
      <p className="text-lg text-gray-600 mb-6">Track your income, expenses, and savings effortlessly.</p>
      <button
        onClick={() => setIsLoginOpen(true)}
        className="px-6 py-3 bg-gray-800 hover:bg-gray-600 text-white cursor-pointer rounded-md text-lg"
      >
        Let's get started!
      </button>
      {isLoginOpen && <LoginPopup onClose={() => setIsLoginOpen(false)} />}

    </div>
  );
};

export default Home;