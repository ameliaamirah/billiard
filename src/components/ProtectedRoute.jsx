import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    const redirectPath = role === "admin" ? "/admin-dashboard" : "/kasir-dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}