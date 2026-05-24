import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage({ roleLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    // 🕵️ SIMULASI VALIDASI AKUN DEMO LANGSUNG DI FRONTEND (MURNI LOKAL)
    setTimeout(() => {
      const validUsers = [
        { username: "admin", password: "admin123", role: "admin" },
        { username: "kasir", password: "kasir123", role: "kasir" }
      ];

      // Mencari kecocokan data input dengan akun demo
      const userFound = validUsers.find(
        (u) => u.username === username.toLowerCase() && u.password === password
      );

      if (userFound) {
        setLoading(false);
        
        // Simpan penanda sesi masuk tiruan ke browser agar aman
        localStorage.setItem("token", "simulated_frontend_token_xyz123");
        localStorage.setItem("role", userFound.role);
        localStorage.setItem("username", userFound.username);
        
        // Mengarahkan ke rute dashboard sesuai hak akses akun
        if (userFound.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/kasir-dashboard");
        }
      } else {
        setLoading(false);
        // Alert penolakan rapi tanpa pesan error backend yang membingungkan
        alert(`Gagal Login: Username atau password untuk ${roleLogin} tidak sesuai.`);
      }
    }, 600); // Memberikan efek jeda loading halus seolah-olah memproses data
  };

  return (
    <div className="min-h-screen bg-[#060b13] flex flex-col items-center justify-center px-4 font-sans">
      <div className="text-center mb-6">
        <div className="text-amber-400 text-3xl mb-3 flex justify-center">
          👑
        </div>
        <h2 className="text-[11px] font-bold tracking-[0.25em] text-slate-400 uppercase mb-1">
          Royal Cue Studio
        </h2>
        <h1 className="text-2xl font-black text-white tracking-wide capitalize">
          Login {roleLogin}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Masuk ke dashboard {roleLogin}
        </p>
      </div>

      <div className="w-full max-w-sm bg-[#0f172a]/90 border border-slate-800/60 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Username</label>
            <div className="relative flex items-center">
              <FaUser className="absolute left-4 text-slate-500 text-xs" />
              <input
                type="text"
                placeholder={`Masukkan username ${roleLogin}...`}
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#1e293b]/70 border border-slate-800 focus:border-emerald-500/80 p-3.5 pl-11 rounded-xl text-white outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative flex items-center">
              <FaLock className="absolute left-4 text-slate-500 text-xs" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1e293b]/70 border border-slate-800 focus:border-emerald-500/80 p-3.5 pl-11 pr-11 rounded-xl text-white outline-none text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4ade80] hover:bg-[#2ecc71] text-[#060b13] font-bold text-sm py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-lg shadow-emerald-500/10 mt-2 disabled:opacity-50"
          >
            {loading ? "Memproses..." : `Login ${roleLogin}`}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Demo Login
          </p>
          <div className="space-y-1 bg-[#1e293b]/40 border border-slate-800/40 p-3 rounded-xl text-xs text-slate-400">
            <div className="flex justify-between items-center">
              <span>Admin:</span>
              <span className="font-mono text-slate-300 select-all">admin / admin123</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Kasir:</span>
              <span className="font-mono text-slate-300 select-all">kasir / kasir123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}