import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaUser, FaPhoneAlt, FaClock, FaDiceD6, FaMoneyBillWave } from "react-icons/fa";

// 👇 SEKARANG URL BACKEND OTOMATIS DAN DINAMIS
const BACKEND_URL = window.location.hostname === "localhost"
  ? "http://localhost:4000"
  : "https://royal-cue-backend.onrender.com"; // 👈 URL Live Render/Railway Backend Kamu

export default function ReservasiPage() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State Form Utama Pelanggan
  const [form, setForm] = useState({ 
    nama: "", 
    nohp: "", 
    durasi: 1, 
    tanggal: new Date().toISOString().split('T')[0], 
    jam: "14:00",
    meja: "Meja 1"
  });

  // Daftar Pilihan Nomor Meja
  const daftarMeja = ["Meja 1", "Meja 2", "Meja 3", "Meja 4", "Meja VIP 1", "Meja VIP 2"];
  
  // Endpoint disinkronkan menggunakan BACKEND_URL dinamis
  const URL_DATABASE = `${BACKEND_URL}/api/reservasi`;

  /* ========================================================
      🔥 FUNGSI HITUNG ESTIMASI HARGA LIVE (REAL-TIME)
     ======================================================== */
  const hitungEstimasiHarga = () => {
    const hargaPerJam = form.meja.toLowerCase().includes("vip") ? 80000 : 50000;
    return hargaPerJam * form.durasi;
  };

  /* ========================================================
      FUNGSI KIRIM DATA RESERVASI KE KASIR
     ======================================================== */
  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true); 

    const idBooking = "RC-" + Math.floor(100000 + Math.random() * 900000);

    const dataPesanan = {
      id: idBooking,
      namaPelanggan: form.nama,
      nomorWhatsApp: form.nohp,
      tanggalMain: form.tanggal,
      jamMulai: form.jam,
      durasiBermain: form.durasi,
      nomorMeja: form.meja,
      statusPemesanan: "Pending", 
      waktuDibuat: new Date().toISOString() 
    };

    try {
      const response = await fetch(URL_DATABASE, {
        method: "POST",
        body: JSON.stringify(dataPesanan),
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        setLoading(false); 
        setSuccess(true);
      } else {
        throw new Error("Respon server gagal");
      }
    } catch (error) {
      console.error("Gagal mengirim data:", error);
      setLoading(false); 
      // 👇 Pesan alert disesuaikan agar informatif baik saat local test maupun live prod
      alert(`Gagal terhubung ke server backend kasir.\n\nJika di hosting, pastikan web service backend Anda di Render/Railway aktif.\nJika di lokal, pastikan server Node.js menyala.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#020a05] text-white pt-28 pb-16 px-6 relative overflow-hidden flex items-center justify-center">
      
      {/* AKSEN EMERALD GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00CC7A]/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* KOTAK FORMULIR */}
      <div className="max-w-xl w-full bg-slate-950/40 border border-slate-800/80 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-2xl relative z-10 shadow-[#00CC7A]/5">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black tracking-tight mb-2">
            Reservasi <span className="bg-gradient-to-r from-[#00ff99] to-[#66ffa6] bg-clip-text text-transparent">Langsung</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            Pesanan Anda dikirim langsung ke komputer kasir secara real-time
          </p>
        </div>

        <form onSubmit={handleBooking} className="space-y-6">
          
          {/* INPUT: NAMA LENGKAP */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-[#00ff99]">Nama Lengkap</label>
            <div className="relative flex items-center">
              <FaUser className="absolute left-4 text-slate-500 text-sm" />
              <input type="text" placeholder="Masukkan nama Anda..." required className="w-full bg-slate-900/60 border border-slate-800 p-4 pl-12 rounded-xl text-white outline-none focus:border-[#00ff99] focus:bg-slate-900 transition-all font-medium text-sm" onChange={e => setForm({...form, nama: e.target.value})} />
            </div>
          </div>

          {/* INPUT: WHATSAPP */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-[#00ff99]">Nomor WhatsApp</label>
            <div className="relative flex items-center">
              <FaPhoneAlt className="absolute left-4 text-slate-500 text-xs" />
              <input type="tel" placeholder="Contoh: 081234567xxx" required className="w-full bg-slate-900/60 border border-slate-800 p-4 pl-12 rounded-xl text-white outline-none focus:border-[#00ff99] focus:bg-slate-900 transition-all font-medium text-sm" onChange={e => setForm({...form, nohp: e.target.value})} />
            </div>
          </div>

          {/* INPUT: PILIH NOMOR MEJA */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-[#00ff99]">Pilih Nomor Meja</label>
            <div className="relative flex items-center">
              <FaDiceD6 className="absolute left-4 text-slate-500 text-sm" />
              <select value={form.meja} className="w-full bg-slate-900/60 border border-slate-800 p-4 pl-12 rounded-xl text-white outline-none focus:border-[#00ff99] focus:bg-slate-900 transition-all font-medium text-sm cursor-pointer appearance-none" onChange={e => setForm({...form, meja: e.target.value})}>
                {daftarMeja.map(m => <option key={m} value={m} className="bg-slate-950">{m}</option>)}
              </select>
            </div>
          </div>

          {/* INPUT: TANGGAL & JAM */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[#00ff99]">Tanggal</label>
              <input type="date" value={form.tanggal} required className="w-full bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-white outline-none focus:border-[#00ff99] transition-all font-medium text-sm" onChange={e => setForm({...form, tanggal: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[#00ff99]">Jam Mulai</label>
              <input type="time" value={form.jam} required className="w-full bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-white outline-none focus:border-[#00ff99] transition-all font-medium text-sm" onChange={e => setForm({...form, jam: e.target.value})} />
            </div>
          </div>

          {/* INPUT: DURASI BERMAIN */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-[#00ff99]">Durasi Bermain</label>
            <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
              <button type="button" onClick={() => setForm({...form, durasi: Math.max(1, form.durasi - 1)})} className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-black rounded-lg transition-all text-lg cursor-pointer">-</button>
              <span className="font-black text-base text-white flex items-center gap-2">
                <FaClock className="text-[#00ff99] text-sm" /> {form.durasi} Jam
              </span>
              <button type="button" onClick={() => setForm({...form, durasi: form.durasi + 1})} className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-black rounded-lg transition-all text-lg cursor-pointer">+</button>
            </div>
          </div>

          {/* 🔥 BOX INFO ESTIMASI HARGA LIVE */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex justify-between items-center my-4">
            <div className="space-y-0.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#00ff99] flex items-center gap-1.5">
                <FaMoneyBillWave /> Estimasi Total Biaya
              </p>
              <p className="text-[11px] text-slate-500 font-bold">
                {form.meja.toLowerCase().includes("vip") ? "Tarif VIP: Rp 80.000 / Jam" : "Tarif Reguler: Rp 50.000 / Jam"}
              </p>
            </div>
            <span className="text-xl font-black text-[#00ff99] tracking-tight">
              Rp {hitungEstimasiHarga().toLocaleString("id-ID")}
            </span>
          </div>

          {/* TOMBOL SUBMIT */}
          <button type="submit" disabled={loading} className="w-full bg-[#00aa66] hover:bg-[#00cc7a] text-white font-black text-sm py-4 rounded-xl transition-all duration-300 shadow-xl shadow-[#00aa66]/20 hover:shadow-[#00aa66]/40 active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
            {loading ? "Mengirim ke Kasir..." : "Konfirmasi & Kirim Ke Kasir"}
          </button>
        </form>
      </div>

      {/* POPUP PANEL SUKSES */}
      {success && (
        <div className="fixed inset-0 z-[150] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
            <FaCheckCircle className="text-[#00ff99] text-6xl mx-auto drop-shadow-[0_0_15px_rgba(0,255,153,0.3)]" />
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Booking Berhasil!</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Data Anda telah masuk ke sistem monitor kasir Royal Cue Studio. Silakan sebutkan nama Anda saat tiba di meja kasir arena bermain biliar.
              </p>
            </div>
            <button onClick={() => { setSuccess(false); navigate("/"); }} className="w-full bg-white text-black font-black text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-[#00ff99] transition-colors duration-300">
              Kembali ke Beranda
            </button>
          </div>
        </div>
      )}
    </div>
  );
}