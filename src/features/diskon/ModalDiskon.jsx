// src/components/ModalDiskon.jsx
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTimes, faTag, faPercent, faMoneyBillWave, faUserCheck, faTrophy, faGift,
  faCalculator, faCheckCircle
} from "@fortawesome/free-solid-svg-icons";

export default function ModalDiskon({ isOpen, onClose, onApplyDiskon, totalSebelumDiskon, meja, pelanggan }) {
  const [tipeDiskon, setTipeDiskon] = useState("persen");
  const [nilaiDiskon, setNilaiDiskon] = useState("");
  const [alasanDiskon, setAlasanDiskon] = useState("");

  if (!isOpen) return null;

  const promoList = [
    { id: 1, nama: "Weekend Special", diskon: 5, tipe: "persen", keterangan: "Diskon 5% khusus weekend", icon: "🎉" },
    { id: 2, nama: "Happy Hour", diskon: 10, tipe: "persen", keterangan: "Diskon 10% jam 10-12", icon: "⏰" },
    { id: 3, nama: "Member Platinum", diskon: 15, tipe: "persen", keterangan: "Diskon 15% untuk member platinum", icon: "💎" },
    { id: 4, nama: "Cashback Rp 20k", diskon: 20000, tipe: "nominal", keterangan: "Cashback Rp 20.000", icon: "💰" },
    { id: 5, nama: "Beli 3 Jam + Free", diskon: 50000, tipe: "nominal", keterangan: "Diskon Rp 50.000", icon: "🎯" },
    { id: 6, nama: "Birthday Special", diskon: 20, tipe: "persen", keterangan: "Diskon 20% ulang tahun", icon: "🎂" },
  ];

  const hitungDiskon = () => {
    let diskon = 0;
    let keterangan = "";

    if (tipeDiskon === "persen") {
      const persen = parseFloat(nilaiDiskon);
      if (!isNaN(persen) && persen > 0 && persen <= 100) {
        diskon = (totalSebelumDiskon * persen) / 100;
        keterangan = `${persen}% Diskon`;
      }
    } else if (tipeDiskon === "nominal") {
      const nominal = parseFloat(nilaiDiskon);
      if (!isNaN(nominal) && nominal > 0) {
        diskon = Math.min(nominal, totalSebelumDiskon);
        keterangan = `Rp ${nominal.toLocaleString("id-ID")} Diskon`;
      }
    } else if (tipeDiskon === "member") {
      diskon = totalSebelumDiskon * 0.1;
      keterangan = "Diskon Member (10%)";
    } else if (tipeDiskon === "promo") {
      const promoDipilih = promoList.find(p => p.id === parseInt(nilaiDiskon));
      if (promoDipilih) {
        if (promoDipilih.tipe === "persen") {
          diskon = (totalSebelumDiskon * promoDipilih.diskon) / 100;
        } else {
          diskon = Math.min(promoDipilih.diskon, totalSebelumDiskon);
        }
        keterangan = promoDipilih.keterangan;
      }
    }

    return { diskon, keterangan };
  };

  const handleApply = () => {
    const { diskon, keterangan } = hitungDiskon();
    if (diskon > 0) {
      onApplyDiskon(diskon, keterangan, alasanDiskon || "-");
      handleClose();
    } else {
      alert("Masukkan nilai diskon yang valid!");
    }
  };

  const handleClose = () => {
    setNilaiDiskon("");
    setAlasanDiskon("");
    setTipeDiskon("persen");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl w-full max-w-[95%] sm:max-w-md max-h-[95vh] overflow-hidden shadow-2xl animate-fade-in">
        
        {/* HEADER - Responsive */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
              <FontAwesomeIcon icon={faTag} className="text-amber-400 text-sm sm:text-base" />
              <span>Diskon & Promo</span>
            </h3>
            <p className="text-slate-400 text-[10px] sm:text-xs mt-1 truncate">
              Meja: {meja} | {pelanggan}
            </p>
          </div>
          <button 
            onClick={handleClose} 
            className="text-slate-400 hover:text-white transition-all p-2 -m-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-slate-800"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} size={18} className="sm:text-xl" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[60vh] overflow-y-auto">
          
          {/* Info Total Sebelum Diskon */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-xl p-3 sm:p-4 text-center border border-slate-700">
            <p className="text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-wider">Total Sebelum Diskon</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1 break-words">
              Rp {totalSebelumDiskon.toLocaleString("id-ID")}
            </p>
          </div>

          {/* Pilih Tipe Diskon */}
          <div>
            <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
              Pilih Jenis Diskon
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={() => { setTipeDiskon("persen"); setNilaiDiskon(""); }}
                className={`
                  py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all 
                  flex items-center justify-center gap-1 sm:gap-2 min-h-[44px]
                  ${tipeDiskon === "persen" 
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" 
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
                  }
                `}
              >
                <FontAwesomeIcon icon={faPercent} size={11} className="sm:text-xs" />
                <span className="hidden xs:inline">Diskon %</span>
                <span className="xs:hidden">%</span>
              </button>
              <button
                onClick={() => { setTipeDiskon("nominal"); setNilaiDiskon(""); }}
                className={`
                  py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all 
                  flex items-center justify-center gap-1 sm:gap-2 min-h-[44px]
                  ${tipeDiskon === "nominal" 
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" 
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
                  }
                `}
              >
                <FontAwesomeIcon icon={faMoneyBillWave} size={11} className="sm:text-xs" />
                <span className="hidden xs:inline">Diskon Rp</span>
                <span className="xs:hidden">Rp</span>
              </button>
              <button
                onClick={() => { setTipeDiskon("member"); setNilaiDiskon(""); }}
                className={`
                  py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all 
                  flex items-center justify-center gap-1 sm:gap-2 min-h-[44px]
                  ${tipeDiskon === "member" 
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" 
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
                  }
                `}
              >
                <FontAwesomeIcon icon={faUserCheck} size={11} className="sm:text-xs" />
                <span className="hidden xs:inline">Member</span>
                <span className="xs:hidden">10%</span>
              </button>
              <button
                onClick={() => { setTipeDiskon("promo"); setNilaiDiskon(""); }}
                className={`
                  py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all 
                  flex items-center justify-center gap-1 sm:gap-2 min-h-[44px]
                  ${tipeDiskon === "promo" 
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" 
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
                  }
                `}
              >
                <FontAwesomeIcon icon={faTrophy} size={11} className="sm:text-xs" />
                <span className="hidden xs:inline">Promo</span>
                <span className="xs:hidden">🎁</span>
              </button>
            </div>
          </div>

          {/* Input Nilai Diskon */}
          {(tipeDiskon === "persen" || tipeDiskon === "nominal") && (
            <div className="animate-fade-in">
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                {tipeDiskon === "persen" ? "Masukkan Persentase (%)" : "Masukkan Nominal (Rp)"}
              </label>
              <input
                type="number"
                placeholder={tipeDiskon === "persen" ? "Contoh: 10" : "Contoh: 50000"}
                value={nilaiDiskon}
                onChange={(e) => setNilaiDiskon(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none transition-all text-sm sm:text-base"
                autoFocus
              />
              <p className="text-[8px] sm:text-[9px] text-slate-500 mt-1">
                {tipeDiskon === "persen" 
                  ? "Maksimal diskon 100%" 
                  : "Diskon tidak boleh melebihi total harga"}
              </p>
            </div>
          )}

          {/* Info Diskon Member */}
          {tipeDiskon === "member" && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 animate-fade-in">
              <div className="flex items-center gap-2 justify-center flex-wrap">
                <FontAwesomeIcon icon={faUserCheck} className="text-emerald-400" />
                <p className="text-emerald-400 text-[10px] sm:text-xs font-medium">
                  🎉 Diskon Member 10% otomatis diterapkan!
                </p>
              </div>
            </div>
          )}

          {/* Pilih Promo */}
          {tipeDiskon === "promo" && (
            <div className="animate-fade-in">
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block flex items-center gap-1">
                <FontAwesomeIcon icon={faGift} className="text-amber-400" />
                Pilih Promo
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {promoList.map((promo) => (
                  <button
                    key={promo.id}
                    onClick={() => setNilaiDiskon(promo.id.toString())}
                    className={`
                      w-full p-3 sm:p-3.5 rounded-xl text-left transition-all min-h-[60px]
                      ${nilaiDiskon === promo.id.toString() 
                        ? "bg-amber-500/20 border border-amber-500/50 shadow-lg shadow-amber-500/10" 
                        : "bg-slate-800/50 border border-slate-700 hover:bg-slate-800"
                      }
                    `}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg sm:text-xl">{promo.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                          {promo.nama}
                        </p>
                        <p className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5 break-words">
                          {promo.keterangan}
                        </p>
                      </div>
                      {nilaiDiskon === promo.id.toString() && (
                        <FontAwesomeIcon icon={faCheckCircle} className="text-amber-400 text-xs sm:text-sm flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Catatan/Alasan */}
          <div>
            <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
              Catatan / Alasan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Promo weekend, Pelanggan setia..."
              value={alasanDiskon}
              onChange={(e) => setAlasanDiskon(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none transition-all text-xs sm:text-sm"
            />
          </div>

          {/* Preview Diskon */}
          {((tipeDiskon === "persen" && nilaiDiskon) || 
            (tipeDiskon === "nominal" && nilaiDiskon) || 
            tipeDiskon === "member" ||
            (tipeDiskon === "promo" && nilaiDiskon)) && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 sm:p-4 animate-fade-in">
              <p className="text-amber-400 text-[9px] sm:text-[10px] mb-2 flex items-center gap-1">
                <FontAwesomeIcon icon={faCalculator} size={10} /> Preview Diskon:
              </p>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between flex-wrap gap-1">
                  <span className="text-slate-400">Total awal:</span>
                  <span className="text-white font-medium">Rp {totalSebelumDiskon.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between flex-wrap gap-1">
                  <span className="text-amber-400">Potongan diskon:</span>
                  <span className="text-amber-400 font-medium">- Rp {hitungDiskon().diskon.toLocaleString("id-ID")}</span>
                </div>
                <div className="border-t border-amber-500/30 my-1.5"></div>
                <div className="flex justify-between font-bold flex-wrap gap-1">
                  <span className="text-white">Total setelah diskon:</span>
                  <span className="text-emerald-400 text-sm sm:text-base">
                    Rp {(totalSebelumDiskon - hitungDiskon().diskon).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER BUTTONS */}
        <div className="p-4 sm:p-5 border-t border-slate-800 flex gap-3 bg-slate-950/50">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all min-h-[44px]"
          >
            Batal
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 min-h-[44px]"
          >
            <FontAwesomeIcon icon={faTag} size={12} className="sm:text-sm" />
            <span className="hidden xs:inline">Terapkan Diskon</span>
            <span className="xs:hidden">Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
}