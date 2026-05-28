import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faMoneyBillWave, faQrcode, faLandmark } from "@fortawesome/free-solid-svg-icons";

export default function ModalBayarDulu({ isOpen, onClose, onBayar, meja, totalBiaya }) {
  const [metode, setMetode] = useState("Cash");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleBayar = async () => {
    setLoading(true);
    await onBayar(metode);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-lg">Pembayaran di Muka</h3>
            <p className="text-slate-400 text-xs">Meja: {meja}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <FontAwesomeIcon icon={faTimes} size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6 text-center">
            <p className="text-slate-400 text-xs mb-1">Total yang harus dibayar</p>
            <p className="text-3xl font-black text-emerald-400">Rp {totalBiaya.toLocaleString("id-ID")}</p>
          </div>

          <div className="mb-6">
            <p className="text-white text-sm font-bold mb-3">Pilih Metode Pembayaran</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setMetode("Cash")}
                className={`py-3 rounded-xl flex flex-col items-center gap-2 transition-all ${metode === "Cash" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
              >
                <FontAwesomeIcon icon={faMoneyBillWave} size={20} />
                <span className="text-xs font-bold">Cash</span>
              </button>
              <button
                onClick={() => setMetode("QRIS")}
                className={`py-3 rounded-xl flex flex-col items-center gap-2 transition-all ${metode === "QRIS" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
              >
                <FontAwesomeIcon icon={faQrcode} size={20} />
                <span className="text-xs font-bold">QRIS</span>
              </button>
              <button
                onClick={() => setMetode("Transfer")}
                className={`py-3 rounded-xl flex flex-col items-center gap-2 transition-all ${metode === "Transfer" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
              >
                <FontAwesomeIcon icon={faLandmark} size={20} />
                <span className="text-xs font-bold">Transfer</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleBayar}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 rounded-xl transition-all"
          >
            {loading ? "Memproses..." : `Bayar Rp ${totalBiaya.toLocaleString("id-ID")}`}
          </button>
        </div>
      </div>
    </div>
  );
}