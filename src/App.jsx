import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

/* =========================================
   PAGES (Disinkronkan dengan File Asli Anda)
========================================= */
import HomePage from "./pages/HomePage";
import Reservasi from "./pages/ReservasiPage";
import LoginKasirPage from "./pages/LoginKasirPage"; // 👈 Sesuai struktur folder Anda
import LoginAdminPage from "./pages/LoginAdminPage"; // 👈 Sesuai struktur folder Anda
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

  // Menyembunyikan Navbar & Footer umum di halaman login operasional dan dashboard internal
  const hideLayout =
    location.pathname === "/admin" ||
    location.pathname === "/kasir" ||
    location.pathname === "/admin-dashboard" ||
    location.pathname === "/kasir-dashboard";

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">

      {/* NAVBAR (Hanya muncul di halaman publik: Beranda & Reservasi) */}
      {!hideLayout && <Navbar />}

      <div className="flex-grow">
        <Routes>

          {/* =========================
              PUBLIC / PELANGGAN
          ========================= */}
          <Route path="/" element={<HomePage />} />
          <Route path="/reservasi" element={<Reservasi />} />

          {/* =========================
              LOGIN FORM (MURNI FRONTEND - TANPA PROTECTED ROUTE)
          ========================= */}
          <Route path="/admin" element={<LoginAdminPage />} />
          <Route path="/kasir" element={<LoginKasirPage />} />

          {/* =========================
              ADMIN DASHBOARD (TERPROTEKSI)
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
              DASHBOARD UTAMA KASIR (TERPROTEKSI)
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

      {/* FOOTER (Otomatis hilang di area kerja kasir & admin) */}
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