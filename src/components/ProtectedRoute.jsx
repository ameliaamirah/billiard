import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  /* =========================================
     AMBIL DATA LOGIN DARI LOCAL STORAGE
  ========================================= */
  // Karena murni frontend, kita bisa cek string 'true' atau eksistensi data
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role");

  /* =========================================
     JIKA BELUM LOGIN
  ========================================= */
  if (!isLoggedIn) {
    // Diarahkan ke halaman login utama (LoginPage.jsx)
    return <Navigate to="/" replace />;
  }

  /* =========================================
     JIKA ROLE TIDAK SESUAI
  ========================================= */
  if (allowedRole && role !== allowedRole) {
    // Jika kasir mencoba masuk ke halaman admin, lempar balik ke Beranda/Login
    return <Navigate to="/" replace />;
  }

  /* =========================================
     JIKA LOLOS VALIDASI FRONTEND
  ========================================= */
  return children;
}