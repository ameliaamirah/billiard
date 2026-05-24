import { useState, useEffect } from "react";
import { Search, Coffee, History, LayoutDashboard, Trash2, Printer, X, MoveHorizontal, Lock } from "lucide-react"; 
import FandBModal from "../components/FandBModal"; 
import { supabase } from "../supabaseClient";

export default function KasirDashboard() {
  const [daftarMeja, setDaftarMeja] = useState([]);
  const [riwayatTransaksi, setRiwayatTransaksi] = useState([]);
  const [filterAktif, setFilterAktif] = useState("Semua"); 
  const [cariNama, setCariNama] = useState("");
  const [loading, setLoading] = useState(false);

  // STATE UNTUK KONTROL MODAL F&B
  const [modalFB, setModalFB] = useState({ isOpen: false, mejaId: null, nomorMeja: "", pesananSaatIni: [] });

  // 🧾 STATE UNTUK KONTROL MODAL STRUK THERMAL
  const [modalStruk, setModalStruk] = useState({ isOpen: false, data: null });

  // 🔒 STATE UNTUK MODAL REPORT CLOSING SHIFT
  const [modalClosing, setModalClosing] = useState({ isOpen: false, reportData: null });

  // Harga per jam (bisa disesuaikan)
  const HARGA_PER_JAM = 50000;
  const HARGA_VIP_PER_JAM = 80000;

  // 🔄 1. Ambil data dari Supabase
  const fetchData = async () => {
    try {
      setLoading(true);
      // Ambil data reservasi aktif (belum selesai)
      const { data: reservasi, error: reservasiError } = await supabase
        .from("reservasi_billiard")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (reservasiError) throw reservasiError;
      
      // Ambil data riwayat transaksi
      const { data: riwayat, error: riwayatError } = await supabase
        .from("riwayat_transaksi")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (riwayatError) throw riwayatError;
      
      setDaftarMeja(reservasi || []);
      setRiwayatTransaksi(riwayat || []);
      
      console.log("Data loaded:", { 
        reservasi: reservasi?.length, 
        riwayat: riwayat?.length,
        sampleRiwayat: riwayat?.[0] 
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Gagal memuat data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Setup realtime subscription
  useEffect(() => {
    fetchData();
    
    // Subscribe ke perubahan tabel reservasi_billiard
    const channelReservasi = supabase
      .channel('reservasi_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reservasi_billiard' }, 
        () => fetchData()
      )
      .subscribe();
    
    // Subscribe ke perubahan tabel riwayat_transaksi
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

  // Fungsi untuk mendapatkan harga per jam berdasarkan nomor meja
  const getHargaPerJam = (nomorMeja) => {
    return nomorMeja?.toLowerCase().includes("vip") ? HARGA_VIP_PER_JAM : HARGA_PER_JAM;
  };

  // ⚡ 2. FUNGSI UTAMA: Start & Stop Billing (DIPERBAIKI)
  const ubahStatusMeja = async (id, statusBaru, namaPelanggan, nomorMeja, totalSewa, totalFB = 0, durasi, itemFB = []) => {
    try {
      console.log("ubahStatusMeja dipanggil:", { id, statusBaru, namaPelanggan, nomorMeja, totalSewa, totalFB, durasi, itemFB });
      
      if (statusBaru === "Selesai") {
        const metode = prompt("Masukkan metode pembayaran (Cash / QRIS / Transfer):", "Cash") || "Cash";
        const jamSelesai = new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
        const tanggalHariIni = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });
        const totalAkhirSemua = Number(totalSewa || 0) + Number(totalFB || 0);

        // 🔥 PASTIKAN DATA TIDAK KOSONG
        const dataStrukBaru = {
          id_booking: "RC-" + String(id).slice(-8),
          nomor_meja: nomorMeja || "Meja Tidak Diketahui",
          nama_pelanggan: namaPelanggan || "Pelanggan Tidak Diketahui",
          durasi: durasi || 1,
          total_sewa: Number(totalSewa || 0),
          total_fb: Number(totalFB || 0),
          total_akhir: totalAkhirSemua,
          metode_pembayaran: metode.toLowerCase(),
          waktu_selesai: `${tanggalHariIni} ${jamSelesai}`,
          pesanan_fb: itemFB || [],
          created_at: new Date().toISOString()
        };

        console.log("Menyimpan transaksi ke riwayat:", dataStrukBaru);

        // Simpan ke riwayat_transaksi
        const { error: insertError } = await supabase
          .from("riwayat_transaksi")
          .insert([dataStrukBaru]);
        
        if (insertError) {
          console.error("Error insert ke riwayat:", insertError);
          throw insertError;
        }

        // Hapus dari reservasi_billiard
        const { error: deleteError } = await supabase
          .from("reservasi_billiard")
          .delete()
          .eq("id", id);
        
        if (deleteError) {
          console.error("Error delete dari reservasi:", deleteError);
          throw deleteError;
        }

        console.log("Transaksi berhasil disimpan, ID meja", id, "telah dihapus");
        
        setModalStruk({ isOpen: true, data: { ...dataStrukBaru, idBooking: dataStrukBaru.id_booking } });
        await fetchData();

      } else if (statusBaru === "Playing") {
        // Update status menjadi Playing
        const { error: updateError } = await supabase
          .from("reservasi_billiard")
          .update({ 
            status_pemesanan: statusBaru,
            jam_mulai: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })
          })
          .eq("id", id);
        
        if (updateError) {
          console.error("Error update status:", updateError);
          throw updateError;
        }
        
        console.log("Status meja", id, "berhasil diubah menjadi Playing");
        await fetchData();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Gagal mengupdate status: " + error.message);
    }
  };

  // 🗑️ 3. FUNGSI: BATALKAN BOOKING PENDING
  const batalkanBookingPending = async (id, nomorMeja, namaPelanggan) => {
    if (window.confirm(`Apakah Anda yakin ingin membatalkan/menghapus pesanan ${nomorMeja} atas nama "${namaPelanggan}"?`)) {
      try {
        const { error } = await supabase
          .from("reservasi_billiard")
          .delete()
          .eq("id", id);
        
        if (error) throw error;
        await fetchData();
        alert("✅ Pesanan berhasil dibatalkan");
      } catch (error) {
        console.error("Error cancelling booking:", error);
        alert("Gagal membatalkan pesanan: " + error.message);
      }
    }
  };

  // 🍳 4. FUNGSI: PINDAH MEJA (SWITCH TABLE)
  const tanganiPindahMeja = async (idMejaAsal, nomorMejaAsal) => {
    try {
      const semuaNomorMejaTerpakai = daftarMeja
        .filter(m => m.status_pemesanan === "Playing")
        .map(m => m.nomor_meja?.toLowerCase());
      
      const daftarSemuaMeja = ["Meja 1", "Meja 2", "Meja 3", "Meja 4", "Meja 5", "Meja 6", "Meja 7", "Meja 8", "Meja 9", "Meja 10", "Meja VIP 1", "Meja VIP 2"];
      const mejaTersedia = daftarSemuaMeja.filter(noMeja => !semuaNomorMejaTerpakai.includes(noMeja.toLowerCase()));

      if (mejaTersedia.length === 0) {
        alert("⚠️ Maaf, seluruh meja biliar saat ini sedang terisi penuh!");
        return;
      }

      const inputMejaBaru = prompt(`🔄 PINDAH MEJA — ${nomorMejaAsal.toUpperCase()}\nPilihan meja kosong:\n[ ${mejaTersedia.join(" ]  [ ")} ]\n\nKetik nomor meja baru (Contoh: Meja 3):`);
      if (!inputMejaBaru) return;

      const mejaTujuanValid = mejaTersedia.find(m => m.toLowerCase() === inputMejaBaru.trim().toLowerCase());
      if (!mejaTujuanValid) {
        alert("⚠️ Meja tidak valid atau sedang digunakan!");
        return;
      }

      const { error } = await supabase
        .from("reservasi_billiard")
        .update({ nomor_meja: mejaTujuanValid })
        .eq("id", idMejaAsal);
      
      if (error) throw error;
      
      await fetchData();
      alert(`🟢 BERHASIL! Pelanggan pindah ke ${mejaTujuanValid}.`);
    } catch (error) {
      console.error("Error moving table:", error);
      alert("Gagal memindahkan meja: " + error.message);
    }
  };

  // 🔒 5. FUNGSI: CLOSING SHIFT (TUTUP BUKU KASIR)
  const tanganiClosingShift = () => {
    if (riwayatTransaksi.length === 0) {
      alert("⚠️ Belum ada transaksi masuk pada shift ini. Tidak perlu closing.");
      return;
    }

    const namaKasir = prompt("Masukkan NAMA KASIR yang bertugas pada shift ini:", "") || "Kasir On Duty";
    
    let totalSewaMeja = 0;
    let totalKantin = 0;
    let totalTunai = 0;
    let totalNonTunai = 0;

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

    const jamClosing = new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
    const tanggalClosing = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });

    setModalClosing({
      isOpen: true,
      reportData: {
        nama_kasir: namaKasir,
        waktu: `${tanggalClosing} ${jamClosing}`,
        total_transaksi: riwayatTransaksi.length,
        total_sewa_meja: totalSewaMeja,
        total_kantin: totalKantin,
        total_tunai: totalTunai,
        total_non_tunai: totalNonTunai,
        grand_total: totalSewaMeja + totalKantin,
        created_at: new Date().toISOString()
      }
    });
  };

  // 🔒 OPTIMASI AKHIR: Amankan data shift ke database arsip permanen
  const selesaikanClosingDanReset = async () => {
    if (window.confirm("Apakah laporan cetak sudah sesuai? Klik OK untuk mengosongkan omset dashboard dan mengarsip shift ini secara permanen.")) {
      try {
        // Simpan laporan ke arsip_laporan_owner
        const { error: insertError } = await supabase
          .from("arsip_laporan_owner")
          .insert([modalClosing.reportData]);
        
        if (insertError) throw insertError;
        
        // Hapus semua riwayat transaksi
        const { error: deleteError } = await supabase
          .from("riwayat_transaksi")
          .delete()
          .neq("id", 0);
        
        if (deleteError) throw deleteError;
        
        // Reset state
        setRiwayatTransaksi([]);
        setModalClosing({ isOpen: false, reportData: null });
        setFilterAktif("Semua");
        
        await fetchData();
        alert("✅ Sukses! Data shift telah diarsipkan dengan aman ke database.");
      } catch (error) {
        console.error("Error closing shift:", error);
        alert("Gagal menutup shift: " + error.message);
      }
    }
  };

  const simpanPesananKantin = async (id, keranjangBaru) => {
    try {
      const { error } = await supabase
        .from("reservasi_billiard")
        .update({ pesanan_fb: keranjangBaru })
        .eq("id", id);
      
      if (error) throw error;
      await fetchData();
      alert("✅ Pesanan berhasil disimpan");
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Gagal menyimpan pesanan: " + error.message);
    }
  };

  // Logika Filter
  const mejaTerfilter = daftarMeja.filter((meja) => {
    const statusPilihan = meja.status_pemesanan || "Pending";
    const cocokFilter = filterAktif === "Semua" ? true : 
      (filterAktif === "Riwayat" ? false : statusPilihan.toLowerCase() === filterAktif.toLowerCase());
    const cocokCari = (meja.nama_pelanggan || "").toLowerCase().includes(cariNama.toLowerCase()) || 
                      (meja.nomor_meja || "").toLowerCase().includes(cariNama.toLowerCase());
    return cocokFilter && cocokCari;
  });

  const riwayatTerfilter = riwayatTransaksi.filter((item) => 
    (item.nama_pelanggan || "").toLowerCase().includes(cariNama.toLowerCase()) || 
    (item.nomor_meja || "").toLowerCase().includes(cariNama.toLowerCase())
  );
  
  const totalOmsetHariIni = riwayatTransaksi.reduce((acc, curr) => {
    return acc + (curr.total_akhir || 0);
  }, 0);

  if (loading && daftarMeja.length === 0) {
    return (
      <div className="min-h-screen bg-[#090D1A] flex items-center justify-center">
        <div className="text-emerald-400 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D1A] bg-gradient-to-tr from-[#090D1A] via-[#0E172A] to-[#0F172A] text-slate-100 p-6 md:p-8 screen-section font-sans selection:bg-emerald-500 selection:text-slate-900">
      
      {/* HEADER & UI UTAMA */}
      <div className="no-print">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 border-b border-slate-800/60 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide uppercase bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                Royal Cue <span className="text-emerald-400">Dashboard</span>
              </h1>
            </div>
            <p className="text-slate-400 text-xs md:text-sm mt-1.5 font-medium">Sistem Pemantauan Billing & Kantin Terpadu POS</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3.5 w-full lg:w-auto">
            <button
              onClick={tanganiClosingShift}
              className="flex-1 lg:flex-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 border border-purple-400/20 active:translate-y-0"
            >
              <Lock size={15} className="text-purple-200" /> Tutup Shift (Closing)
            </button>

            <div className="flex-1 lg:flex-none bg-slate-900/80 backdrop-blur-md border border-emerald-500/20 px-5 py-3 rounded-xl flex items-center justify-between lg:justify-start gap-4 shadow-md shadow-black/20">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20"><LayoutDashboard size={20} /></div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Omset Shift Aktif</p>
                <p className="text-xl font-black text-emerald-400 font-mono">Rp {totalOmsetHariIni.toLocaleString("id-ID")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="bg-slate-950/40 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl flex flex-col lg:flex-row gap-4 justify-between items-center mb-8 shadow-sm">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Cari nomor meja atau nama pelanggan..." 
              value={cariNama} 
              onChange={(e) => setCariNama(e.target.value)} 
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all" 
            />
          </div>
          <div className="flex gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 w-full lg:w-auto overflow-x-auto">
            {["Semua", "Pending", "Playing", "Riwayat"].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setFilterAktif(tab)} 
                className={`flex-1 lg:flex-none px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                  filterAktif === tab 
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {tab === "Riwayat" && <History size={15} />} 
                {tab === "Pending" ? "DISETUJUI" : tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RENDER KARTU ATAU TABEL */}
      <div className="no-print">
        {filterAktif === "Riwayat" ? (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
            <div className="p-4 bg-slate-950/40 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
              <span>Laporan Transaksi Selesai</span>
              <span className="px-2 py-0.5 bg-slate-800 rounded-md text-[10px] text-slate-300">{riwayatTerfilter.length} Baris</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-950/60 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800 tracking-wider">
                  <tr>
                    <th className="p-4">Waktu Selesai</th>
                    <th className="p-4">Meja</th>
                    <th className="p-4">Pelanggan</th>
                    <th className="p-4">Detail Sewa</th>
                    <th className="p-4">Kantin</th>
                    <th className="p-4">Total</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 font-medium">
                  {riwayatTerfilter.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-12 text-center text-slate-500 italic bg-slate-950/10">
                        Belum ada riwayat transaksi masuk pada shift ini.
                      </td>
                    </tr>
                  ) : (
                    riwayatTerfilter.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/20 transition-colors duration-150">
                        <td className="p-4 text-xs font-mono text-slate-400">{item.waktu_selesai || "-"}</td>
                        <td className="p-4 font-black text-emerald-400">{item.nomor_meja || "-"}</td>
                        <td className="p-4 font-bold text-white">{item.nama_pelanggan || "-"}</td>
                        <td className="p-4 text-xs text-slate-300">
                          {item.durasi || 1} Jam <span className="text-slate-500 mx-1">|</span> 
                          Rp {(item.total_sewa || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="p-4 text-xs text-amber-400 font-semibold">
                          Rp {(item.total_fb || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-400">
                          Rp {(item.total_akhir || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => setModalStruk({ isOpen: true, data: { ...item, idBooking: item.id_booking } })} 
                            className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl text-slate-300 border border-slate-700/60 cursor-pointer transition-all"
                          >
                            <Printer size={14} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mejaTerfilter.map((meja) => {
              const statusSekarang = meja.status_pemesanan || "Pending";
              // Hitung total makanan
              const totalBelanjaFB = (meja.pesanan_fb || []).reduce((acc, curr) => acc + ((curr.harga || 0) * (curr.qty || 1)), 0);
              // Hitung total sewa berdasarkan durasi dan harga per jam
              const hargaPerJamMeja = getHargaPerJam(meja.nomor_meja);
              const totalBiayaSewa = (meja.durasi_bermain || 1) * hargaPerJamMeja;
              const totalTagihanKeseluruhan = totalBiayaSewa + totalBelanjaFB;
              const isPlaying = statusSekarang === "Playing";

              return (
                <div 
                  key={meja.id} 
                  className={`bg-slate-900/60 border rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                    isPlaying 
                      ? "border-sky-500/20 shadow-sky-500/5 hover:border-sky-500/40" 
                      : "border-amber-500/20 shadow-amber-500/5 hover:border-amber-500/40"
                  }`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-[3px] ${isPlaying ? "bg-gradient-to-r from-sky-400 to-indigo-500" : "bg-gradient-to-r from-amber-400 to-orange-500"}`} />
                  
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h3 className="font-black text-xl text-white tracking-wide flex items-center gap-2">
                        🎱 {meja.nomor_meja || "Meja ?"}
                      </h3>
                      <p className="text-slate-500 text-[10px] font-mono mt-1 bg-slate-950/60 w-fit px-1.5 py-0.5 rounded border border-slate-800/40">
                        ID: {meja.id_booking || "RC-" + String(meja.id).slice(-5)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        disabled={!isPlaying} 
                        onClick={() => tanganiPindahMeja(meja.id, meja.nomor_meja)} 
                        className={`p-2.5 rounded-xl border transition-all duration-150 ${
                          isPlaying 
                            ? "bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 cursor-pointer hover:scale-105" 
                            : "bg-slate-950/20 border-slate-800 text-slate-700 cursor-not-allowed"
                        }`} 
                        title="Pindah Meja"
                      >
                        <MoveHorizontal size={14} />
                      </button>
                      <button 
                        disabled={!isPlaying} 
                        onClick={() => setModalFB({ isOpen: true, mejaId: meja.id, nomorMeja: meja.nomor_meja, pesananSaatIni: meja.pesanan_fb || [] })} 
                        className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all duration-150 ${
                          isPlaying 
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 cursor-pointer hover:scale-105" 
                            : "bg-slate-950/20 border-slate-800 text-slate-700 cursor-not-allowed"
                        }`}
                      >
                        <Coffee size={14} /> + Order
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2.5 text-xs border-y border-slate-800/60 py-4 my-4 font-medium text-slate-300">
                    <div className="flex justify-between"><span className="text-slate-400">👤 Pelanggan:</span> <span className="font-bold text-white text-sm">{meja.nama_pelanggan || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">⏱️ Durasi Bermain:</span> <span className="font-semibold text-slate-100">{meja.durasi_bermain || 1} Jam</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">🕒 Jam Mulai:</span> <span className="font-mono text-emerald-400 font-semibold">{meja.jam_mulai || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">💰 Biaya Sewa:</span> <span className="font-semibold text-emerald-400">Rp {totalBiayaSewa.toLocaleString("id-ID")}</span></div>
                    {totalBelanjaFB > 0 && (
                      <div className="text-[11px] text-amber-400 bg-amber-500/5 p-2 rounded-xl border border-amber-500/10 flex justify-between items-center mt-2">
                        <span>🛒 Pesanan Kantin:</span>
                        <span className="font-mono font-bold">Rp {totalBelanjaFB.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 mb-5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tagihan</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">Rp {totalTagihanKeseluruhan.toLocaleString("id-ID")}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {(statusSekarang === "Pending" || statusSekarang === "Disetujui") ? (
                      <>
                        <button 
                          onClick={() => {
                            const hargaPerJamMejaBtn = getHargaPerJam(meja.nomor_meja);
                            const totalSewa = (meja.durasi_bermain || 1) * hargaPerJamMejaBtn;
                            console.log("Start Main - Data meja:", {
                              id: meja.id,
                              nama: meja.nama_pelanggan,
                              meja: meja.nomor_meja,
                              totalSewa: totalSewa
                            });
                            ubahStatusMeja(
                              meja.id, 
                              "Playing", 
                              meja.nama_pelanggan, 
                              meja.nomor_meja, 
                              totalSewa, 
                              totalBelanjaFB, 
                              meja.durasi_bermain, 
                              meja.pesanan_fb || []
                            );
                          }} 
                          className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-sky-950/20 transition-all duration-150 active:scale-95"
                        >
                          ▶️ Start Main
                        </button>
                        <button onClick={() => batalkanBookingPending(meja.id, meja.nomor_meja, meja.nama_pelanggan)} 
                          className="px-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-xl cursor-pointer transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button disabled className="bg-slate-950/40 text-slate-700 border border-slate-900 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider cursor-not-allowed flex-1">▶️ Start Main</button>
                        <button 
                          disabled={!isPlaying} 
                          onClick={() => {
                            console.log("Stop & Bayar - Data meja:", {
                              id: meja.id,
                              nama: meja.nama_pelanggan,
                              meja: meja.nomor_meja,
                              totalBiayaSewa: totalBiayaSewa,
                              totalBelanjaFB: totalBelanjaFB
                            });
                            ubahStatusMeja(
                              meja.id, 
                              "Selesai", 
                              meja.nama_pelanggan, 
                              meja.nomor_meja, 
                              totalBiayaSewa, 
                              totalBelanjaFB, 
                              meja.durasi_bermain, 
                              meja.pesanan_fb || []
                            );
                          }} 
                          className={`flex-1 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-150 ${isPlaying ? "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white cursor-pointer shadow-lg shadow-rose-950/20 active:scale-95" : "bg-slate-950/40 text-slate-700 border border-slate-900 cursor-not-allowed"}`}
                        >
                          ⏹️ Stop & Bayar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 print-modal-container animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm flex flex-col no-print shadow-2xl scale-in">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Preview X-Report Closing</span>
              <button onClick={() => setModalClosing({ isOpen: false, reportData: null })} className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-slate-800"><X size={16} /></button>
            </div>
            <div className="bg-white text-black p-5 font-mono text-[11px] leading-relaxed rounded-xl shadow-inner max-h-[50vh] overflow-y-auto border border-slate-200">
              <div className="text-center space-y-0.5 border-b border-dashed border-black/60 pb-3 mb-3"><h4 className="font-black text-sm tracking-wide">ROYAL CUE BILLIARD</h4><p className="font-bold text-[10px] tracking-widest uppercase">*** LAPORAN TUTUP SHIFT ***</p></div>
              <div className="space-y-1.5 mb-3 border-b border-dashed border-black/60 pb-3 text-[10px] text-slate-800"><div>WAKTU : {modalClosing.reportData.waktu}</div><div>KASIR : {modalClosing.reportData.nama_kasir}</div><div>TOTAL : {modalClosing.reportData.total_transaksi} Transaksi Selesai</div></div>
              <div className="space-y-1.5 border-b border-dashed border-black/60 pb-3 text-slate-900">
                <p className="font-bold text-[10px]">[ SUMBER OMSET ]</p>
                <div className="flex justify-between"><span>- Sewa Meja</span><span>Rp {(modalClosing.reportData.total_sewa_meja || 0).toLocaleString("id-ID")}</span></div>
                <div className="flex justify-between"><span>- Kantin / F&B</span><span>Rp {(modalClosing.reportData.total_kantin || 0).toLocaleString("id-ID")}</span></div>
              </div>
              <div className="space-y-1.5 border-b border-dashed border-black/60 py-2.5 text-slate-900">
                <p className="font-bold text-[10px]">[ METODE BAYAR ]</p>
                <div className="flex justify-between"><span>- Tunai (Cash)</span><span>Rp {(modalClosing.reportData.total_tunai || 0).toLocaleString("id-ID")}</span></div>
                <div className="flex justify-between"><span>- Non-Tunai (QRIS/Trf)</span><span>Rp {(modalClosing.reportData.total_non_tunai || 0).toLocaleString("id-ID")}</span></div>
              </div>
              <div className="pt-3 font-black flex justify-between text-sm text-black border-t border-black/20 mt-1"><span>GRAND TOTAL :</span><span>Rp {(modalClosing.reportData.grand_total || 0).toLocaleString("id-ID")}</span></div>
              <div className="text-center pt-5 border-t border-dashed border-black/60 mt-4 text-[9px] text-slate-700">
                <div className="flex justify-between px-1 mt-2"><div>Kasir Bertugas,<br/><br/><br/><br/>( ______________ )</div><div>Manajer / Owner,<br/><br/><br/><br/>( ______________ )</div></div>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <button onClick={() => window.print()} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"><Printer size={14} /> Cetak Laporan</button>
              <button onClick={selesaikanClosingDanReset} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors shadow-md">Selesai Shift & Reset</button>
            </div>
          </div>

          {/* PRINT AREA */}
          <div className="print-only-layout font-mono text-[11px] text-black bg-white p-2 w-[58mm] leading-tight">
            <div className="text-center border-b border-dashed border-black pb-2 mb-2"><h3 className="font-bold text-sm">ROYAL CUE BILLIARD</h3><p className="font-bold text-[9px]">LAPORAN CLOSING SHIFT</p></div>
            <div className="space-y-0.5 mb-2 border-b border-dashed border-black pb-2" style={{ fontSize: '10px' }}><div>WAKTU : {modalClosing.reportData.waktu}</div><div>KASIR : {modalClosing.reportData.nama_kasir}</div></div>
            <div className="space-y-1 border-b border-dashed border-black pb-2">
              <div className="font-bold" style={{ fontSize: '9px' }}>[ SUMBER OMSET ]</div>
              <div className="flex justify-between"><span>Sewa Meja:</span><span>{(modalClosing.reportData.total_sewa_meja || 0).toLocaleString("id-ID")}</span></div>
              <div className="flex justify-between"><span>Kantin:</span><span>{(modalClosing.reportData.total_kantin || 0).toLocaleString("id-ID")}</span></div>
            </div>
            <div className="pt-1.5 font-black flex justify-between text-xs"><span>TOTAL OMSET:</span><span>Rp {(modalClosing.reportData.grand_total || 0).toLocaleString("id-ID")}</span></div>
            <div className="text-center pt-6 mt-4" style={{ fontSize: '10px' }}><div className="flex justify-between"><span>Kasir,</span><span>Owner,</span></div><div className="h-8"></div><div className="flex justify-between"><span>(...........)</span><span>(...........)</span></div></div>
          </div>
        </div>
      )}

      {/* MODAL STRUK */}
      {modalStruk.isOpen && modalStruk.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 print-modal-container animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm flex flex-col no-print shadow-2xl scale-in">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-400">Preview Struk Kasir</span>
              <button onClick={() => setModalStruk({ isOpen: false, data: null })} className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-slate-800"><X size={16} /></button>
            </div>
            <div className="bg-white text-black p-5 font-mono text-[11px] leading-relaxed rounded-xl shadow-inner max-h-[50vh] overflow-y-auto border border-slate-200">
              <div className="text-center space-y-0.5 border-b border-dashed border-black/60 pb-3 mb-3"><h4 className="font-black text-sm tracking-wide">ROYAL CUE BILLIARD</h4><p className="text-slate-500 text-[10px]">Jl. Utama Biliar No. 88, Kota</p></div>
              <div className="space-y-1 mb-3 border-b border-dashed border-black/60 pb-3 text-[10px] text-slate-800">
                <div>WAKTU : {modalStruk.data.waktu_selesai}</div>
                <div>ID    : {modalStruk.data.idBooking}</div>
                <div>MEJA  : {modalStruk.data.nomor_meja}</div>
                <div>CUST  : {modalStruk.data.nama_pelanggan}</div>
              </div>
              <div className="space-y-1.5 border-b border-dashed border-black/60 pb-3 text-slate-900">
                <div className="flex justify-between font-bold"><span>Sewa Meja ({modalStruk.data.durasi} Jam)</span><span>Rp {(modalStruk.data.total_sewa || 0).toLocaleString("id-ID")}</span></div>
                {modalStruk.data.pesanan_fb && modalStruk.data.pesanan_fb.map((item, idx) => (
                  <div key={idx} className="pl-2 border-l border-slate-200 mt-1">
                    <div className="flex justify-between text-slate-900"><span>- {item.nama}</span><span>Rp {((item.harga || 0) * (item.qty || 1)).toLocaleString("id-ID")}</span></div>
                    <div className="text-[10px] text-slate-500">{item.qty} x Rp {(item.harga || 0).toLocaleString("id-ID")}</div>
                  </div>
                ))}
              </div>
              <div className="pt-2 font-black space-y-1.5 text-right text-slate-900">
                <div className="flex justify-between text-black text-sm"><span>TOTAL BILL :</span><span>Rp {(modalStruk.data.total_akhir || 0).toLocaleString("id-ID")}</span></div>
                <div className="flex justify-between text-[10px] text-slate-600 font-medium"><span>METODE PEMBAYARAN:</span><span>{(modalStruk.data.metode_pembayaran || "").toUpperCase()}</span></div>
              </div>
              <div className="text-center pt-4 border-t border-dashed border-black/60 mt-4 text-[10px] text-slate-600 font-bold tracking-widest"><p>--- TERIMA KASIH ---</p></div>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => window.print()} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"><Printer size={14} /> Cetak Struk</button>
              <button onClick={() => setModalStruk({ isOpen: false, data: null })} className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer transition-colors">Tutup</button>
            </div>
          </div>

          {/* PRINT AREA STRUK */}
          <div className="print-only-layout font-mono text-[11px] text-black bg-white p-2 w-[58mm] leading-tight">
            <div className="text-center border-b border-dashed border-black pb-2 mb-2"><h3 className="font-bold text-sm">ROYAL CUE BILLIARD</h3></div>
            <div className="space-y-0.5 mb-2 border-b border-dashed border-black pb-2" style={{ fontSize: '10px' }}>
              <div>TGL  : {modalStruk.data.waktu_selesai}</div>
              <div>MEJA : {modalStruk.data.nomor_meja}</div>
              <div>CUST : {modalStruk.data.nama_pelanggan}</div>
            </div>
            <div className="space-y-1 border-b border-dashed border-black pb-2">
              <div className="flex justify-between"><span>Sewa Meja ({modalStruk.data.durasi} Jam)</span><span>{(modalStruk.data.total_sewa || 0).toLocaleString("id-ID")}</span></div>
              {modalStruk.data.pesanan_fb && modalStruk.data.pesanan_fb.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between"><span>{item.nama}</span><span>{((item.harga || 0) * (item.qty || 1)).toLocaleString("id-ID")}</span></div>
                  <div style={{ fontSize: '9px', paddingLeft: '5px', color: '#444' }}>{item.qty} x {(item.harga || 0).toLocaleString("id-ID")}</div>
                </div>
              ))}
            </div>
            <div className="pt-1.5 font-black">
              <div className="flex justify-between text-xs"><span>TOTAL  :</span><span>Rp {(modalStruk.data.total_akhir || 0).toLocaleString("id-ID")}</span></div>
              <div className="flex justify-between" style={{ fontSize: '10px', fontWeight: 'normal' }}><span>BAYAR  :</span><span>{(modalStruk.data.metode_pembayaran || "").toUpperCase()}</span></div>
            </div>
            <div className="text-center pt-4 border-t border-dashed border-black mt-3" style={{ fontSize: '10px' }}><p>--- TERIMA KASIH ---</p></div>
          </div>
        </div>
      )}

      {/* STYLE CSS */}
      <style>{`
        .print-only-layout { display: none; }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .scale-in { animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @media print {
          body, html, #root, .screen-section { background: white !important; color: black !important; padding: 0 !important; margin: 0 !important; }
          .no-print, .print-modal-container, header, nav, button { display: none !important; }
          .print-only-layout { display: block !important; width: 100% !important; max-width: 240px; margin: 0 auto !important; padding: 4px !important; background: white !important; color: black !important; }
          .flex { display: flex !important; } .justify-between { justify-content: space-between !important; } .text-center { text-align: center !important; }
        }
      `}</style>

    </div>
  );
}