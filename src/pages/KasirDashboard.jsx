import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, faCoffee, faHistory, faTrash, faPrint, 
  faTimes, faExchangeAlt, faLock, faPlay, faStop, 
  faUser, faClock, faMoneyBillWave, faCheck,
  faReceipt, faHourglassHalf, faPlusCircle,
  faFileExcel, faFilePdf
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FandBModal from "../components/FandBModal";
import { useCountdown } from "../hooks/useCountdown";
import { supabase } from "../supabaseClient";

export default function KasirDashboard() {
  const [daftarMeja, setDaftarMeja] = useState([]);
  const [riwayatTransaksi, setRiwayatTransaksi] = useState([]);
  const [filterAktif, setFilterAktif] = useState("Semua"); 
  const [cariNama, setCariNama] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalFB, setModalFB] = useState({ isOpen: false, mejaId: null, nomorMeja: "", pesananSaatIni: [] });
  const [modalStruk, setModalStruk] = useState({ isOpen: false, data: null });
  const [modalClosing, setModalClosing] = useState({ isOpen: false, reportData: null });

  const getHargaPerJam = (nomorMeja) => {
    if (!nomorMeja) return 50000;
    return nomorMeja.toLowerCase().includes("vip") ? 80000 : 50000;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: reservasi, error: reservasiError } = await supabase
        .from("reservasi_billiard")
        .select("*");
      
      if (reservasiError) throw reservasiError;
      
      const { data: riwayat, error: riwayatError } = await supabase
        .from("riwayat_transaksi")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (riwayatError) throw riwayatError;
      
      setDaftarMeja(reservasi || []);
      setRiwayatTransaksi(riwayat || []);
      
      console.log("Data loaded - Meja:", reservasi?.length || 0);
      
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal memuat data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    const channelReservasi = supabase
      .channel('reservasi_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reservasi_billiard' }, 
        () => fetchData()
      )
      .subscribe();
    
    const channelRiwayat = supabase
      .channel('riwayat_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'riwayat_transaksi' }, 
        () => fetchData()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channelReservasi);
      supabase.removeChannel(channelRiwayat);
    };
  }, []);

  // ==================== EXPORT EXCEL ====================
  const exportToExcel = () => {
    if (riwayatTransaksi.length === 0) {
      alert("Belum ada data transaksi untuk diexport!");
      return;
    }
    
    try {
      const exportData = riwayatTransaksi.map((item, index) => ({
        "No": index + 1,
        "Tanggal": item.waktu_selesai || "-",
        "Nomor Struk": item.id_booking || "-",
        "Meja": item.nomor_meja || "-",
        "Pelanggan": item.nama_pelanggan || "-",
        "Durasi": `${item.durasi || 1} Jam`,
        "Sewa Meja": item.total_sewa || 0,
        "Kantin/F&B": item.total_fb || 0,
        "Total": item.total_akhir || 0,
        "Metode Bayar": item.metode_pembayaran?.toUpperCase() || "-",
      }));
      
      const totalOmset = riwayatTransaksi.reduce((sum, item) => sum + (item.total_akhir || 0), 0);
      const totalSewa = riwayatTransaksi.reduce((sum, item) => sum + (item.total_sewa || 0), 0);
      const totalKantin = riwayatTransaksi.reduce((sum, item) => sum + (item.total_fb || 0), 0);
      
      exportData.push({
        "No": "", "Tanggal": "", "Nomor Struk": "", "Meja": "", "Pelanggan": "", "Durasi": "",
        "Sewa Meja": totalSewa, "Kantin/F&B": totalKantin, "Total": totalOmset, "Metode Bayar": "TOTAL",
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
    }
  };

  // ==================== EXPORT PDF ====================
  const exportToPDF = () => {
    if (riwayatTransaksi.length === 0) {
      alert("Belum ada data transaksi untuk diexport!");
      return;
    }
    
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      
      doc.setFontSize(18);
      doc.setTextColor(0, 100, 0);
      doc.text("ROYAL CUE BILLIARD", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Jl. Jawa No. 10, Banyuwangi, Jawa Timur", 14, 28);
      doc.text(`Telp: +62 812-3456-7890`, 14, 34);
      doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, 14, 40);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("LAPORAN TRANSAKSI", 14, 50);
      
      const tableData = riwayatTransaksi.map((item, index) => [
        index + 1,
        item.waktu_selesai || "-",
        item.id_booking || "-",
        item.nomor_meja || "-",
        item.nama_pelanggan || "-",
        `${item.durasi || 1} Jam`,
        `Rp ${(item.total_sewa || 0).toLocaleString("id-ID")}`,
        `Rp ${(item.total_fb || 0).toLocaleString("id-ID")}`,
        `Rp ${(item.total_akhir || 0).toLocaleString("id-ID")}`,
        item.metode_pembayaran?.toUpperCase() || "-",
      ]);
      
      const totalOmset = riwayatTransaksi.reduce((sum, item) => sum + (item.total_akhir || 0), 0);
      const totalSewa = riwayatTransaksi.reduce((sum, item) => sum + (item.total_sewa || 0), 0);
      const totalKantin = riwayatTransaksi.reduce((sum, item) => sum + (item.total_fb || 0), 0);
      
      autoTable(doc, {
        startY: 55,
        head: [["No", "Tanggal", "No. Struk", "Meja", "Pelanggan", "Durasi", "Sewa", "Kantin", "Total", "Metode"]],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 100, 0], textColor: 255, fontStyle: 'bold' },
        foot: [[
          "", "", "", "", "", "",
          { content: `Rp ${totalSewa.toLocaleString("id-ID")}`, styles: { fontStyle: 'bold' } },
          { content: `Rp ${totalKantin.toLocaleString("id-ID")}`, styles: { fontStyle: 'bold' } },
          { content: `Rp ${totalOmset.toLocaleString("id-ID")}`, styles: { fontStyle: 'bold', textColor: [0, 100, 0] } },
          "TOTAL"
        ]],
      });
      
      const fileName = `Laporan_Transaksi_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      alert("✅ Laporan berhasil diexport ke PDF!");
    } catch (error) {
      console.error("Error export PDF:", error);
      alert("Gagal export PDF: " + error.message);
    }
  };

  // Hitung endTime untuk timer
  const calculateEndTime = (jamMulai, durasiJam) => {
    if (!jamMulai || jamMulai === "-" || !durasiJam) return null;
    const [hours, minutes] = jamMulai.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    return startDate.getTime() + (durasiJam * 3600000);
  };

  // Fungsi Extend Waktu
  const extendWaktu = async (id, jamMulai, durasiSaatIni) => {
    const tambahJam = prompt("Masukkan tambahan jam (1-4 jam):", "1");
    if (!tambahJam) return;
    
    const jamTambahan = parseInt(tambahJam);
    if (isNaN(jamTambahan) || jamTambahan < 1 || jamTambahan > 4) {
      alert("Tambahan jam harus antara 1-4 jam!");
      return;
    }
    
    const durasiBaru = durasiSaatIni + jamTambahan;
    const hargaPerJam = getHargaPerJam(jamMulai);
    const biayaTambahan = jamTambahan * hargaPerJam;
    
    if (window.confirm(`Tambah ${jamTambahan} jam (${jamTambahan} x Rp ${hargaPerJam.toLocaleString("id-ID")} = Rp ${biayaTambahan.toLocaleString("id-ID")})?`)) {
      try {
        const { error } = await supabase
          .from("reservasi_billiard")
          .update({ durasi_bermain: durasiBaru })
          .eq("id", id);
        
        if (error) throw error;
        await fetchData();
        alert(`✅ Waktu bermain berhasil ditambah ${jamTambahan} jam!`);
      } catch (error) {
        console.error("Error:", error);
        alert("Gagal menambah waktu: " + error.message);
      }
    }
  };

  const ubahStatusMeja = async (id, statusBaru, namaPelanggan, nomorMeja, totalSewa, totalFB, durasi, itemFB) => {
    try {
      if (statusBaru === "Selesai") {
        const metode = prompt("Masukkan metode pembayaran (Cash / QRIS / Transfer):", "Cash") || "Cash";
        const jamSelesai = new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
        const tanggalHariIni = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });
        const totalAkhirSemua = Number(totalSewa || 0) + Number(totalFB || 0);

        const transaksiStruk = {
          noStruk: "RC-" + String(id).slice(-8),
          tanggal: `${tanggalHariIni} ${jamSelesai}`,
          kasir: "Kasir",
          meja: nomorMeja,
          pelanggan: namaPelanggan,
          durasi: durasi,
          hargaSewa: Number(totalSewa || 0),
          itemsFB: itemFB || [],
          totalFB: Number(totalFB || 0),
          totalAkhir: totalAkhirSemua,
          metode: metode.toLowerCase()
        };

        const dataStrukBaru = {
          id_booking: "RC-" + String(id).slice(-8),
          nomor_meja: nomorMeja,
          nama_pelanggan: namaPelanggan,
          durasi: durasi,
          total_sewa: Number(totalSewa || 0),
          total_fb: Number(totalFB || 0),
          total_akhir: totalAkhirSemua,
          metode_pembayaran: metode.toLowerCase(),
          waktu_selesai: `${tanggalHariIni} ${jamSelesai}`,
          pesanan_fb: itemFB || [],
          created_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase
          .from("riwayat_transaksi")
          .insert([dataStrukBaru]);
        
        if (insertError) throw insertError;

        const { error: deleteError } = await supabase
          .from("reservasi_billiard")
          .delete()
          .eq("id", id);
        
        if (deleteError) throw deleteError;

        setModalStruk({ isOpen: true, data: transaksiStruk });
        await fetchData();
        alert("✅ Transaksi berhasil!");

      } else if (statusBaru === "Playing") {
        const { error: updateError } = await supabase
          .from("reservasi_billiard")
          .update({ 
            status_pemesanan: statusBaru,
            jam_mulai: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })
          })
          .eq("id", id);
        
        if (updateError) throw updateError;
        await fetchData();
        alert("✅ Status berhasil diubah menjadi Playing!");
      }
    } catch (error) {
      console.error("ERROR:", error);
      alert("Gagal: " + error.message);
    }
  };

  const batalkanBookingPending = async (id, nomorMeja, namaPelanggan) => {
    if (window.confirm(`Batalkan pesanan ${nomorMeja} atas nama "${namaPelanggan}"?`)) {
      try {
        const { error } = await supabase
          .from("reservasi_billiard")
          .delete()
          .eq("id", id);
        
        if (error) throw error;
        await fetchData();
        alert("✅ Pesanan dibatalkan");
      } catch (error) {
        alert("Gagal: " + error.message);
      }
    }
  };

  const tanganiPindahMeja = async (idMejaAsal, nomorMejaAsal) => {
    if (!idMejaAsal) {
      alert("Data meja tidak valid!");
      return;
    }
    
    try {
      const semuaNomorMejaTerpakai = daftarMeja
        .filter(m => (m.status_pemesanan === "Playing" || m.status_pemesanan === "Disetujui") && m.id !== idMejaAsal)
        .map(m => m.nomor_meja || "").filter(n => n).map(n => n.toLowerCase());
      
      const daftarSemuaMeja = ["Meja 1", "Meja 2", "Meja 3", "Meja 4", "Meja 5", "Meja 6", "Meja 7", "Meja 8", "Meja 9", "Meja 10", "Meja VIP 1", "Meja VIP 2"];
      const mejaTersedia = daftarSemuaMeja.filter(noMeja => !semuaNomorMejaTerpakai.includes(noMeja.toLowerCase()));

      if (mejaTersedia.length === 0) {
        alert("⚠️ Semua meja terisi! Tidak ada meja kosong untuk dipindah.");
        return;
      }

      const inputMejaBaru = prompt(`Pindah dari ${nomorMejaAsal}\nMeja tersedia: ${mejaTersedia.join(", ")}\n\nMasukkan nomor meja tujuan:`);
      if (!inputMejaBaru) return;

      const mejaTujuanValid = mejaTersedia.find(m => m.toLowerCase() === inputMejaBaru.trim().toLowerCase());
      if (!mejaTujuanValid) {
        alert("⚠️ Meja tidak tersedia! Silakan pilih dari daftar yang tersedia.");
        return;
      }

      const { error } = await supabase
        .from("reservasi_billiard")
        .update({ nomor_meja: mejaTujuanValid })
        .eq("id", idMejaAsal);
      
      if (error) throw error;
      await fetchData();
      alert(`✅ Berhasil pindah dari ${nomorMejaAsal} ke ${mejaTujuanValid}`);
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal memindahkan meja: " + error.message);
    }
  };

  const tanganiClosingShift = () => {
    if (riwayatTransaksi.length === 0) {
      alert("Belum ada transaksi!");
      return;
    }

    const namaKasir = prompt("Nama Kasir:", "") || "Kasir";
    
    let totalSewaMeja = 0, totalKantin = 0, totalTunai = 0, totalNonTunai = 0;

    riwayatTransaksi.forEach((item) => {
      totalSewaMeja += item.total_sewa || 0;
      totalKantin += item.total_fb || 0;
      const metode = (item.metode_pembayaran || "").toLowerCase();
      const totalAkhir = item.total_akhir || 0;
      if (metode === "cash" || metode === "tunai") {
        totalTunai += totalAkhir;
      } else {
        totalNonTunai += totalAkhir;
      }
    });

    const waktu = new Date().toLocaleString("id-ID");
    setModalClosing({
      isOpen: true,
      reportData: {
        nama_kasir: namaKasir,
        waktu: waktu,
        total_transaksi: riwayatTransaksi.length,
        total_sewa_meja: totalSewaMeja,
        total_kantin: totalKantin,
        total_tunai: totalTunai,
        total_non_tunai: totalNonTunai,
        grand_total: totalSewaMeja + totalKantin
      }
    });
  };

  const selesaikanClosingDanReset = async () => {
    if (window.confirm("Konfirmasi tutup shift?")) {
      try {
        await supabase.from("arsip_laporan_owner").insert([modalClosing.reportData]);
        await supabase.from("riwayat_transaksi").delete().neq("id", 0);
        setRiwayatTransaksi([]);
        setModalClosing({ isOpen: false, reportData: null });
        await fetchData();
        alert("✅ Shift ditutup!");
      } catch (error) {
        alert("Gagal: " + error.message);
      }
    }
  };

  const simpanPesananKantin = async (id, keranjangBaru) => {
    if (!id) {
      alert("ID Meja tidak valid!");
      return false;
    }
    
    try {
      const { error } = await supabase
        .from("reservasi_billiard")
        .update({ pesanan_fb: keranjangBaru })
        .eq("id", id);
      
      if (error) throw error;
      await fetchData();
      alert("✅ Pesanan berhasil disimpan!");
      return true;
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal menyimpan pesanan: " + error.message);
      return false;
    }
  };

  const handlePrintStruk = () => {
    window.print();
  };

  const mejaTerfilter = daftarMeja.filter((meja) => {
    const statusPilihan = meja.status_pemesanan || "Pending";
    const namaPelanggan = meja.nama_pelanggan || "";
    const nomorMeja = meja.nomor_meja || "";
    
    const cocokFilter = filterAktif === "Semua" ? true : 
      (filterAktif === "Riwayat" ? false : statusPilihan.toLowerCase() === filterAktif.toLowerCase());
    const cocokCari = namaPelanggan.toLowerCase().includes(cariNama.toLowerCase()) || 
                      nomorMeja.toLowerCase().includes(cariNama.toLowerCase());
    return cocokFilter && cocokCari;
  });

  const riwayatTerfilter = riwayatTransaksi.filter((item) => 
    (item.nama_pelanggan || "").toLowerCase().includes(cariNama.toLowerCase()) || 
    (item.nomor_meja || "").toLowerCase().includes(cariNama.toLowerCase())
  );
  
  const totalOmsetHariIni = riwayatTransaksi.reduce((acc, curr) => acc + (curr.total_akhir || 0), 0);

  if (loading) {
    return <div className="min-h-screen bg-[#090D1A] flex items-center justify-center text-emerald-400 text-xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#090D1A] bg-gradient-to-tr from-[#090D1A] via-[#0E172A] to-[#0F172A] text-slate-100 p-4 md:p-8 font-sans">
      
      {/* HEADER */}
      <div className="no-print mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-800/60 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Royal Cue <span className="text-emerald-400">Dashboard</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">Sistem Billing & Kantin Terpadu</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={exportToExcel}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
              title="Export ke Excel"
            >
              <FontAwesomeIcon icon={faFileExcel} size={14} /> Export Excel
            </button>

            <button
              onClick={exportToPDF}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
              title="Export ke PDF"
            >
              <FontAwesomeIcon icon={faFilePdf} size={14} /> Export PDF
            </button>

            <button
              onClick={tanganiClosingShift}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
            >
              <FontAwesomeIcon icon={faLock} size={14} /> Tutup Shift
            </button>

            <div className="bg-slate-900/80 backdrop-blur-md border border-emerald-500/20 px-4 py-2 rounded-xl min-w-[140px]">
              <div className="flex items-center gap-1.5 mb-0.5">
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-emerald-400 text-[11px]" />
                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Omset Shift</p>
              </div>
              <p className="text-base md:text-lg font-black text-emerald-400 text-right">
                Rp {totalOmsetHariIni.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="bg-slate-950/40 backdrop-blur-md border border-slate-800/80 p-3 rounded-2xl flex flex-col lg:flex-row gap-3 justify-between items-center mt-6">
          <div className="relative w-full lg:max-w-md">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Cari meja atau pelanggan..." 
              value={cariNama} 
              onChange={(e) => setCariNama(e.target.value)} 
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-white text-sm focus:outline-none focus:border-emerald-500" 
            />
          </div>
          <div className="flex gap-1 bg-slate-900/90 p-1 rounded-xl">
            {["Semua", "Pending", "Playing", "Riwayat"].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setFilterAktif(tab)} 
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterAktif === tab 
                    ? "bg-emerald-500 text-slate-950" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {tab === "Riwayat" ? <FontAwesomeIcon icon={faHistory} size={12} className="inline mr-1" /> : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RENDER KONTEN */}
      <div className="no-print">
        {filterAktif === "Riwayat" ? (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden">
            <div className="p-3 bg-slate-950/40 border-b border-slate-800 text-xs font-bold text-slate-400">
              <FontAwesomeIcon icon={faHistory} size={12} className="inline mr-1" /> Laporan Transaksi Selesai ({riwayatTerfilter.length})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/60 text-[9px] font-bold text-slate-400">
                  <tr>
                    <th className="p-3">Waktu</th>
                    <th className="p-3">Meja</th>
                    <th className="p-3">Pelanggan</th>
                    <th className="p-3">Sewa</th>
                    <th className="p-3">Kantin</th>
                    <th className="p-3">Total</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {riwayatTerfilter.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500">Belum ada transaksi</td>
                    </tr>
                  ) : (
                    riwayatTerfilter.map((item, idx) => (
                      <tr key={idx} className="border-t border-slate-800/40">
                        <td className="p-3 text-[10px]">{item.waktu_selesai}</td>
                        <td className="p-3 font-bold text-emerald-400 text-sm">{item.nomor_meja || "-"}</td>
                        <td className="p-3 font-bold text-white text-sm">{item.nama_pelanggan || "-"}</td>
                        <td className="p-3 text-[10px]">Rp {(item.total_sewa || 0).toLocaleString("id-ID")}</td>
                        <td className="p-3 text-[10px] text-amber-400">Rp {(item.total_fb || 0).toLocaleString("id-ID")}</td>
                        <td className="p-3 font-bold text-emerald-400 text-sm">Rp {(item.total_akhir || 0).toLocaleString("id-ID")}</td>
                        <td className="p-3 text-center">
                          <button 
                            onClick={() => {
                              const strukData = {
                                noStruk: item.id_booking,
                                tanggal: item.waktu_selesai,
                                meja: item.nomor_meja,
                                pelanggan: item.nama_pelanggan,
                                durasi: item.durasi,
                                hargaSewa: item.total_sewa,
                                itemsFB: item.pesanan_fb || [],
                                totalFB: item.total_fb,
                                totalAkhir: item.total_akhir,
                                metode: item.metode_pembayaran
                              };
                              setModalStruk({ isOpen: true, data: strukData });
                            }} 
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-all"
                          >
                            <FontAwesomeIcon icon={faPrint} size={12} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mejaTerfilter.length === 0 ? (
              <div className="col-span-full text-center text-slate-500 py-20">
                🎱 Tidak ada meja aktif. Silakan buat reservasi terlebih dahulu.
              </div>
            ) : (
              mejaTerfilter.map((meja) => {
                const statusSekarang = meja.status_pemesanan || "Pending";
                const namaPelanggan = meja.nama_pelanggan || "-";
                const nomorMeja = meja.nomor_meja || "Meja ?";
                const durasiBermain = meja.durasi_bermain || 1;
                const pesananFB = meja.pesanan_fb || [];
                const jamMulai = meja.jam_mulai || "-";
                const idBooking = meja.id_booking || ("RC-" + String(meja.id).slice(-5));
                const isPlaying = statusSekarang === "Playing";
                
                const totalBelanjaFB = (pesananFB || []).reduce((acc, curr) => acc + ((curr.harga || 0) * (curr.qty || 1)), 0);
                const hargaPerJam = getHargaPerJam(nomorMeja);
                const totalBiayaSewa = durasiBermain * hargaPerJam;
                const totalTagihan = totalBiayaSewa + totalBelanjaFB;
                
                // MENGGUNAKAN useCountdown HOOK
                const endTime = calculateEndTime(jamMulai, durasiBermain);
                const { formatted, isExpired, isExpiring } = useCountdown(isPlaying ? endTime : null);
                
                return (
                  <div key={meja.id} className={`bg-slate-900/60 border rounded-2xl p-5 relative overflow-hidden hover:border-emerald-500/50 transition-all duration-300 ${
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
                          onClick={() => tanganiPindahMeja(meja.id, nomorMeja)} 
                          className="p-1.5 rounded-lg border transition-all bg-purple-500/20 border-purple-500/30 text-purple-400 cursor-pointer hover:bg-purple-500/30 hover:scale-105"
                          title="Pindah Meja"
                        >
                          <FontAwesomeIcon icon={faExchangeAlt} size={13} />
                        </button>
                        
                        <button 
                          onClick={() => {
                            setModalFB({ 
                              isOpen: true, 
                              mejaId: meja.id, 
                              nomorMeja: nomorMeja, 
                              pesananSaatIni: pesananFB 
                            });
                          }} 
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
                              onClick={() => extendWaktu(meja.id, nomorMeja, durasiBermain)}
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
                    
                    <div className="flex gap-2">
                      {statusSekarang === "Pending" ? (
                        <>
                          <button 
                            onClick={() => ubahStatusMeja(meja.id, "Playing", namaPelanggan, nomorMeja, totalBiayaSewa, totalBelanjaFB, durasiBermain, pesananFB)} 
                            className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                          >
                            <FontAwesomeIcon icon={faPlay} size={10} className="mr-1" /> START MAIN
                          </button>
                          <button 
                            onClick={() => batalkanBookingPending(meja.id, nomorMeja, namaPelanggan)} 
                            className="px-3 bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl cursor-pointer hover:bg-rose-500/30 transition-all"
                            title="Batalkan"
                          >
                            <FontAwesomeIcon icon={faTrash} size={13} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button disabled className="flex-1 bg-slate-800/50 text-slate-600 font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider cursor-not-allowed">
                            <FontAwesomeIcon icon={faPlay} size={10} className="mr-1" /> START MAIN
                          </button>
                          <button 
                            onClick={() => ubahStatusMeja(meja.id, "Selesai", namaPelanggan, nomorMeja, totalBiayaSewa, totalBelanjaFB, durasiBermain, pesananFB)} 
                            className={`flex-1 font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all ${isExpired ? "bg-red-600 hover:bg-red-500" : "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500"} cursor-pointer active:scale-95`}
                          >
                            <FontAwesomeIcon icon={faStop} size={10} className="mr-1" /> STOP & BAYAR
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* MODAL F&B */}
      <FandBModal 
        isOpen={modalFB.isOpen} 
        onClose={() => setModalFB({ ...modalFB, isOpen: false })} 
        mejaId={modalFB.mejaId} 
        nomorMeja={modalFB.nomorMeja} 
        pesananSaatIni={modalFB.pesananSaatIni} 
        onSave={simpanPesananKantin} 
      />

      {/* MODAL CLOSING SHIFT */}
      {modalClosing.isOpen && modalClosing.reportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 no-print">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl max-w-sm w-full">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
              <span className="text-purple-400 font-bold text-xs">X-REPORT CLOSING</span>
              <button onClick={() => setModalClosing({ isOpen: false, reportData: null })} className="text-slate-400 hover:text-white cursor-pointer">
                <FontAwesomeIcon icon={faTimes} size={16} />
              </button>
            </div>
            <div className="bg-white text-black p-3 font-mono text-[10px] rounded-xl">
              <div className="text-center border-b pb-1 mb-2">
                <h4 className="font-bold">ROYAL CUE BILLIARD</h4>
                <p className="text-[8px]">LAPORAN TUTUP SHIFT</p>
              </div>
              <div>WAKTU: {modalClosing.reportData.waktu}</div>
              <div>KASIR: {modalClosing.reportData.nama_kasir}</div>
              <div className="border-t my-1"></div>
              <div className="flex justify-between"><span>Sewa Meja:</span><span>Rp {modalClosing.reportData.total_sewa_meja.toLocaleString("id-ID")}</span></div>
              <div className="flex justify-between"><span>Kantin:</span><span>Rp {modalClosing.reportData.total_kantin.toLocaleString("id-ID")}</span></div>
              <div className="flex justify-between"><span>Tunai:</span><span>Rp {modalClosing.reportData.total_tunai.toLocaleString("id-ID")}</span></div>
              <div className="flex justify-between"><span>Non-Tunai:</span><span>Rp {modalClosing.reportData.total_non_tunai.toLocaleString("id-ID")}</span></div>
              <div className="border-t my-1 pt-1 font-bold flex justify-between">
                <span>TOTAL:</span>
                <span>Rp {modalClosing.reportData.grand_total.toLocaleString("id-ID")}</span>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <button onClick={() => window.print()} className="py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold cursor-pointer">
                <FontAwesomeIcon icon={faPrint} size={12} className="mr-1" /> Cetak
              </button>
              <button onClick={selesaikanClosingDanReset} className="py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold cursor-pointer">
                <FontAwesomeIcon icon={faCheck} size={12} className="mr-1" /> Selesai & Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL STRUK PEMBAYARAN */}
      {modalStruk.isOpen && modalStruk.data && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            
            <div className="p-6 text-center border-b border-slate-800">
              <FontAwesomeIcon icon={faReceipt} className="text-[#00ff99] text-3xl mb-3" />
              <h3 className="text-white font-bold uppercase tracking-widest text-sm">Pembayaran Berhasil</h3>
            </div>

            <div id="thermal-receipt" className="bg-white p-6 text-black font-mono text-[11px] leading-tight mx-auto my-2 shadow-inner max-w-[280px] rounded-xl">
              <div className="text-center mb-3">
                <h2 className="font-bold text-sm uppercase">Royal Cue Studio</h2>
                <p className="text-[9px]">Jl. Jawa No. 10, Banyuwangi</p>
                <p className="text-[9px]">WA: 0812-3456-7890</p>
                <p className="border-t border-dashed border-black/30 my-2"></p>
              </div>

              <div className="mb-3 space-y-0.5">
                <p>No: {modalStruk.data.noStruk}</p>
                <p>Tgl: {modalStruk.data.tanggal}</p>
                <p>Meja: {modalStruk.data.meja}</p>
                <p>Pel: {modalStruk.data.pelanggan}</p>
                <p>Durasi: {modalStruk.data.durasi} Jam</p>
                <p className="border-t border-dashed border-black/30 my-2"></p>
              </div>

              <div className="mb-3">
                <div className="flex justify-between">
                  <span>Sewa Meja</span>
                  <span>Rp {modalStruk.data.hargaSewa?.toLocaleString("id-ID")}</span>
                </div>
                {modalStruk.data.itemsFB && modalStruk.data.itemsFB.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[10px]">
                    <span>{item.nama} x{item.qty}</span>
                    <span>Rp {((item.harga || 0) * (item.qty || 1)).toLocaleString("id-ID")}</span>
                  </div>
                ))}
                <p className="border-t border-dashed border-black/30 my-2"></p>
              </div>

              <div className="text-right space-y-0.5">
                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL</span>
                  <span>Rp {modalStruk.data.totalAkhir?.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>METODE</span>
                  <span className="font-bold">{modalStruk.data.metode?.toUpperCase()}</span>
                </div>
              </div>

              <div className="text-center mt-4 pt-2 border-t border-dashed border-black/30">
                <p className="text-[10px] font-bold">TERIMA KASIH</p>
                <p className="text-[9px]">SELAMAT BERLATIH KEMBALI!</p>
              </div>
            </div>

            <div className="p-6 flex gap-3">
              <button 
                onClick={() => setModalStruk({ isOpen: false, data: null })}
                className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold text-xs uppercase cursor-pointer hover:bg-slate-700 transition-all"
              >
                <FontAwesomeIcon icon={faTimes} size={12} className="mr-1" /> Tutup
              </button>
              <button 
                onClick={handlePrintStruk}
                className="flex-1 py-3 bg-[#00ff99] text-black font-black rounded-xl text-xs uppercase flex items-center justify-center gap-2 cursor-pointer hover:bg-[#00cc7a] transition-all"
              >
                <FontAwesomeIcon icon={faPrint} size={12} /> Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #thermal-receipt, #thermal-receipt * {
            visibility: visible;
          }
          #thermal-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 10px;
            box-shadow: none;
          }
          @page {
            margin: 0;
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .fixed.z-50, .fixed.z-200 {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>

    </div>
  );
}