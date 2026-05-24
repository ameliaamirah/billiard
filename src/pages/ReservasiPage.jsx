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

  const getHargaPerJam = (meja) => {
    return meja.toLowerCase().includes("vip") ? 80000 : 50000;
  };

  const hitungEstimasiHarga = () => {
    return getHargaPerJam(form.meja) * form.durasi;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!form.nama.trim()) return alert("Masukkan nama!");
    if (!form.nohp.trim()) return alert("Masukkan nomor WhatsApp!");

    setLoading(true);

    try {
      const idBooking = "RC-" + Date.now().toString().slice(-8);
      const idNumerik = Date.now();

      // DATA MINIMAL - HANYA FIELD YANG PASTI ADA
      const dataPesanan = {
        id: idNumerik,
        nomorMeja: form.meja,
        namaPelanggan: form.nama.trim(),
        statusPemesanan: "Pending",
        durasiBermain: Number(form.durasi)
      };

      console.log("Menyimpan data:", dataPesanan);

      const { error, data } = await supabase
        .from("reservasi_billiard")
        .insert([dataPesanan])
        .select();

      if (error) {
        console.error("Supabase error:", error);
        alert("Error: " + error.message);
        return;
      }

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

  return (
    <div className="min-h-screen bg-[#020a05] text-white pt-28 pb-16 px-6 flex items-center justify-center">
      <div className="max-w-xl w-full bg-slate-950/40 border border-slate-800/80 backdrop-blur-xl p-8 sm:p-10 rounded-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black">Reservasi <span className="text-[#00ff99]">Meja</span></h2>
          <p className="text-xs text-slate-400">Pesanan langsung ke kasir real-time</p>
        </div>

        <form onSubmit={handleBooking} className="space-y-5">
          <div>
            <label className="text-[11px] font-bold text-[#00ff99]">NAMA LENGKAP</label>
            <input type="text" placeholder="Nama Anda" required value={form.nama}
              className="w-full bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-white focus:border-[#00ff99] outline-none"
              onChange={e => setForm({...form, nama: e.target.value})} />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#00ff99]">NO. WHATSAPP</label>
            <input type="tel" placeholder="081234567890" required value={form.nohp}
              className="w-full bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-white focus:border-[#00ff99] outline-none"
              onChange={e => setForm({...form, nohp: e.target.value})} />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#00ff99]">PILIH MEJA</label>
            <select value={form.meja} className="w-full bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-white outline-none cursor-pointer"
              onChange={e => setForm({...form, meja: e.target.value})}>
              {daftarMeja.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[#00ff99]">TANGGAL</label>
              <input type="date" value={form.tanggal} required
                className="w-full bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-white focus:border-[#00ff99] outline-none"
                onChange={e => setForm({...form, tanggal: e.target.value})} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#00ff99]">JAM MULAI</label>
              <input type="time" value={form.jam} required
                className="w-full bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-white focus:border-[#00ff99] outline-none"
                onChange={e => setForm({...form, jam: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#00ff99]">DURASI (JAM)</label>
            <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
              <button type="button" onClick={() => setForm({...form, durasi: Math.max(1, form.durasi - 1)})}
                className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg text-xl font-bold cursor-pointer transition">
                -
              </button>
              <span className="font-bold"><FaClock className="inline mr-2 text-[#00ff99]" />{form.durasi} Jam</span>
              <button type="button" onClick={() => setForm({...form, durasi: form.durasi + 1})}
                className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg text-xl font-bold cursor-pointer transition">
                +
              </button>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#00ff99]">ESTIMASI TOTAL</p>
              <p className="text-[10px] text-slate-500">{getHargaPerJam(form.meja) === 80000 ? "VIP: Rp80.000/jam" : "Reguler: Rp50.000/jam"}</p>
            </div>
            <span className="text-xl font-bold text-[#00ff99]">Rp {hitungEstimasiHarga().toLocaleString("id-ID")}</span>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#00aa66] hover:bg-[#00cc7a] font-bold py-4 rounded-xl transition-all disabled:opacity-50 cursor-pointer">
            {loading ? "Memproses..." : "KONFIRMASI BOOKING"}
          </button>
        </form>
      </div>

      {success && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center max-w-md">
            <FaCheckCircle className="text-[#00ff99] text-6xl mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Booking Berhasil!</h3>
            <p className="text-slate-400 text-sm">Kode Booking: <span className="text-[#00ff99] font-mono">{bookingId}</span></p>
            <p className="text-slate-400 text-xs mt-4">Silakan sebutkan nama Anda saat tiba di kasir.</p>
            <button onClick={() => { setSuccess(false); navigate("/"); }}
              className="mt-6 w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-[#00ff99] transition cursor-pointer">
              Kembali ke Beranda
            </button>
          </div>
        </div>
      )}
    </div>
  );
}