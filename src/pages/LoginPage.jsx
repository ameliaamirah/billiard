// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, faLock, faEye, faEyeSlash, faCrown, faSpinner, faArrowRight,
  faArrowLeft, faUserShield, faUserClock
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../supabaseClient";

export default function LoginPage({ roleLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let targetRole = "";
      if (roleLogin === "Admin") targetRole = "admin";
      else if (roleLogin === "Kasir") targetRole = "kasir";
      else targetRole = roleLogin?.toLowerCase() || "";

      const { data, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("username", username.trim())
        .eq("role", targetRole)
        .single();

      if (fetchError) {
        console.error("Error fetching user:", fetchError);
        setError(`Username atau password ${roleLogin} salah!`);
        setLoading(false);
        return;
      }

      if (data && data.password === password) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("token", "simulated_token_" + Date.now());
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", data.username);
        localStorage.setItem("userId", data.id);
        
        if (data.role === "admin") {
          localStorage.setItem("nama_admin", data.nama_lengkap || data.username);
          navigate("/admin-dashboard");
        } else if (data.role === "kasir") {
          localStorage.setItem("nama_kasir", data.nama_lengkap || data.username);
          localStorage.setItem("shift", data.shift || "Pagi");
          navigate("/kasir-dashboard");
        } else {
          setError("Role tidak dikenali!");
          setLoading(false);
        }
      } else {
        setError(`Gagal Login: Username atau password untuk ${roleLogin} tidak sesuai.`);
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Terjadi kesalahan, silakan coba lagi.");
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoUsername, demoPassword) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    setShowDemoAccounts(false);
  };

  const demoAccounts = roleLogin === "Admin" 
    ? [{ username: "Boss", password: "boss123", name: "Administrator" }]
    : [
        { username: "Cantika", password: "Diana123", name: "Cantika Diana" },
        { username: "Budi", password: "Santoso123", name: "Budi Santoso" },
        { username: "Citra", password: "Dewi123", name: "Citra Dewi" },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020608] via-[#051010] to-[#020608] flex items-center justify-center p-3 sm:p-4 selection:bg-[#00ff99]/30">
      
      {/* Dekorasi Background - Responsive */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#00ff99]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-blue-500/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Tombol Kembali - Responsive */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-10 flex items-center gap-2 text-slate-400 hover:text-white transition-all p-2 min-w-[44px] min-h-[44px] rounded-lg hover:bg-white/5 backdrop-blur-sm"
        aria-label="Kembali ke Beranda"
      >
        <FontAwesomeIcon icon={faArrowLeft} size={16} />
        <span className="hidden xs:inline text-sm">Beranda</span>
      </button>

      <div className="w-full max-w-[90%] xs:max-w-sm z-10">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#00ff99] to-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg shadow-[#00ff99]/20">
            {roleLogin === "Admin" ? (
              <FontAwesomeIcon icon={faUserShield} className="text-white text-xl sm:text-2xl" />
            ) : (
              <FontAwesomeIcon icon={faUserClock} className="text-white text-xl sm:text-2xl" />
            )}
          </div>
          <h2 className="text-[8px] sm:text-[10px] font-black tracking-[0.2em] sm:tracking-[0.3em] text-emerald-500 uppercase mb-1">
            Royal Cue Studio
          </h2>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Login <span className="text-[#00ff99]">{roleLogin}</span>
          </h1>
          <p className="text-slate-500 text-[10px] sm:text-xs mt-2">
            Akses sistem manajemen {roleLogin === "Admin" ? "administrator" : "kasir"}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[#0a0f0d]/80 border border-slate-800 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl animate-fadeIn">
          
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            {/* Username Field */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black uppercase text-slate-500 ml-1">
                Username
              </label>
              <div className="relative group">
                <FontAwesomeIcon 
                  icon={faUser} 
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[#00ff99] transition-colors text-xs sm:text-sm" 
                />
                <input
                  type="text"
                  placeholder="Masukkan username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-[#00ff99] p-3 sm:p-3.5 pl-9 sm:pl-12 rounded-xl text-white outline-none text-xs sm:text-sm transition-all placeholder:text-slate-700 min-h-[44px]"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black uppercase text-slate-500 ml-1">
                Password
              </label>
              <div className="relative group">
                <FontAwesomeIcon 
                  icon={faLock} 
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[#00ff99] transition-colors text-xs sm:text-sm" 
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-[#00ff99] p-3 sm:p-3.5 pl-9 sm:pl-12 pr-9 sm:pr-12 rounded-xl text-white outline-none text-xs sm:text-sm transition-all min-h-[44px]"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size={14} className="sm:text-base" />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-2.5 sm:p-3 animate-shake">
                <p className="text-red-400 text-[10px] sm:text-xs text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#00ff99] to-emerald-600 hover:from-[#00dd88] hover:to-emerald-500 text-black font-black text-xs sm:text-sm py-3 sm:py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-[#00ff99]/10 mt-2 disabled:opacity-70 disabled:cursor-not-allowed min-h-[48px]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  MASUK KE DASHBOARD
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs sm:text-sm" />
                </span>
              )}
            </button>
          </form>

          {/* Info Akun dari Database - Responsive */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-800/50">
            <button
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="w-full flex items-center justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 hover:text-slate-300 transition-all p-1"
            >
              <span>📋 Akun Demo</span>
              <span>{showDemoAccounts ? "▲" : "▼"}</span>
            </button>
            
            {showDemoAccounts && (
              <div className="space-y-2 animate-fadeIn">
                {demoAccounts.map((account, idx) => (
                  <button
                    key={idx}
                    onClick={() => fillDemoAccount(account.username, account.password)}
                    className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950/30 p-2.5 sm:p-3 rounded-xl border border-slate-800/50 hover:bg-slate-800/40 transition-all text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[#00ff99] text-xs">👤</span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-300">
                        {account.name}
                      </span>
                      <span className="text-[8px] sm:text-[9px] text-slate-500">
                        ({account.username})
                      </span>
                    </div>
                    <div className="text-[8px] sm:text-[9px] text-slate-500 mt-1 sm:mt-0">
                      🔒 {account.password}
                    </div>
                  </button>
                ))}
                <p className="text-[7px] sm:text-[8px] text-slate-500 text-center mt-2">
                  Klik akun untuk mengisi otomatis
                </p>
              </div>
            )}
          </div>

          {/* Info Footer */}
          <div className="mt-4 pt-3 text-center">
            <p className="text-[7px] sm:text-[8px] text-slate-600">
              Royal Cue Management System © {new Date().getFullYear()}
            </p>
          </div>
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