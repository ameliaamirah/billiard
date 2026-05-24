import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

/* =========================================
   PAGES
========================================= */
import HomePage from "./pages/HomePage";
import Reservasi from "./pages/ReservasiPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";

// Komponen Pembungkus Utama Baru untuk Kasir
import DashboardUtamaKasir from "./pages/DashboardUtamaKasir"; 

/* =========================================
   COMPONENTS
========================================= */
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

/* =========================================
   LAYOUT CONFIGURATION
========================================= */
function LayoutUtama() {
  const location = useLocation();

  // Memastikan navbar & footer disembunyikan saat masuk halaman login role maupun panel dashboard
  const hideLayout =
    location.pathname === "/admin" ||
    location.pathname === "/kasir" ||
    location.pathname === "/admin-dashboard" ||
    location.pathname === "/kasir-dashboard";

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">

      {/* NAVBAR (Hanya muncul di halaman publik / luar) */}
      {!hideLayout && <Navbar />}

      <div className="flex-grow">
        <Routes>

          {/* =========================
              PUBLIC / PELANGGAN
          ========================= */}
          <Route path="/" element={<HomePage />} />
          <Route path="/reservasi" element={<Reservasi />} />

          {/* =========================
              LOGIN ROLE BASED (MURNI FRONTEND)
          ========================= */}
          <Route
            path="/admin"
            element={<LoginPage roleLogin="admin" />}
          />

          <Route
            path="/kasir"
            element={<LoginPage roleLogin="kasir" />}
          />

          {/* =========================
              ADMIN DASHBOARD
          ========================= */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* =========================
              DASHBOARD UTAMA KASIR
          ========================= */}
          <Route
            path="/kasir-dashboard"
            element={
              <ProtectedRoute allowedRole="kasir">
                <DashboardUtamaKasir />
              </ProtectedRoute>
            }
          />

        </Routes>
      </div>

      {/* FOOTER (Otomatis hilang di halaman login kasir, login admin, dan semua jenis dashboard) */}
      {!hideLayout && <Footer />}

    </div>
  );
}

/* =========================================
   APP MAIN ENTRY
========================================= */
export default function App() {
  return (
    <Router>
      <LayoutUtama />
    </Router>
  );
}