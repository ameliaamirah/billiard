import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCoffee, faExchangeAlt, faUser, faClock, faMoneyBillWave, 
  faHourglassHalf, faPlusCircle, faShoppingCart
} from "@fortawesome/free-solid-svg-icons";
import { useCountdown } from "../hooks/useCountdown";

export default function MejaCard({ meja, onPindahMeja, onOrderMakanan, onSewaMeja, onExtendWaktu }) {
  const statusSekarang = meja.status_pemesanan || "Pending";
  const namaPelanggan = meja.nama_pelanggan || "-";
  const nomorMeja = meja.nomor_meja || "Meja ?";
  const durasiBermain = meja.durasi_bermain || 1;
  const pesananFB = meja.pesanan_fb || [];
  const jamMulai = meja.jam_mulai || "-";
  const idBooking = meja.id_booking || ("RC-" + String(meja.id).slice(-5));
  const isPlaying = statusSekarang === "Playing";
  
  const totalBelanjaFB = (pesananFB || []).reduce((acc, curr) => acc + ((curr.harga || 0) * (curr.qty || 1)), 0);
  const getHargaPerJam = (nomorMeja) => {
    if (!nomorMeja) return 50000;
    return nomorMeja.toLowerCase().includes("vip") ? 80000 : 50000;
  };
  const totalBiayaSewa = durasiBermain * getHargaPerJam(nomorMeja);
  const totalTagihan = totalBiayaSewa + totalBelanjaFB;
  
  // Hitung endTime untuk timer
  const calculateEndTime = (jamMulai, durasiJam) => {
    if (!jamMulai || jamMulai === "-" || !durasiJam) return null;
    const [hours, minutes] = jamMulai.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    return startDate.getTime() + (durasiJam * 3600000);
  };
  
  const endTime = calculateEndTime(jamMulai, durasiBermain);
  const { formatted, isExpired, isExpiring } = useCountdown(isPlaying ? endTime : null);
  
  return (
    <div className={`bg-slate-900/60 border rounded-2xl p-5 relative overflow-hidden hover:border-emerald-500/50 transition-all duration-300 ${
      isExpired ? "bg-red-950/30 border-red-500/50" : 
      isExpiring ? "bg-amber-950/30 border-amber-500/50 animate-pulse" : 
      isPlaying ? "border-sky-500/30" : "border-slate-800"
    }`}>
      {isPlaying && !isExpired && endTime && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500" 
             style={{ width: `${((endTime - Date.now()) / (durasiBermain * 3600000)) * 100}%` }} />
      )}
      
      <div className={`absolute top-0 left-0 right-0 h-1 ${isPlaying ? "bg-gradient-to-r from-sky-400 to-indigo-500" : "bg-gradient-to-r from-amber-400 to-orange-500"}`} />
      
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-black text-xl">🎱 {nomorMeja}</h3>
          <p className="text-slate-500 text-[9px] font-mono">ID: {idBooking}</p>
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
        
        <div className="flex justify-between">
          <span className="text-slate-400"><FontAwesomeIcon icon={faMoneyBillWave} size={10} className="mr-1" /> Sewa:</span>
          <span className="font-semibold text-emerald-400">Rp {totalBiayaSewa.toLocaleString("id-ID")}</span>
        </div>
        {totalBelanjaFB > 0 && (
          <div className="flex justify-between text-amber-400 bg-amber-500/10 p-1.5 rounded-lg">
            <span><FontAwesomeIcon icon={faCoffee} size={10} className="mr-1" /> Makanan:</span>
            <span className="font-bold">Rp {totalBelanjaFB.toLocaleString("id-ID")}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl mb-3">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">TOTAL</span>
        <span className="text-lg font-black text-emerald-400 font-mono">Rp {totalTagihan.toLocaleString("id-ID")}</span>
      </div>
      
      {/* TOMOL SEWA MEJA & BAYAR (UNTUK STATUS PENDING) */}
      {statusSekarang === "Pending" ? (
        <button 
          onClick={() => onSewaMeja(meja, totalBiayaSewa, totalBelanjaFB, totalTagihan)}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2.5 rounded-xl text-sm uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faShoppingCart} size={14} /> SEWA MEJA & BAYAR
        </button>
      ) : isPlaying ? (
        <button disabled className="w-full bg-slate-800/50 text-slate-600 font-bold py-2.5 rounded-xl text-sm uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2">
          <FontAwesomeIcon icon={faClock} size={14} /> SEDANG BERMAIN
        </button>
      ) : (
        <button disabled className="w-full bg-slate-800/50 text-slate-600 font-bold py-2.5 rounded-xl text-sm uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2">
          <FontAwesomeIcon icon={faCheck} size={14} /> SELESAI
        </button>
      )}
    </div>
  );
}