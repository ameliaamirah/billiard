// src/pages/LoginAdminPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faArrowLeft, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../supabaseClient";

export default function LoginAdminPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Sudah diperbaiki dari sebelumnya 'loading(true)'
    setError("");

    try {
      // Mengubah filter pencarian dari 'username' menjadi 'email'
      const { data, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .eq("role", "admin");

      if (fetchError) {
        console.error("Error fetching admin:", fetchError);
        setError("Terjadi kesalahan koneksi database!");
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setError("Email admin tidak ditemukan!");
        setLoading(false);
        return;
      }

      const user = data[0];

      if (user.password === password) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", user.role);
        localStorage.setItem("email", user.email);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("nama_admin", user.nama_lengkap || user.email);
        
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
    // Memaksa satu layar penuh anti-scroll dengan background gambar home premium
    <div className="fixed inset-0 h-screen w-screen overflow-hidden flex flex-col items-center justify-center p-4 select-none box-border m-0 bg-slate-950">
      
      {/* BACKGROUND IMAGE DENGAN OVERLAY YANG LEBIH TERANG */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/admin.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-slate-950/50 to-black/85" />
        <div className="absolute inset-0 bg-emerald-950/5 backdrop-blur-[1px]" />
      </div>

      {/* HEADER UTAMA DI LUAR CARD */}
      <div className="relative z-10 text-center mb-6 flex flex-col items-center animate-fadeIn flex-shrink-0">
        <div className="flex justify-center mb-2 animate-fadeIn">
          <div className="bg-white p-2 rounded-full shadow-lg flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 overflow-hidden border border-white/20">
            <img 
              src="/images/logo2.png" 
              alt="Javatica Logo" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wider uppercase m-0 leading-tight drop-shadow-md">
          ROYAL CUE
        </h1>
        <p className="text-slate-300 text-xs tracking-widest uppercase mt-1 font-semibold opacity-90 drop-shadow">
          Admin & System Control
        </p>
      </div>

      {/* CARD CONTAINER - SEKARANG JAUH LEBIH TRANSPARAN */}
      <div className="relative z-10 w-full max-w-[380px] sm:max-w-[420px] bg-[#1a1a1a]/35 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] flex flex-col justify-between max-h-[85vh] box-border animate-fadeIn">
        
        <div>
          {/* Teks Judul Dalam Card */}
          <h2 className="text-xl font-bold text-white mb-1 tracking-wide">
            Login Admin
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mb-6 font-normal opacity-90">
            Masukkan kredensial Anda untuk mengakses kontrol inti
          </p>

          {/* Notifikasi Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-xs text-center font-medium backdrop-blur-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Form Input */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="block text-white text-xs font-semibold tracking-wide ml-0.5">
                Email Admin
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email admin"
                className="w-full bg-[#f0f0f0]/90 border-0 text-slate-900 p-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400 text-sm font-medium h-[46px]"
                autoComplete="email"
              />
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label className="block text-white text-xs font-semibold tracking-wide ml-0.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full bg-[#f0f0f0]/90 border-0 text-slate-900 p-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400 text-sm font-medium h-[46px] pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg cursor-pointer"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-sm" />
                </button>
              </div>
            </div>

            {/* Tombol Login Hijau Solid Premium */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] bg-[#008966] hover:bg-[#00aa7f] text-white font-bold tracking-wider uppercase rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-sm mt-6 flex items-center justify-center shadow-lg shadow-black/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  MEMPROSES...
                </span>
              ) : (
                "LOGIN TO DASHBOARD ADMIN"
              )}
            </button>
          </form>
        </div>

        {/* Tombol Kembali ke Homepage Minimalis */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-200 hover:text-white border border-white/20 hover:border-white/40 bg-white/10 backdrop-blur-sm transition-all px-4 py-2 rounded-xl cursor-pointer text-xs tracking-wide"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />
            <span>Kembali ke Homepage</span>
          </button>
        </div>

      </div>

      {/* Footer Hak Cipta */}
      <div className="relative z-10 text-center mt-6 flex-shrink-0">
        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-medium m-0 drop-shadow-sm">
          © 2026 ROYAL CUE BILLIARD. ALL RIGHTS RESERVED.
        </p>
      </div>

    </div>
  );
}