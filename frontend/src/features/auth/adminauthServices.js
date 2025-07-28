import axios from "axios";

const API_URL = import.meta.env.VITE_ADMIN_AUTH_API_URL;

const adminLogin = async (userData) => {
  const response = await axios.post(API_URL + "login", userData, {
    withCredentials: true, // ✅ this is the missing part
  });

  if (response.data.token) {
    localStorage.setItem("admin-token", response.data.token);
  }

  return {
  data: response.data.adminData,  
  token: response.data.token
};

};

const adminLogout = () => {
  localStorage.removeItem("admin-token");
};

const adminauthService = { adminLogin, adminLogout };

export default adminauthService;
