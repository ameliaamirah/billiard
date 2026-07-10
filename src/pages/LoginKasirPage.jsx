import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faArrowLeft, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../supabaseClient";

export default function LoginKasirPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [initializing, setInitializing] = useState(true); // State baru untuk tracking loading awal auth
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 1. CEK SESSION SEARA REAL-TIME & HANDLE REDIRECT
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        // Ambil session saat ini (berguna menangkap token google di URL)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("email", session.user.email);
          localStorage.setItem("userId", session.user.id);
          localStorage.setItem("nama_kasir", session.user.user_metadata?.full_name || session.user.email);
          localStorage.setItem("role", "kasir");
          localStorage.setItem("shift", "Pagi");
          
          if (isMounted) {
            navigate("/kasir-dashboard", { replace: true });
          }
        }
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        if (isMounted) {
          // Matikan status inisialisasi agar form login tidak berkedip muncul
          setInitializing(false); 
        }
      }
    };

    checkSession();

    // Dengarkan perubahan auth state secara real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("email", session.user.email);
        localStorage.setItem("userId", session.user.id);
        localStorage.setItem("nama_kasir", session.user.user_metadata?.full_name || session.user.email);
        localStorage.setItem("role", "kasir");
        localStorage.setItem("shift", "Pagi");
        
        if (isMounted) {
          navigate("/kasir-dashboard", { replace: true });
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  // 2. FUNGSI LOGIN MANUAL
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .eq("role", "kasir");

      if (fetchError) {
        console.error("Error fetching user:", fetchError);
        setError("Terjadi kesalahan koneksi database!");
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setError("Email tidak ditemukan atau role bukan kasir!");
        setLoading(false);
        return;
      }

      const user = data[0];

      if (user.password === password) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", user.role);
        localStorage.setItem("email", user.email);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("nama_kasir", user.nama_lengkap || user.email);
        localStorage.setItem("shift", user.shift || "Pagi");
        
        console.log("Login berhasil:", user.email);
        navigate("/kasir-dashboard");
      } else {
        setError("Password salah!");
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan, silakan coba lagi.");
      setLoading(false);
    }
  };

  // 3. FUNGSI LOGIN DENGAN GOOGLE
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    
    try {
      const { error: OAuthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/kasir-dashboard", 
        },
      });

      if (OAuthError) throw OAuthError;
      
    } catch (err) {
      console.error("Google login error:", err);
      setError("Gagal login dengan Google, silakan coba lagi.");
      setGoogleLoading(false);
    }
  };

  // TAMPILAN FULLSCREEN LOADING (Menghilangkan kedipan halaman login)
  if (initializing) {
    return (
      <div className="w-full min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-emerald-500 text-4xl mb-4" />
        <p className="text-white text-sm font-light tracking-wide animate-pulse">
          Memeriksa autentikasi enkripsi...
        </p>
      </div>
    );
  }

  return (
    <div 
      className="w-full min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-4 relative box-border"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url('/images/profile.png')` 
      }}
    >
      
      {/* Title Header Luar */}
      <div className="text-center mb-6 z-10 w-full max-w-[420px] animate-fadeIn">
        <div className="flex justify-center mb-2 animate-fadeIn">
          <div className="bg-white p-2 rounded-full shadow-lg flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 overflow-hidden border border-white/20">
            <img 
              src="/images/logo2.png" 
              alt="Javatica Logo" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wider drop-shadow-md uppercase leading-tight">
          Royal Cue
        </h1>
        <p className="text-slate-300 text-xs mt-1 tracking-wide font-light drop-shadow-sm">
          POS & Billiard Management
        </p>
      </div>

      {/* Card Utama */}
      <div className="w-full max-w-[420px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] animate-fadeIn flex flex-col box-border" style={{ animationDelay: '0.1s' }}>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">
            Login Kasir
          </h2>
          <p className="text-slate-300 text-sm font-light">
            Masukkan kredensial Anda untuk mengakses sistem
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-xs text-center animate-shake">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-white text-xs font-semibold mb-1.5 ml-1">
              Email Kasir
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan alamat email"
              className="w-full bg-white/90 border border-white/30 text-slate-900 p-3 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400 text-sm min-h-[46px] box-border"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-white text-xs font-semibold mb-1.5 ml-1">
              Password
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full bg-white/90 border border-white/30 text-slate-900 p-3 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400 text-sm min-h-[46px] pr-12 box-border"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size={15} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-950/40 active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-sm min-h-[48px] mt-4 box-border"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                Memproses...
              </span>
            ) : (
              "Login to Dashboard Kasir"
            )}
          </button>
        </form>

        <div className="relative flex py-4 items-center font-semibold">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase tracking-wider">Atau</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full py-3 bg-white hover:bg-slate-100 text-slate-800 font-medium rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-sm min-h-[48px] flex items-center justify-center gap-3 box-border"
        >
          {googleLoading ? (
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-slate-600" />
              <span>Menghubungkan...</span>
            </div>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign In with Google</span>
            </>
          )}
        </button>

        <div className="mt-5 border-t border-white/10 pt-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-all text-xs font-light py-2 px-4 rounded-xl hover:bg-white/10 bg-white/5 border border-white/10 cursor-pointer layout-button w-full justify-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} size={11} />
            <span>Kembali ke Homepage</span>
          </button>
        </div>
      </div>

      <div className="text-center mt-6 z-10 w-full max-w-[420px]">
        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-medium drop-shadow-sm">
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