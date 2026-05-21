import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaCrown } from "react-icons/fa";

export default function LoginPage({ roleLogin }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          role: roleLogin, // 🔥 kirim role login (admin / kasir)
        }),
      });

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", data.username);

        // 🔥 validasi role dari halaman login
        if (data.role === "admin") {
          navigate("/admin-dashboard");
        } else if (data.role === "kasir") {
          navigate("/kasir-dashboard");
        } else {
          navigate("/");
        }
      } else {
        alert(data.message || "Login gagal");
      }
    } catch (error) {
      console.error("ERROR LOGIN:", error);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020a05] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl">

        {/* LOGO */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-[#00ff99]/10 border border-[#00ff99]/20 flex items-center justify-center mb-5">
            <FaCrown className="text-[#00ff99] text-3xl" />
          </div>

          <p className="text-[#00ff99] text-xs font-black uppercase tracking-[4px] mb-2">
            Royal Cue Studio
          </p>

          <h1 className="text-3xl font-black text-white">
            Login {roleLogin === "kasir" ? "Kasir" : "Admin"}
          </h1>

          <p className="text-slate-400 text-sm mt-2 text-center">
            Masuk ke dashboard {roleLogin}
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-5">

          {/* USERNAME */}
          <div>
            <label className="text-sm font-bold text-slate-300 mb-3 block">
              Username
            </label>

            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl px-4">
              <FaUser className="text-slate-500" />
              <input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent outline-none px-4 py-4 text-white placeholder:text-slate-500"
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-bold text-slate-300 mb-3 block">
              Password
            </label>

            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl px-4">
              <FaLock className="text-slate-500" />
              <input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none px-4 py-4 text-white placeholder:text-slate-500"
                required
              />
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00ff99] hover:bg-[#00e187] text-black font-black py-4 rounded-2xl transition-all duration-300 mt-4"
          >
            {loading ? "Loading..." : `Login ${roleLogin}`}
          </button>
        </form>

        {/* DEMO */}
        <div className="mt-6 p-4 bg-slate-900/50 border border-slate-800/60 rounded-2xl text-xs tracking-wide text-slate-400">
          <p className="font-black text-[#00ff99] uppercase tracking-[1px] mb-2">Demo Login</p>
          <div className="space-y-1 font-medium">
            <p>Admin &rarr; <span className="text-white font-bold">admin</span> / <span className="text-white font-bold">admin123</span></p>
            <p>Kasir &nbsp;&rarr; <span className="text-white font-bold">kasir</span> / <span className="text-white font-bold">kasir123</span></p>
          </div>
        </div>

      </div>
    </div>
  );
}