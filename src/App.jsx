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
import LoginKasirPage from "./pages/LoginKasirPage";
import LoginAdminPage from "./pages/LoginAdminPage";
import AdminDashboard from "./pages/AdminDashboard";
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

  // 1. Sembunyikan Navbar di halaman login & dashboard internal saja (Di Beranda TETAP MUNCUL)
  const hideNavbar =
    location.pathname === "/admin" ||
    location.pathname === "/kasir" ||
    location.pathname === "/admin-dashboard" ||
    location.pathname === "/kasir-dashboard";

  // 2. Sembunyikan Footer di halaman login, dashboard, DAN HALAMAN BERANDA ("/")
  const hideFooter =
    location.pathname === "/" || 
    location.pathname === "/admin" ||
    location.pathname === "/kasir" ||
    location.pathname === "/admin-dashboard" ||
    location.pathname === "/kasir-dashboard";

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">

      {/* NAVBAR */}
      {!hideNavbar && <Navbar />}

      <div className="flex-grow">
        <Routes>

          {/* =========================
              PUBLIC / PELANGGAN
          ========================= */}
          <Route path="/" element={<HomePage />} />
          <Route path="/reservasi" element={<Reservasi />} />

          {/* =========================
              LOGIN FORM (MURNI FRONTEND)
          ========================= */}
          <Route path="/admin" element={<LoginAdminPage />} />
          <Route path="/kasir" element={<LoginKasirPage />} />

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

      {/* FOOTER (Otomatis hilang di Beranda, Login, dan area kerja Dashboard) */}
      {!hideFooter && <Footer />}

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