import React from "react";
import { motion } from "framer-motion";
import { FaEye, FaRocket, FaHandshake, FaLightbulb, FaChess } from "react-icons/fa";

const AboutPage = () => {
  const nilaiInti = [
    { icon: <FaHandshake />, title: "Pelayanan Premium", desc: "Kami mengutamakan kenyamanan pelanggan dengan menyediakan fasilitas meja dan stik kelas turnamen." },
    { icon: <FaLightbulb />, title: "Inovasi Digital", desc: "Integrasi sistem booking online dan billing otomatis berbasis IoT untuk kemudahan bermain." },
    { icon: <FaChess />, title: "Komunitas & Sportivitas", desc: "Mendukung perkembangan atlet billiard lokal melalui turnamen berkala dan coaching clinic." }
  ];

  return (
    <div className="bg-[#020617] min-h-screen pt-32 text-slate-100">
      <section className="py-20 px-5 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-[#00ff99] font-bold tracking-widest uppercase text-xs mb-3">Tentang Kami</h2>
          <h3 className="text-3xl font-black text-white mb-5 tracking-tight">Modernisasi Arena Billiard Konvensional</h3>
          <p className="text-slate-400 text-base leading-relaxed mb-6">
            Royal Cue Billiard Studio bukan sekadar tempat bermain biasa. Kami merancang ekosistem digital terintegrasi...
          </p>
        </motion.div>
        <div className="relative">
          <img src="/images/profile.png" alt="Arena" className="rounded-2xl shadow-2xl border border-slate-800 w-full h-[350px] object-cover" />
        </div>
      </section>

      {/* Visi Misi */}
      <section className="py-20 px-5 bg-[#090f1d]/40 border-y border-slate-900">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="p-10 rounded-[2.5rem] bg-[#0b1329]/60 border border-slate-800">
             <FaEye className="text-4xl text-[#00ff99] mb-6"/>
             <h3 className="text-2xl font-bold mb-4 text-white">Visi Kami</h3>
             <p className="text-slate-400 text-sm">Menjadi pionir digitalisasi manajemen olahraga billiard nasional.</p>
          </div>
          <div className="p-10 rounded-[2.5rem] bg-[#070a13] border border-slate-800">
             <FaRocket className="text-4xl text-[#00ff99] mb-6"/>
             <h3 className="text-2xl font-bold mb-4 text-white">Misi Kami</h3>
             <ul className="text-slate-400 text-sm space-y-2">
                <li>✓ Sistem manajemen billing IoT.</li>
                <li>✓ Kemudahan akses pemesanan.</li>
             </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;