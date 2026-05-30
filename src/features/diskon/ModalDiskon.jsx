import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faTag, faPercent, faMoneyBillWave, faUserCheck, faTrophy, faGift } from "@fortawesome/free-solid-svg-icons";

export default function ModalDiskon({ isOpen, onClose, onApplyDiskon, totalSebelumDiskon, meja, pelanggan }) {
  const [tipeDiskon, setTipeDiskon] = useState("persen");
  const [nilaiDiskon, setNilaiDiskon] = useState("");
  const [alasanDiskon, setAlasanDiskon] = useState("");

  if (!isOpen) return null;

  const promoList = [
    { id: 1, nama: "Weekend Special", diskon: 5, tipe: "persen", keterangan: "Diskon 5% khusus weekend" },
    { id: 2, nama: "Happy Hour (10:00-12:00)", diskon: 10, tipe: "persen", keterangan: "Diskon 10% jam 10-12" },
    { id: 3, nama: "Member Platinum", diskon: 15, tipe: "persen", keterangan: "Diskon 15% untuk member platinum" },
    { id: 4, nama: "Cashback Rp 20.000", diskon: 20000, tipe: "nominal", keterangan: "Cashback Rp 20.000" },
    { id: 5, nama: "Pembelian 3 Jam + Free 1 Jam", diskon: 50000, tipe: "nominal", keterangan: "Diskon Rp 50.000" },
    { id: 6, nama: "Birthday Special", diskon: 20, tipe: "persen", keterangan: "Diskon 20% ulang tahun" },
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
      onClose();
      setNilaiDiskon("");
      setAlasanDiskon("");
      setTipeDiskon("persen");
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
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
        
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <FontAwesomeIcon icon={faTag} className="text-amber-400" />
              Diskon & Promo
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Meja: {meja} | Pelanggan: {pelanggan}
            </p>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white transition-all">
            <FontAwesomeIcon icon={faTimes} size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Info Total Sebelum Diskon */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-xl p-4 text-center border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wider">Total Sebelum Diskon</p>
            <p className="text-2xl font-bold text-white mt-1">
              Rp {totalSebelumDiskon.toLocaleString("id-ID")}
            </p>
          </div>

          {/* Pilih Tipe Diskon */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
              Pilih Jenis Diskon
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setTipeDiskon("persen"); setNilaiDiskon(""); }}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  tipeDiskon === "persen" 
                    ? "bg-amber-500 text-black" 
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                <FontAwesomeIcon icon={faPercent} size={12} /> Diskon %
              </button>
              <button
                onClick={() => { setTipeDiskon("nominal"); setNilaiDiskon(""); }}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  tipeDiskon === "nominal" 
                    ? "bg-amber-500 text-black" 
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                <FontAwesomeIcon icon={faMoneyBillWave} size={12} /> Diskon Rp
              </button>
              <button
                onClick={() => { setTipeDiskon("member"); setNilaiDiskon(""); }}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  tipeDiskon === "member" 
                    ? "bg-amber-500 text-black" 
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                <FontAwesomeIcon icon={faUserCheck} size={12} /> Member (10%)
              </button>
              <button
                onClick={() => { setTipeDiskon("promo"); setNilaiDiskon(""); }}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  tipeDiskon === "promo" 
                    ? "bg-amber-500 text-black" 
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                <FontAwesomeIcon icon={faTrophy} size={12} /> Promo
              </button>
            </div>
          </div>

          {/* Input Nilai Diskon */}
          {(tipeDiskon === "persen" || tipeDiskon === "nominal") && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                {tipeDiskon === "persen" ? "Masukkan Persentase (%)" : "Masukkan Nominal (Rp)"}
              </label>
              <input
                type="number"
                placeholder={tipeDiskon === "persen" ? "Contoh: 10" : "Contoh: 50000"}
                value={nilaiDiskon}
                onChange={(e) => setNilaiDiskon(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none transition-all"
              />
              <p className="text-[9px] text-slate-500 mt-1">
                {tipeDiskon === "persen" 
                  ? "Maksimal diskon 100%" 
                  : "Diskon tidak boleh melebihi total harga"}
              </p>
            </div>
          )}

          {/* Info Diskon Member */}
          {tipeDiskon === "member" && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
              <div className="flex items-center gap-2 justify-center">
                <FontAwesomeIcon icon={faUserCheck} className="text-emerald-400" />
                <p className="text-emerald-400 text-xs font-medium">
                  🎉 Diskon Member 10% otomatis diterapkan!
                </p>
              </div>
            </div>
          )}

          {/* Pilih Promo */}
          {tipeDiskon === "promo" && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                <FontAwesomeIcon icon={faGift} className="mr-1" /> Pilih Promo
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {promoList.map((promo) => (
                  <button
                    key={promo.id}
                    onClick={() => setNilaiDiskon(promo.id.toString())}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      nilaiDiskon === promo.id.toString() 
                        ? "bg-amber-500/20 border border-amber-500/50" 
                        : "bg-slate-800/50 border border-slate-700 hover:bg-slate-800"
                    }`}
                  >
                    <p className="font-bold text-white text-sm flex items-center gap-2">
                      <FontAwesomeIcon icon={faTrophy} className="text-amber-400 text-xs" />
                      {promo.nama}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{promo.keterangan}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Catatan/Alasan */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
              Catatan / Alasan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Promo weekend, Pelanggan setia, Komplain, dll"
              value={alasanDiskon}
              onChange={(e) => setAlasanDiskon(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none transition-all text-sm"
            />
          </div>

          {/* Preview Diskon */}
          {((tipeDiskon === "persen" && nilaiDiskon) || 
            (tipeDiskon === "nominal" && nilaiDiskon) || 
            tipeDiskon === "member" ||
            (tipeDiskon === "promo" && nilaiDiskon)) && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-amber-400 text-xs mb-2 flex items-center gap-1">
                <FontAwesomeIcon icon={faTag} size={10} /> Preview Diskon:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total awal:</span>
                  <span className="text-white font-medium">Rp {totalSebelumDiskon.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-400">Potongan diskon:</span>
                  <span className="text-amber-400 font-medium">- Rp {hitungDiskon().diskon.toLocaleString("id-ID")}</span>
                </div>
                <div className="border-t border-amber-500/30 my-1"></div>
                <div className="flex justify-between font-bold">
                  <span className="text-white">Total setelah diskon:</span>
                  <span className="text-emerald-400 text-base">
                    Rp {(totalSebelumDiskon - hitungDiskon().diskon).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-slate-800 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all"
          >
            Batal
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faTag} size={14} />
            Terapkan Diskon
          </button>
        </div>
      </div>

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