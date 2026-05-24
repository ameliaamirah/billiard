import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role");

  /* ==========================================================
     JIKA BELUM LOGIN: 
     Arahkan ke rute login masing-masing, bukan ke halaman utama
     ========================================================== */
  if (!isLoggedIn) {
    if (allowedRole === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/kasir" replace />;
  }

  /* ==========================================================
     JIKA ROLE TIDAK SESUAI (Misal: Kasir maksa masuk ke Admin)
     ========================================================== */
  if (allowedRole && role !== allowedRole) {
    // Kembalikan ke halaman dashboard yang menjadi haknya
    if (role === "kasir") return <Navigate to="/kasir-dashboard" replace />;
    if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
    
    // Jika data role rusak, paksa login ulang
    return <Navigate to="/kasir" replace />;
  }

  /* ==========================================
     JIKA LOLOS VALIDASI, MELEWATI GERBANG
     ========================================== */
  return children;
}