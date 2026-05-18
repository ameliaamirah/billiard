import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaEye, 
  FaRocket, 
  FaHandshake, 
  FaLightbulb, 
  FaChess, 
  FaCrown,
  FaShieldAlt,
  FaUsers,
  FaGamepad,
  FaAward
} from "react-icons/fa";

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Mengambil state tab dari navigasi navbar, jika tidak ada default ke 'tentang-kami'
  const [activeTab, setActiveTab] = useState(location.state?.tab || "tentang-kami");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Sinkronisasi tab jika user berpindah tab dari navbar ketika sudah di halaman profil
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  // Variasi Animasi Framer Motion
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const nilaiInti = [
    { icon: <FaHandshake />, title: "Pelayanan Premium", desc: "Kami mengutamakan kenyamanan pelanggan dengan menyediakan fasilitas meja dan stik kelas turnamen." },
    { icon: <FaLightbulb />, title: "Inovasi Digital", desc: "Integrasi sistem booking online dan billing otomatis berbasis IoT untuk kemudahan bermain." },
    { icon: <FaChess />, title: "Komunitas & Sportivitas", desc: "Mendukung perkembangan atlet billiard lokal melalui turnamen berkala dan coaching clinic." }
  ];

  // Data Struktur Organisasi Komite Royal Cue Studio
  const eliteTeam = {
    ceo: { 
      // UBAH: Sinkronisasi nama CEO dengan StrukturPage.jsx
      name: "Anggy Mutydinata", 
      role: "Chief Executive Officer & Founder", 
      icon: <FaCrown className="text-yellow-400" />, 
      desc: "Lead Visionary di balik integrasi teknologi digital pada arena Royal Cue Studio." 
    },
    managers: [
      { 
        // UBAH: Sinkronisasi nama Advisor dengan StrukturPage.jsx
        name: "Devon Wijaya, M.Kom", 
        role: "Supervising Advisor", 
        icon: <FaShieldAlt className="text-[#00ff99]" />, 
        desc: "Penasihat teknis sistem informasi & arsitektur aplikasi." 
      },
      { name: "Alex Bhaskara", role: "Operational & Tournament Lead", icon: <FaGamepad className="text-blue-400" />, desc: "Pengawas operasional arena dan manajemen kompetisi." }
    ],
    executors: [
      { name: "Budi Santoso", role: "Lead Fullstack Developer", task: "React & Supabase Billing Engine" },
      { name: "Siti Rahma", role: "UI/UX & Motion Designer", task: "Interface & Animation Asset" },
      { name: "Rian Hidayat", role: "Network & IoT Engineer", task: "Hardware Integration & LAN Tester" }
    ]
  };

  return (
    <div className="bg-[#020617] min-h-screen overflow-x-hidden text-slate-100">
      
      {/* SECTION 1: HERO CONTAINER & TAB SWITCHER */}
      <section className="pt-36 pb-14 px-5 bg-gradient-to-b from-[#091413] to-[#020617] text-white relative overflow-hidden border-b border-slate-800/50">
        {/* Efek Cahaya Meja Billiard / Glow Efek Neon Hijau */}
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-[#00aa66] rounded-full blur-[130px]"
        />

        <div className="max-w-6xl mx-auto text-center relative z-10 mb-6">
          <h2 className="text-[#00ff99] font-bold tracking-[0.2em] uppercase mb-4 text-xs">Profil Studio</h2>
          <h1 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tight text-white">
            Kenali Lebih Dekat <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[#00ff99]">Royal Cue Billiard Studio</span>
          </h1>

          {/* Sakelar Pilihan Tab Konten GAYA PREMIUM */}
          <div className="inline-flex p-1.5 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-800 shadow-2xl">
            <button
              onClick={() => setActiveTab("tentang-kami")}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer ${
                activeTab === "tentang-kami" 
                  ? "bg-[#00aa66] text-white shadow-lg shadow-[#00aa66]/20 scale-105" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Tentang Kami
            </button>
            <button
              onClick={() => setActiveTab("struktur-organisasi")}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer ${
                activeTab === "struktur-organisasi" 
                  ? "bg-[#00aa66] text-white shadow-lg shadow-[#00aa66]/20 scale-105" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Struktur Organisasi
            </button>
          </div>
        </div>
      </section>

      {/* RENDER ANIMASI PERUBAHAN TAB KONTEN */}
      <AnimatePresence mode="wait">
        {activeTab === "tentang-kami" ? (
          <motion.div
            key="tentang-kami-tab"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.4 }}
          >
            {/* SUB TAB: TENTANG KAMI - DESKRIPSI UTAMA */}
            <section className="py-20 px-5 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <h3 className="text-3xl font-black text-white mb-5 tracking-tight">Modernisasi Arena Billiard Konvensional</h3>
                <p className="text-slate-400 text-base leading-relaxed mb-6">
                  Royal Cue Billiard Studio bukan sekadar tempat bermain biasa. Kami merancang ekosistem digital terintegrasi yang memudahkan pemain memesan meja secara <span className="text-[#00ff99] font-medium">*real-time*</span>, melihat papan skor turnamen digital, hingga memesan menu makanan langsung dari aplikasi.
                </p>
                <div className="flex gap-8 border-t border-slate-800 pt-6">
                  <div><h3 className="text-3xl font-black text-[#00ff99]">16+</h3><p className="text-[10px] text-slate-500 uppercase font-black tracking-wider mt-1">Meja Pro Standar</p></div>
                  <div><h3 className="text-3xl font-black text-[#00ff99]">24/7</h3><p className="text-[10px] text-slate-500 uppercase font-black tracking-wider mt-1">Sistem Otomatis</p></div>
                </div>
              </motion.div>
              <div className="relative">
                <div className="absolute inset-0 bg-[#00aa66]/10 rounded-2xl transform rotate-3 scale-102 -z-10 blur-sm" />
                <img 
                  src="/images/profile.png " 
                  alt="Premium Billiard Table Arena" 
                  className="rounded-2xl shadow-2xl border border-slate-800 object-cover w-full h-[350px] filter brightness-90 contrast-105" 
                />
              </div>
            </section>

            {/* VISI & MISI SECTION */}
            <section className="py-20 px-5 relative bg-[#090f1d]/40 border-y border-slate-900">
              <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 relative z-10">
                <div className="p-10 rounded-[2.5rem] bg-[#0b1329]/60 border border-slate-800/60 shadow-xl group hover:border-[#00aa66]/50 transition-all duration-500">
                  <div className="w-14 h-14 bg-[#00aa66] text-white rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:rotate-12 transition-transform shadow-lg shadow-[#00aa66]/20">
                    <FaEye />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white tracking-tight">Visi Kami</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Menjadi pionir digitalisasi manajemen olahraga billiard nasional yang transparan, modern, dan memberikan pengalaman bermain kelas dunia bagi komunitas.
                  </p>
                </div>
                
                <div className="p-10 rounded-[2.5rem] bg-[#070a13] text-white border border-slate-800 shadow-2xl group hover:-translate-y-1 transition-all duration-500">
                  <div className="w-14 h-14 bg-white/5 text-[#00ff99] border border-slate-800 rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:-rotate-12 transition-transform shadow-md">
                    <FaRocket />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 tracking-tight">Misi Kami</h3>
                  <ul className="space-y-4 text-slate-400 text-sm">
                    <li className="flex gap-3"><span className="text-[#00ff99] font-bold">✓</span> Menyediakan sistem manajemen billing meja berbasis IoT yang akurat.</li>
                    <li className="flex gap-3"><span className="text-[#00ff99] font-bold">✓</span> Mempermudah akses pemesanan tempat bagi para pelanggan via aplikasi.</li>
                    <li className="flex gap-3"><span className="text-[#00ff99] font-bold">✓</span> Meningkatkan eksposur olahraga billiard melalui platform interaktif.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* NILAI UTAMA BRAND */}
            <section className="py-20 px-5 bg-[#020617]">
              <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                {nilaiInti.map((item, index) => (
                  <div key={index} className="bg-[#0b1329]/40 p-8 rounded-3xl border border-slate-900 shadow-sm hover:-translate-y-2 hover:bg-[#0b1329]/80 hover:border-slate-800 transition-all duration-300">
                    <div className="text-4xl text-[#00ff99] mb-6 opacity-90">{item.icon}</div>
                    <h4 className="text-lg font-bold mb-3 text-white tracking-tight">{item.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="struktur-organisasi-tab"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.4 }}
            className="py-16 px-5 max-w-6xl mx-auto"
          >
            {/* SUB TAB: STRUKTUR ORGANISASI KELAS EMERALD */}
            <div className="text-center mb-20">
              <h3 className="text-3xl font-black text-white tracking-tight">Struktur Direksi & Pengembang</h3>
              <p className="text-slate-500 mt-2 text-xs uppercase tracking-widest font-semibold">Kolaborasi tim profesional di balik arsitektur digital Royal Cue Studio.</p>
            </div>

            {/* LEVEL 1: CEO / FOUNDER */}
            <div className="flex justify-center mb-20 relative">
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className="bg-gradient-to-b from-[#0b1329] to-[#070a13] border-2 border-[#00aa66] text-white p-8 rounded-3xl shadow-2xl shadow-[#00aa66]/5 text-center max-w-md w-full relative z-10"
              >
                <div className="w-14 h-14 bg-[#00aa66]/10 border border-[#00aa66]/30 rounded-full mx-auto flex items-center justify-center text-2xl mb-4 shadow-inner">
                  {eliteTeam.ceo.icon}
                </div>
                <h4 className="text-2xl font-black tracking-wide text-white">{eliteTeam.ceo.name}</h4>
                <p className="text-[#00ff99] text-[10px] uppercase font-black tracking-widest mt-1">{eliteTeam.ceo.role}</p>
                <p className="text-slate-400 text-xs mt-4 italic border-t border-slate-800 pt-3 font-light leading-relaxed">{eliteTeam.ceo.desc}</p>
              </motion.div>
              {/* Garis Bagan Konektor Vertikal */}
              <div className="absolute top-full left-1/2 w-0.5 h-20 bg-[#00aa66]/20 -translate-x-1/2 hidden md:block"></div>
            </div>

            {/* LEVEL 2: ADVISOR & OPERATIONAL MANAGERS */}
            <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto mb-20 relative pt-2">
              {/* Garis Bagan Konektor Horizontal Desktop */}
              <div className="hidden md:block absolute top-0 left-1/4 right-1/4 h-0.5 bg-[#00aa66]/20"></div>
              
              {/* Card Advisor & Manager Gelap Sinematik */}
              {eliteTeam.managers.map((mgr, index) => (
                <motion.div 
                  key={index} 
                  whileHover={{ y: -4 }}
                  className="bg-[#0b1329]/60 border border-slate-800/80 p-6 rounded-2xl shadow-xl flex items-start gap-5 relative group hover:border-[#00aa66]/60 hover:bg-[#0b1329] transition-all duration-300"
                >
                  {/* Garis Vertikal Mini Ke Atas */}
                  <div className="hidden md:block absolute bottom-full left-1/2 w-0.5 h-6 bg-[#00aa66]/20 -translate-x-1/2"></div>
                  
                  <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-xl text-slate-300 group-hover:bg-[#00aa66] group-hover:text-white group-hover:border-transparent transition-all duration-300 shrink-0">
                    {mgr.icon}
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-base tracking-tight">{mgr.name}</h5>
                    <p className="text-[#00ff99] text-[10px] font-black uppercase tracking-wider mt-0.5">{mgr.role}</p>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">{mgr.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* KONEKTOR LEVEL TIM TEKNIS */}
            <div className="text-center mb-10">
              <span className="bg-slate-900/80 text-[#00ff99] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-800">
                Core Production Team
              </span>
            </div>

            {/* LEVEL 3: EXECUTORS / TECHNICAL DEVELOPERS */}
            <motion.div 
              variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            >
              {eliteTeam.executors.map((exe, index) => (
                <motion.div 
                  key={index} variants={fadeIn} whileHover={{ scale: 1.02 }}
                  className="bg-[#070a13] border border-dashed border-slate-800 p-6 rounded-2xl text-center shadow-sm hover:bg-[#0b1329]/40 hover:border-solid hover:border-slate-700 transition-all duration-300"
                >
                  <div className="w-9 h-9 bg-slate-900 text-slate-400 shadow-sm rounded-full mx-auto flex items-center justify-center text-xs font-black mb-3 border border-slate-800 group-hover:text-[#00ff99]">
                    0{index + 1}
                  </div>
                  <h6 className="font-bold text-white text-sm tracking-tight">{exe.name}</h6>
                  <p className="text-[#00ff99] text-[11px] font-semibold mt-0.5">{exe.role}</p>
                  <div className="mt-3 bg-slate-950 rounded-lg py-1.5 px-3 border border-slate-900/60 text-slate-500 text-[11px] font-medium tracking-wide">
                    {exe.task}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER CALL-TO-ACTION (CTA) GAYA PREMIUM-DARK */}
      <section className="py-20 px-5 text-center bg-gradient-to-b from-[#020617] to-[#070a13] border-t border-slate-900">
        <h3 className="text-2xl font-black text-white mb-6 tracking-tight">Tertarik Mengembangkan Kerja Sama?</h3>
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/kontak-kami")}
          className="bg-[#00aa66] text-white px-10 py-3.5 rounded-full font-bold shadow-lg shadow-[#00aa66]/10 hover:bg-[#00CC7A] transition-all cursor-pointer text-sm tracking-wide"
        >
          Hubungi Manajemen Kami
        </motion.button>
      </section>
    </div>
  );
};

export default ProfilePage;