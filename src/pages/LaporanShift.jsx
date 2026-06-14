// src/pages/LaporanShift.jsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPrint, faEye, faSpinner, faArrowLeft,
  faFileAlt, faDownload, faTimes, faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import PrintClosingReport from "../components/PrintClosingReport";
import { printClosingReport, previewClosingReport } from "../utils/printHelper";

export default function LaporanShift() {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    waktu: "",
    nama_kasir: "",
    shift: "",
    jam_mulai: "",
    jam_selesai: "",
    total_sewa_meja: 0,
    total_kantin: 0,
    total_tunai: 0,
    total_non_tunai: 0,
    qris_amount: 0,
    transfer_amount: 0,
    grand_total: 0,
    total_transaksi: 0,
    catatan: ""
  });

  // Ambil data dari localStorage atau API
  useEffect(() => {
    loadShiftData();
  }, []);

  const loadShiftData = async () => {
    setLoading(true);
    try {
      const shiftData = localStorage.getItem("shiftReport");
      if (shiftData) {
        setReportData(JSON.parse(shiftData));
      } else {
        setReportData({
          waktu: new Date().toLocaleString("id-ID"),
          nama_kasir: localStorage.getItem("nama_kasir") || "Admin",
          shift: localStorage.getItem("shift") || "Siang",
          jam_mulai: "10:00",
          jam_selesai: "22:00",
          total_sewa_meja: 2500000,
          total_kantin: 1500000,
          total_tunai: 2000000,
          total_non_tunai: 2000000,
          qris_amount: 1200000,
          transfer_amount: 800000,
          grand_total: 4000000,
          total_transaksi: 25,
          catatan: "Shift berjalan lancar, tidak ada kendala"
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    printClosingReport("print-content");
  };

  const handlePreview = () => {
    previewClosingReport();
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <FontAwesomeIcon icon={faSpinner} spin className="text-3xl sm:text-4xl text-[#00ff99]" />
          <p className="text-slate-400 text-sm">Memuat data laporan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-3 sm:p-4 md:p-6">
      
      {/* Tombol Kembali - Touch Friendly */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 sm:mb-6 transition-all p-2 -ml-2 min-w-[44px] min-h-[44px] rounded-lg hover:bg-slate-800/50"
        aria-label="Kembali"
      >
        <FontAwesomeIcon icon={faArrowLeft} size={14} className="sm:text-base" />
        <span className="text-sm sm:text-base">Kembali</span>
      </button>

      {/* Header - Responsive */}
      <div className="mb-5 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white">
          Laporan <span className="text-[#00ff99]">Tutup Shift</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Cetak atau preview laporan closing shift kasir
        </p>
      </div>

      {/* Konten Utama - Responsive Grid */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 md:gap-6">
        
        {/* Preview Area */}
        <div className="flex-1">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6">
            {/* Header Preview */}
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 mb-3 sm:mb-4">
              <h2 className="text-white font-bold text-[11px] sm:text-xs md:text-sm uppercase tracking-wider flex items-center gap-2">
                <FontAwesomeIcon icon={faFileAlt} className="text-[#00ff99] text-xs sm:text-sm" />
                <span>Preview Struk</span>
              </h2>
              <div className="flex gap-2 w-full xs:w-auto">
                <button
                  onClick={handlePreview}
                  className="flex-1 xs:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600/80 hover:bg-blue-500 rounded-lg text-white text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all min-h-[36px]"
                >
                  <FontAwesomeIcon icon={faEye} size={10} className="sm:text-xs" />
                  <span className="hidden xs:inline">Preview</span>
                  <span className="xs:hidden">Lihat</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 xs:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-600/80 hover:bg-emerald-500 rounded-lg text-white text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all min-h-[36px]"
                >
                  <FontAwesomeIcon icon={faPrint} size={10} className="sm:text-xs" />
                  <span className="hidden xs:inline">Cetak</span>
                  <span className="xs:hidden">Print</span>
                </button>
              </div>
            </div>
            
            {/* Preview Struk - Scrollable untuk HP */}
            <div className="flex justify-center bg-white rounded-xl p-3 sm:p-4 overflow-x-auto shadow-inner">
              <div className="transform scale-100 origin-top">
                <PrintClosingReport data={reportData} />
              </div>
            </div>
            
            {/* Info Preview */}
            <p className="text-center text-[9px] sm:text-[10px] text-slate-500 mt-3">
              *Struk di atas adalah preview, ukuran sesuai thermal printer 58mm
            </p>
          </div>
        </div>

        {/* Informasi Shift - Sidebar */}
        <div className="lg:w-80 xl:w-96">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 sticky top-20">
            <h2 className="text-white font-bold text-[11px] sm:text-xs md:text-sm uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faDownload} className="text-[#00ff99]" />
              Informasi Shift
            </h2>
            
            {/* Info Grid - Responsive */}
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-slate-400">Kasir:</span>
                <span className="text-white font-medium truncate max-w-[150px] sm:max-w-[200px]">
                  {reportData.nama_kasir}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-slate-400">Shift:</span>
                <span className="text-white font-medium capitalize">{reportData.shift}</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-slate-400">Jam Kerja:</span>
                <span className="text-white font-mono text-[11px] sm:text-xs">
                  {reportData.jam_mulai} - {reportData.jam_selesai}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-slate-400">Tanggal:</span>
                <span className="text-white font-medium">{reportData.waktu.split(" ")[0]}</span>
              </div>
            </div>

            <div className="border-t border-slate-800 my-3 sm:my-4"></div>

            {/* Statistik */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-slate-400">Total Transaksi:</span>
                <span className="text-white font-bold">{reportData.total_transaksi}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs sm:text-sm">Grand Total:</span>
                <span className="text-[#00ff99] font-black text-base sm:text-lg md:text-xl">
                  Rp {reportData.grand_total.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Detail Metode (Jika ada) */}
            {(reportData.qris_amount > 0 || reportData.transfer_amount > 0) && (
              <>
                <div className="border-t border-slate-800 my-3 sm:my-4"></div>
                <div className="space-y-2">
                  <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider">Rincian Non-Tunai</p>
                  {reportData.qris_amount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">QRIS:</span>
                      <span className="text-white">Rp {reportData.qris_amount.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  {reportData.transfer_amount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Transfer:</span>
                      <span className="text-white">Rp {reportData.transfer_amount.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Catatan */}
            {reportData.catatan && (
              <>
                <div className="border-t border-slate-800 my-3 sm:my-4"></div>
                <div>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider mb-1">Catatan</p>
                  <p className="text-[10px] sm:text-xs text-slate-300 bg-slate-800/30 p-2 rounded-lg">
                    {reportData.catatan}
                  </p>
                </div>
              </>
            )}

            {/* Tombol Aksi Utama - Responsive */}
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={handlePrint}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all min-h-[44px]"
              >
                <FontAwesomeIcon icon={faPrint} size={12} className="sm:text-sm" />
                <span>Cetak</span>
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all min-h-[44px]"
              >
                <FontAwesomeIcon icon={faEye} size={12} className="sm:text-sm" />
                <span>{showPreview ? "Sembunyikan" : "Preview"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Print Content */}
      <div className="hidden" id="print-wrapper">
        <PrintClosingReport data={reportData} />
      </div>

      {/* Preview Modal untuk Mobile (Opsional) */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4 lg:hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-[95%] max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-slate-950 p-3 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-white font-bold text-sm">Preview Struk</h3>
              <button 
                onClick={() => setShowPreview(false)}
                className="p-2 -m-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-slate-800"
              >
                <FontAwesomeIcon icon={faTimes} size={16} />
              </button>
            </div>
            <div className="p-4 flex justify-center">
              <PrintClosingReport data={reportData} />
            </div>
            <div className="p-3 border-t border-slate-800">
              <button
                onClick={handlePrint}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faPrint} />
                Cetak Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}