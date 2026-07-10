// src/App.jsx (dengan ScrollToTop)
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";

/* =========================================
   PAGES
========================================= */  
import HomePage from "./pages/HomePage";
import Reservasi from "./pages/ReservasiPage";
import LoginKasirPage from "./pages/LoginKasirPage";
import LoginAdminPage from "./pages/LoginAdminPage";
import AdminDashboard from "./pages/AdminDashboard";
import DashboardUtamaKasir from "./pages/DashboardUtamaKasir";
import MenuManagement from "./pages/MenuManagement";
import MonitorKasir from "./pages/MonitorKasir"; 
import ManageKasir from "./pages/ManageKasir";
import LaporanShift from "./pages/LaporanShift";
import RegisterKasirPage from "./pages/RegisterKasirPage";


/* =========================================
   COMPONENTS
========================================= */
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ToastNotification from "./components/ToastNotification";

/* =========================================
   CONTEXTS
========================================= */
import { NotificationProvider } from "./contexts/NotificationContext";

/* =========================================
   SCROLL TO TOP COMPONENT
========================================= */
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

/* =========================================
   LAYOUT CONFIGURATION
========================================= */
function LayoutUtama() {
  const location = useLocation();

  // Halaman yang TIDAK menampilkan Navbar
  const hideNavbarRoutes = [
    "/admin",
    "/kasir",
    "/admin-dashboard",
    "/kasir-dashboard",
    "/menu-management",
    "/monitor",
    "/manage-kasir",
    "/laporan-shift",
  ];
  
  // ✅ Halaman yang MENAMPILKAN Footer (HAPUS "/" agar footer tidak muncul di beranda)
  const showFooterRoutes = ["/reservasi"];  // <-- diubah, hanya reservasi yang punya footer
  
  // Halaman yang menggunakan layout berbeda (tanpa padding tambahan)
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);
  const showFooter = showFooterRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <ScrollToTop />
      <ToastNotification />

      {!hideNavbar && <Navbar />}
      
      <div className={`flex-grow ${!hideNavbar ? "pt-16" : ""}`}>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<HomePage />} />
          <Route path="/reservasi" element={<Reservasi />} />

          {/* LOGIN ROUTES */}
          <Route path="/admin" element={<LoginAdminPage />} />
          <Route path="/kasir" element={<LoginKasirPage />} />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu-management"
            element={
              <ProtectedRoute allowedRole="admin">
                <MenuManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/monitor"
            element={
              <ProtectedRoute allowedRole="admin">
                <MonitorKasir />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-kasir"
            element={
              <ProtectedRoute allowedRole="admin">
                <ManageKasir />
              </ProtectedRoute>
            }
          />
          <Route
            path="/laporan-shift"
            element={
              <ProtectedRoute allowedRole="admin">
                <LaporanShift />
              </ProtectedRoute>
            }
          />

          {/* KASIR ROUTES */}
          <Route
            path="/kasir-dashboard"
            element={
              <ProtectedRoute allowedRole="kasir">
                <DashboardUtamaKasir />
              </ProtectedRoute>
            }
          />

          <Route
            path="/register-kasir"
            element={
              <ProtectedRoute allowedRole="admin">
                <RegisterKasirPage />
              </ProtectedRoute>
            }
          />

          {/* 404 NOT FOUND */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      
      {showFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <NotificationProvider>
        <LayoutUtama />
      </NotificationProvider>
    </Router>
  );
}