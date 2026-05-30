import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCoffee, faExchangeAlt, faUser, faClock, faMoneyBillWave, 
  faHourglassHalf, faPlusCircle, faShoppingCart, faPlay, faStop, 
  faReceipt, faCheckCircle, faCheck, faTag
} from "@fortawesome/free-solid-svg-icons";
import { useCountdown } from "../hooks/useCountdown";

export default function MejaCard({ meja, onPindahMeja, onOrderMakanan, onSewaMeja, onMulaiMain, onSelesaikanMain, onExtendWaktu, onBayarKekurangan, onBukaDiskon }) {
  const statusSekarang = meja.status_pemesanan || "Pending";
  const namaPelanggan = meja.nama_pelanggan || "-";
  const nomorMeja = meja.nomor_meja || "Meja ?";
  const durasiBermain = meja.durasi_bermain || 1;
  const pesananFB = meja.pesanan_fb || [];
  const jamMulai = meja.jam_mulai || "-";
  const isPlaying = statusSekarang === "Playing";
  const isSudahDibayar = statusSekarang === "Sudah Dibayar";
  const isFoodPaid = meja.is_food_paid || false;
  
  const totalBelanjaFB = (pesananFB || []).reduce((acc, curr) => acc + ((curr.harga || 0) * (curr.qty || 1)), 0);
  const getHargaPerJam = (nomorMeja) => {
    if (!nomorMeja) return 50000;
    return nomorMeja.toLowerCase().includes("vip") ? 80000 : 50000;
  };
  const totalBiayaSewa = durasiBermain * getHargaPerJam(nomorMeja);
  const totalTagihan = totalBiayaSewa + totalBelanjaFB;
  
  const hasKekurangan = isSudahDibayar && totalBelanjaFB > 0 && !isFoodPaid;
  
  // Hitung endTime untuk timer
  const calculateEndTime = (jamMulai, durasiJam) => {
    if (!jamMulai || jamMulai === "-" || jamMulai === "" || !durasiJam) return null;
    const [hours, minutes] = jamMulai.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    return startDate.getTime() + (durasiJam * 3600000);
  };
  
  const endTime = calculateEndTime(jamMulai, durasiBermain);
  const { formatted, isExpired, isExpiring } = useCountdown(isPlaying && endTime ? endTime : null);
  
  // Cek apakah tombol "MULAI MAIN" dapat ditekan (validasi waktu)
  const canStartMain = () => {
    if (statusSekarang !== "Sudah Dibayar") return false;
    
    const now = new Date();
    const jamSekarang = now.getHours();
    const menitSekarang = now.getMinutes();
    const waktuSekarangMenit = (jamSekarang * 60) + menitSekarang;
    
    // Jam operasional
    const day = new Date().getDay();
    const isWeekend = (day === 0 || day === 6);
    const batasOperasional = isWeekend ? 27 * 60 : 26 * 60; // 03:00 atau 02:00
    
    // Cek apakah dalam jam operasional
    if (waktuSekarangMenit < 10 * 60) return false; // Sebelum jam 10:00
    if (waktuSekarangMenit >= batasOperasional) return false; // Setelah jam tutup
    
    // Jika ada jadwal reservasi, cek apakah sudah waktunya (maksimal 30 menit sebelum jadwal)
    if (meja.jam_mulai && meja.jam_mulai !== "-") {
      const [jamJadwal, menitJadwal] = meja.jam_mulai.split(":").map(Number);
      const waktuJadwalMenit = (jamJadwal || 0) * 60 + (menitJadwal || 0);
      const selisihMenit = waktuJadwalMenit - waktuSekarangMenit;
      
      // Jika lebih dari 30 menit sebelum jadwal, belum boleh main
      if (selisihMenit > 30) return false;
    }
    
    return true;
  };
  
  const isStartMainDisabled = !canStartMain();
  
  const getStatusColor = () => {
    switch (statusSekarang) {
      case "Sudah Dibayar": return "border-blue-500/50 bg-blue-950/30";
      case "Playing": return "border-sky-500/30";
      case "Selesai": return "border-slate-600 bg-slate-800/30";
      default: return "border-slate-800";
    }
  };
  
  return (
    <div className={`bg-slate-900/60 border rounded-2xl p-5 relative overflow-hidden hover:border-emerald-500/50 transition-all duration-300 ${getStatusColor()} ${
      isExpired ? "bg-red-950/30 border-red-500/50" : 
      isExpiring ? "bg-amber-950/30 border-amber-500/50 animate-pulse" : ""
    }`}>
      {isPlaying && !isExpired && endTime && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500" 
             style={{ width: `${((endTime - Date.now()) / (durasiBermain * 3600000)) * 100}%` }} />
      )}
      
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-black text-xl">🎱 {nomorMeja}</h3>
          <p className="text-slate-500 text-[9px] font-mono">ID: {meja.id}</p>
        </div>
        <div className="flex gap-1.5">
          <button 
            onClick={() => onPindahMeja(meja.id, nomorMeja)} 
            className="p-1.5 rounded-lg border transition-all bg-purple-500/20 border-purple-500/30 text-purple-400 cursor-pointer hover:bg-purple-500/30 hover:scale-105"
            title="Pindah Meja"
          >
            <FontAwesomeIcon icon={faExchangeAlt} size={13} />
          </button>
          
          <button 
            onClick={() => onOrderMakanan(meja.id, nomorMeja, pesananFB)} 
            className="p-1.5 rounded-lg border transition-all bg-amber-500/20 border-amber-500/30 text-amber-400 cursor-pointer hover:bg-amber-500/30 hover:scale-105"
            title="Order Makanan"
          >
            <FontAwesomeIcon icon={faCoffee} size={13} />
          </button>
        </div>
      </div>
      
      {/* Badge Status */}
      <div className="absolute top-2 right-2">
        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
          statusSekarang === "Sudah Dibayar" ? "bg-blue-500/20 text-blue-400" :
          statusSekarang === "Playing" ? "bg-green-500/20 text-green-400" :
          statusSekarang === "Selesai" ? "bg-slate-500/20 text-slate-400" :
          "bg-yellow-500/20 text-yellow-400"
        }`}>
          {statusSekarang}
        </span>
      </div>
      
      <div className="space-y-1.5 text-[11px] border-y border-slate-800/60 py-2.5 my-2.5">
        <div className="flex justify-between">
          <span className="text-slate-400"><FontAwesomeIcon icon={faUser} size={10} className="mr-1" /> Pelanggan:</span>
          <span className="font-bold text-white">{namaPelanggan}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400"><FontAwesomeIcon icon={faClock} size={10} className="mr-1" /> Durasi:</span>
          <span className="font-semibold text-slate-100">{durasiBermain} Jam</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">🕒 Jam Mulai:</span>
          <span className="font-mono text-emerald-400">{jamMulai}</span>
        </div>
        
        {isPlaying && (
          <div className="flex justify-between items-center">
            <span className="text-slate-400"><FontAwesomeIcon icon={faHourglassHalf} size={10} className="mr-1" /> Sisa Waktu:</span>
            <div className="flex items-center gap-2">
              <span className={`font-mono font-bold ${isExpiring ? "text-amber-400 animate-pulse" : "text-emerald-400"}`}>
                {formatted}
              </span>
              <button 
                onClick={() => onExtendWaktu(meja.id, nomorMeja, durasiBermain)}
                className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/40 rounded-lg text-emerald-400 text-[9px] font-bold transition-all flex items-center gap-0.5"
                title="Tambah Waktu"
              >
                <FontAwesomeIcon icon={faPlusCircle} size={8} /> Extend
              </button>
            </div>
          </div>
        )}
        
        {!isPlaying && isSudahDibayar && (
          <div className="flex justify-between items-center">
            <span className="text-slate-400"><FontAwesomeIcon icon={faHourglassHalf} size={10} className="mr-1" /> Sisa Waktu:</span>
            <span className="font-mono text-amber-400">Belum mulai main</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-slate-400"><FontAwesomeIcon icon={faMoneyBillWave} size={10} className="mr-1" /> Sewa (dibayar):</span>
          <span className="font-semibold text-emerald-400">Rp {totalBiayaSewa.toLocaleString("id-ID")}</span>
        </div>
        
        {totalBelanjaFB > 0 && (
          <div className={`flex justify-between p-1.5 rounded-lg ${isFoodPaid ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"}`}>
            <span><FontAwesomeIcon icon={faCoffee} size={10} className="mr-1" /> Makanan:</span>
            <span className="font-bold">
              Rp {totalBelanjaFB.toLocaleString("id-ID")}
              {isFoodPaid && <FontAwesomeIcon icon={faCheckCircle} size={10} className="ml-1 text-green-400" />}
              {!isFoodPaid && " (belum bayar)"}
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl mb-3">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">TOTAL KESELURUHAN</span>
        <span className="text-lg font-black text-emerald-400 font-mono">Rp {totalTagihan.toLocaleString("id-ID")}</span>
      </div>
      
      {/* Tombol Aksi Berdasarkan Status */}
      <div className="flex flex-col gap-2">
        {statusSekarang === "Pending" ? (
          <>
            {/* Tombol Diskon untuk Pending */}
            <button 
              onClick={() => onBukaDiskon(meja.id, nomorMeja, namaPelanggan, totalTagihan)}
              className="w-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold py-2 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all hover:bg-amber-500/30 flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faTag} size={12} /> Berikan Diskon
            </button>
            
            {/* Tombol Sewa Meja */}
            <button 
              onClick={() => onSewaMeja(meja, totalBiayaSewa, totalBelanjaFB, totalTagihan)}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2.5 rounded-xl text-sm uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faShoppingCart} size={14} /> SEWA MEJA & BAYAR
            </button>
          </>
        ) : statusSekarang === "Sudah Dibayar" ? (
          <>
            {/* Tombol Mulai Main dengan validasi */}
            <button 
              onClick={() => onMulaiMain(meja.id, nomorMeja)}
              disabled={isStartMainDisabled}
              className={`w-full font-bold py-2.5 rounded-xl text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                isStartMainDisabled 
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 cursor-pointer active:scale-95"
              }`}
              title={isStartMainDisabled ? "Belum waktunya mulai main atau di luar jam operasional" : ""}
            >
              <FontAwesomeIcon icon={faPlay} size={14} /> 
              {isStartMainDisabled ? "BELUM WAKTU NYA" : "MULAI MAIN"}
            </button>
            
            {/* Tombol Bayar Kekurangan */}
            {hasKekurangan && (
              <button 
                onClick={() => onBayarKekurangan(meja.id, totalBelanjaFB, meja.nama_pelanggan, nomorMeja)}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-2.5 rounded-xl text-sm uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faReceipt} size={14} />
                BAYAR KEKURANGAN: Rp {totalBelanjaFB.toLocaleString("id-ID")}
              </button>
            )}
          </>
        ) : statusSekarang === "Playing" ? (
          <button 
            onClick={() => onSelesaikanMain(meja.id, nomorMeja)}
            className={`w-full font-bold py-2.5 rounded-xl text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${isExpired ? "bg-red-600 hover:bg-red-500" : "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500"} cursor-pointer active:scale-95`}
          >
            <FontAwesomeIcon icon={faStop} size={14} /> SELESAIKAN MAIN
          </button>
        ) : (
          <button disabled className="w-full bg-slate-800/50 text-slate-600 font-bold py-2.5 rounded-xl text-sm uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faCheck} size={14} /> SELESAI
          </button>
        )}
      </div>
    </div>
  );
}