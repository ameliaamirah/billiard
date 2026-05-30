import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCheckCircle, faUser, faPhoneAlt, faClock, 
  faDiceD6, faMoneyBillWave, faExclamationTriangle, faSpinner,
  faCalendarAlt, faPlus, faMinus
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../supabaseClient";

export default function ReservasiPage() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [reservasiAktif, setReservasiAktif] = useState([]);
  const [loadingMeja, setLoadingMeja] = useState(false);
  const [errorWaktu, setErrorWaktu] = useState("");
  
  const [form, setForm] = useState({ 
    nama: "", 
    nohp: "", 
    durasi: 1, 
    tanggal: new Date().toISOString().split('T')[0], 
    jam: "10:00",
    meja: "Meja 1"
  });

  const daftarMeja = ["Meja 1", "Meja 2", "Meja 3", "Meja 4", "Meja 5", "Meja 6", "Meja 7", "Meja 8", "Meja 9", "Meja 10", "Meja VIP 1", "Meja VIP 2"];

  // JAM OPERASIONAL (dalam menit)
  // Senin - Jumat: 10:00 - 02:00 (26*60 = 1560 menit)
  // Sabtu - Minggu: 10:00 - 03:00 (27*60 = 1620 menit)
  const JAM_BUKA = {
    weekday: { start: 10 * 60, end: 26 * 60 }, // 10:00 - 02:00
    weekend: { start: 10 * 60, end: 27 * 60 }  // 10:00 - 03:00
  };

  // Konversi jam ke menit
  const timeToMinutes = (time) => {
    if (!time) return 0;
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Konversi menit ke format HH:MM (DIPERBAIKI - tidak menampilkan 26:00)
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    // Jika jam >= 24, berarti esok hari
    if (hours >= 24) {
      const displayHour = hours - 24;
      return `${displayHour.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")} (esok hari)`;
    }
    
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  // Fungsi untuk mendapatkan hari dalam seminggu
  const getDayType = (date) => {
    const day = new Date(date).getDay();
    // 0 = Minggu, 6 = Sabtu
    if (day === 0 || day === 6) return "weekend";
    return "weekday";
  };

  // CEK APAKAH JAM + DURASI MASIH DALAM JAM OPERASIONAL
  const isWithinOperatingHours = (jamMulai, durasiJam, tanggal) => {
    const dayType = getDayType(tanggal);
    const jamMulaiMenit = timeToMinutes(jamMulai);
    const jamSelesaiMenit = jamMulaiMenit + (durasiJam * 60);
    const batasOperasional = JAM_BUKA[dayType].end;
    
    // Cek apakah jam mulai sebelum jam buka
    if (jamMulaiMenit < JAM_BUKA[dayType].start) {
      return { valid: false, reason: `Jam buka dimulai pukul 10:00` };
    }
    
    // Cek apakah selesai melebihi jam operasional
    if (jamSelesaiMenit > batasOperasional) {
      const maxJam = minutesToTime(batasOperasional);
      const maxDurasi = Math.floor((batasOperasional - jamMulaiMenit) / 60);
      if (maxDurasi <= 0) {
        return { 
          valid: false, 
          reason: `Jam mulai ${jamMulai} terlalu dekat dengan jam tutup.` 
        };
      }
      return { 
        valid: false, 
        reason: `Waktu bermain akan melebihi jam operasional (berakhir pukul ${maxJam}). Maksimal durasi ${maxDurasi} jam.` 
      };
    }
    
    return { valid: true, reason: "" };
  };

  // Generate daftar jam yang tersedia berdasarkan tanggal
  const getAvailableHours = (tanggal) => {
    const dayType = getDayType(tanggal);
    const endHourValue = JAM_BUKA[dayType].end / 60; // 26 atau 27
    const availableHours = [];
    
    // Jam 10:00 - 23:00 (siang sampai malam)
    for (let i = 10; i <= 23; i++) {
      const hourString = i.toString().padStart(2, "0") + ":00";
      availableHours.push({
        value: hourString,
        label: hourString
      });
    }
    
    // Jam dini hari (00:00, 01:00, 02:00, dst) sesuai batas
    for (let i = 0; i < endHourValue - 24; i++) {
      const hourString = i.toString().padStart(2, "0") + ":00";
      availableHours.push({
        value: hourString,
        label: `${hourString} (esok hari)`
      });
    }
    
    return availableHours;
  };

  // Filter jam berdasarkan durasi (agar tidak melebihi jam operasional)
  const getAvailableHoursWithDuration = (tanggal, durasi) => {
    const allHours = getAvailableHours(tanggal);
    return allHours.filter(hour => {
      const check = isWithinOperatingHours(hour.value, durasi, tanggal);
      return check.valid;
    });
  };

  // CEK TABRAKAN WAKTU (memperhitungkan durasi)
  const isTimeConflict = (existingJam, existingDurasi, newJam, newDurasi) => {
    if (!existingJam || existingJam === "-") return false;
    const existingStart = timeToMinutes(existingJam);
    const existingEnd = existingStart + (existingDurasi * 60);
    const newStart = timeToMinutes(newJam);
    const newEnd = newStart + (newDurasi * 60);
    
    return (newStart < existingEnd && newEnd > existingStart);
  };

  // CEK APAKAH MEJA TERSEDIA UNTUK RENTANG WAKTU TERTENTU
  const isMejaTersedia = (meja, jam, durasi) => {
    const reservasiMeja = reservasiAktif.filter(r => r.nomor_meja === meja);
    for (const reservasi of reservasiMeja) {
      if (isTimeConflict(reservasi.jam_mulai, reservasi.durasi_bermain, jam, durasi)) {
        return false;
      }
    }
    return true;
  };

  const fetchReservasiAktif = async (tanggal) => {
    setLoadingMeja(true);
    try {
      const { data, error } = await supabase
        .from("reservasi_billiard")
        .select("*")
        .eq("tanggal_main", tanggal)
        .in("status_pemesanan", ["Pending", "Playing", "Disetujui"]);

      if (error) throw error;
      setReservasiAktif(data || []);
      console.log("Reservasi aktif:", data);
    } catch (error) {
      console.error("Error fetch reservasi:", error);
    } finally {
      setLoadingMeja(false);
    }
  };

  const getMejaTersedia = (jam, durasi) => {
    return daftarMeja.filter(meja => isMejaTersedia(meja, jam, durasi));
  };

  const handleTanggalChange = async (e) => {
    const newTanggal = e.target.value;
    const defaultJam = "10:00";
    setForm({...form, tanggal: newTanggal, jam: defaultJam});
    setErrorWaktu("");
    await fetchReservasiAktif(newTanggal);
  };

  const handleJamChange = (e) => {
    const newJam = e.target.value;
    setForm({...form, jam: newJam});
    setErrorWaktu("");
    
    const check = isWithinOperatingHours(newJam, form.durasi, form.tanggal);
    if (!check.valid) {
      setErrorWaktu(check.reason);
    } else if (!isMejaTersedia(form.meja, newJam, form.durasi)) {
      setErrorWaktu(`⚠️ Meja ${form.meja} sudah dipesan pada jam tersebut`);
    }
  };

  const handleDurasiChange = (newDurasi) => {
    if (newDurasi < 1) return;
    if (newDurasi > 4) {
      alert("Durasi maksimal 4 jam!");
      return;
    }
    
    setForm({...form, durasi: newDurasi});
    setErrorWaktu("");
    
    const check = isWithinOperatingHours(form.jam, newDurasi, form.tanggal);
    if (!check.valid) {
      setErrorWaktu(check.reason);
    } else if (!isMejaTersedia(form.meja, form.jam, newDurasi)) {
      setErrorWaktu(`⚠️ Dengan durasi ${newDurasi} jam, meja ${form.meja} sudah dipesan`);
    }
  };

  const mejaTersediaList = getMejaTersedia(form.jam, form.durasi);
  const isMejaSaatIniTersedia = mejaTersediaList.includes(form.meja);
  const availableHours = getAvailableHoursWithDuration(form.tanggal, form.durasi);
  const isJamValid = availableHours.some(h => h.value === form.jam);
  const isFormValid = isMejaSaatIniTersedia && isJamValid && !errorWaktu;

  useEffect(() => {
    if (form.meja && !isMejaSaatIniTersedia && mejaTersediaList.length > 0) {
      setForm(prev => ({ ...prev, meja: mejaTersediaList[0] }));
    }
  }, [form.jam, form.durasi, form.tanggal]);

  useEffect(() => {
    if (form.jam && !isJamValid && availableHours.length > 0) {
      setForm(prev => ({ ...prev, jam: availableHours[0].value }));
    }
  }, [form.durasi, form.tanggal]);

  useEffect(() => {
    fetchReservasiAktif(form.tanggal);
  }, [form.tanggal]);

  const hitungEstimasiHarga = () => {
    const tarif = form.meja.toLowerCase().includes("vip") ? 80000 : 50000;
    return tarif * form.durasi;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!form.nama.trim()) {
      alert("Harap masukkan nama lengkap!");
      return;
    }
    if (!form.nohp.trim()) {
      alert("Harap masukkan nomor WhatsApp!");
      return;
    }
    if (!form.nohp.match(/^\d{10,13}$/)) {
      alert("Nomor WhatsApp harus berupa angka (10-13 digit)!");
      return;
    }
    
    // Validasi jam operasional
    const check = isWithinOperatingHours(form.jam, form.durasi, form.tanggal);
    if (!check.valid) {
      alert(check.reason);
      return;
    }
    
    if (!isMejaSaatIniTersedia) {
      alert(`⚠️ Meja ${form.meja} sudah dipesan pada jam ${form.jam}. Silakan pilih meja lain.`);
      return;
    }
    
    setLoading(true);
    try {
      // Cek ulang ketersediaan (race condition)
      const { data: cekTerbaru, error: cekError } = await supabase
        .from("reservasi_billiard")
        .select("*")
        .eq("tanggal_main", form.tanggal)
        .in("status_pemesanan", ["Pending", "Playing", "Disetujui"]);

      if (cekError) throw cekError;

      const mejaSudahDipesan = cekTerbaru.some(r => 
        r.nomor_meja === form.meja && 
        isTimeConflict(r.jam_mulai, r.durasi_bermain, form.jam, form.durasi)
      );

      if (mejaSudahDipesan) {
        alert(`⚠️ Meja ${form.meja} sudah dipesan pada jam tersebut. Silakan pilih meja atau jam lain.`);
        setLoading(false);
        return;
      }

      const idBooking = "RC-" + Date.now().toString().slice(-8);
      const idNumerik = Date.now();

      const { error } = await supabase
        .from("reservasi_billiard")
        .insert([{
          id: idNumerik,
          id_booking: idBooking,
          nomor_meja: form.meja,
          nama_pelanggan: form.nama.trim(),
          status_pemesanan: "Pending",
          durasi_bermain: Number(form.durasi),
          tanggal_main: form.tanggal,
          jam_mulai: form.jam,
          no_whatsapp: form.nohp,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      setBookingId(idBooking);
      setSuccess(true);
    } catch (error) {
      alert("Gagal booking: " + error.message);
    } finally {
      setLoading(false);
    }
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
          {/* Nama Lengkap */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-[#00ff99]">Nama Lengkap</label>
            <div className="relative flex items-center">
              <FontAwesomeIcon icon={faUser} className="absolute left-4 text-slate-500 text-sm" />
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

          {/* Nomor WhatsApp */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-[#00ff99]">Nomor WhatsApp</label>
            <div className="relative flex items-center">
              <FontAwesomeIcon icon={faPhoneAlt} className="absolute left-4 text-slate-500 text-xs" />
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

          {/* Pilih Meja */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-[#00ff99]">Pilih Nomor Meja</label>
            <div className="relative flex items-center">
              <FontAwesomeIcon icon={faDiceD6} className="absolute left-4 text-slate-500 text-sm" />
              <select 
                value={form.meja} 
                onChange={e => setForm({...form, meja: e.target.value})}
                className="w-full bg-slate-900/60 border border-slate-800 p-4 pl-12 rounded-xl text-white outline-none focus:border-[#00ff99] transition-all font-medium text-sm cursor-pointer appearance-none" 
              >
                {daftarMeja.map(meja => {
                  const isTersedia = mejaTersediaList.includes(meja);
                  return (
                    <option 
                      key={meja} 
                      value={meja} 
                      disabled={!isTersedia}
                      className={!isTersedia ? "text-slate-500" : "text-white"}
                    >
                      {meja} {!isTersedia && "❌ (Sudah Dipesan)"}
                    </option>
                  );
                })}
              </select>
            </div>
            {loadingMeja && (
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Memeriksa ketersediaan meja...</span>
              </div>
            )}
            {!isMejaSaatIniTersedia && !loadingMeja && (
              <div className="flex items-center gap-1 mt-1 text-[10px] text-red-400">
                <FontAwesomeIcon icon={faExclamationTriangle} size={10} />
                <span>Meja {form.meja} sudah dipesan pada jam {form.jam}. Silakan pilih meja lain.</span>
              </div>
            )}
          </div>

          {/* Tanggal dan Jam */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[#00ff99]">Tanggal</label>
              <div className="relative">
                <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input 
                  type="date" 
                  value={form.tanggal} 
                  required 
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-slate-900/60 border border-slate-800 p-4 pl-12 rounded-xl text-white outline-none focus:border-[#00ff99] transition-all font-medium text-sm" 
                  onChange={handleTanggalChange} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[#00ff99]">Jam Mulai</label>
              <div className="relative">
                <FontAwesomeIcon icon={faClock} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <select
                  value={form.jam}
                  onChange={handleJamChange}
                  className={`w-full bg-slate-900/60 border p-4 pl-12 rounded-xl text-white outline-none focus:border-[#00ff99] transition-all font-medium text-sm cursor-pointer appearance-none ${
                    errorWaktu ? 'border-red-500' : 'border-slate-800'
                  }`}
                >
                  {availableHours.map((hour) => (
                    <option key={hour.value} value={hour.value}>
                      {hour.label}
                    </option>
                  ))}
                </select>
              </div>
              {errorWaktu && (
                <div className="flex items-center gap-1 mt-1 text-[10px] text-red-400">
                  <FontAwesomeIcon icon={faExclamationTriangle} size={10} />
                  <span>{errorWaktu}</span>
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
            <p className="text-[8px] text-slate-500 mt-2 italic">
              *Jam 00:00 - 02:00 (Senin-Jumat) dan 00:00 - 03:00 (Sabtu-Minggu) berarti esok hari
            </p>
          </div>

          {/* Durasi Bermain */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-[#00ff99]">Durasi Bermain</label>
            <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
              <button 
                type="button" 
                onClick={() => handleDurasiChange(Math.max(1, form.durasi - 1))} 
                className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-black rounded-lg transition-all text-lg cursor-pointer"
              >
                <FontAwesomeIcon icon={faMinus} />
              </button>
              <span className="font-black text-base text-white flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className="text-[#00ff99] text-sm" /> {form.durasi} Jam
              </span>
              <button 
                type="button" 
                onClick={() => handleDurasiChange(form.durasi + 1)} 
                className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-black rounded-lg transition-all text-lg cursor-pointer"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
          </div>

          {/* Estimasi Biaya */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex justify-between items-center my-4">
            <div className="space-y-0.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#00ff99] flex items-center gap-1.5">
                <FontAwesomeIcon icon={faMoneyBillWave} /> Estimasi Total Biaya
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
            disabled={loading || !isFormValid} 
            className={`w-full font-black text-sm py-4 rounded-xl transition-all duration-300 shadow-xl flex items-center justify-center gap-2 mt-4 disabled:opacity-50 ${
              !isFormValid 
                ? 'bg-slate-700 cursor-not-allowed' 
                : 'bg-[#00aa66] hover:bg-[#00cc7a] shadow-[#00aa66]/20 hover:shadow-[#00aa66]/40 active:scale-95 cursor-pointer'
            }`}
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Mengirim ke Kasir...</span>
              </>
            ) : (
              !isFormValid ? "Jam atau Meja Tidak Tersedia" : "Konfirmasi & Kirim Ke Kasir"
            )}
          </button>
        </form>
      </div>

      {/* Modal Sukses */}
      {success && (
        <div className="fixed inset-0 z-[150] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6 animate-fade-in">
            <FontAwesomeIcon icon={faCheckCircle} className="text-[#00ff99] text-6xl mx-auto drop-shadow-[0_0_15px_rgba(0,255,153,0.3)]" />
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