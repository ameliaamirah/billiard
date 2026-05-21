import { Navigate } from "react-router-dom";

export default function ProtectedRoute({

  children,
  allowedRole

}) {

  /* =========================================
     AMBIL DATA LOGIN DARI LOCAL STORAGE
  ========================================= */

  const token = localStorage.getItem("token");

  const role = localStorage.getItem("role");

  /* =========================================
     JIKA BELUM LOGIN
  ========================================= */

  if (!token) {

    return <Navigate to="/login" />;
  }

  /* =========================================
     JIKA ROLE TIDAK SESUAI
  ========================================= */

  if (role !== allowedRole) {

    return <Navigate to="/login" />;
  }

  /* =========================================
     JIKA LOLOS
  ========================================= */

  return children;
}