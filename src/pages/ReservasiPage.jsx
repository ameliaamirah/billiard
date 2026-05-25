import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaUser, FaPhoneAlt, FaClock, FaDiceD6, FaMoneyBillWave, FaExclamationTriangle } from "react-icons/fa";
import { supabase } from "../supabaseClient";

export default function ReservasiPage() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [errorJam, setErrorJam] = useState("");
  
  const [form, setForm] = useState({ 
    nama: "", 
    nohp: "", 
    durasi: 1, 
    tanggal: new Date().toISOString().split('T')[0], 
    jam: "14:00",
    meja: "Meja 1"
  });

  const daftarMeja = ["Meja 1", "Meja 2", "Meja 3", "Meja 4", "Meja 5", "Meja 6", "Meja 7", "Meja 8", "Meja 9", "Meja 10", "Meja VIP 1", "Meja VIP 2"];

  // JAM OPERASIONAL
  const JAM_BUKA = {
    weekday: { start: "10:00", end: "02:00" }, // Senin - Jumat
    weekend: { start: "10:00", end: "03:00" }  // Sabtu - Minggu
  };

  // Fungsi untuk mendapatkan hari dalam seminggu (0 = Minggu, 1 = Senin, ... 6 = Sabtu)
  const getDayType = (date) => {
    const day = new Date(date).getDay();
    // 0 = Minggu, 6 = Sabtu
    if (day === 0 || day === 6) return "weekend";
    return "weekday";
  };

  // Fungsi konversi string jam ke menit untuk perbandingan
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Fungsi untuk menangani jam yang melewati tengah malam (02:00 atau 03:00)
  const isTimeWithinRange = (time, startTime, endTime) => {
    const timeMinutes = timeToMinutes(time);
    let startMinutes = timeToMinutes(startTime);
    let endMinutes = timeToMinutes(endTime);

    // Jika endTime lebih kecil dari startTime (melewati tengah malam, misal 10:00 - 02:00)
    if (endMinutes < startMinutes) {
      // Jika waktu >= startTime (misal 22:00) ATAU waktu <= endTime (misal 02:00)
      return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
    }
    // Normal range (tidak melewati tengah malam)
    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  };

  // Cek apakah jam yang dipilih tersedia
  const isJamTersedia = (tanggal, jam) => {
    const dayType = getDayType(tanggal);
    const jamOperasional = JAM_BUKA[dayType];
    
    return isTimeWithinRange(jam, jamOperasional.start, jamOperasional.end);
  };

  // Mendapatkan pesan jam operasional untuk ditampilkan
  const getJamOperasionalMessage = () => {
    const dayType = getDayType(form.tanggal);
    const jamOperasional = JAM_BUKA[dayType];
    
    if (dayType === "weekend") {
      return `Jam operasional Sabtu-Minggu: ${jamOperasional.start} - ${jamOperasional.end} WIB`;
    }
    return `Jam operasional Senin-Jumat: ${jamOperasional.start} - ${jamOperasional.end} WIB`;
  };

  // Cek ketersediaan meja
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
      return true;
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    // Validasi nama
    if (!form.nama.trim()) {
      alert("Harap masukkan nama lengkap!");
      return;
    }
    
    // Validasi nomor WhatsApp
    if (!form.nohp.trim()) {
      alert("Harap masukkan nomor WhatsApp!");
      return;
    }
    
    // 🔥 VALIDASI JAM OPERASIONAL
    if (!isJamTersedia(form.tanggal, form.jam)) {
      const dayType = getDayType(form.tanggal);
      const jamOperasional = JAM_BUKA[dayType];
      alert(`⚠️ Maaf, jam operasional pada ${dayType === "weekend" ? "Sabtu-Minggu" : "Senin-Jumat"} adalah ${jamOperasional.start} - ${jamOperasional.end} WIB. Silakan pilih jam yang sesuai.`);
      return;
    }
    
    setLoading(true);
    setErrorJam("");

    try {
      // Cek ketersediaan meja
      const mejaTersedia = await cekKetersediaanMeja();
      if (!mejaTersedia) {
        alert(`⚠️ Meja ${form.meja} sudah dipesan pada tanggal ${form.tanggal} jam ${form.jam}. Silakan pilih meja atau waktu lain.`);
        setLoading(false);
        return;
      }

      const idBooking = "RC-" + Date.now().toString().slice(-8);
      const idNumerik = Date.now();

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
        pesanan_fb: [],
        created_at: new Date().toISOString()
      };

      console.log("Menyimpan data:", dataPesanan);

      const { error, data } = await supabase
        .from("reservasi_billiard")
        .insert([dataPesanan])
        .select();

      if (error) throw error;

      console.log("Berhasil:", data);
      setBookingId(idBooking);
      setSuccess(true);
      
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal booking: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk perubahan jam - langsung validasi
  const handleJamChange = (e) => {
    const newJam = e.target.value;
    setForm({...form, jam: newJam});
    
    if (!isJamTersedia(form.tanggal, newJam)) {
      setErrorJam(getJamOperasionalMessage());
    } else {
      setErrorJam("");
    }
  };

  // Handler untuk perubahan tanggal - reset validasi jam
  const handleTanggalChange = (e) => {
    const newTanggal = e.target.value;
    setForm({...form, tanggal: newTanggal});
    
    // Re-validasi jam setelah tanggal berubah
    if (!isJamTersedia(newTanggal, form.jam)) {
      setErrorJam(getJamOperasionalMessage());
    } else {
      setErrorJam("");
    }
  };

  const getHargaPerJam = (meja) => {
    return meja.toLowerCase().includes("vip") ? 80000 : 50000;
  };

  const hitungEstimasiHarga = () => {
    return getHargaPerJam(form.meja) * form.durasi;
  };

  return (
    <div className="min-h-screen bg-[#020a05] text-white pt-28 pb-16 px-6 relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00CC7A]/10 rounded-full blur-[150px] pointer-events-none z-0" />

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[#00ff99]">Tanggal</label>
              <input 
                type="date" 
                value={form.tanggal} 
                required 
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-white outline-none focus:border-[#00ff99] transition-all font-medium text-sm" 
                onChange={handleTanggalChange} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[#00ff99]">Jam Mulai</label>
              <input 
                type="time" 
                value={form.jam} 
                required 
                step="3600"
                className={`w-full bg-slate-900/60 border p-4 rounded-xl text-white outline-none transition-all font-medium text-sm ${
                  errorJam ? 'border-red-500 focus:border-red-500' : 'border-slate-800 focus:border-[#00ff99]'
                }`}
                onChange={handleJamChange} 
              />
              {errorJam && (
                <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-400">
                  <FaExclamationTriangle size={10} />
                  <span>{errorJam}</span>
                </div>
              )}
            </div>
          </div>

          {/* Informasi Jam Operasional */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3">
            <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-1">📅 Jam Operasional</p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Senin - Jumat:</span>
                <span className="text-white font-mono">10:00 - 02:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sabtu - Minggu:</span>
                <span className="text-[#00ff99] font-mono">10:00 - 03:00</span>
              </div>
            </div>
          </div>

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

          <button 
            type="submit" 
            disabled={loading || !!errorJam} 
            className={`w-full font-black text-sm py-4 rounded-xl transition-all duration-300 shadow-xl flex items-center justify-center gap-2 mt-4 disabled:opacity-50 ${
              errorJam 
                ? 'bg-slate-700 cursor-not-allowed' 
                : 'bg-[#00aa66] hover:bg-[#00cc7a] shadow-[#00aa66]/20 hover:shadow-[#00aa66]/40 active:scale-95 cursor-pointer'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mengirim ke Kasir...
              </>
            ) : (
              errorJam ? "Jam Tidak Tersedia" : "Konfirmasi & Kirim Ke Kasir"
            )}
          </button>
        </form>
      </div>

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
              className="w-full bg-white text-black font-black text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-[#00ff99] transition-colors duration-300 cursor-pointer"
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