import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage"; // Tersedia jika nanti dibutuhkan
import MonitoringMeja from "./pages/MonitoringMeja";
import ContactPage from "./pages/ContactPage";
import StrukturPage from "./pages/StrukturPage";
import AboutPage from "./pages/AboutPage";
import LaporanKeuangan from "./pages/LaporanKeuangan";
import InventoryPage from "./pages/InventoryPage";

// Komponen pembantu untuk mengatur tampilan Footer
const LayoutContent = () => {
  const location = useLocation();
  
  // Perbaikan Logika: Sembunyikan Footer di halaman Beranda DAN halaman Operasional/Dashboard Kasir
  const disabledFooterRoutes = ["/", "/monitoring-meja", "/laporan-keuangan"];
  const hideFooter = disabledFooterRoutes.includes(location.pathname);

  return (
    <>
      <Navbar />
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tentang-kami" element={<AboutPage />} />
        <Route path="/struktur-organisasi" element={<StrukturPage />} />
        <Route path="/kontak-kami" element={<ContactPage />} />
        <Route path="/monitoring-meja" element={<MonitoringMeja />} />
        <Route path="/laporan-keuangan" element={<LaporanKeuangan />} />
        <Route path="/inventory-fnb" element={<InventoryPage />} />
      </Routes>

      {!hideFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <Router>
      <LayoutContent />
    </Router>
  );
}

export default App;