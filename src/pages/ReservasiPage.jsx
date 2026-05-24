import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaUser, FaPhoneAlt, FaClock, FaDiceD6, FaMoneyBillWave } from "react-icons/fa";
import { supabase } from "../supabaseClient";

export default function ReservasiPage() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState("");
  
  const [form, setForm] = useState({ 
    nama: "", 
    nohp: "", 
    durasi: 1, 
    tanggal: new Date().toISOString().split('T')[0], 
    jam: "14:00",
    meja: "Meja 1"
  });

  const daftarMeja = ["Meja 1", "Meja 2", "Meja 3", "Meja 4", "Meja 5", "Meja 6", "Meja 7", "Meja 8", "Meja 9", "Meja 10"];

  const hitungEstimasiHarga = () => {
    const hargaPerJam = form.meja.toLowerCase().includes("vip") ? 80000 : 50000;
    return hargaPerJam * form.durasi;
  };

  // 🔥 CEK APAKAH MEJA SUDAH DIPESAN PADA TANGGAL DAN JAM TERSEBUT
  const cekKetersediaanMeja = async () => {
    try {
      const { data, error } = await supabase
        .from("reservasi_billiard")
        .select("*")
        .eq("nomor_meja", form.meja)
        .eq("tanggal_main", form.tanggal)
        .eq("jam_mulai", form.jam)
        .in("status_pemesanan", ["Pending", "Playing"]);

      if (error) throw error;
      
      return data && data.length > 0 ? false : true;
    } catch (error) {
      console.error("Error cek ketersediaan:", error);
      return true; // Jika error, anggap tersedia
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    // Validasi form
    if (!form.nama.trim()) {
      alert("Harap masukkan nama lengkap!");
      return;
    }
    if (!form.nohp.trim()) {
      alert("Harap masukkan nomor WhatsApp!");
      return;
    }
    
    setLoading(true);

    try {
      // 1. Cek ketersediaan meja terlebih dahulu
      const mejaTersedia = await cekKetersediaanMeja();
      if (!mejaTersedia) {
        alert(`⚠️ Meja ${form.meja} sudah dipesan pada tanggal ${form.tanggal} jam ${form.jam}. Silakan pilih meja atau waktu lain.`);
        setLoading(false);
        return;
      }

      // 2. Buat ID Booking unik
      const idBooking = "RC-" + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);
      
      // 3. Generate ID numerik (pakai timestamp untuk menghindari konflik)
      const idNumerik = Date.now();

      // 4. Struktur data yang sesuai dengan tabel di Supabase
      const dataPesanan = {
        id: idNumerik,
        id_booking: idBooking,
        nomor_meja: form.meja,
        nama_pelanggan: form.nama.trim(),
        status_pemesanan: "Pending",
        durasi_bermain: Number(form.durasi),
        tanggal_main: form.tanggal,
        jam_mulai: form.jam,
        no_whatsapp: form.nohp,
        total: 0, // Akan diisi saat start main
        pesanan_fb: [], // Pesanan makanan & minuman
        created_at: new Date().toISOString()
      };

      console.log("Menyimpan data reservasi:", dataPesanan);

      // 5. Simpan ke Supabase
      const { data, error } = await supabase
        .from("reservasi_billiard")
        .insert([dataPesanan])
        .select();

      if (error) throw error;

      console.log("Reservasi berhasil disimpan:", data);
      
      setBookingId(idBooking);
      setLoading(false);
      setSuccess(true);
      
    } catch (error) {
      console.error("Gagal menyimpan data ke Supabase:", error);
      setLoading(false);
      
      // Menampilkan pesan error yang lebih jelas
      let pesanError = "Terjadi kesalahan sistem: ";
      if (error.message.includes("duplicate key")) {
        pesanError += "ID sudah terpakai, silakan coba lagi.";
      } else if (error.message.includes("row-level security")) {
        pesanError += "Masalah keamanan database. Silakan hubungi admin.";
      } else {
        pesanError += error.message;
      }
      alert(pesanError);
    }
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
                value={form.nama}
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
                placeholder="Contoh: 081234567890" 
                required 
                value={form.nohp}
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
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mengirim ke Kasir...
              </>
            ) : (
              "Konfirmasi & Kirim Ke Kasir"
            )}
          </button>
        </form>
      </div>

      {/* Modal Popup Sukses Booking */}
      {success && (
        <div className="fixed inset-0 z-[150] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6 animate-fade-in">
            <FaCheckCircle className="text-[#00ff99] text-6xl mx-auto drop-shadow-[0_0_15px_rgba(0,255,153,0.3)]" />
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Booking Berhasil!</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Data Anda telah masuk ke sistem monitor kasir Royal Cue Studio.
              </p>
              <p className="text-sm text-[#00ff99] font-mono mt-2">
                Kode Booking: {bookingId}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Silakan sebutkan nama Anda saat tiba di meja kasir.
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}