import React from "react";
import { motion } from "framer-motion";
import { 
  FaCrown, 
  FaShieldAlt, 
  FaGamepad, 
  FaCode, 
  FaPaintBrush, 
  FaNetworkWired,
  FaUsers
} from "react-icons/fa";

const StrukturPage = () => {
  // Variasi Animasi Framer Motion untuk efek smooth loading
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  // Data Struktur Organisasi Komite Royal Cue Studio
  const eliteTeam = {
    ceo: { 
      name: "Anggy Mutydinata", 
      role: "Chief Executive Officer & Founder", 
      // UBAH: Mengganti arbitrary shadow Tailwind custom yang rentan error dengan shadow-color bawaan Tailwind untuk stabilitas UI
      icon: <FaCrown className="text-amber-400 text-3xl shadow-lg shadow-amber-500/20" />, 
      desc: "Lead Visionary di balik perancangan bisnis serta integrasi ekosistem digital pada arena Royal Cue Studio." 
    },
    managers: [
      { 
        name: "Devon Wijaya, M.Kom", 
        role: "Supervising Advisor", 
        icon: <FaShieldAlt className="text-[#00ff99]" />, 
        desc: "Penasihat teknis utama dalam pengembangan sistem informasi, arsitektur aplikasi, dan standarisasi sistem." 
      },
      { 
        name: "Alex Bhaskara", 
        role: "Operational & Tournament Lead", 
        icon: <FaGamepad className="text-blue-400" />, 
        desc: "Pengawas operasional harian arena biliar, perawatan aset premium, dan manajemen kompetisi turnamen." 
      }
    ],
    executors: [
      { 
        name: "Budi Santoso", 
        role: "Lead Fullstack Developer", 
        icon: <FaCode />, 
        task: "React & Supabase Billing Engine" 
      },
      { 
        name: "Siti Rahma", 
        role: "UI/UX & Motion Designer", 
        icon: <FaPaintBrush />, 
        task: "Interface & Animation Asset" 
      },
      { 
        name: "Rian Hidayat", 
        role: "Network & IoT Engineer", 
        icon: <FaNetworkWired />, 
        task: "Hardware Integration & LAN Tester" 
      }
    ]
  };

  return (
    <div className="bg-[#020617] min-h-screen pt-36 text-slate-100 pb-24 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-5">
        
        {/* HEADER PAGE */}
        <div className="text-center mb-20">
          <h2 className="text-[#00ff99] font-bold tracking-[0.2em] uppercase text-xs mb-3">Management Committee</h2>
          <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">Struktur Direksi & Pengembang</h3>
          <p className="text-slate-500 mt-3 text-xs md:text-sm max-w-xl mx-auto font-medium leading-relaxed">
            Kolaborasi tim profesional dan ahli di balik layar arsitektur manajemen digital Royal Cue Studio.
          </p>
        </div>

        {/* LEVEL 1: CEO / FOUNDER */}
        <div className="flex justify-center mb-24 relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-b from-[#0b1329] to-[#070a13] border-2 border-[#00aa66] text-white p-8 rounded-[2rem] shadow-2xl shadow-[#00aa66]/5 text-center max-w-md w-full relative z-10"
          >
            <div className="w-16 h-16 bg-[#00aa66]/10 border border-[#00aa66]/30 rounded-full mx-auto flex items-center justify-center mb-5 shadow-inner">
              {eliteTeam.ceo.icon}
            </div>
            <h4 className="text-2xl font-black tracking-wide text-white">{eliteTeam.ceo.name}</h4>
            <p className="text-[#00ff99] text-[10px] uppercase font-black tracking-widest mt-1.5">{eliteTeam.ceo.role}</p>
            <p className="text-slate-400 text-xs mt-5 italic border-t border-slate-800 pt-4 font-light leading-relaxed">
              {eliteTeam.ceo.desc}
            </p>
          </motion.div>
          
          {/* Garis Bagan Konektor Vertikal Tengah (Desktop) */}
          <div className="absolute top-full left-1/2 w-0.5 h-24 bg-gradient-to-b from-[#00aa66]/40 to-[#00aa66]/10 -translate-x-1/2 hidden md:block" />
        </div>

        {/* LEVEL 2: ADVISOR & OPERATIONAL MANAGERS */}
        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto mb-24 relative pt-6">
          {/* Garis Bagan Konektor Horizontal Desktop */}
          <div className="hidden md:block absolute top-0 left-1/4 right-1/4 h-0.5 bg-[#00aa66]/20" />
          
          {eliteTeam.managers.map((mgr, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="bg-[#0b1329]/60 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-start gap-5 relative group hover:border-[#00aa66]/60 hover:bg-[#0b1329] transition-all duration-300"
            >
              {/* Garis Vertikal Mini Menghubungkan ke Garis Horizontal Atas */}
              <div className="hidden md:block absolute bottom-full left-1/2 w-0.5 h-6 bg-[#00aa66]/20 -translate-x-1/2" />
              
              <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-xl text-slate-300 group-hover:bg-[#00aa66] group-hover:text-white group-hover:border-transparent transition-all duration-300 shrink-0">
                {mgr.icon}
              </div>
              <div>
                <h5 className="font-bold text-white text-base tracking-tight">{mgr.name}</h5>
                <p className="text-[#00ff99] text-[10px] font-black uppercase tracking-wider mt-0.5">{mgr.role}</p>
                <p className="text-slate-400 text-xs mt-2.5 leading-relaxed font-light">{mgr.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* LABEL TIM TEKNIS */}
        <div className="text-center mb-10 flex flex-col items-center justify-center">
          <div className="w-px h-12 bg-slate-800 mb-4 hidden md:block" />
          <span className="bg-slate-900/80 text-[#00ff99] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-800/80 shadow-md flex items-center gap-2">
            <FaUsers /> Core Technical & Production Team
          </span>
        </div>

        {/* LEVEL 3: EXECUTORS / TECHNICAL DEVELOPERS */}
        <motion.div 
          variants={staggerContainer} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {eliteTeam.executors.map((exe, index) => (
            <motion.div 
              key={index} 
              variants={fadeIn} 
              whileHover={{ scale: 1.02, y: -2 }}
              className="group bg-[#070a13] border border-dashed border-slate-800 p-6 rounded-2xl text-center shadow-sm hover:bg-[#0b1329]/50 hover:border-solid hover:border-slate-700 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-slate-900 text-slate-400 group-hover:text-[#00ff99] shadow-sm rounded-xl mx-auto flex items-center justify-center text-base mb-4 border border-slate-800 transition-colors">
                {exe.icon}
              </div>
              <h6 className="font-bold text-white text-sm tracking-tight">{exe.name}</h6>
              <p className="text-[#00ff99] text-[11px] font-semibold mt-0.5">{exe.role}</p>
              
              <div className="mt-4 bg-slate-950/80 rounded-xl py-2 px-3 border border-slate-900 text-slate-400 text-[11px] font-medium tracking-wide">
                {exe.task}
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
};

export default StrukturPage;