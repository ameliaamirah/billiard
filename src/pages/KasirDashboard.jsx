// src/pages/KasirDashboard.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, faCoffee, faHistory, faPrint, 
  faTimes, faLock, faUser, faClock, faMoneyBillWave, faCheck,
  faReceipt, faFileExcel, faFilePdf, faPlus, faPlay, faStop, faTag,
  faUsers, faBell
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FandBModal from "../components/FandBModal";
import MejaCard from "../components/MejaCard";
import ModalBayarDulu from "../components/ModalBayarDulu";
import ModalDiskon from "../features/diskon/ModalDiskon";
import useDiskon from "../features/diskon/useDiskon";
import SplitBillModal from "../components/SplitBillModal";
import NotificationBell from "../components/NotificationBell";
import { useRealtimeNotification } from "../hooks/useRealtimeNotification";
import { supabase } from "../supabaseClient";

export default function KasirDashboard() {
  const navigate = useNavigate();
  const [daftarMeja, setDaftarMeja] = useState([]);
  const [riwayatTransaksi, setRiwayatTransaksi] = useState([]);
  const [filterAktif, setFilterAktif] = useState("Semua"); 
  const [cariNama, setCariNama] = useState("");
  const [loading, setLoading] = useState(false);

  // State untuk Split Bill
  const [showSplitBillModal, setShowSplitBillModal] = useState(false);
  const [splitBillData, setSplitBillData] = useState({
    total: 0,
    items: [],
    meja: "",
    pelanggan: ""
  });

  const [modalFB, setModalFB] = useState({ isOpen: false, mejaId: null, nomorMeja: "", pesananSaatIni: [] });
  const [modalStruk, setModalStruk] = useState({ isOpen: false, data: null });
  const [modalClosing, setModalClosing] = useState({ isOpen: false, reportData: null });
  const [modalBayar, setModalBayar] = useState({ isOpen: false, meja: null, totalBiaya: 0, totalSewa: 0, totalFB: 0 });
  const [modalDiskon, setModalDiskon] = useState({ isOpen: false, mejaId: null, nomorMeja: "", pelanggan: "", totalSebelumDiskon: 0 });

  const { diskonAktif, applyDiskon, resetDiskon, hitungTotalSetelahDiskon } = useDiskon();
  
  // Hook notifikasi real-time
  const { notifyWaktuHampirHabis, notifyWaktuHabis } = useRealtimeNotification();
  
  // Ref untuk track notifikasi yang sudah dikirim
  const notifiedRef = useRef({});

  const getHargaPerJam = (nomorMeja) => {
    if (!nomorMeja) return 50000;
    return nomorMeja.toLowerCase().includes("vip") ? 80000 : 50000;
  };

  // Fungsi untuk menghitung end time
  const calculateEndTime = (jamMulai, durasiJam) => {
    if (!jamMulai || jamMulai === "-" || jamMulai === "" || !durasiJam) return null;
    const [hours, minutes] = jamMulai.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    return startDate.getTime() + (durasiJam * 3600000);
  };

  // Fungsi untuk membuka modal split bill
  const openSplitBill = (meja, pelanggan, total, items) => {
    setSplitBillData({
      total: total,
      items: items || [],
      meja: meja,
      pelanggan: pelanggan
    });
    setShowSplitBillModal(true);
  };

  // Fungsi proses setelah split bill selesai
  const handleSplitBillProcessed = async (splitResults, totalTagihan) => {
    console.log("Split bill processed:", splitResults);
    alert(`✅ Split bill berhasil!\n${splitResults.length} orang telah membayar.\nTotal: Rp ${totalTagihan.toLocaleString("id-ID")}`);
    setShowSplitBillModal(false);
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

  // Fungsi untuk membatalkan reservasi yang sudah lewat tanggal
  const batalkanReservasiKadaluarsa = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: kadaluarsa, error: selectError } = await supabase
        .from("reservasi_billiard")
        .select("*")
        .lt("tanggal_main", today)
        .in("status_pemesanan", ["Pending", "Sudah Dibayar", "Playing"]);
      
      if (selectError) throw selectError;
      
      if (kadaluarsa && kadaluarsa.length > 0) {
        for (const reservasi of kadaluarsa) {
          await supabase.from("reservasi_billiard").delete().eq("id", reservasi.id);
        }
        await fetchData();
        if (kadaluarsa.length > 0) {
          alert(`⚠️ ${kadaluarsa.length} reservasi kadaluarsa otomatis dibatalkan!`);
        }
      }
    } catch (error) {
      console.error("Error membatalkan reservasi kadaluarsa:", error);
    }
  };

  // Cek waktu setiap menit untuk notifikasi
  useEffect(() => {
    const interval = setInterval(() => {
      daftarMeja.forEach(meja => {
        if (meja.status_pemesanan === "Playing" && meja.jam_mulai && meja.jam_mulai !== "-") {
          const endTime = calculateEndTime(meja.jam_mulai, meja.durasi_bermain);
          if (endTime) {
            const remaining = endTime - Date.now();
            const remainingMinutes = Math.floor(remaining / 60000);
            
            // Notifikasi 15 menit sebelum habis
            if (remainingMinutes === 15 && !notifiedRef.current[`${meja.id}_15min`]) {
              notifyWaktuHampirHabis(meja);
              notifiedRef.current[`${meja.id}_15min`] = true;
            }
            
            // Notifikasi 5 menit sebelum habis
            if (remainingMinutes === 5 && !notifiedRef.current[`${meja.id}_5min`]) {
              notifyWaktuHampirHabis(meja);
              notifiedRef.current[`${meja.id}_5min`] = true;
            }
            
            // Notifikasi waktu habis
            if (remaining <= 0 && !notifiedRef.current[`${meja.id}_expired`]) {
              notifyWaktuHabis(meja);
              notifiedRef.current[`${meja.id}_expired`] = true;
            }
          }
        }
      });
    }, 30000); // Cek setiap 30 detik

    return () => clearInterval(interval);
  }, [daftarMeja, notifyWaktuHampirHabis, notifyWaktuHabis]);

  useEffect(() => {
    fetchData();
    batalkanReservasiKadaluarsa();
    
    const channelReservasi = supabase
      .channel('reservasi_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reservasi_billiard' }, 
        () => {
          fetchData();
          batalkanReservasiKadaluarsa();
          // Reset notified ref saat ada perubahan data
          notifiedRef.current = {};
        }
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
        "Diskon": item.diskon || 0,
        "Total": item.total_akhir || 0,
        "Metode Bayar": item.metode_pembayaran?.toUpperCase() || "-",
      }));
      
      const totalOmset = riwayatTransaksi.reduce((sum, item) => sum + (item.total_akhir || 0), 0);
      const totalSewa = riwayatTransaksi.reduce((sum, item) => sum + (item.total_sewa || 0), 0);
      const totalKantin = riwayatTransaksi.reduce((sum, item) => sum + (item.total_fb || 0), 0);
      const totalDiskon = riwayatTransaksi.reduce((sum, item) => sum + (item.diskon || 0), 0);
      
      exportData.push({
        "No": "", "Tanggal": "", "Nomor Struk": "", "Meja": "", "Pelanggan": "", "Durasi": "",
        "Sewa Meja": totalSewa, "Kantin/F&B": totalKantin, "Diskon": totalDiskon, "Total": totalOmset, "Metode Bayar": "TOTAL",
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
        `Rp ${(item.diskon || 0).toLocaleString("id-ID")}`,
        `Rp ${(item.total_akhir || 0).toLocaleString("id-ID")}`,
        item.metode_pembayaran?.toUpperCase() || "-",
      ]);
      
      const totalOmset = riwayatTransaksi.reduce((sum, item) => sum + (item.total_akhir || 0), 0);
      const totalSewa = riwayatTransaksi.reduce((sum, item) => sum + (item.total_sewa || 0), 0);
      const totalKantin = riwayatTransaksi.reduce((sum, item) => sum + (item.total_fb || 0), 0);
      const totalDiskon = riwayatTransaksi.reduce((sum, item) => sum + (item.diskon || 0), 0);
      
      autoTable(doc, {
        startY: 55,
        head: [["No", "Tanggal", "No. Struk", "Meja", "Pelanggan", "Durasi", "Sewa", "Kantin", "Diskon", "Total", "Metode"]],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 100, 0], textColor: 255, fontStyle: 'bold' },
        foot: [[
          "", "", "", "", "", "", "",
          { content: `Rp ${totalSewa.toLocaleString("id-ID")}`, styles: { fontStyle: 'bold' } },
          { content: `Rp ${totalKantin.toLocaleString("id-ID")}`, styles: { fontStyle: 'bold' } },
          { content: `Rp ${totalDiskon.toLocaleString("id-ID")}`, styles: { fontStyle: 'bold' } },
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

  // ==================== FUNGSI MULAI MAIN ====================
  const mulaiMain = async (id, nomorMeja) => {
    const { data: mejaData, error: fetchError } = await supabase
      .from("reservasi_billiard")
      .select("jam_mulai, tanggal_main, durasi_bermain, nama_pelanggan")
      .eq("id", id)
      .single();
    
    if (fetchError) {
      console.error("Error fetching meja data:", fetchError);
      alert("Gagal memuat data meja!");
      return;
    }
    
    const now = new Date();
    const jamSekarang = now.getHours();
    const menitSekarang = now.getMinutes();
    
    const [jamJadwal, menitJadwal] = (mejaData.jam_mulai || "00:00").split(":").map(Number);
    
    const waktuSekarangMenit = (jamSekarang * 60) + menitSekarang;
    const waktuJadwalMenit = (jamJadwal * 60) + (menitJadwal || 0);
    const selisihMenit = waktuJadwalMenit - waktuSekarangMenit;
    
    if (selisihMenit < -15) {
      alert(`⚠️ Meja ini dijadwalkan jam ${mejaData.jam_mulai}.\nSudah terlambat lebih dari 15 menit. Reservasi akan dibatalkan.`);
      await supabase.from("reservasi_billiard").delete().eq("id", id);
      await fetchData();
      return;
    }
    
    if (selisihMenit > 30) {
      const jamTunggu = Math.floor(selisihMenit / 60);
      const menitTunggu = selisihMenit % 60;
      alert(`⚠️ Meja ini dijadwalkan jam ${mejaData.jam_mulai}.\nMasih terlalu awal (${jamTunggu > 0 ? jamTunggu + " jam " : ""}${menitTunggu} menit lagi).\nSilakan mulai main mendekati jadwal reservasi.`);
      return;
    }
    
    const getDayType = (date) => {
      const day = new Date(date).getDay();
      if (day === 0 || day === 6) return "weekend";
      return "weekday";
    };
    
    const JAM_BUKA = {
      weekday: { start: 10 * 60, end: 26 * 60 },
      weekend: { start: 10 * 60, end: 27 * 60 }
    };
    
    const dayType = getDayType(mejaData.tanggal_main);
    const batasOperasional = JAM_BUKA[dayType];
    
    if (waktuSekarangMenit < batasOperasional.start) {
      alert(`⚠️ Jam operasional dimulai pukul 10:00!\nSaat ini masih pukul ${jamSekarang.toString().padStart(2, '0')}:${menitSekarang.toString().padStart(2, '0')}`);
      return;
    }
    
    if (waktuSekarangMenit >= batasOperasional.end) {
      const tutupJam = Math.floor(batasOperasional.end / 60);
      const tutupLabel = tutupJam >= 24 ? `esok hari pukul ${(tutupJam - 24).toString().padStart(2, '0')}:00` : `${tutupJam.toString().padStart(2, '0')}:00`;
      alert(`⚠️ Jam operasional sudah berakhir pukul ${tutupLabel}!\nSilakan datang kembali besok.`);
      return;
    }
    
    const jamMulai = `${jamSekarang.toString().padStart(2, '0')}:${menitSekarang.toString().padStart(2, '0')}`;
    
    try {
      const { error } = await supabase
        .from("reservasi_billiard")
        .update({
          status_pemesanan: "Playing",
          jam_mulai: jamMulai
        })
        .eq("id", id);
      
      if (error) throw error;
      
      await fetchData();
      alert(`✅ Meja ${nomorMeja} mulai dimainkan! Waktu mulai: ${jamMulai}`);
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal memulai main: " + error.message);
    }
  };

  // ==================== FUNGSI SELESAIKAN MAIN ====================
  const selesaikanMain = async (id, nomorMeja) => {
    if (window.confirm(`Selesaikan permainan untuk meja ${nomorMeja}?`)) {
      try {
        const { data: mejaData, error: mejaError } = await supabase
          .from("reservasi_billiard")
          .select("*")
          .eq("id", id)
          .single();
        
        if (mejaError) {
          console.error("Error fetching meja:", mejaError);
          alert("Gagal mengambil data meja!");
          return;
        }
        
        const hargaPerJam = getHargaPerJam(mejaData.nomor_meja);
        const totalSewa = (mejaData.durasi_bermain || 1) * hargaPerJam;
        const totalFB = (mejaData.pesanan_fb || []).reduce((acc, item) => acc + ((item.harga || 0) * (item.qty || 1)), 0);
        const totalAkhir = totalSewa + totalFB;
        
        const strukData = {
          noStruk: "RC-" + String(mejaData.id).slice(-8),
          tanggal: new Date().toLocaleString("id-ID"),
          meja: nomorMeja,
          pelanggan: mejaData.nama_pelanggan,
          durasi: mejaData.durasi_bermain || 1,
          hargaSewa: totalSewa,
          itemsFB: mejaData.pesanan_fb || [],
          totalFB: totalFB,
          diskon: 0,
          totalAkhir: totalAkhir,
          metode: "-"
        };
        
        setModalStruk({ isOpen: true, data: strukData });
        
        const { error: updateError } = await supabase
          .from("reservasi_billiard")
          .update({ status_pemesanan: "Selesai" })
          .eq("id", id);
        
        if (updateError) throw updateError;
        
        await fetchData();
        
      } catch (error) {
        console.error("Error:", error);
        alert("Gagal menyelesaikan main: " + error.message);
      }
    }
  };

  // Fungsi Extend Waktu
  const extendWaktu = async (id, nomorMeja, durasiSaatIni) => {
    const tambahJam = prompt("Masukkan tambahan jam (1-4 jam):", "1");
    if (!tambahJam) return;
    
    const jamTambahan = parseInt(tambahJam);
    if (isNaN(jamTambahan) || jamTambahan < 1 || jamTambahan > 4) {
      alert("Tambahan jam harus antara 1-4 jam!");
      return;
    }
    
    const durasiBaru = durasiSaatIni + jamTambahan;
    const hargaPerJam = getHargaPerJam(nomorMeja);
    const biayaTambahan = jamTambahan * hargaPerJam;
    
    if (window.confirm(`Tambah ${jamTambahan} jam (${jamTambahan} x Rp ${hargaPerJam.toLocaleString("id-ID")} = Rp ${biayaTambahan.toLocaleString("id-ID")})?`)) {
      try {
        const { error } = await supabase
          .from("reservasi_billiard")
          .update({ durasi_bermain: durasiBaru })
          .eq("id", id);
        
        if (error) throw error;
        
        await fetchData();
        alert(`✅ Waktu bermain berhasil ditambah ${jamTambahan} jam! Biaya tambahan: Rp ${biayaTambahan.toLocaleString("id-ID")}`);
      } catch (error) {
        console.error("Error:", error);
        alert("Gagal menambah waktu: " + error.message);
      }
    }
  };

  // Fungsi untuk sewa meja (bayar di muka)
  const sewaMeja = (meja, totalSewa, totalFB, totalTagihan) => {
    resetDiskon();
    setModalBayar({
      isOpen: true,
      meja: meja,
      totalBiaya: totalTagihan,
      totalSewa: totalSewa,
      totalFB: totalFB
    });
  };

  // Proses pembayaran di muka (dengan diskon)
  const prosesBayarDulu = async (metode) => {
    const { meja, totalSewa, totalFB, totalBiaya } = modalBayar;
    
    const totalSetelahDiskon = hitungTotalSetelahDiskon(totalBiaya);
    const nominalDiskon = diskonAktif.aktif ? diskonAktif.nilai : 0;
    
    try {
      const tanggalHariIni = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });
      
      const { error: updateError } = await supabase
        .from("reservasi_billiard")
        .update({
          status_pemesanan: "Sudah Dibayar",
          jam_mulai: "-",
          is_food_paid: false
        })
        .eq("id", meja.id);
      
      if (updateError) throw updateError;
      
      const dataStrukBaru = {
        id_booking: "RC-" + String(meja.id).slice(-8),
        nomor_meja: meja.nomor_meja,
        nama_pelanggan: meja.nama_pelanggan,
        durasi: meja.durasi_bermain,
        total_sewa: totalSewa,
        total_fb: totalFB,
        total_akhir: totalSetelahDiskon,
        diskon: nominalDiskon,
        diskon_keterangan: diskonAktif.aktif ? diskonAktif.keterangan : null,
        diskon_alasan: diskonAktif.aktif ? diskonAktif.alasan : null,
        metode_pembayaran: metode.toLowerCase(),
        waktu_selesai: `${tanggalHariIni} -`,
        pesanan_fb: meja.pesanan_fb || [],
        is_food_paid: false,
        created_at: new Date().toISOString()
      };
      
      const { error: insertError } = await supabase
        .from("riwayat_transaksi")
        .insert([dataStrukBaru]);
      
      if (insertError) throw insertError;
      
      resetDiskon();
      setModalBayar({ isOpen: false, meja: null, totalBiaya: 0, totalSewa: 0, totalFB: 0 });
      await fetchData();
      
      if (nominalDiskon > 0) {
        alert(`✅ Pembayaran berhasil! Diskon ${diskonAktif.keterangan} telah diterapkan.\nTotal bayar: Rp ${totalSetelahDiskon.toLocaleString("id-ID")}`);
      } else {
        alert(`✅ Pembayaran berhasil! Meja ${meja.nomor_meja} status "Sudah Dibayar". Klik "Mulai Main" untuk memulai timer.`);
      }
      
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal memproses pembayaran: " + error.message);
    }
  };

  // Fungsi untuk bayar kekurangan
  const bayarKekurangan = async (id, kekurangan, namaPelanggan, nomorMeja) => {
    const metode = prompt(`Bayar kekurangan Rp ${kekurangan.toLocaleString("id-ID")}\nPilih metode (Cash / QRIS / Transfer):`, "Cash") || "Cash";
    
    if (!metode) return;
    
    try {
      const { error: updateError } = await supabase
        .from("reservasi_billiard")
        .update({ is_food_paid: true })
        .eq("id", id);
      
      if (updateError) throw updateError;
      
      alert(`✅ Pembayaran kekurangan Rp ${kekurangan.toLocaleString("id-ID")} berhasil via ${metode.toUpperCase()}!\n\nMakanan sudah lunas.`);
      
      await fetchData();
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal memproses pembayaran kekurangan: " + error.message);
    }
  };

  // ==================== FUNGSI SIMPAN PESANAN KANTIN ====================
  const simpanPesananKantin = async (id, keranjangBaru) => {
    if (!id) {
      alert("ID Meja tidak valid!");
      return false;
    }
    
    try {
      const { data: mejaData, error: mejaError } = await supabase
        .from("reservasi_billiard")
        .select("status_pemesanan, pesanan_fb")
        .eq("id", id)
        .single();
      
      if (mejaError) throw mejaError;
      
      const pesananLama = mejaData.pesanan_fb || [];
      const pesananGabungan = [...pesananLama];
      
      keranjangBaru.forEach(itemBaru => {
        const existingIndex = pesananGabungan.findIndex(p => p.id === itemBaru.id);
        if (existingIndex >= 0) {
          pesananGabungan[existingIndex].qty = (pesananGabungan[existingIndex].qty || 0) + (itemBaru.qty || 1);
        } else {
          pesananGabungan.push(itemBaru);
        }
      });
      
      const isPlaying = mejaData.status_pemesanan === "Playing";
      
      const { error } = await supabase
        .from("reservasi_billiard")
        .update({ 
          pesanan_fb: pesananGabungan,
          is_food_paid: isPlaying ? true : false
        })
        .eq("id", id);
      
      if (error) throw error;
      
      await fetchData();
      
      const totalTambahan = keranjangBaru.reduce((acc, item) => acc + ((item.harga || 0) * (item.qty || 1)), 0);
      if (isPlaying) {
        alert(`✅ Pesanan berhasil ditambahkan! Total: Rp ${totalTambahan.toLocaleString("id-ID")}`);
      } else {
        alert(`✅ Pesanan berhasil disimpan! Total makanan: Rp ${totalTambahan.toLocaleString("id-ID")}\nSilakan minta pelanggan bayar kekurangan.`);
      }
      
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

  // ==================== FUNGSI CETAK CLOSING SHIFT ====================
  const printClosingReceipt = () => {
    const reportData = modalClosing.reportData;
    if (!reportData) return;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Royal Cue - Laporan Closing Shift</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; font-size: 12px; background: white; }
            .receipt { max-width: 300px; margin: 0 auto; background: white; padding: 15px; }
            .text-center { text-align: center; }
            .border-top { border-top: 1px dashed #000; margin: 8px 0; }
            .flex { display: flex; justify-content: space-between; }
            .font-bold { font-weight: bold; }
            .mt-2 { margin-top: 8px; }
            h4 { margin: 0; font-size: 14px; }
            p { margin: 4px 0; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="text-center">
              <h4>ROYAL CUE BILLIARD</h4>
              <p>Jl. Jawa No. 10, Banyuwangi</p>
              <p>Telp: 0812-3456-7890</p>
              <div class="border-top"></div>
              <p><strong>LAPORAN TUTUP SHIFT</strong></p>
              <div class="border-top"></div>
            </div>
            <p>WAKTU: ${reportData.waktu}</p>
            <p>KASIR: ${reportData.nama_kasir}</p>
            <div class="border-top"></div>
            <div class="flex"><span>Sewa Meja:</span><span>Rp ${reportData.total_sewa_meja.toLocaleString("id-ID")}</span></div>
            <div class="flex"><span>Kantin:</span><span>Rp ${reportData.total_kantin.toLocaleString("id-ID")}</span></div>
            <div class="flex"><span>Tunai:</span><span>Rp ${reportData.total_tunai.toLocaleString("id-ID")}</span></div>
            <div class="flex"><span>Non-Tunai:</span><span>Rp ${reportData.total_non_tunai.toLocaleString("id-ID")}</span></div>
            <div class="border-top"></div>
            <div class="flex font-bold"><span>TOTAL OMSET:</span><span>Rp ${reportData.grand_total.toLocaleString("id-ID")}</span></div>
            <div class="border-top"></div>
            <div class="flex"><span>Total Transaksi:</span><span>${reportData.total_transaksi}</span></div>
            <div class="border-top"></div>
            <div class="text-center mt-2">
              <p>Terima Kasih</p>
              <p>Royal Cue Studio</p>
              <p class="mt-2">*** Laporan ini dicetak oleh sistem ***</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); }
          </script>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // ==================== FUNGSI TUTUP SHIFT ====================
  const selesaikanClosingDanReset = async () => {
    if (window.confirm("Konfirmasi tutup shift?\n\n- Laporan akan disimpan\n- Riwayat transaksi akan dihapus\n- Reservasi yang sudah selesai akan dihapus\n- Meja aktif akan direset ke status Pending")) {
      try {
        if (modalClosing.reportData) {
          await supabase.from("arsip_laporan_owner").insert([modalClosing.reportData]);
        }
        
        await supabase.from("riwayat_transaksi").delete().neq("id", 0);
        
        const { error: deleteSelesaiError } = await supabase
          .from("reservasi_billiard")
          .delete()
          .eq("status_pemesanan", "Selesai");
        
        if (deleteSelesaiError) throw deleteSelesaiError;
        
        const { error: resetError } = await supabase
          .from("reservasi_billiard")
          .update({ 
            status_pemesanan: "Pending",
            jam_mulai: "-",
            pesanan_fb: [],
            is_food_paid: false
          })
          .in("status_pemesanan", ["Pending", "Sudah Dibayar", "Playing"]);
        
        if (resetError) throw resetError;
        
        setRiwayatTransaksi([]);
        setModalClosing({ isOpen: false, reportData: null });
        await fetchData();
        alert("✅ Shift ditutup! Semua meja telah direset.");
        
      } catch (error) {
        console.error("Error closing shift:", error);
        alert("Gagal menutup shift: " + error.message);
      }
    }
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
            <p className="text-slate-400 text-xs mt-1">Sistem Billing & Kantin Terpadu (Bayar di Muka)</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/reservasi")}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-500/30"
            >
              <FontAwesomeIcon icon={faPlus} size={14} /> Reservasi Baru
            </button>

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

            {/* Notification Bell */}
            <NotificationBell />

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
            {["Semua", "Pending", "Sudah Dibayar", "Playing", "Selesai", "Riwayat"].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setFilterAktif(tab)} 
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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
                    <th className="p-3">Diskon</th>
                    <th className="p-3">Total</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {riwayatTerfilter.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-500">Belum ada transaksi</td>
                    </tr>
                  ) : (
                    riwayatTerfilter.map((item, idx) => (
                      <tr key={idx} className="border-t border-slate-800/40">
                        <td className="p-3 text-[10px]">{item.waktu_selesai}</td>
                        <td className="p-3 font-bold text-emerald-400 text-sm">{item.nomor_meja || "-"}</td>
                        <td className="p-3 font-bold text-white text-sm">{item.nama_pelanggan || "-"}</td>
                        <td className="p-3 text-[10px]">Rp {(item.total_sewa || 0).toLocaleString("id-ID")}</td>
                        <td className="p-3 text-[10px] text-amber-400">Rp {(item.total_fb || 0).toLocaleString("id-ID")}</td>
                        <td className="p-3 text-[10px] text-green-400">Rp {(item.diskon || 0).toLocaleString("id-ID")}</td>
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
                                diskon: item.diskon || 0,
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
                <div className="mt-4">
                  <button
                    onClick={() => navigate("/reservasi")}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 mx-auto"
                  >
                    <FontAwesomeIcon icon={faPlus} size={14} /> Buat Reservasi Baru
                  </button>
                </div>
              </div>
            ) : (
              mejaTerfilter.map((meja) => (
                <MejaCard
                  key={meja.id}
                  meja={meja}
                  onPindahMeja={tanganiPindahMeja}
                  onOrderMakanan={(id, nomorMeja, pesanan) => {
                    setModalFB({ 
                      isOpen: true, 
                      mejaId: id, 
                      nomorMeja: nomorMeja, 
                      pesananSaatIni: pesanan 
                    });
                  }}
                  onSewaMeja={sewaMeja}
                  onMulaiMain={mulaiMain}
                  onSelesaikanMain={selesaikanMain}
                  onExtendWaktu={extendWaktu}
                  onBayarKekurangan={bayarKekurangan}
                  onBukaDiskon={(id, nomorMeja, pelanggan, total) => {
                    setModalDiskon({
                      isOpen: true,
                      mejaId: id,
                      nomorMeja: nomorMeja,
                      pelanggan: pelanggan,
                      totalSebelumDiskon: total
                    });
                  }}
                  onOpenSplitBill={openSplitBill}
                />
              ))
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
            
            <div className="bg-slate-800/50 p-3 rounded-xl mb-3">
              <div className="text-center mb-2">
                <p className="text-[10px] text-slate-400">PREVIEW LAPORAN</p>
              </div>
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Sewa Meja:</span>
                  <span className="text-white">Rp {modalClosing.reportData.total_sewa_meja.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kantin:</span>
                  <span className="text-white">Rp {modalClosing.reportData.total_kantin.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tunai:</span>
                  <span className="text-white">Rp {modalClosing.reportData.total_tunai.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Non-Tunai:</span>
                  <span className="text-white">Rp {modalClosing.reportData.total_non_tunai.toLocaleString("id-ID")}</span>
                </div>
                <div className="border-t border-slate-700 my-1"></div>
                <div className="flex justify-between font-bold">
                  <span className="text-emerald-400">TOTAL:</span>
                  <span className="text-emerald-400">Rp {modalClosing.reportData.grand_total.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-3 flex flex-col gap-2">
              <button onClick={printClosingReceipt} className="py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faPrint} size={12} /> Cetak Struk
              </button>
              <button onClick={selesaikanClosingDanReset} className="py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faCheck} size={12} /> Selesai & Reset
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
                <p className="border-t border-dashed border-black/30 my-2"></p>
              </div>
              <div><p>No: {modalStruk.data.noStruk}</p><p>Tgl: {modalStruk.data.tanggal}</p><p>Meja: {modalStruk.data.meja}</p><p>Pel: {modalStruk.data.pelanggan}</p><p>Durasi: {modalStruk.data.durasi} Jam</p></div>
              <div className="border-t border-dashed border-black/30 my-2"></div>
              <div className="flex justify-between"><span>Sewa Meja</span><span>Rp {modalStruk.data.hargaSewa?.toLocaleString("id-ID")}</span></div>
              {modalStruk.data.itemsFB?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[10px]"><span>{item.nama} x{item.qty}</span><span>Rp {((item.harga || 0) * (item.qty || 1)).toLocaleString("id-ID")}</span></div>
              ))}
              <div className="border-t border-dashed border-black/30 my-2"></div>
              <div className="flex justify-between font-bold"><span>TOTAL</span><span>Rp {modalStruk.data.totalAkhir?.toLocaleString("id-ID")}</span></div>
              <div className="flex justify-between"><span>METODE</span><span className="font-bold">{modalStruk.data.metode?.toUpperCase()}</span></div>
              <div className="text-center mt-4 pt-2 border-t border-dashed border-black/30"><p>TERIMA KASIH</p><p>SELAMAT BERLATIH KEMBALI!</p></div>
            </div>
            <div className="p-6 flex gap-3">
              <button onClick={() => setModalStruk({ isOpen: false, data: null })} className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold text-xs uppercase">Tutup</button>
              <button onClick={handlePrintStruk} className="flex-1 py-3 bg-[#00ff99] text-black font-black rounded-xl text-xs uppercase flex items-center justify-center gap-2">Cetak Struk</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SPLIT BILL */}
      <SplitBillModal
        isOpen={showSplitBillModal}
        onClose={() => setShowSplitBillModal(false)}
        totalTagihan={splitBillData.total}
        items={splitBillData.items}
        meja={splitBillData.meja}
        pelanggan={splitBillData.pelanggan}
        onProcessSplit={handleSplitBillProcessed}
      />

      {/* MODAL BAYAR DI MUKA */}
      <ModalBayarDulu
        isOpen={modalBayar.isOpen}
        onClose={() => setModalBayar({ isOpen: false, meja: null, totalBiaya: 0, totalSewa: 0, totalFB: 0 })}
        onBayar={prosesBayarDulu}
        meja={modalBayar.meja?.nomor_meja}
        pelanggan={modalBayar.meja?.nama_pelanggan}
        totalBiaya={modalBayar.totalBiaya}
        items={modalBayar.meja?.pesanan_fb || []}
        onOpenSplitBill={openSplitBill}
      />

      {/* MODAL DISKON */}
      <ModalDiskon
        isOpen={modalDiskon.isOpen}
        onClose={() => setModalDiskon({ isOpen: false, mejaId: null, nomorMeja: "", pelanggan: "", totalSebelumDiskon: 0 })}
        onApplyDiskon={applyDiskon}
        totalSebelumDiskon={modalDiskon.totalSebelumDiskon}
        meja={modalDiskon.nomorMeja}
        pelanggan={modalDiskon.pelanggan}
      />

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #thermal-receipt, #thermal-receipt * { visibility: visible; }
          #thermal-receipt { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 10px; box-shadow: none; }
          @page { margin: 0; }
        }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .fixed.z-50, .fixed.z-200 { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>

    </div>
  );
}