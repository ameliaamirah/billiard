import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
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
import MenuManagement from "./pages/MenuManagement";
import MonitorKasir from "./pages/MonitorKasir"; 
import ManageKasir from "./pages/ManageKasir";

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
  ];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  // Halaman yang MENAMPILKAN Footer (Beranda "/" dihapus dari daftar ini)
  const showFooterRoutes = ["/reservasi"];
  const showFooter = showFooterRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Toast Notification untuk popup notifikasi */}
      <ToastNotification />
      
      {!hideNavbar && <Navbar />}
      <div className="flex-grow">
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

          {/* KASIR ROUTES */}
          <Route
            path="/kasir-dashboard"
            element={
              <ProtectedRoute allowedRole="kasir">
                <DashboardUtamaKasir />
              </ProtectedRoute>
            }
          />

          {/* 404 NOT FOUND */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </div>
      
      {/* Footer hanya tampil jika berada di route yang ada di showFooterRoutes */}
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