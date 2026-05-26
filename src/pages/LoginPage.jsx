import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, faLock, faEye, faEyeSlash, faCrown, faSpinner, faArrowRight 
} from "@fortawesome/free-solid-svg-icons";

export default function LoginPage({ roleLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const validUsers = [
        { username: "admin", password: "admin123", role: "admin" },
        { username: "kasir", password: "kasir123", role: "kasir" }
      ];

      const userFound = validUsers.find(
        (u) => u.username === username.toLowerCase() && u.password === password
      );

      if (userFound) {
        setLoading(false);
        localStorage.setItem("token", "simulated_frontend_token_xyz123");
        localStorage.setItem("role", userFound.role);
        localStorage.setItem("username", userFound.username);
        
        navigate(userFound.role === "admin" ? "/admin-dashboard" : "/kasir-dashboard");
      } else {
        setLoading(false);
        alert(`Gagal Login: Username atau password untuk ${roleLogin} tidak sesuai.`);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#020608] flex items-center justify-center p-4 selection:bg-[#00ff99]/30">
      {/* Dekorasi Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#00ff99]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-blue-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-sm z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#00ff99] to-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#00ff99]/20">
            <FontAwesomeIcon icon={faCrown} className="text-white text-2xl" />
          </div>
          <h2 className="text-[10px] font-black tracking-[0.3em] text-emerald-500 uppercase mb-1">Royal Cue Studio</h2>
          <h1 className="text-3xl font-black text-white tracking-tight">Login {roleLogin}</h1>
        </div>

        <div className="bg-[#0a0f0d]/80 border border-slate-800 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Username</label>
              <div className="relative group">
                <FontAwesomeIcon icon={faUser} className="absolute left-4 top-4 text-slate-600 group-focus-within:text-[#00ff99] transition-colors" />
                <input
                  type="text"
                  placeholder="admin"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-[#00ff99] p-3.5 pl-12 rounded-xl text-white outline-none text-sm transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Password</label>
              <div className="relative group">
                <FontAwesomeIcon icon={faLock} className="absolute left-4 top-4 text-slate-600 group-focus-within:text-[#00ff99] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-[#00ff99] p-3.5 pl-12 pr-12 rounded-xl text-white outline-none text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-slate-600 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#00ff99] to-emerald-600 hover:from-[#00dd88] hover:to-emerald-500 text-black font-black text-sm py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-[#00ff99]/10 mt-2"
            >
              {loading ? (
                <><FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> Memproses...</>
              ) : (
                <>MASUK KE DASHBOARD <FontAwesomeIcon icon={faArrowRight} className="ml-2" /></>
              )}
            </button>
          </form>

          {/* Info Demo Login */}
          <div className="mt-8 pt-6 border-t border-slate-800/50">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-3 text-center">Akun Demo</p>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between bg-slate-950/30 p-2.5 rounded-lg border border-slate-800/50">
                <span className="text-[10px] font-bold text-slate-400">Admin</span>
                <span className="text-[10px] font-mono text-emerald-500">admin / admin123</span>
              </div>
              <div className="flex justify-between bg-slate-950/30 p-2.5 rounded-lg border border-slate-800/50">
                <span className="text-[10px] font-bold text-slate-400">Kasir</span>
                <span className="text-[10px] font-mono text-blue-500">kasir / kasir123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}