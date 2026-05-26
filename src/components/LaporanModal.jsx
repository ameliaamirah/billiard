import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTimes, faFileExcel, faFilePdf, faCalendarAlt, 
  faPrint, faDownload, faSpinner 
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
      
      // Tambahkan baris total
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
      
      // Format kolom currency
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:J1');
      for (let R = range.s.r + 1; R <= range.e.r; R++) {
        const sewaCell = ws[XLSX.utils.encode_cell({ r: R, c: 6 })];
        const kantinCell = ws[XLSX.utils.encode_cell({ r: R, c: 7 })];
        const totalCell = ws[XLSX.utils.encode_cell({ r: R, c: 8 })];
        if (sewaCell) sewaCell.z = '#,##0';
        if (kantinCell) kantinCell.z = '#,##0';
        if (totalCell) totalCell.z = '#,##0';
      }
      
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
      
      // Judul Laporan
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      let judul = "LAPORAN TRANSAKSI";
      if (filterTanggal === "hari_ini") judul = "LAPORAN TRANSAKSI - HARI INI";
      else if (filterTanggal === "minggu_ini") judul = "LAPORAN TRANSAKSI - MINGGU INI";
      else if (filterTanggal === "bulan_ini") judul = "LAPORAN TRANSAKSI - BULAN INI";
      else if (filterTanggal === "tahun_ini") judul = "LAPORAN TRANSAKSI - TAHUN INI";
      else if (filterTanggal === "custom") judul = `LAPORAN TRANSAKSI - ${tanggalMulai} s/d ${tanggalSelesai}`;
      
      doc.text(judul, 14, 45);
      doc.setFontSize(9);
      doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, 14, 52);
      
      // Tabel data
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

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider">
            <FontAwesomeIcon icon={faPrint} className="text-[#00ff99] mr-2" />
            Export Laporan Transaksi
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Filter Tanggal */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
              Filter Periode
            </label>
            
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "semua", label: "Semua" },
                { value: "hari_ini", label: "Hari Ini" },
                { value: "minggu_ini", label: "Minggu Ini" },
                { value: "bulan_ini", label: "Bulan Ini" },
                { value: "tahun_ini", label: "Tahun Ini" },
                { value: "custom", label: "Custom" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterTanggal(opt.value)}
                  className={`px-3 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    filterTanggal === opt.value
                      ? "bg-[#00ff99] text-black"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          {filterTanggal === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400">Tanggal Mulai</label>
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 p-2 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Tanggal Selesai</label>
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 p-2 rounded-lg text-white text-sm"
                />
              </div>
            </div>
          )}

          {/* Informasi Data */}
          <div className="bg-slate-800/50 rounded-xl p-3">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-400">Total Transaksi:</span>
              <span className="font-bold text-white">{filteredData.length}</span>
            </div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-400">Total Omset:</span>
              <span className="font-bold text-emerald-400">Rp {totalKeseluruhan.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Periode:</span>
              <span className="text-slate-300 text-[10px]">
                {filterTanggal === "semua" && "Semua waktu"}
                {filterTanggal === "hari_ini" && "Hari ini"}
                {filterTanggal === "minggu_ini" && "Minggu ini"}
                {filterTanggal === "bulan_ini" && "Bulan ini"}
                {filterTanggal === "tahun_ini" && "Tahun ini"}
                {filterTanggal === "custom" && `${tanggalMulai || "-"} s/d ${tanggalSelesai || "-"}`}
              </span>
            </div>
          </div>

          {/* Tombol Export */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            <button
              onClick={exportToExcel}
              disabled={loading || filteredData.length === 0}
              className="py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <FontAwesomeIcon icon={faFileExcel} />
              {loading ? "Memproses..." : "Export Excel"}
            </button>
            <button
              onClick={exportToPDF}
              disabled={loading || filteredData.length === 0}
              className="py-3 bg-red-600 hover:bg-red-500 rounded-xl text-white font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <FontAwesomeIcon icon={faFilePdf} />
              {loading ? "Memproses..." : "Export PDF"}
            </button>
          </div>

          {/* Tombol Cetak Langsung */}
          <button
            onClick={() => window.print()}
            disabled={filteredData.length === 0}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <FontAwesomeIcon icon={faPrint} />
            Cetak Langsung
          </button>
        </div>
      </div>
    </div>
  );
}