import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role");

  console.log("=== DEBUG ProtectedRoute ===");
  console.log("isLoggedIn:", isLoggedIn);
  console.log("role yang tersimpan:", role);
  console.log("allowedRole yang diizinkan:", allowedRole);

  // Jika belum login, redirect ke login
  if (!isLoggedIn) {
    console.log("Belum login, redirect ke /login");
    return <Navigate to="/login" replace />;
  }

  // Jika role tidak sesuai dengan allowedRole
  if (allowedRole && role !== allowedRole) {
    console.log(`Role ${role} tidak sama dengan ${allowedRole}, redirect ke dashboard yang sesuai`);
    
    // Jika dia admin tapi mencoba akses halaman kasir
    if (role === "admin") {
      console.log("Redirect ke /admin-dashboard");
      return <Navigate to="/admin-dashboard" replace />;
    }
    // Jika dia kasir tapi mencoba akses halaman admin
    if (role === "kasir") {
      console.log("Redirect ke /kasir-dashboard");
      return <Navigate to="/kasir-dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  console.log("Akses diizinkan");
  return children;
}