import { Navigate, useLocation } from "react-router-dom";
import React from "react";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    // ✅ Save the page user tried to access
    localStorage.setItem("redirectAfterLogin", location.pathname);

    return <Navigate to="/login" replace />;
  }

  return children;
}