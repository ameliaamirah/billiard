import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserLock, faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function LoginKasirPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      if (username === "kasir" && password === "kasir123") {
        localStorage.setItem("isLoggedIn", "true");
        navigate("/kasir-dashboard");
      } else {
        alert("Username atau Password salah.");
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Container Utama */}
      <div className="w-full max-w-md bg-[#0b0e14] border border-slate-800 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Ikon Atas */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#00aa66] to-[#00ff99] rounded-full flex items-center justify-center shadow-lg shadow-[#00ff99]/20">
            <FontAwesomeIcon icon={faUserLock} className="text-slate-950 text-2xl" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
            Login <span className="text-[#00ff99]">Kasir</span>
          </h2>
          <p className="text-slate-500 text-sm">
            Gunakan kredensial resmi untuk mengakses sistem
          </p>
        </div>

        {/* Form */}
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
            className="w-full py-4 bg-gradient-to-r from-[#00aa66] to-[#00cc7a] hover:from-[#00cc7a] hover:to-[#00ff99] text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#00ff99]/20 active:scale-[0.98]"
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-600 text-[10px] uppercase tracking-widest">
            Royal Cue POS System © 2026
          </p>
        </div>
      </div>
    </div>
  );
}