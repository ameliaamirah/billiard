// src/pages/LoginAdminPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserShield, faSpinner, faArrowLeft, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../supabaseClient";

export default function LoginAdminPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("username", username.trim())
        .eq("role", "admin");

      if (fetchError) {
        console.error("Error fetching admin:", fetchError);
        setError("Terjadi kesalahan koneksi database!");
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setError("Username admin tidak ditemukan!");
        setLoading(false);
        return;
      }

      const user = data[0];

      if (user.password === password) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", user.role);
        localStorage.setItem("username", user.username);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("nama_admin", user.nama_lengkap || user.username);
        
        navigate("/admin-dashboard");
      } else {
        setError("Password salah!");
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Terjadi kesalahan, silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-3 sm:p-4">
      
      {/* Tombol Kembali ke Home - Responsive */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-10 flex items-center gap-2 text-slate-400 hover:text-white transition-all p-2 min-w-[44px] min-h-[44px] rounded-lg hover:bg-slate-800/50"
        aria-label="Kembali ke Beranda"
      >
        <FontAwesomeIcon icon={faArrowLeft} size={16} />
        <span className="hidden xs:inline text-sm">Beranda</span>
      </button>

      {/* Container Utama */}
      <div className="w-full max-w-[90%] xs:max-w-md bg-[#0b0e14] border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-fadeIn">
        
        {/* Ikon Atas */}
        <div className="flex justify-center mb-5 sm:mb-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#00aa66] to-[#00ff99] rounded-full flex items-center justify-center shadow-lg shadow-[#00ff99]/20">
            <FontAwesomeIcon icon={faUserShield} className="text-slate-950 text-xl sm:text-2xl" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider mb-2">
            LOGIN <span className="text-[#00ff99]">ADMIN</span>
          </h2>
          <p className="text-slate-500 text-[11px] sm:text-sm">
            Panel akses tingkat lanjut untuk manajemen
          </p>
        </div>

        {/* Error Message - Responsive */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs sm:text-sm text-center animate-shake">
            <span className="inline-block mr-1">⚠️</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-[#00ff99] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 ml-1">
              Admin Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username admin"
              className="w-full bg-[#161a22] border border-slate-700 text-slate-200 p-3 sm:p-4 rounded-xl outline-none focus:border-[#00ff99] focus:ring-1 focus:ring-[#00ff99]/50 transition-all placeholder:text-slate-600 text-sm sm:text-base min-h-[48px]"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-[#00ff99] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 ml-1">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#161a22] border border-slate-700 text-slate-200 p-3 sm:p-4 rounded-xl outline-none focus:border-[#00ff99] focus:ring-1 focus:ring-[#00ff99]/50 transition-all placeholder:text-slate-600 text-sm sm:text-base min-h-[48px] pr-12"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-all min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size={16} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-4 bg-gradient-to-r from-[#00aa66] to-[#00cc7a] hover:from-[#00cc7a] hover:to-[#00ff99] text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#00ff99]/20 active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-xs sm:text-sm min-h-[52px]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                Memproses...
              </span>
            ) : (
              "Masuk ke Panel Admin"
            )}
          </button>
        </form>

        {/* Info Footer */}
        <div className="text-center mt-6 sm:mt-8 pt-4 border-t border-slate-800">
          <p className="text-slate-600 text-[8px] sm:text-[10px] uppercase tracking-widest">
            Royal Cue Admin System © {new Date().getFullYear()}
          </p>
          <p className="text-slate-700 text-[7px] sm:text-[8px] mt-1">
            Sistem Manajemen Billiard Premium
          </p>
        </div>
      </div>

      {/* Animations CSS */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}