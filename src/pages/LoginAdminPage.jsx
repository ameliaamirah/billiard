import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaLock, FaSignInAlt, FaArrowLeft } from "react-icons/fa";

export default function LoginAdminPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLoginAdmin = (e) => {
    e.preventDefault();

    /* ==========================================================
       VALIDASI MURNI FRONTEND ADMIN (TANPA BACKEND)
       Username: admin
       Password: admin123
       ========================================================== */
    if (username === "admin" && password === "admin123") {
      
      // 1. Simpan status login admin ke browser local storage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", "admin");
      localStorage.setItem("token", "bypass-token-admin-murni-frontend");

      // 2. Langsung arahkan masuk ke Dashboard Admin
      navigate("/admin-dashboard");
    } else {
      alert("Username atau Password Admin Salah! Gunakan username: admin & password: admin123");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative">
      
      {/* Tombol Kembali ke Beranda */}
      <button 
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-[#00ff99] font-bold text-sm transition-colors cursor-pointer"
      >
        <FaArrowLeft /> Kembali ke Beranda
      </button>

      {/* Kartu Formulir Login */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
        
        {/* Header Form */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">
            ROYAL CUE <span className="text-amber-500">ADMIN</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Masuk ke panel manajemen utama & statistik studio
          </p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLoginAdmin} className="flex flex-col gap-5">
          
          {/* Input Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Admin Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                <FaUserShield className="text-sm" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username admin..."
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                <FaLock className="text-sm" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password admin..."
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Tombol Masuk */}
          <button
            type="submit"
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-amber-500 text-black hover:bg-amber-600 font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/10 active:scale-[0.98] cursor-pointer"
          >
            <FaSignInAlt /> Akses Panel Admin
          </button>

        </form>

        {/* Informasi Akun Demo */}
        <div className="mt-6 pt-4 border-t border-slate-800/50 text-center">
          <p className="text-[10px] text-slate-500 font-medium">
            Demo Admin: <span className="text-slate-400 font-bold">admin</span> / <span className="text-slate-400 font-bold">admin123</span>
          </p>
        </div>

      </div>
    </div>
  );
}