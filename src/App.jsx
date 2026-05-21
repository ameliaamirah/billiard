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
import Leaderboard from "./pages/LeaderboardPage";
import StatistikPage from "./pages/StatistikPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";

// Import Komponen Pembungkus Utama Baru untuk Kasir
import DashboardUtamaKasir from "./pages/DashboardUtamaKasir"; 

/* =========================================
   COMPONENTS
========================================= */
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

/* =========================================
   LAYOUT
========================================= */
function LayoutUtama() {
  const location = useLocation();

  // Memastikan navbar & footer bawaan user umum disembunyikan saat masuk panel admin/kasir
  const hideLayout =
    location.pathname === "/admin" ||
    location.pathname === "/kasir" ||
    location.pathname === "/admin-dashboard" ||
    location.pathname === "/kasir-dashboard";

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">

      {/* NAVBAR */}
      {!hideLayout && <Navbar />}

      <div className="flex-grow">
        <Routes>

          {/* =========================
              PUBLIC / PELANGGAN
          ========================= */}
          <Route path="/" element={<HomePage />} />
          <Route path="/reservasi" element={<Reservasi />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/statistik" element={<StatistikPage />} />

          {/* =========================
              LOGIN ROLE BASED
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
              DASHBOARD UTAMA KASIR (Dua Fitur dalam Satu Rumah)
          ========================= */}
          <Route
            path="/kasir-dashboard"
            element={
              <ProtectedRoute allowedRole="kasir">
                {/* Komponen ini otomatis merangkum MonitorKasir & KasirDashboard 
                  melalui sistem Tab internal navigasi.
                */}
                <DashboardUtamaKasir />
              </ProtectedRoute>
            }
          />

        </Routes>
      </div>

      {/* FOOTER */}
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