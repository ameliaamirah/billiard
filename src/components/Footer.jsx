import React from "react";
import { FaInstagram, FaWhatsapp, FaFacebook, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#070a13] text-slate-300 border-t border-slate-900 pt-16 pb-8 px-5">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        
        {/* KOLOM 1: BRAND */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <img src="/images/logo.png" alt="Logo" className="h-8 w-auto filter brightness-110" />
            <h2 className="text-white font-black text-xl tracking-tight">
              Royal Cue <span className="text-[#00ff99]">Studio</span>
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            Arena billiard premium dengan standar turnamen internasional. Tempat terbaik untuk mengasah skill dan bersantai bersama komunitas.
          </p>
          <div className="flex gap-4 mt-6">
            <a href="#" className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-[#00aa66] hover:text-white transition-all">
              <FaInstagram />
            </a>
            <a href="#" className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-[#00aa66] hover:text-white transition-all">
              <FaWhatsapp />
            </a>
            <a href="#" className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-[#00aa66] hover:text-white transition-all">
              <FaFacebook />
            </a>
          </div>
        </div>

        {/* KOLOM 2: NAVIGASI CEPAT */}
        <div>
          <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Navigasi</h3>
          <ul className="grid gap-3 text-sm">
            <li><button onClick={() => navigate("/")} className="hover:text-[#00ff99] transition-colors cursor-pointer">Beranda</button></li>
            <li><button onClick={() => navigate("/profil")} className="hover:text-[#00ff99] transition-colors cursor-pointer">Tentang Kami</button></li>
            <li><button onClick={() => navigate("/profil")} className="hover:text-[#00ff99] transition-colors cursor-pointer">Struktur Organisasi</button></li>
            <li><button onClick={() => navigate("/kontak-kami")} className="hover:text-[#00ff99] transition-colors cursor-pointer">Reservasi</button></li>
          </ul>
        </div>

        {/* KOLOM 3: JAM OPERASIONAL */}
        <div>
          <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Jam Buka</h3>
          <ul className="grid gap-3 text-sm">
            <li className="flex justify-between border-b border-slate-800/50 pb-2">
              <span>Senin - Jumat</span>
              <span className="text-white">10:00 - 02:00</span>
            </li>
            <li className="flex justify-between border-b border-slate-800/50 pb-2">
              <span>Sabtu - Minggu</span>
              <span className="text-[#00ff99]">10:00 - 03:00</span>
            </li>
            <li className="text-xs text-slate-500 mt-2 italic">*Buka di hari libur nasional</li>
          </ul>
        </div>

        {/* KOLOM 4: KONTAK SINGKAT */}
        <div>
          <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Alamat</h3>
          <ul className="grid gap-4 text-sm text-slate-400">
            <li className="flex gap-3 items-start">
              <FaMapMarkerAlt className="text-[#00ff99] mt-1 shrink-0" />
              <span>Jl. Jawa No. 10, Banyuwangi, Jawa Timur</span>
            </li>
            <li className="flex gap-3 items-center">
              <FaPhoneAlt className="text-[#00ff99] shrink-0" />
              <span>+62 812-3456-7890</span>
            </li>
            <li className="flex gap-3 items-center">
              <FaEnvelope className="text-[#00ff99] shrink-0" />
              <span>hello@royalcue.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="max-w-6xl mx-auto border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-medium tracking-wider text-slate-500 uppercase">
        <p>© 2026 Royal Cue Studio. All Rights Reserved.</p>
        <p>Built with ❤️ for Billiard Community</p>
      </div>
    </footer>
  );
};

export default Footer;