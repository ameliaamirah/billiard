// src/pages/ManageKasir.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCrown, faUsers, faClock, faCheckCircle, faTimesCircle, 
  faSignOutAlt, faCalendarAlt, faChartLine, faMoneyBillWave,
  faClipboardList, faUtensils, faSpinner, faHourglassHalf,
  faPlayCircle, faUserPlus, faBars, faArrowRight, faEdit, 
  faTrash, faSave, faTimes, faKey, faUser, faPhoneAlt,
  faSun, faMoon, faCloudSun
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../supabaseClient";
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";

export default function ManageKasir() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [kasirList, setKasirList] = useState([]);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingKasir, setEditingKasir] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    username: "",
    password: "",
    nama_lengkap: "",
    no_whatsapp: "",
    shift: "Pagi"
  });

  useEffect(() => {
    fetchKasir();
  }, []);

  const fetchKasir = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "kasir")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setKasirList(data || []);
    } catch (error) {
      console.error("Error fetching kasir:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      username: "",
      password: "",
      nama_lengkap: "",
      no_whatsapp: "",
      shift: "Pagi"
    });
    setEditingKasir(null);
    setModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.username.trim()) {
      alert("Username harus diisi!");
      return;
    }
    if (!form.nama_lengkap.trim()) {
      alert("Nama lengkap harus diisi!");
      return;
    }
    
    setSaving(true);
    
    try {
      if (editingKasir) {
        const updateData = {
          username: form.username.trim(),
          nama_lengkap: form.nama_lengkap.trim(),
          no_whatsapp: form.no_whatsapp || null,
          shift: form.shift,
          updated_at: new Date().toISOString()
        };
        
        if (form.password.trim()) {
          updateData.password = form.password.trim();
        }
        
        const { error } = await supabase
          .from("users")
          .update(updateData)
          .eq("id", editingKasir.id);
        
        if (error) throw error;
        alert("✅ Data kasir berhasil diupdate!");
      } else {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("username", form.username.trim())
          .maybeSingle();
        
        if (existingUser) {
          alert("Username sudah digunakan! Silakan pilih username lain.");
          setSaving(false);
          return;
        }
        
        const { error } = await supabase
          .from("users")
          .insert([{
            username: form.username.trim(),
            password: form.password.trim() || "123456",
            nama_lengkap: form.nama_lengkap.trim(),
            no_whatsapp: form.no_whatsapp || null,
            shift: form.shift,
            role: "kasir",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        
        if (error) throw error;
        alert("✅ Kasir baru berhasil ditambahkan! Password default: 123456");
      }
      
      resetForm();
      await fetchKasir();
    } catch (error) {
      console.error("Error saving kasir:", error);
      alert("Gagal menyimpan data: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteKasir = async (kasir) => {
    if (window.confirm(`Hapus kasir "${kasir.nama_lengkap}"?`)) {
      try {
        const { error } = await supabase
          .from("users")
          .delete()
          .eq("id", kasir.id);
        
        if (error) throw error;
        alert("✅ Kasir berhasil dihapus!");
        await fetchKasir();
      } catch (error) {
        alert("Gagal menghapus kasir: " + error.message);
      }
    }
  };

  const editKasir = (kasir) => {
    setEditingKasir(kasir);
    setForm({
      username: kasir.username,
      password: "",
      nama_lengkap: kasir.nama_lengkap || "",
      no_whatsapp: kasir.no_whatsapp || "",
      shift: kasir.shift || "Pagi"
    });
    setModalOpen(true);
  };

  const getShiftBadge = (shift) => {
    switch (shift) {
      case "Pagi":
        return { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "🌅 Pagi", icon: faSun };
      case "Siang":
        return { bg: "bg-amber-500/20", text: "text-amber-400", label: "☀️ Siang", icon: faCloudSun };
      case "Malam":
        return { bg: "bg-indigo-500/20", text: "text-indigo-400", label: "🌙 Malam", icon: faMoon };
      default:
        return { bg: "bg-slate-500/20", text: "text-slate-400", label: shift, icon: faClock };
    }
  };

  // Statistik kasir
  const totalKasir = kasirList.length;
  const shiftCount = {
    Pagi: kasirList.filter(k => k.shift === "Pagi").length,
    Siang: kasirList.filter(k => k.shift === "Siang").length,
    Malam: kasirList.filter(k => k.shift === "Malam").length,
  };

  return (
    <div className="flex min-h-screen bg-[#020a05]">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <AdminNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-[#00ff99] text-[10px] sm:text-xs font-black uppercase tracking-[3px] sm:tracking-[4px] mb-1 sm:mb-2">
                Manajemen
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
                Kelola <span className="text-[#00ff99]">Kasir</span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Tambah, edit, atau hapus akun kasir
              </p>
            </div>
            
            <button
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto bg-[#00aa66] hover:bg-[#00cc7a] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
            >
              <FontAwesomeIcon icon={faUserPlus} /> Tambah Kasir
            </button>
          </div>

          {/* Statistik Cards - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 sm:p-4">
              <p className="text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-wider">Total Kasir</p>
              <p className="text-2xl sm:text-3xl font-black text-white">{totalKasir}</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 sm:p-4">
              <p className="text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-wider">Shift Pagi</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">{shiftCount.Pagi}</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-4">
              <p className="text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-wider">Shift Siang</p>
              <p className="text-2xl sm:text-3xl font-black text-amber-400">{shiftCount.Siang}</p>
            </div>
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 sm:p-4">
              <p className="text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-wider">Shift Malam</p>
              <p className="text-2xl sm:text-3xl font-black text-indigo-400">{shiftCount.Malam}</p>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20">
              <FontAwesomeIcon icon={faSpinner} spin className="text-2xl sm:text-3xl text-[#00ff99] mb-3 sm:mb-4" />
              <p className="text-slate-400 text-xs sm:text-sm">Memuat data kasir...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 text-center">
              <FontAwesomeIcon icon={faTimesCircle} className="text-3xl sm:text-4xl text-red-400 mb-3" />
              <p className="text-red-400 text-sm sm:text-base">Error: {error}</p>
              <button onClick={fetchKasir} className="mt-4 px-4 py-2 bg-[#00aa66] rounded-xl text-xs sm:text-sm">Coba Lagi</button>
            </div>
          ) : (
            /* Tabel Kasir - Responsive */
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-slate-800/50 text-left">
                    <tr>
                      <th className="p-3 sm:p-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">No</th>
                      <th className="p-3 sm:p-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Username</th>
                      <th className="p-3 sm:p-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Nama Lengkap</th>
                      <th className="p-3 sm:p-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">WhatsApp</th>
                      <th className="p-3 sm:p-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Shift</th>
                      <th className="p-3 sm:p-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kasirList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 sm:p-10 text-center text-slate-500">
                          <FontAwesomeIcon icon={faUsers} className="text-3xl sm:text-4xl mb-2 opacity-30" />
                          <p className="text-xs sm:text-sm">Belum ada data kasir</p>
                          <p className="text-[10px] sm:text-xs mt-1">Klik tombol "Tambah Kasir" untuk menambahkan</p>
                        </td>
                      </tr>
                    ) : (
                      kasirList.map((kasir, index) => {
                        const shiftBadge = getShiftBadge(kasir.shift);
                        return (
                          <tr key={kasir.id} className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-all">
                            <td className="p-3 sm:p-4 text-slate-400 text-xs sm:text-sm">{index + 1}</td>
                            <td className="p-3 sm:p-4">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <FontAwesomeIcon icon={faUser} className="text-slate-500 text-[10px] sm:text-xs" />
                                <span className="text-white font-mono text-xs sm:text-sm">{kasir.username}</span>
                              </div>
                            </td>
                            <td className="p-3 sm:p-4 font-medium text-white text-xs sm:text-sm">{kasir.nama_lengkap || "-"}</td>
                            <td className="p-3 sm:p-4 text-slate-300 text-xs sm:text-sm">
                              {kasir.no_whatsapp ? (
                                <a href={`https://wa.me/${kasir.no_whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#00ff99] transition-colors flex items-center gap-1">
                                  <FontAwesomeIcon icon={faPhoneAlt} size={10} className="text-green-500" />
                                  {kasir.no_whatsapp}
                                </a>
                              ) : "-"}
                            </td>
                            <td className="p-3 sm:p-4">
                              <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold ${shiftBadge.bg} ${shiftBadge.text}`}>
                                <FontAwesomeIcon icon={shiftBadge.icon} size={8} className="sm:text-[10px]" />
                                {shiftBadge.label}
                              </span>
                            </td>
                            <td className="p-3 sm:p-4">
                              <div className="flex gap-1.5 sm:gap-2">
                                <button
                                  onClick={() => editKasir(kasir)}
                                  className="bg-blue-600/80 hover:bg-blue-500 px-2 sm:px-3 py-1.5 rounded-lg text-white text-[10px] sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer min-h-[32px]"
                                >
                                  <FontAwesomeIcon icon={faEdit} size={10} />
                                  <span className="hidden xs:inline">Edit</span>
                                </button>
                                <button
                                  onClick={() => deleteKasir(kasir)}
                                  className="bg-rose-600/80 hover:bg-rose-500 px-2 sm:px-3 py-1.5 rounded-lg text-white text-[10px] sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer min-h-[32px]"
                                >
                                  <FontAwesomeIcon icon={faTrash} size={10} />
                                  <span className="hidden xs:inline">Hapus</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL TAMBAH/EDIT KASIR - Responsive */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl w-full max-w-[95%] sm:max-w-md max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider">
                  <FontAwesomeIcon icon={faUserPlus} className="text-[#00ff99] mr-2" />
                  {editingKasir ? "Edit Kasir" : "Tambah Kasir Baru"}
                </h3>
                <button onClick={resetForm} className="text-slate-400 hover:text-white cursor-pointer p-2 -m-2 min-w-[36px] min-h-[36px] rounded-lg hover:bg-slate-800">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3 sm:space-y-4">
              <div>
                <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <FontAwesomeIcon icon={faUser} size={10} /> Username *
                </label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({...form, username: e.target.value})}
                  className="w-full bg-slate-900/60 border border-slate-800 p-2.5 sm:p-3 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-[#00ff99] mt-1 min-h-[44px]"
                  placeholder="contoh: kasir_royal"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <FontAwesomeIcon icon={faKey} size={10} /> Password
                  {!editingKasir && <span className="text-red-400 text-[8px] sm:text-[9px] ml-1">(default: 123456)</span>}
                  {editingKasir && <span className="text-slate-500 text-[8px] sm:text-[9px] ml-1">(kosongkan jika tidak diubah)</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  className="w-full bg-slate-900/60 border border-slate-800 p-2.5 sm:p-3 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-[#00ff99] mt-1 min-h-[44px]"
                  placeholder={editingKasir ? "******" : "Isi password"}
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={form.nama_lengkap}
                  onChange={(e) => setForm({...form, nama_lengkap: e.target.value})}
                  className="w-full bg-slate-900/60 border border-slate-800 p-2.5 sm:p-3 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-[#00ff99] mt-1 min-h-[44px]"
                  placeholder="contoh: Ahmad Fauzi"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <FontAwesomeIcon icon={faPhoneAlt} size={10} /> No. WhatsApp
                </label>
                <input
                  type="tel"
                  value={form.no_whatsapp}
                  onChange={(e) => setForm({...form, no_whatsapp: e.target.value})}
                  className="w-full bg-slate-900/60 border border-slate-800 p-2.5 sm:p-3 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-[#00ff99] mt-1 min-h-[44px]"
                  placeholder="contoh: 081234567890"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase">Shift Kerja</label>
                <select
                  value={form.shift}
                  onChange={(e) => setForm({...form, shift: e.target.value})}
                  className="w-full bg-slate-900/60 border border-slate-800 p-2.5 sm:p-3 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-[#00ff99] mt-1 cursor-pointer min-h-[44px]"
                >
                  <option value="Pagi">🌅 Pagi (08:00 - 16:00)</option>
                  <option value="Siang">☀️ Siang (12:00 - 20:00)</option>
                  <option value="Malam">🌙 Malam (16:00 - 00:00)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-bold text-[10px] sm:text-xs uppercase cursor-pointer transition-all min-h-[44px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 sm:py-3 bg-[#00aa66] hover:bg-[#00cc7a] rounded-xl text-white font-bold text-[10px] sm:text-xs uppercase cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
                >
                  {saving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                  {editingKasir ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}