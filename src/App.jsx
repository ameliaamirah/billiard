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
import MenuManagement from "./pages/MenuManagement";
import MonitorKasir from "./pages/MonitorKasir"; 
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

  const hideNavbar =
    location.pathname === "/admin" ||
    location.pathname === "/kasir" ||
    location.pathname === "/admin-dashboard" ||
    location.pathname === "/kasir-dashboard" ||
    location.pathname === "/menu-management" ||
    location.pathname === "/monitor";  // ✅ TAMBAHKAN

  const hideFooter =
    location.pathname === "/" || 
    location.pathname === "/admin" ||
    location.pathname === "/kasir" ||
    location.pathname === "/admin-dashboard" ||
    location.pathname === "/kasir-dashboard" ||
    location.pathname === "/menu-management" ||
    location.pathname === "/monitor";  // ✅ TAMBAHKAN

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {!hideNavbar && <Navbar />}
      <div className="flex-grow">
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<HomePage />} />
          <Route path="/reservasi" element={<Reservasi />} />

          {/* LOGIN */}
          <Route path="/admin" element={<LoginAdminPage />} />
          <Route path="/kasir" element={<LoginKasirPage />} />

          {/* ADMIN DASHBOARD */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* KASIR DASHBOARD */}
          <Route
            path="/kasir-dashboard"
            element={
              <ProtectedRoute allowedRole="kasir">
                <DashboardUtamaKasir />
              </ProtectedRoute>
            }
          />

          {/* MENU MANAGEMENT */}
          <Route
            path="/menu-management"
            element={
              <ProtectedRoute allowedRole="admin">
                <MenuManagement />
              </ProtectedRoute>
            }
          />

          {/* ✅ TAMBAHKAN ROUTE MONITOR KASIR */}
          <Route
            path="/monitor"
            element={
              <ProtectedRoute allowedRole="admin">
                <MonitorKasir />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <LayoutUtama />
    </Router>
  );
}