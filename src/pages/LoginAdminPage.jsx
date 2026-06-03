// src/pages/LoginAdminPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserShield, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../supabaseClient";

export default function LoginAdminPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // src/pages/LoginAdminPage.jsx - bagian yang diubah
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // HAPUS .single() - gunakan array
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

      // Cek apakah data ditemukan
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Container Utama */}
      <div className="w-full max-w-md bg-[#0b0e14] border border-slate-800 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Ikon Atas - Menggunakan faUserShield untuk membedakan dengan Kasir */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#00aa66] to-[#00ff99] rounded-full flex items-center justify-center shadow-lg shadow-[#00ff99]/20">
            <FontAwesomeIcon icon={faUserShield} className="text-slate-950 text-2xl" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
            LOGIN <span className="text-[#00ff99]">ADMIN</span>
          </h2>
          <p className="text-slate-500 text-sm">
            Panel akses tingkat lanjut untuk manajemen
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[#00ff99] text-xs font-bold uppercase tracking-widest mb-2 ml-1">
              Admin Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username admin"
              className="w-full bg-[#161a22] border border-slate-700 text-slate-200 p-4 rounded-xl outline-none focus:border-[#00ff99] transition-all placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-[#00ff99] text-xs font-bold uppercase tracking-widest mb-2 ml-1">
              Admin Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#161a22] border border-slate-700 text-slate-200 p-4 rounded-xl outline-none focus:border-[#00ff99] transition-all placeholder:text-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#00aa66] to-[#00cc7a] hover:from-[#00cc7a] hover:to-[#00ff99] text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#00ff99]/20 active:scale-[0.98] cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              "Masuk ke Panel Admin"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-600 text-[10px] uppercase tracking-widest">
            Royal Cue Admin System © 2026
          </p>
        </div>
      </div>
    </div>
  );
}