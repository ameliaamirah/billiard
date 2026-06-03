// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("role");

  if (!isLoggedIn) {
    // Redirect ke halaman login yang sesuai
    if (allowedRole === "admin") return <Navigate to="/admin" replace />;
    if (allowedRole === "kasir") return <Navigate to="/kasir" replace />;
    return <Navigate to="/" replace />;
  }

  if (userRole !== allowedRole) {
    // Role tidak sesuai, redirect ke dashboard masing-masing
    if (userRole === "admin") return <Navigate to="/admin-dashboard" replace />;
    if (userRole === "kasir") return <Navigate to="/kasir-dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}