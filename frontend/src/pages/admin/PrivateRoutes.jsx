// import React from "react";
// import { Navigate, Outlet, useLocation } from "react-router-dom";

// import { useSelector } from "react-redux";
// import AdminRootLayout from "@/pages/admin/RootLayout";

// function PrivateRoutes({ ...props }) {
//   let location = useLocation();
//   const { adminData } = useSelector((state) => state.adminAuth);
//   const { user } = useSelector((state) => state.auth);
//   return (
//     <>
//       {user !== null ? (
//         <Navigate to="/" />
//       ) : adminData?.isAdmin === true ? (
//         <AdminRootLayout />
//       ) : (
//         <Navigate to="/admin/login" />
//       )}
//     </>
//   );
// }

// export default PrivateRoutes;


import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";

import AdminRootLayout from "@/pages/admin/RootLayout";

function PrivateRoutes() {
  // ✅ 1. Get from Redux
  const adminAuth = useSelector((state) => state.adminAuth || {});
  const auth = useSelector((state) => state.auth || {});
  const { adminData } = adminAuth;
  const { user } = auth;

  // ✅ 2. Fallback: Try decoding from token if Redux not ready
  const token = localStorage.getItem("admin-token");
  let decodedAdmin = null;

  if (!adminData && token) {
    try {
      const decoded = jwtDecode(token);
      decodedAdmin = {
        _id: decoded._id,
        email: decoded.email,
        isAdmin: decoded.isAdmin,
      };
    } catch (err) {
      console.error("Invalid token");
    }
  }

  // ✅ 3. Determine access
  const isAdmin = adminData?.isAdmin || decodedAdmin?.isAdmin;

  console.log("PrivateRoutes - adminData:", adminData);
  console.log("PrivateRoutes - decodedAdmin:", decodedAdmin);
  console.log("PrivateRoutes - user:", user);

  // ✅ 4. Routing logic
  // If user exists and is NOT an admin, redirect them away from admin routes
if (user && !isAdmin) {
  return <Navigate to="/" />;
}


  if (isAdmin) {
    return <AdminRootLayout />;
  }

  return <Navigate to="/admin/login" />;
}

export default PrivateRoutes;

