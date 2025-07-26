import axios from "axios";
import { reset } from "./authSlices";

// API base URL from your .env file
const API_URL = import.meta.env.VITE_AUTH_API_URL;

// Register a new user
const register = async (userData) => {
  const response = await axios.post(API_URL + "register", userData, {
    withCredentials: true, // 👈 Ensures proper CORS and cookie handling
  });

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }

  return { data: response.data.userdata };
};

// Login an existing user
const login = async (userData) => {
  const response = await axios.post(API_URL + "login", userData, {
    withCredentials: true, // 👈 Important for session handling and CORS
  });

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }

  return { data: response.data.userdata };
};

// Logout user
const logout = () => {
  localStorage.removeItem("token");
};

const authService = {
  register,
  login,
  logout,
};

export default authService;
