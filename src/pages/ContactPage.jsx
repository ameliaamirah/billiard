import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaClock, 
  FaPaperPlane,
  FaInstagram,
  FaWhatsapp,
  FaArrowRight
} from "react-icons/fa";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Integrasi masa depan ke Supabase / Database Engine
    console.log("Data dikirim:", formData);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: <FaPhoneAlt />,
      title: "Hubungi Kami",
      details: "+62 812-3456-7890",
      sub: "Respons cepat via WhatsApp",
      actionLabel: "Chat Sekarang",
      link: "https://wa.me/6281234567890"
    },
    {
      icon: <FaEnvelope />,
      title: "Email Resmi",
      details: "support@royalcuestudio.com",
      sub: "Untuk proposal & kerja sama event",
      actionLabel: "Kirim Email",
      link: "mailto:support@royalcuestudio.com"
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Lokasi Arena",
      details: "Jl. Jawa No. 10, Banyuwangi",
      sub: "Jawa Timur, Indonesia",
      actionLabel: "Buka Maps",
      link: "https://maps.google.com"
    },
    {
      icon: <FaClock />,
      title: "Jam Operasional",
      details: "10.00 WIB - 02.00 WIB",
      sub: "Buka setiap hari tanpa libur",
      actionLabel: "Lihat Jadwal VIP",
      link: "#"
    }
  ];

  return (
    <div className="bg-[#020617] min-h-screen pt-24 overflow-x-hidden text-slate-100">
      
      {/* SECTION 1: HERO HEADER - SINEMATIK GLOW */}
      <section className="py-20 px-5 bg-gradient-to-b from-[#091413] to-[#020617] text-white relative overflow-hidden text-center border-b border-slate-900">
        {/* Efek Ambient Neon Meja Billiard */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#00aa66] rounded-full blur-[140px] pointer-events-none"
        />
        
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-[#00ff99] font-bold tracking-[0.2em] uppercase mb-4 text-xs">Hubungi Kami</h2>
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">
            Ada Pertanyaan atau <br />
            Ingin <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff99] to-[#00aa66]">Reservasi Meja VIP?</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Tim administrasi kami siap mengamankan slot meja billiard premium Anda atau mendiskusikan kolaborasi turnamen dan kemitraan.
          </p>
        </div>
      </section>

      {/* SECTION 2: KONTEN UTAMA (INFO CARDS & FORMULIR PREMIUM) */}
      <section className="py-20 px-5 max-w-6xl mx-auto grid lg:grid-cols-12 gap-10 items-start relative z-10">
        
        {/* KIRI: INFORMASI KONTAK LIST (5 KOLOM) */}
        <div className="lg:col-span-5 grid gap-4">
          <div className="text-left mb-4">
            <h3 className="text-xl font-bold tracking-tight text-white">Hubungi Secara Langsung</h3>
            <p className="text-slate-500 text-xs mt-1">Gunakan salah satu saluran resmi di bawah ini untuk mendapatkan bantuan cepat.</p>
          </div>

          {contactInfo.map((info, idx) => (
            <a 
              href={info.link} 
              target="_blank" 
              rel="noopener noreferrer"
              key={idx} 
              className="bg-[#0b1329]/50 border border-slate-900 p-5 rounded-2xl flex gap-4 items-center justify-between group hover:border-[#00aa66]/40 hover:bg-[#0b1329] transition-all duration-300 shadow-sm"
            >
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-lg text-[#00ff99] shrink-0 group-hover:bg-[#00aa66] group-hover:text-white transition-all duration-300 shadow-inner">
                  {info.icon}
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{info.title}</h4>
                  <p className="text-white font-bold text-sm mt-0.5 group-hover:text-[#00ff99] transition-colors">{info.details}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5 font-light">{info.sub}</p>
                </div>
              </div>
              <div className="text-slate-600 group-hover:text-[#00ff99] transition-colors pr-1 hidden sm:block">
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          ))}

          {/* SOCIAL MEDIA CONNECTIONS */}
          <div className="bg-[#0b1329]/30 border border-slate-900 p-5 rounded-2xl flex items-center justify-between mt-2">
            <span className="text-xs font-bold text-slate-400 tracking-wide">Ikuti Komunitas Kami:</span>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#00aa66] hover:border-transparent transition-all shadow-sm">
                <FaInstagram size={15} />
              </a>
              <a href="#" className="w-9 h-9 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#00aa66] hover:border-transparent transition-all shadow-sm">
                <FaWhatsapp size={15} />
              </a>
            </div>
          </div>
        </div>

        {/* KANAN: FORMULIR HUBUNGI KAMI (7 KOLOM) */}
        <div className="lg:col-span-7 bg-[#0b1329]/40 p-8 md:p-10 rounded-[2.5rem] border border-slate-900/80 shadow-2xl backdrop-blur-xs relative overflow-hidden">
          {/* Ornamen Kilau Pojok */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00aa66]/5 rounded-bl-full pointer-events-none" />
          
          <h3 className="text-2xl font-black text-white tracking-tight mb-2">Kirim Pesan Enkripsi</h3>
          <p className="text-slate-400 text-xs md:text-sm mb-8 font-light">Isi formulir terintegrasi di bawah ini untuk terhubung ke dalam *dashboard* admin kami.</p>
          
          {isSubmitted && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-[#00aa66]/10 border border-[#00aa66]/30 text-[#00ff99] rounded-xl text-xs font-semibold backdrop-blur-md"
            >
              ✓ Transmisi Berhasil! Pesan Anda telah terkirim ke dalam sistem manajemen Royal Cue Studio.
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-5 relative z-10">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                <input 
                  type="text" name="name" required value={formData.name} onChange={handleChange}
                  placeholder="Contoh: Amelia Amirah" 
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00aa66] focus:bg-slate-950 transition-all text-white placeholder-slate-600"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alamat Email</label>
                <input 
                  type="email" name="email" required value={formData.email} onChange={handleChange}
                  placeholder="nama@email.com" 
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00aa66] focus:bg-slate-950 transition-all text-white placeholder-slate-600"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subjek / Kepentingan</label>
              <input 
                type="text" name="subject" required value={formData.subject} onChange={handleChange}
                placeholder="Booking Meja VIP / Sponsorship Turnamen / Keluhan" 
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00aa66] focus:bg-slate-950 transition-all text-white placeholder-slate-600"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Pesan Anda</label>
              <textarea 
                name="message" rows="5" required value={formData.message} onChange={handleChange}
                placeholder="Tuliskan spesifikasi pesanan meja, tanggal main, atau penawaran kerja sama di sini..." 
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#00aa66] focus:bg-slate-950 transition-all text-white placeholder-slate-600 resize-none leading-relaxed"
              ></textarea>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit"
              className="bg-[#00aa66] text-white py-3.5 px-6 rounded-xl font-bold shadow-lg shadow-[#00aa66]/10 hover:bg-[#00CC7A] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest mt-2 cursor-pointer"
            >
              <FaPaperPlane className="text-[10px]" /> Kirim Pesan Sekarang
            </motion.button>
          </form>
        </div>
      </section>

      {/* SECTION 3: MAPS EMBEDDED - DISESUAIKAN TEMA DISKRET */}
      <section className="w-full h-[420px] bg-slate-950 relative border-t border-slate-900 filter invert-[90%] hue-rotate-180 brightness-95 contrast-110 opacity-80 hover:opacity-100 hover:filter-none transition-all duration-700">
        <iframe 
          title="Royal Cue Studio Location Map"
          src="https://www.google.com/maps/embed?pb=!16m12!1m3!1d15792.836854580227!2d114.3541818!3d-8.2820542!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        ></iframe>
      </section>
    </div>
  );
};

export default ContactPage;