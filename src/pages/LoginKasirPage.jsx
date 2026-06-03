// src/pages/LoginKasirPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserLock, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../supabaseClient";

export default function LoginKasirPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // HAPUS .single() - gunakan .maybeSingle() atau handling array
      const { data, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("username", username.trim())
        .eq("role", "kasir");

      if (fetchError) {
        console.error("Error fetching user:", fetchError);
        setError("Terjadi kesalahan koneksi database!");
        setLoading(false);
        return;
      }

      // Cek apakah data ditemukan (data berupa array)
      if (!data || data.length === 0) {
        setError("Username tidak ditemukan atau role bukan kasir!");
        setLoading(false);
        return;
      }

      // Ambil user pertama yang ditemukan
      const user = data[0];

      // Cek password
      if (user.password === password) {
        // Login berhasil
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", user.role);
        localStorage.setItem("username", user.username);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("nama_kasir", user.nama_lengkap || user.username);
        localStorage.setItem("shift", user.shift || "Pagi");
        
        console.log("Login berhasil:", user.username);
        navigate("/kasir-dashboard");
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
      <div className="w-full max-w-md bg-[#0b0e14] border border-slate-800 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#00aa66] to-[#00ff99] rounded-full flex items-center justify-center shadow-lg shadow-[#00ff99]/20">
            <FontAwesomeIcon icon={faUserLock} className="text-slate-950 text-2xl" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
            Login <span className="text-[#00ff99]">Kasir</span>
          </h2>
          <p className="text-slate-500 text-sm">
            Gunakan kredensial resmi untuk mengakses sistem
          </p>
        </div>

        {/* Info Akun Demo (membantu debugging) */}
        <div className="mb-4 p-2 bg-slate-800/30 rounded-lg">
          <p className="text-[10px] text-slate-500 text-center">
            Demo: Cantika / Diana123 | Budi / Santoso123 | Citra / Dewi123
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[#00ff99] text-xs font-bold uppercase tracking-widest mb-2 ml-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="w-full bg-[#161a22] border border-slate-700 text-slate-200 p-4 rounded-xl outline-none focus:border-[#00ff99] transition-all placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-[#00ff99] text-xs font-bold uppercase tracking-widest mb-2 ml-1">
              Password
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
            className="w-full py-4 bg-gradient-to-r from-[#00aa66] to-[#00cc7a] hover:from-[#00cc7a] hover:to-[#00ff99] text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#00ff99]/20 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-slate-600 text-[10px] uppercase tracking-widest">
            Royal Cue POS System © 2026
          </p>
        </div>
      </div>
    </div>
  );
}