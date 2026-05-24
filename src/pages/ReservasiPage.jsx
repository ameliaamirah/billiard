import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaUser, FaPhoneAlt, FaClock, FaDiceD6, FaMoneyBillWave } from "react-icons/fa";

export default function ReservasiPage() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({ 
    nama: "", 
    nohp: "", 
    durasi: 1, 
    tanggal: new Date().toISOString().split('T')[0], 
    jam: "14:00",
    meja: "Meja 1"
  });

  const daftarMeja = ["Meja 1", "Meja 2", "Meja 3", "Meja 4", "Meja VIP 1", "Meja VIP 2"];

  const hitungEstimasiHarga = () => {
    const hargaPerJam = form.meja.toLowerCase().includes("vip") ? 80000 : 50000;
    return hargaPerJam * form.durasi;
  };

  const handleBooking = (e) => {
    e.preventDefault();
    setLoading(true); 

    // Simulasi delay pengerjaan 600ms agar efek loading tombol tetap bekerja dengan mulus
    setTimeout(() => {
      try {
        const idBooking = "RC-" + Math.floor(100000 + Math.random() * 900000);
        const totalEstimasi = hitungEstimasiHarga();

        // 💾 AMBIL DATA LAMA DI LOCALSTORAGE (JIKA ADA)
        const dataLama = JSON.parse(localStorage.getItem("reservasi_billiard")) || [];

        // STRUKTUR DATA: Disesuaikan agar terbaca sempurna oleh filter KasirDashboard
        const dataPesanan = {
          id: Date.now(), // Gunakan timestamp murni sebagai index key utama di React
          idBooking: idBooking,
          namaPelanggan: form.nama.trim(),
          nomorWhatsApp: form.nohp,
          tanggalMain: form.tanggal,
          jamMulai: "", // Kosong, nanti Kasir yang menentukan saat klik "Start"
          jamSelesai: "",
          durasiBermain: Number(form.durasi),
          nomorMeja: form.meja,
          total: totalEstimasi,
          statusPemesanan: "Pending", // Status awal wajib Pending agar masuk antrean
          status: "Pending",
          waktuDibuat: new Date().toLocaleString("id-ID")
        };

        // GABUNGKAN DATA BARU DI ATAS DATA LAMA
        const dataDiperbarui = [dataPesanan, ...dataLama];

        // SIMPAN KE LOCALSTORAGE
        localStorage.setItem("reservasi_billiard", JSON.stringify(dataDiperbarui));

        setLoading(false); 
        setSuccess(true);
      } catch (error) {
        console.error("Gagal menyimpan data:", error);
        setLoading(false);
        alert("Terjadi kesalahan sistem saat menyimpan data boking lokal.");
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#020a05] text-white pt-28 pb-16 px-6 relative overflow-hidden flex items-center justify-center">
      {/* Efek Lingkaran Glow Hijau di Latar Belakang */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00CC7A]/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Box Form Utama */}
      <div className="max-w-xl w-full bg-slate-950/40 border border-slate-800/80 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black tracking-tight mb-2">
            Reservasi <span className="bg-gradient-to-r from-[#00ff99] to-[#66ffa6] bg-clip-text text-transparent">Langsung</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            Pesanan Anda dikirim langsung ke komputer kasir secara real-time
          </p>
        </div>

        <form onSubmit={handleBooking} className="space-y-6">
          {/* Input Nama Lengkap */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-[#00ff99]">Nama Lengkap</label>
            <div className="relative flex items-center">
              <FaUser className="absolute left-4 text-slate-500 text-sm" />
              <input 
                type="text" 
                placeholder="Masukkan nama Anda..." 
                required 
                className="w-full bg-slate-900/60 border border-slate-800 p-4 pl-12 rounded-xl text-white outline-none focus:border-[#00ff99] transition-all font-medium text-sm" 
                onChange={e => setForm({...form, nama: e.target.value})} 
              />
            </div>
          </div>

          {/* Input Nomor WhatsApp */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-[#00ff99]">Nomor WhatsApp</label>
            <div className="relative flex items-center">
              <FaPhoneAlt className="absolute left-4 text-slate-500 text-xs" />
              <input 
                type="tel" 
                placeholder="Contoh: 081234567xxx" 
                required 
                className="w-full bg-slate-900/60 border border-slate-800 p-4 pl-12 rounded-xl text-white outline-none focus:border-[#00ff99] transition-all font-medium text-sm" 
                onChange={e => setForm({...form, nohp: e.target.value})} 
              />
            </div>
          </div>

          {/* Select Nomor Meja */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-[#00ff99]">Pilih Nomor Meja</label>
            <div className="relative flex items-center">
              <FaDiceD6 className="absolute left-4 text-slate-500 text-sm" />
              <select 
                value={form.meja} 
                className="w-full bg-slate-900/60 border border-slate-800 p-4 pl-12 rounded-xl text-white outline-none focus:border-[#00ff99] transition-all font-medium text-sm cursor-pointer appearance-none" 
                onChange={e => setForm({...form, meja: e.target.value})}
              >
                {daftarMeja.map(m => <option key={m} value={m} className="bg-slate-950">{m}</option>)}
              </select>
            </div>
          </div>

          {/* Grid Tanggal & Jam */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[#00ff99]">Tanggal</label>
              <input 
                type="date" 
                value={form.tanggal} 
                required 
                className="w-full bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-white outline-none focus:border-[#00ff99] transition-all font-medium text-sm" 
                onChange={e => setForm({...form, tanggal: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[#00ff99]">Jam Mulai</label>
              <input 
                type="time" 
                value={form.jam} 
                required 
                className="w-full bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-white outline-none focus:border-[#00ff99] transition-all font-medium text-sm" 
                onChange={e => setForm({...form, jam: e.target.value})} 
              />
            </div>
          </div>

          {/* Counter Durasi Bermain */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-[#00ff99]">Durasi Bermain</label>
            <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
              <button 
                type="button" 
                onClick={() => setForm({...form, durasi: Math.max(1, form.durasi - 1)})} 
                className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-black rounded-lg transition-all text-lg cursor-pointer"
              >
                -
              </button>
              <span className="font-black text-base text-white flex items-center gap-2">
                <FaClock className="text-[#00ff99] text-sm" /> {form.durasi} Jam
              </span>
              <button 
                type="button" 
                onClick={() => setForm({...form, durasi: form.durasi + 1})} 
                className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-black rounded-lg transition-all text-lg cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Kotak Info Tarif & Estimasi Biaya */}
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

          {/* Tombol Submit */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#00aa66] hover:bg-[#00cc7a] text-white font-black text-sm py-4 rounded-xl transition-all duration-300 shadow-xl shadow-[#00aa66]/20 hover:shadow-[#00aa66]/40 active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? "Mengirim ke Kasir..." : "Konfirmasi & Kirim Ke Kasir"}
          </button>
        </form>
      </div>

      {/* Modal Popup Sukses Boking */}
      {success && (
        <div className="fixed inset-0 z-[150] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
            <FaCheckCircle className="text-[#00ff99] text-6xl mx-auto drop-shadow-[0_0_15px_rgba(0,255,153,0.3)]" />
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Booking Berhasil!</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Data Anda telah masuk ke sistem monitor kasir Royal Cue Studio. Silakan sebutkan nama Anda saat tiba di meja kasir.
              </p>
            </div>
            <button 
              onClick={() => { setSuccess(false); navigate("/"); }} 
              className="w-full bg-white text-black font-black text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-[#00ff99] transition-colors duration-300"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      )}
    </div>
  );
}