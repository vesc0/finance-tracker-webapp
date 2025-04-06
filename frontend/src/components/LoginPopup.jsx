import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LoginPopup = ({ onClose }) => {
  // State variables for form inputs and UI behavior
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle form submission for login or signup
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `http://localhost:5277/api/auth/${isSignup ? "register" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(isSignup ? { email, passwordHash: password, name } : { email, passwordHash: password }),
          credentials: "include",
        }
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong.");
      
      toast.success(isSignup ? "Registration successful! Please log in." : "Login successful!");
      if (isSignup) {
        setIsSignup(false); // Switch to login mode after successful registration
      } else {
        navigate("/dashboard");
        onClose();
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 backdrop-brightness-90 backdrop-blur-sm flex text-center items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        {/* Title */}
        <h2 className="text-2xl font-semibold mb-6">{isSignup ? "Sign up" : "Log in"}</h2>
        {/* Error message */}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Email Input */}
        <div className="relative w-full mb-4">
          <input
            type="email"
            id="auth-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="peer w-full p-2 pt-3 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 placeholder-transparent"
            placeholder="Email"
            autoComplete="email"
            required
          />
          <label
            htmlFor="auth-email"
            className="absolute left-3 px-1 bg-white text-gray-600 text-sm transition-all -top-3 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3 peer-focus:text-sm peer-focus:text-gray-600"
          >
            Email
          </label>
        </div>

        {/* Password Input */}
        <div className={`relative w-full ${isSignup ? "mb-4" : ""}`}>
          <input
            type="password"
            id="auth-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="peer w-full p-2 pt-3 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 placeholder-transparent"
            placeholder="Password"
            autoComplete={`${isSignup ? "new-password" : "current-password"}`}
            required
          />
          <label
            htmlFor="auth-password"
            className="absolute left-3 px-1 bg-white text-gray-600 text-sm transition-all -top-3 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3 peer-focus:text-sm peer-focus:text-gray-600"
          >
            Password
          </label>
        </div>

        {/* Name Input (Only for Signup) */}
        {isSignup && (
          <div className="relative w-full">
            <input
              type="text"
              id="auth-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="peer w-full p-2 pt-3 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 placeholder-transparent"
              placeholder="Name"
              autoComplete="name"
              required
            />
            <label
              htmlFor="auth-name"
              className="absolute left-3 px-1 bg-white text-gray-600 text-sm transition-all -top-3 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3 peer-focus:text-sm peer-focus:text-gray-600"
            >
              Name
            </label>
          </div>
        )}

        {/* Submit Button */}
        <button
          className="w-full cursor-pointer bg-gray-800 hover:bg-gray-600 text-white p-2 rounded-md mt-6"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Processing..." : isSignup ? "Sign up" : "Log in"}
        </button>

        {/* Toggle Signup/Login */}
        <p className="mt-2 text-sm text-center">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Log in" : "Sign up"}
          </span>
        </p>

        {/* Close Button */}
        <button onClick={onClose} className="mt-4 cursor-pointer text-red-500 w-full">
          Close
        </button>
      </div>
    </div>
  );
};

export default LoginPopup;