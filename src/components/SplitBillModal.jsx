// src/components/SplitBillModal.jsx
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTimes, faUsers, faMoneyBillWave, faPrint, 
  faCopy, faCheck, faUserPlus, faUserMinus,
  faReceipt, faWallet, faQrcode, faCreditCard
} from "@fortawesome/free-solid-svg-icons";

export default function SplitBillModal({ 
  isOpen, 
  onClose, 
  totalTagihan, 
  items, 
  meja, 
  pelanggan,
  onProcessSplit 
}) {
  const [jumlahOrang, setJumlahOrang] = useState(2);
  const [metodePembayaran, setMetodePembayaran] = useState("cash");
  const [activeSplitIndex, setActiveSplitIndex] = useState(null);
  const [splitResults, setSplitResults] = useState([]);
  const [isSplitProcessed, setIsSplitProcessed] = useState(false);

  const metodeList = [
    { value: "cash", label: "Cash", icon: faMoneyBillWave, shortLabel: "💵", color: "bg-emerald-600" },
    { value: "qris", label: "QRIS", icon: faQrcode, shortLabel: "📱", color: "bg-blue-600" },
    { value: "transfer", label: "Transfer", icon: faCreditCard, shortLabel: "🏦", color: "bg-purple-600" }
  ];

  const totalPerOrang = totalTagihan / jumlahOrang;
  const sisaRupiah = totalTagihan % jumlahOrang;
  const pembulatanPerOrang = Math.floor(totalPerOrang);
  const orangTerakhir = pembulatanPerOrang + sisaRupiah;

  // Hitung pembagian per orang
  const hitungPembagian = () => {
    const pembagian = [];
    for (let i = 1; i <= jumlahOrang; i++) {
      pembagian.push({
        orang: i,
        total: i === jumlahOrang ? orangTerakhir : pembulatanPerOrang,
        metode: metodePembayaran,
        dibayar: false,
        items: items ? [...items] : []
      });
    }
    setSplitResults(pembagian);
    setIsSplitProcessed(false);
    setActiveSplitIndex(0);
  };

  // Proses pembayaran per orang
  const prosesBayarPerOrang = (index) => {
    const updated = [...splitResults];
    updated[index].dibayar = true;
    setSplitResults(updated);
    setActiveSplitIndex(index + 1);
    
    if (updated.every(p => p.dibayar)) {
      setIsSplitProcessed(true);
    }
  };

  // Cetak struk per orang
  const printStrukPerOrang = (orang) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Royal Cue - Struk Split Bill</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; font-size: 12px; background: white; }
            .receipt { max-width: 280px; margin: 0 auto; background: white; padding: 15px; }
            .text-center { text-align: center; }
            .border-dashed { border-top: 1px dashed #000; margin: 8px 0; }
            .flex { display: flex; justify-content: space-between; }
            .font-bold { font-weight: bold; }
            h4 { margin: 0; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="text-center">
              <h4>ROYAL CUE BILLIARD</h4>
              <p>Jl. Jawa No. 10, Banyuwangi</p>
              <p>WA: 0812-3456-7890</p>
              <div class="border-dashed"></div>
              <p><strong>STRUK SPLIT BILL</strong></p>
              <p>Orang ke-${orang.orang} dari ${splitResults.length} orang</p>
              <div class="border-dashed"></div>
            </div>
            <p>Meja: ${meja}</p>
            <p>Pelanggan: ${pelanggan}</p>
            <p>Tanggal: ${new Date().toLocaleString("id-ID")}</p>
            <div class="border-dashed"></div>
            <div class="flex"><span>Total Tagihan:</span><span>Rp ${totalTagihan.toLocaleString("id-ID")}</span></div>
            <div class="flex"><span>Dibagi:</span><span>${splitResults.length} orang</span></div>
            <div class="border-dashed"></div>
            <div class="flex font-bold"><span>Bayar:</span><span>Rp ${orang.total.toLocaleString("id-ID")}</span></div>
            <div class="flex"><span>Metode:</span><span>${orang.metode.toUpperCase()}</span></div>
            <div class="border-dashed"></div>
            <div class="text-center">
              <p>Terima Kasih</p>
              <p>Selamat Berlatih Kembali!</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Proses semua split bill
  const handleProcessAll = async () => {
    if (splitResults.every(p => p.dibayar)) {
      onProcessSplit(splitResults, totalTagihan);
      onClose();
    } else {
      alert("Belum semua orang membayar!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl w-full max-w-[95%] sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* HEADER - Responsive */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faUsers} className="text-emerald-400 text-sm sm:text-lg" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base sm:text-lg">Split Bill</h3>
              <p className="text-slate-400 text-[10px] sm:text-sm">
                Meja {meja} - {pelanggan}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-2 -m-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-slate-800 transition-all"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} size={18} className="sm:text-xl" />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          
          {/* INFORMASI TOTAL - Responsive */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 sm:p-4 mb-4 sm:mb-5">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <span className="text-slate-400 text-xs sm:text-sm">Total Tagihan:</span>
              <span className="text-emerald-400 font-black text-xl sm:text-2xl break-words">
                Rp {totalTagihan.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {splitResults.length === 0 ? (
            // FORM SETTING SPLIT - Responsive
            <div className="space-y-4 sm:space-y-5">
              {/* Jumlah Orang */}
              <div>
                <label className="text-slate-400 text-xs sm:text-sm block mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUsers} className="text-sm" /> Jumlah Orang
                </label>
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    onClick={() => setJumlahOrang(Math.max(2, jumlahOrang - 1))}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faUserMinus} className="text-sm sm:text-base" />
                  </button>
                  <span className="text-2xl sm:text-3xl font-bold text-white w-12 sm:w-16 text-center">
                    {jumlahOrang}
                  </span>
                  <button
                    onClick={() => setJumlahOrang(Math.min(10, jumlahOrang + 1))}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faUserPlus} className="text-sm sm:text-base" />
                  </button>
                </div>
                <p className="text-slate-500 text-[10px] sm:text-xs mt-2">
                  Per orang: Rp {totalPerOrang.toLocaleString("id-ID")}
                  {sisaRupiah > 0 && (
                    <span className="block xs:inline">
                      {' '}({jumlahOrang - 1} orang: Rp {pembulatanPerOrang.toLocaleString("id-ID")}, 
                      1 orang: Rp {orangTerakhir.toLocaleString("id-ID")})
                    </span>
                  )}
                </p>
              </div>

              {/* Metode Pembayaran - Responsive Grid */}
              <div>
                <label className="text-slate-400 text-xs sm:text-sm block mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faWallet} className="text-sm" /> Metode Pembayaran
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {metodeList.map(metode => (
                    <button
                      key={metode.value}
                      onClick={() => setMetodePembayaran(metode.value)}
                      className={`
                        py-2.5 sm:py-3 rounded-xl font-bold text-[10px] sm:text-sm transition-all
                        flex items-center justify-center gap-1 sm:gap-2 min-h-[44px]
                        ${metodePembayaran === metode.value
                          ? `${metode.color} text-white`
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }
                      `}
                    >
                      <span className="text-xs sm:text-base">{metode.shortLabel}</span>
                      <span className="hidden xs:inline">{metode.label}</span>
                      <span className="xs:hidden text-[9px]">{metode.label.substring(0, 3)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2 sm:pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm transition-all min-h-[44px]"
                >
                  Batal
                </button>
                <button
                  onClick={hitungPembagian}
                  className="flex-1 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all min-h-[44px]"
                >
                  <FontAwesomeIcon icon={faCheck} className="text-xs sm:text-sm" />
                  <span className="hidden xs:inline">Hitung Pembagian</span>
                  <span className="xs:hidden">Hitung</span>
                </button>
              </div>
            </div>
          ) : (
            // DAFTAR PEMBAGIAN PER ORANG - Responsive
            <div className="space-y-3 sm:space-y-4">
              <div className="max-h-[350px] sm:max-h-[400px] overflow-y-auto space-y-2 sm:space-y-3 pr-1">
                {splitResults.map((orang, idx) => (
                  <div
                    key={idx}
                    className={`bg-slate-800/50 rounded-xl p-3 sm:p-4 transition-all ${
                      orang.dibayar ? "border-emerald-500/50 bg-emerald-500/10" : "border-slate-700"
                    } border`}
                  >
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2 sm:mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                          orang.dibayar ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-white"
                        }`}>
                          {orang.dibayar ? (
                            <FontAwesomeIcon icon={faCheck} className="text-xs sm:text-sm" />
                          ) : (
                            <span className="font-bold text-xs sm:text-sm">{orang.orang}</span>
                          )}
                        </div>
                        <span className="font-bold text-white text-xs sm:text-sm">Orang ke-{orang.orang}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-bold text-sm sm:text-base">
                          Rp {orang.total.toLocaleString("id-ID")}
                        </p>
                        <p className="text-[8px] sm:text-[9px] text-slate-500 uppercase">{orang.metode}</p>
                      </div>
                    </div>

                    {/* Daftar Items */}
                    {orang.items && orang.items.length > 0 && (
                      <div className="mb-2 sm:mb-3 text-[9px] sm:text-xs text-slate-400 space-y-0.5">
                        {orang.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="truncate max-w-[150px] sm:max-w-[200px]">{item.nama} x{item.qty || 1}</span>
                            <span>Rp {((item.harga || 0) * (item.qty || 1)).toLocaleString("id-ID")}</span>
                          </div>
                        ))}
                        {orang.items.length > 3 && (
                          <p className="text-slate-500 text-[8px]">+{orang.items.length - 3} item lainnya</p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 mt-2">
                      {!orang.dibayar ? (
                        <button
                          onClick={() => prosesBayarPerOrang(idx)}
                          className="flex-1 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all min-h-[40px]"
                        >
                          <FontAwesomeIcon icon={faMoneyBillWave} className="text-xs sm:text-sm" />
                          <span className="hidden xs:inline">Bayar</span>
                          <span className="xs:hidden">Bayar</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => printStrukPerOrang(orang)}
                          className="flex-1 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all min-h-[40px]"
                        >
                          <FontAwesomeIcon icon={faPrint} className="text-xs sm:text-sm" />
                          <span className="hidden xs:inline">Cetak Struk</span>
                          <span className="xs:hidden">Cetak</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* TOTAL KESELURUHAN */}
              <div className="bg-slate-800/30 rounded-xl p-3 sm:p-4">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-400">Total Dibayar:</span>
                  <span className="text-white font-bold">
                    Rp {splitResults.filter(p => p.dibayar).reduce((sum, p) => sum + p.total, 0).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm mt-1">
                  <span className="text-slate-400">Sisa:</span>
                  <span className={splitResults.every(p => p.dibayar) ? "text-emerald-400" : "text-amber-400"}>
                    Rp {(totalTagihan - splitResults.filter(p => p.dibayar).reduce((sum, p) => sum + p.total, 0)).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* TOMBOL SELESAI */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSplitResults([])}
                  className="flex-1 py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm transition-all min-h-[44px]"
                >
                  Kembali
                </button>
                <button
                  onClick={handleProcessAll}
                  disabled={!splitResults.every(p => p.dibayar)}
                  className="flex-1 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all min-h-[44px]"
                >
                  <FontAwesomeIcon icon={faCheck} className="text-xs sm:text-sm" />
                  <span className="hidden xs:inline">Selesaikan Split Bill</span>
                  <span className="xs:hidden">Selesai</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {splitResults.length === 0 && (
          <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/50">
            <p className="text-[8px] sm:text-[10px] text-slate-500 text-center">
              Fitur Split Bill - Bayar terpisah untuk rombongan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}