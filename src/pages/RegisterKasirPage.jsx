import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faArrowLeft, faEye, faEyeSlash, faUserCheck } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../supabaseClient";

export default function RegisterKasirPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [noWhatsapp, setNoWhatsapp] = useState("");
  const [shift, setShift] = useState("Pagi");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1. Validasi awal: Cek duplikasi di tabel kustom users
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("email")
        .eq("email", email.trim().toLowerCase());

      if (checkError) throw checkError;

      if (existingUser && existingUser.length > 0) {
        setError("Email sudah digunakan! Silakan gunakan email lain.");
        setLoading(false);
        return;
      }

      // 2. Daftarkan ke Supabase Auth & kirim data form ke metadata agar dibaca database trigger
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: {
          emailRedirectTo: window.location.origin + "/manage-kasir",
          data: {
            nama_lengkap: namaLengkap.trim(),
            password_kasir: password, // Menyisipkan password ke metadata agar terbaca oleh SQL Trigger
            no_whatsapp: noWhatsapp.trim() || null,
            shift: shift
          }
        }
      });

      if (authError) throw authError;

      setSuccess("Registrasi kasir berhasil! Data otomatis tersinkronisasi ke database.");
      
      // Bersihkan isi form setelah berhasil
      setEmail("");
      setPassword("");
      setNamaLengkap("");
      setNoWhatsapp("");
      setShift("Pagi");

      // Redirect kembali ke halaman kelola kasir setelah beberapa detik
      setTimeout(() => {
        navigate("/manage-kasir"); 
      }, 2500);

    } catch (err) {
      console.error("Register error:", err);
      setError(err.message || "Terjadi kesalahan sistem database, coba lagi nanti.");
      setLoading(false);
    }
  };

  return (
    <div 
      className="w-full min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-4 relative box-border"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url('/images/profile.png')` 
      }}
    >
      {/* Title Header Luar */}
      <div className="text-center mb-5 z-10 w-full max-w-[420px] animate-fadeIn">
        <div className="flex justify-center mb-2">
          <div className="bg-white p-2 rounded-full shadow-lg flex items-center justify-center w-20 h-20 overflow-hidden border border-white/20">
            <img 
              src="/images/logo2.png" 
              alt="Royal Cue Logo" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>
        </div>
        <h1 className="text-3xl font-black text-white tracking-wider drop-shadow-md uppercase leading-tight">
          Royal Cue
        </h1>
        <p className="text-slate-300 text-xs mt-1 tracking-wide font-light">
          POS & Billiard Management
        </p>
      </div>

      {/* Card Utama */}
      <div className="w-full max-w-[420px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] animate-fadeIn flex flex-col box-border">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-white mb-1">
            Daftar Kasir Baru
          </h2>
          <p className="text-slate-300 text-xs font-light">
            Buat kredensial kasir. Akun otomatis mendukung login Google OAuth dan tabel manajemen.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-xs text-center animate-shake">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-200 text-xs text-center">
            🎉 {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-white text-xs font-semibold mb-1 ml-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              placeholder="Nama lengkap kasir"
              className="w-full bg-white/90 border border-white/30 text-slate-900 p-2.5 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all text-sm min-h-[42px] box-border"
            />
          </div>

          {/* Email Kasir */}
          <div>
            <label className="block text-white text-xs font-semibold mb-1 ml-1">
              Email Kasir
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email aktif kasir"
              className="w-full bg-white/90 border border-white/30 text-slate-900 p-2.5 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all text-sm min-h-[42px] box-border"
              autoComplete="email"
            />
          </div>

          {/* Password Manual */}
          <div>
            <label className="block text-white text-xs font-semibold mb-1 ml-1">
              Password
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tentukan password akun kasir"
                className="w-full bg-white/90 border border-white/30 text-slate-900 p-2.5 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all text-sm min-h-[42px] pr-12 box-border"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size={14} />
              </button>
            </div>
          </div>

          {/* No Whatsapp */}
          <div>
            <label className="block text-white text-xs font-semibold mb-1 ml-1">
              No. WhatsApp <span className="text-slate-300 font-normal">(Opsional)</span>
            </label>
            <input
              type="text"
              value={noWhatsapp}
              onChange={(e) => setNoWhatsapp(e.target.value)}
              placeholder="Contoh: 081234xxxx"
              className="w-full bg-white/90 border border-white/30 text-slate-900 p-2.5 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all text-sm min-h-[42px] box-border"
            />
          </div>

          {/* Shift */}
          <div>
            <label className="block text-white text-xs font-semibold mb-1 ml-1">
              Shift Kerja
            </label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full bg-white border border-white/30 text-slate-900 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm min-h-[42px] box-border cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
            >
              <option value="Pagi">Pagi</option>
              <option value="Siang">Siang</option>
              <option value="Malam">Malam</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-sm min-h-[44px] mt-4 box-border"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                Mendaftarkan Kasir...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faUserCheck} size={13} />
                Daftarkan Kasir
              </span>
            )}
          </button>
        </form>

        <button
          onClick={() => navigate("/manage-kasir")}
          className="mt-4 mx-auto flex items-center gap-2 text-slate-300 hover:text-white transition-all text-xs font-semibold py-2 px-4 rounded-xl hover:bg-white/10 bg-white/5 border border-white/10 cursor-pointer w-full justify-center"
        >
          <FontAwesomeIcon icon={faArrowLeft} size={11} />
          <span>Kembali ke Kelola Kasir</span>
        </button>
      </div>

      <div className="text-center mt-5 z-10 w-full max-w-[420px]">
        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-medium">
          © {new Date().getFullYear()} Royal Cue Billiard. All rights reserved.
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-2px); }
          40%, 80% { transform: translateX(2px); }
        }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}