import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTimes, faMoneyBillWave, faQrcode, faLandmark, faUsers,
  faCreditCard, faWallet, faReceipt
} from "@fortawesome/free-solid-svg-icons";

export default function ModalBayarDulu({ 
  isOpen, 
  onClose, 
  onBayar, 
  meja, 
  pelanggan,
  totalBiaya,
  items,
  onOpenSplitBill 
}) {
  const [metode, setMetode] = useState("Cash");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleBayar = async () => {
    setLoading(true);
    await onBayar(metode);
    setLoading(false);
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID").format(angka);
  };

  const metodePembayaran = [
    { id: "Cash", label: "Cash", icon: faMoneyBillWave, color: "emerald" },
    { id: "QRIS", label: "QRIS", icon: faQrcode, color: "blue" },
    { id: "Transfer", label: "Transfer", icon: faLandmark, color: "purple" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl w-full max-w-[95%] sm:max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header - Responsive */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
              <FontAwesomeIcon icon={faReceipt} className="text-emerald-400 text-sm sm:text-base" />
              <span>Pembayaran di Muka</span>
            </h3>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
              <p className="text-slate-400 text-[10px] sm:text-xs">
                Meja: <span className="text-emerald-400 font-bold">{meja}</span>
              </p>
              {pelanggan && (
                <p className="text-slate-400 text-[10px] sm:text-xs truncate">
                  Pelanggan: <span className="text-white">{pelanggan}</span>
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white cursor-pointer p-2 -m-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-slate-800 transition-all"
            aria-label="Close modal"
          >
            <FontAwesomeIcon icon={faTimes} size={18} className="sm:text-xl" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          
          {/* Total Amount Card */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-4 sm:p-5 mb-5 sm:mb-6 text-center">
            <p className="text-slate-400 text-[10px] sm:text-xs mb-1 uppercase tracking-wider">
              Total yang harus dibayar
            </p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-400 break-words">
              Rp {formatRupiah(totalBiaya)}
            </p>
            {items && items.length > 0 && (
              <p className="text-[9px] sm:text-[10px] text-slate-500 mt-2">
                {items.reduce((sum, item) => sum + item.quantity, 0)} item pesanan
              </p>
            )}
          </div>

          {/* Metode Pembayaran - Responsive Grid */}
          <div className="mb-5 sm:mb-6">
            <p className="text-white text-xs sm:text-sm font-bold mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faWallet} className="text-emerald-400" />
              Pilih Metode Pembayaran
            </p>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {metodePembayaran.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setMetode(method.id)}
                  className={`
                    py-2.5 sm:py-3 rounded-xl flex flex-col items-center gap-1.5 sm:gap-2 
                    transition-all duration-200 min-h-[70px] sm:min-h-[80px]
                    ${metode === method.id 
                      ? `bg-${method.color}-500 text-white shadow-lg shadow-${method.color}-500/20` 
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                    }
                  `}
                >
                  <FontAwesomeIcon 
                    icon={method.icon} 
                    size={18} 
                    className="sm:text-xl transition-transform group-hover:scale-110" 
                  />
                  <span className="text-[10px] sm:text-xs font-bold">
                    {method.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Informasi Metode (Opsional) */}
          {metode !== "Cash" && (
            <div className="mb-5 p-2.5 sm:p-3 bg-slate-800/30 rounded-lg border border-slate-700">
              <p className="text-[9px] sm:text-[10px] text-slate-400 text-center">
                {metode === "QRIS" && "Scan QR Code yang akan muncul setelah konfirmasi"}
                {metode === "Transfer" && "Transfer ke rekening BCA 1234567890 a.n Royal Cue Studio"}
              </p>
            </div>
          )}

          {/* Action Buttons - Responsive */}
          <div className="flex flex-col xs:flex-row gap-3">
            {/* Tombol Bayar */}
            <button
              onClick={handleBayar}
              disabled={loading}
              className={`
                flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 
                hover:from-emerald-600 hover:to-teal-700 
                text-white font-bold py-3 sm:py-3.5 rounded-xl 
                transition-all disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 min-h-[48px]
                ${loading ? "cursor-wait" : "active:scale-95"}
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faMoneyBillWave} className="text-sm sm:text-base" />
                  <span className="hidden xs:inline">Bayar</span>
                  <span className="xs:hidden">Bayar</span>
                  <span className="hidden sm:inline text-xs">
                    Rp {formatRupiah(totalBiaya)}
                  </span>
                </>
              )}
            </button>
            
            {/* Tombol Split Bill */}
            <button
              onClick={() => {
                onClose();
                onOpenSplitBill(meja, pelanggan, totalBiaya, items);
              }}
              className="flex-1 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-bold py-3 sm:py-3.5 flex items-center justify-center gap-2 transition-all active:scale-95 min-h-[48px]"
            >
              <FontAwesomeIcon icon={faUsers} className="text-sm sm:text-base" />
              <span className="hidden xs:inline">Split Bill</span>
              <span className="xs:hidden">Split</span>
            </button>
          </div>

          {/* Info Footer */}
          <p className="text-center text-[8px] sm:text-[9px] text-slate-500 mt-4">
            Pastikan data pesanan sudah benar sebelum melakukan pembayaran
          </p>
        </div>
      </div>
    </div>
  );
}