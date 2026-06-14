import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTimes, faFileExcel, faFilePdf, faCalendarAlt, 
  faPrint, faDownload, faSpinner, faFilter,
  faChartLine, faChevronLeft
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function LaporanModal({ isOpen, onClose, dataTransaksi }) {
  const [loading, setLoading] = useState(false);
  const [filterTanggal, setFilterTanggal] = useState("semua");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");

  if (!isOpen) return null;

  // Filter data berdasarkan tanggal
  const filterDataByDate = () => {
    if (filterTanggal === "semua") return dataTransaksi;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    if (filterTanggal === "hari_ini") {
      return dataTransaksi.filter(item => {
        const itemDate = new Date(item.waktu_selesai);
        return itemDate.toDateString() === today.toDateString();
      });
    } else if (filterTanggal === "minggu_ini") {
      return dataTransaksi.filter(item => {
        const itemDate = new Date(item.waktu_selesai);
        return itemDate >= startOfWeek;
      });
    } else if (filterTanggal === "bulan_ini") {
      return dataTransaksi.filter(item => {
        const itemDate = new Date(item.waktu_selesai);
        return itemDate >= startOfMonth;
      });
    } else if (filterTanggal === "tahun_ini") {
      return dataTransaksi.filter(item => {
        const itemDate = new Date(item.waktu_selesai);
        return itemDate >= startOfYear;
      });
    } else if (filterTanggal === "custom" && tanggalMulai && tanggalSelesai) {
      const start = new Date(tanggalMulai);
      const end = new Date(tanggalSelesai);
      end.setHours(23, 59, 59);
      return dataTransaksi.filter(item => {
        const itemDate = new Date(item.waktu_selesai);
        return itemDate >= start && itemDate <= end;
      });
    }
    
    return dataTransaksi;
  };

  const filteredData = filterDataByDate();

  // Hitung total
  const hitungTotal = () => {
    let totalSewa = 0;
    let totalKantin = 0;
    let totalKeseluruhan = 0;
    
    filteredData.forEach(item => {
      totalSewa += item.total_sewa || 0;
      totalKantin += item.total_fb || 0;
      totalKeseluruhan += item.total_akhir || 0;
    });
    
    return { totalSewa, totalKantin, totalKeseluruhan };
  };

  const { totalSewa, totalKantin, totalKeseluruhan } = hitungTotal();

  // Export ke Excel
  const exportToExcel = () => {
    setLoading(true);
    try {
      const exportData = filteredData.map((item, index) => ({
        "No": index + 1,
        "Tanggal": item.waktu_selesai,
        "Nomor Struk": item.id_booking,
        "Meja": item.nomor_meja,
        "Pelanggan": item.nama_pelanggan,
        "Durasi": `${item.durasi} Jam`,
        "Sewa Meja": item.total_sewa,
        "Kantin/F&B": item.total_fb,
        "Total": item.total_akhir,
        "Metode Bayar": item.metode_pembayaran?.toUpperCase(),
      }));
      
      exportData.push({
        "No": "",
        "Tanggal": "",
        "Nomor Struk": "",
        "Meja": "",
        "Pelanggan": "",
        "Durasi": "",
        "Sewa Meja": totalSewa,
        "Kantin/F&B": totalKantin,
        "Total": totalKeseluruhan,
        "Metode Bayar": "TOTAL",
      });
      
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Transaksi");
      
      const fileName = `Laporan_Transaksi_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      alert("✅ Laporan berhasil diexport ke Excel!");
    } catch (error) {
      console.error("Error export Excel:", error);
      alert("Gagal export Excel: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Export ke PDF
  const exportToPDF = () => {
    setLoading(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(0, 100, 0);
      doc.text("ROYAL CUE BILLIARD", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Jl. Jawa No. 10, Banyuwangi, Jawa Timur", 14, 28);
      doc.text(`Telp: +62 812-3456-7890`, 14, 34);
      
      let judul = "LAPORAN TRANSAKSI";
      if (filterTanggal === "hari_ini") judul = "LAPORAN TRANSAKSI - HARI INI";
      else if (filterTanggal === "minggu_ini") judul = "LAPORAN TRANSAKSI - MINGGU INI";
      else if (filterTanggal === "bulan_ini") judul = "LAPORAN TRANSAKSI - BULAN INI";
      else if (filterTanggal === "tahun_ini") judul = "LAPORAN TRANSAKSI - TAHUN INI";
      else if (filterTanggal === "custom") judul = `LAPORAN TRANSAKSI - ${tanggalMulai} s/d ${tanggalSelesai}`;
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(judul, 14, 45);
      doc.setFontSize(9);
      doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, 14, 52);
      
      const tableData = filteredData.map((item, index) => [
        index + 1,
        item.waktu_selesai,
        item.id_booking,
        item.nomor_meja,
        item.nama_pelanggan,
        `${item.durasi} Jam`,
        `Rp ${(item.total_sewa || 0).toLocaleString("id-ID")}`,
        `Rp ${(item.total_fb || 0).toLocaleString("id-ID")}`,
        `Rp ${(item.total_akhir || 0).toLocaleString("id-ID")}`,
        item.metode_pembayaran?.toUpperCase(),
      ]);
      
      autoTable(doc, {
        startY: 58,
        head: [["No", "Tanggal", "No. Struk", "Meja", "Pelanggan", "Durasi", "Sewa", "Kantin", "Total", "Metode"]],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 100, 0], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 20 },
          4: { cellWidth: 35 },
          5: { cellWidth: 20 },
          6: { cellWidth: 25 },
          7: { cellWidth: 25 },
          8: { cellWidth: 30 },
          9: { cellWidth: 25 },
        },
        foot: [[
          "", "", "", "", "", "",
          { content: `Rp ${totalSewa.toLocaleString("id-ID")}`, styles: { fontStyle: 'bold' } },
          { content: `Rp ${totalKantin.toLocaleString("id-ID")}`, styles: { fontStyle: 'bold' } },
          { content: `Rp ${totalKeseluruhan.toLocaleString("id-ID")}`, styles: { fontStyle: 'bold', textColor: [0, 100, 0] } },
          "TOTAL"
        ]],
      });
      
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Royal Cue Studio - Sistem Manajemen Billiard", 14, finalY);
      doc.text(`Total Transaksi: ${filteredData.length} transaksi`, 14, finalY + 6);
      
      const fileName = `Laporan_Transaksi_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      alert("✅ Laporan berhasil diexport ke PDF!");
    } catch (error) {
      console.error("Error export PDF:", error);
      alert("Gagal export PDF: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get periode text
  const getPeriodeText = () => {
    switch (filterTanggal) {
      case "semua": return "Semua waktu";
      case "hari_ini": return "Hari ini";
      case "minggu_ini": return "Minggu ini";
      case "bulan_ini": return "Bulan ini";
      case "tahun_ini": return "Tahun ini";
      case "custom": return `${tanggalMulai || "-"} s/d ${tanggalSelesai || "-"}`;
      default: return "Semua waktu";
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl w-full max-w-[95%] sm:max-w-md max-h-[95vh] overflow-y-auto shadow-2xl">
        
        {/* Header - Responsive */}
        <div className="sticky top-0 z-10 p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <FontAwesomeIcon icon={faPrint} className="text-[#00ff99]" />
              <span className="hidden xs:inline">Export Laporan Transaksi</span>
              <span className="xs:hidden">Export Laporan</span>
            </h3>
            <p className="text-slate-400 text-[9px] sm:text-[10px] mt-0.5 hidden xs:block">
              Export data dalam format Excel atau PDF
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white cursor-pointer p-2 -m-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-slate-800 transition-all"
            aria-label="Close modal"
          >
            <FontAwesomeIcon icon={faTimes} size={16} />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
          
          {/* Filter Tanggal Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <FontAwesomeIcon icon={faFilter} className="text-[#00ff99]" />
              Filter Periode
            </label>
            
            {/* Filter Buttons - Responsive Grid */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-2 gap-2">
              {[
                { value: "semua", label: "Semua", icon: "📊" },
                { value: "hari_ini", label: "Hari Ini", icon: "📅" },
                { value: "minggu_ini", label: "Minggu Ini", icon: "📆" },
                { value: "bulan_ini", label: "Bulan Ini", icon: "📈" },
                { value: "tahun_ini", label: "Tahun Ini", icon: "📉" },
                { value: "custom", label: "Custom", icon: "⚙️" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterTanggal(opt.value)}
                  className={`
                    px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-[11px] font-bold 
                    transition-all duration-200 cursor-pointer min-h-[40px] sm:min-h-[44px]
                    flex items-center justify-center gap-1.5
                    ${filterTanggal === opt.value
                      ? "bg-[#00ff99] text-black shadow-lg shadow-[#00ff99]/20" 
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                    }
                  `}
                >
                  <span className="text-xs sm:text-sm">{opt.icon}</span>
                  <span className="hidden xs:inline">{opt.label}</span>
                  <span className="xs:hidden">{opt.value === "custom" ? "Custom" : opt.label.substring(0, 3)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range - Responsive */}
          {filterTanggal === "custom" && (
            <div className="bg-slate-800/30 rounded-xl p-3 sm:p-4 space-y-3 animate-in fade-in duration-200">
              <label className="text-[10px] text-slate-400 font-medium">Pilih Rentang Tanggal</label>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-slate-500 block mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-[#00ff99]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 block mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={tanggalSelesai}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-[#00ff99]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Informasi Data - Summary Card */}
          <div className="bg-gradient-to-r from-[#00ff99]/10 to-transparent border border-[#00ff99]/20 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3">
              <FontAwesomeIcon icon={faChartLine} className="text-[#00ff99] text-xs sm:text-sm" />
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Ringkasan Laporan
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-slate-400">Total Transaksi:</span>
                <span className="font-bold text-white">{filteredData.length} transaksi</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-slate-400">Total Omset:</span>
                <span className="font-bold text-emerald-400 text-sm sm:text-base">
                  Rp {totalKeseluruhan.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-700/50 text-[9px] sm:text-[10px]">
                <span className="text-slate-500">Periode:</span>
                <span className="text-slate-300 font-medium text-right">
                  {getPeriodeText()}
                </span>
              </div>
            </div>
          </div>

          {/* Tombol Export - Responsive */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 pt-2">
            <button
              onClick={exportToExcel}
              disabled={loading || filteredData.length === 0}
              className="py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold text-[10px] sm:text-xs uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px] group"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faFileExcel} className="text-sm sm:text-base group-hover:scale-110 transition-transform" />
              )}
              {loading ? "Memproses..." : "Export Excel"}
            </button>
            
            <button
              onClick={exportToPDF}
              disabled={loading || filteredData.length === 0}
              className="py-2.5 sm:py-3 bg-red-600 hover:bg-red-500 rounded-xl text-white font-bold text-[10px] sm:text-xs uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px] group"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faFilePdf} className="text-sm sm:text-base group-hover:scale-110 transition-transform" />
              )}
              {loading ? "Memproses..." : "Export PDF"}
            </button>
          </div>

          {/* Tombol Cetak Langsung */}
          <button
            onClick={() => window.print()}
            disabled={filteredData.length === 0}
            className="w-full py-2.5 sm:py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-bold text-[10px] sm:text-xs uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px] group"
          >
            <FontAwesomeIcon icon={faPrint} className="group-hover:scale-110 transition-transform" />
            Cetak Langsung
          </button>

          {/* Info Footer */}
          {filteredData.length === 0 && !loading && (
            <div className="text-center text-slate-500 text-[10px] sm:text-xs py-3">
              <FontAwesomeIcon icon={faTimes} className="mr-1" />
              Tidak ada data untuk periode yang dipilih
            </div>
          )}
        </div>
      </div>
    </div>
  );
}