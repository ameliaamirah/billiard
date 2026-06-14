import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCoffee, faExchangeAlt, faUser, faClock, faMoneyBillWave, 
  faHourglassHalf, faPlusCircle, faShoppingCart, faPlay, faStop, 
  faReceipt, faCheckCircle, faCheck, faTag, faUsers, faCrown,
  faBell, faStopwatch
} from "@fortawesome/free-solid-svg-icons";
import { useCountdown } from "../hooks/useCountdown";

export default function MejaCard({ 
  meja, 
  onPindahMeja, 
  onOrderMakanan, 
  onSewaMeja, 
  onMulaiMain, 
  onSelesaikanMain, 
  onExtendWaktu, 
  onBayarKekurangan, 
  onBukaDiskon,
  onOpenSplitBill
}) {
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
  
  // Cek apakah tombol "MULAI MAIN" dapat ditekan
  const canStartMain = () => {
    if (statusSekarang !== "Sudah Dibayar") return false;
    
    const now = new Date();
    const jamSekarang = now.getHours();
    const menitSekarang = now.getMinutes();
    const waktuSekarangMenit = (jamSekarang * 60) + menitSekarang;
    
    const day = new Date().getDay();
    const isWeekend = (day === 0 || day === 6);
    const batasOperasional = isWeekend ? 27 * 60 : 26 * 60;
    
    if (waktuSekarangMenit < 10 * 60) return false;
    if (waktuSekarangMenit >= batasOperasional) return false;
    
    if (meja.jam_mulai && meja.jam_mulai !== "-") {
      const [jamJadwal, menitJadwal] = meja.jam_mulai.split(":").map(Number);
      const waktuJadwalMenit = (jamJadwal || 0) * 60 + (menitJadwal || 0);
      const selisihMenit = waktuJadwalMenit - waktuSekarangMenit;
      
      if (selisihMenit > 30) return false;
    }
    
    return true;
  };
  
  const isStartMainDisabled = !canStartMain();
  const isVipMeja = nomorMeja.toLowerCase().includes("vip");
  
  const getStatusColor = () => {
    switch (statusSekarang) {
      case "Sudah Dibayar": return "border-blue-500/50 bg-blue-950/30";
      case "Playing": return "border-sky-500/30";
      case "Selesai": return "border-slate-600 bg-slate-800/30";
      default: return "border-slate-800";
    }
  };
  
  return (
    <div className={`
      bg-slate-900/60 border rounded-xl sm:rounded-2xl p-4 sm:p-5 
      relative overflow-hidden hover:border-emerald-500/50 transition-all duration-300
      ${getStatusColor()}
      ${isExpired ? "bg-red-950/30 border-red-500/50" : ""}
      ${isExpiring ? "bg-amber-950/30 border-amber-500/50 animate-pulse" : ""}
    `}>
      {/* Progress Bar - Responsive */}
      {isPlaying && !isExpired && endTime && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700/50">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-1000"
            style={{ width: `${Math.max(0, ((endTime - Date.now()) / (durasiBermain * 3600000)) * 100)}%` }} 
          />
        </div>
      )}
      
      {/* Header Section - Responsive */}
      <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-lg sm:text-xl tracking-tight">
              🎱 {nomorMeja}
            </h3>
            {isVipMeja && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-full text-[8px] sm:text-[9px] font-bold text-amber-400">
                <FontAwesomeIcon icon={faCrown} size={8} /> VIP
              </span>
            )}
          </div>
          <p className="text-slate-500 text-[8px] sm:text-[9px] font-mono mt-0.5">
            ID: {meja.id}
          </p>
        </div>
        
        {/* Action Buttons - Responsive */}
        <div className="flex gap-1.5 sm:gap-2">
          <button 
            onClick={() => onPindahMeja(meja.id, nomorMeja)} 
            className="p-1.5 sm:p-2 rounded-lg border transition-all bg-purple-500/20 border-purple-500/30 text-purple-400 cursor-pointer hover:bg-purple-500/30 hover:scale-105 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center"
            title="Pindah Meja"
          >
            <FontAwesomeIcon icon={faExchangeAlt} size={12} className="sm:text-sm" />
          </button>
          
          <button 
            onClick={() => onOrderMakanan(meja.id, nomorMeja, pesananFB)} 
            className="p-1.5 sm:p-2 rounded-lg border transition-all bg-amber-500/20 border-amber-500/30 text-amber-400 cursor-pointer hover:bg-amber-500/30 hover:scale-105 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center"
            title="Order Makanan"
          >
            <FontAwesomeIcon icon={faCoffee} size={12} className="sm:text-sm" />
          </button>
        </div>
      </div>
      
      {/* Status Badge - Responsive */}
      <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
        <span className={`
          px-1.5 sm:px-2 py-0.5 rounded-full text-[7px] sm:text-[8px] font-bold
          ${statusSekarang === "Sudah Dibayar" ? "bg-blue-500/20 text-blue-400" : ""}
          ${statusSekarang === "Playing" ? "bg-green-500/20 text-green-400" : ""}
          ${statusSekarang === "Selesai" ? "bg-slate-500/20 text-slate-400" : ""}
          ${statusSekarang === "Pending" ? "bg-yellow-500/20 text-yellow-400" : ""}
        `}>
          {statusSekarang}
        </span>
      </div>
      
      {/* Info Section - Responsive Grid */}
      <div className="space-y-1.5 text-[10px] sm:text-[11px] border-y border-slate-800/60 py-2 sm:py-2.5 my-2 sm:my-2.5">
        {/* Row 1: Pelanggan */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400 flex items-center gap-1">
            <FontAwesomeIcon icon={faUser} size={9} className="sm:text-[10px]" />
            <span className="hidden xs:inline">Pelanggan:</span>
          </span>
          <span className="font-bold text-white text-right truncate max-w-[60%] sm:max-w-none">
            {namaPelanggan}
          </span>
        </div>
        
        {/* Row 2: Durasi */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400 flex items-center gap-1">
            <FontAwesomeIcon icon={faClock} size={9} className="sm:text-[10px]" />
            <span className="hidden xs:inline">Durasi:</span>
          </span>
          <span className="font-semibold text-slate-100">{durasiBermain} Jam</span>
        </div>
        
        {/* Row 3: Jam Mulai */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400 flex items-center gap-1">
            🕒
            <span className="hidden xs:inline">Jam Mulai:</span>
          </span>
          <span className="font-mono text-emerald-400 text-[10px] sm:text-[11px]">{jamMulai}</span>
        </div>
        
        {/* Row 4: Sisa Waktu (Jika Playing) */}
        {isPlaying && (
          <div className="flex justify-between items-center flex-wrap gap-1 sm:gap-2">
            <span className="text-slate-400 flex items-center gap-1">
              <FontAwesomeIcon icon={faHourglassHalf} size={9} className="sm:text-[10px]" />
              <span className="hidden xs:inline">Sisa Waktu:</span>
            </span>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className={`font-mono font-bold text-[10px] sm:text-[11px] ${isExpiring ? "text-amber-400 animate-pulse" : "text-emerald-400"}`}>
                {formatted}
              </span>
              <button 
                onClick={() => onExtendWaktu(meja.id, nomorMeja, durasiBermain)}
                className="px-1.5 sm:px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/40 rounded-lg text-emerald-400 text-[8px] sm:text-[9px] font-bold transition-all flex items-center gap-0.5 min-h-[24px]"
                title="Tambah Waktu"
              >
                <FontAwesomeIcon icon={faPlusCircle} size={7} className="sm:text-[8px]" />
                <span className="hidden xs:inline">Extend</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Row 5: Belum Mulai (Jika Sudah Dibayar) */}
        {!isPlaying && isSudahDibayar && (
          <div className="flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1">
              <FontAwesomeIcon icon={faStopwatch} size={9} className="sm:text-[10px]" />
              <span className="hidden xs:inline">Sisa Waktu:</span>
            </span>
            <span className="font-mono text-amber-400 text-[10px] sm:text-[11px]">Belum mulai main</span>
          </div>
        )}
        
        {/* Row 6: Biaya Sewa */}
        <div className="flex justify-between items-center pt-1">
          <span className="text-slate-400 flex items-center gap-1">
            <FontAwesomeIcon icon={faMoneyBillWave} size={9} className="sm:text-[10px]" />
            <span className="hidden xs:inline">Sewa (dibayar):</span>
          </span>
          <span className="font-semibold text-emerald-400 text-[10px] sm:text-[11px]">
            Rp {totalBiayaSewa.toLocaleString("id-ID")}
          </span>
        </div>
        
        {/* Row 7: Pesanan F&B */}
        {totalBelanjaFB > 0 && (
          <div className={`flex justify-between items-center p-1.5 sm:p-2 rounded-lg ${isFoodPaid ? "bg-green-500/10" : "bg-amber-500/10"} mt-1`}>
            <span className="flex items-center gap-1 text-[9px] sm:text-[10px]">
              <FontAwesomeIcon icon={faCoffee} size={9} />
              <span>Makanan:</span>
            </span>
            <span className={`font-bold text-[10px] sm:text-[11px] ${isFoodPaid ? "text-green-400" : "text-amber-400"}`}>
              Rp {totalBelanjaFB.toLocaleString("id-ID")}
              {isFoodPaid && <FontAwesomeIcon icon={faCheckCircle} size={9} className="ml-1" />}
              {!isFoodPaid && " (belum bayar)"}
            </span>
          </div>
        )}
      </div>

      {/* Total Tagihan - Responsive */}
      <div className="flex justify-between items-center bg-slate-950/60 p-2 sm:p-2.5 rounded-xl mb-3 gap-2">
        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider">
          TOTAL
        </span>
        <span className="text-sm sm:text-base md:text-lg font-black text-emerald-400 font-mono truncate">
          Rp {totalTagihan.toLocaleString("id-ID")}
        </span>
      </div>
      
      {/* Action Buttons Section - Responsive Grid */}
      <div className="flex flex-col gap-2">
        {statusSekarang === "Pending" ? (
          <>
            <button 
              onClick={() => onBukaDiskon(meja.id, nomorMeja, namaPelanggan, totalTagihan)}
              className="w-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer transition-all hover:bg-amber-500/30 flex items-center justify-center gap-2 min-h-[40px] sm:min-h-[44px]"
            >
              <FontAwesomeIcon icon={faTag} size={11} className="sm:text-xs" />
              <span className="hidden xs:inline">Berikan Diskon</span>
              <span className="xs:hidden">Diskon</span>
            </button>
            
            <button 
              onClick={() => onSewaMeja(meja, totalBiayaSewa, totalBelanjaFB, totalTagihan)}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-sm uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[48px]"
            >
              <FontAwesomeIcon icon={faShoppingCart} size={12} className="sm:text-sm" />
              <span className="hidden xs:inline">SEWA MEJA & BAYAR</span>
              <span className="xs:hidden">SEWA & BAYAR</span>
            </button>
          </>
        ) : statusSekarang === "Sudah Dibayar" ? (
          <>
            <button 
              onClick={() => onMulaiMain(meja.id, nomorMeja)}
              disabled={isStartMainDisabled}
              className={`w-full font-bold py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[48px] ${
                isStartMainDisabled 
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 cursor-pointer active:scale-95"
              }`}
              title={isStartMainDisabled ? "Belum waktunya mulai main atau di luar jam operasional" : ""}
            >
              <FontAwesomeIcon icon={faPlay} size={12} className="sm:text-sm" />
              {isStartMainDisabled ? "BELUM WAKTU" : "MULAI MAIN"}
            </button>
            
            {hasKekurangan && (
              <button 
                onClick={() => onBayarKekurangan(meja.id, totalBelanjaFB, meja.nama_pelanggan, nomorMeja)}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[48px]"
              >
                <FontAwesomeIcon icon={faReceipt} size={11} className="sm:text-xs" />
                <span className="hidden xs:inline">BAYAR KEKURANGAN</span>
                <span className="xs:hidden">BAYAR</span>
                <span className="hidden sm:inline">Rp {totalBelanjaFB.toLocaleString("id-ID")}</span>
              </button>
            )}
          </>
        ) : statusSekarang === "Playing" ? (
          <button 
            onClick={() => onSelesaikanMain(meja.id, nomorMeja)}
            className={`w-full font-bold py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[48px] ${
              isExpired ? "bg-red-600 hover:bg-red-500 animate-pulse" : "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500"
            } cursor-pointer active:scale-95`}
          >
            <FontAwesomeIcon icon={faStop} size={12} className="sm:text-sm" />
            <span className="hidden xs:inline">SELESAIKAN MAIN</span>
            <span className="xs:hidden">SELESAI</span>
          </button>
        ) : (
          <button disabled className="w-full bg-slate-800/50 text-slate-600 font-bold py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-sm uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faCheck} size={12} className="sm:text-sm" />
            SELESAI
          </button>
        )}
        
        {/* Split Bill Button - Responsive */}
        {statusSekarang !== "Selesai" && (
          <button
            onClick={() => onOpenSplitBill(meja.nomor_meja, meja.nama_pelanggan, totalTagihan, meja.pesanan_fb)}
            className="w-full bg-purple-600/80 hover:bg-purple-500 rounded-lg sm:rounded-xl text-white text-[10px] sm:text-xs font-bold py-2 sm:py-2.5 flex items-center justify-center gap-1.5 sm:gap-2 transition-all min-h-[36px] sm:min-h-[40px]"
          >
            <FontAwesomeIcon icon={faUsers} size={11} className="sm:text-xs" />
            <span className="hidden xs:inline">Split Bill</span>
            <span className="xs:hidden">Split</span>
          </button>
        )}
      </div>
    </div>
  );
}