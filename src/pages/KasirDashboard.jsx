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

  // Harga per jam
  const getHargaPerJam = (nomorMeja) => {
    if (!nomorMeja) return 50000;
    return nomorMeja.toLowerCase().includes("vip") ? 80000 : 50000;
  };

  // 🔄 Ambil data dari Supabase
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Ambil data reservasi aktif
      const { data: reservasi, error: reservasiError } = await supabase
        .from("reservasi_billiard")
        .select("*");
      
      if (reservasiError) throw reservasiError;
      
      // Ambil data riwayat transaksi
      const { data: riwayat, error: riwayatError } = await supabase
        .from("riwayat_transaksi")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (riwayatError) throw riwayatError;
      
      setDaftarMeja(reservasi || []);
      setRiwayatTransaksi(riwayat || []);
      
      console.log("Data meja loaded:", reservasi?.length || 0, "meja");
      if (reservasi && reservasi.length > 0) {
        console.log("Contoh data meja:", {
          id: reservasi[0].id,
          nomorMeja: reservasi[0].nomorMeja || reservasi[0].nomor_meja,
          namaPelanggan: reservasi[0].namaPelanggan || reservasi[0].nama_pelanggan,
          status: reservasi[0].statusPemesanan || reservasi[0].status_pemesanan
        });
      }
      
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

  // ⚡ FUNGSI START & STOP BILLING
  const ubahStatusMeja = async (id, statusBaru, namaPelanggan, nomorMeja, totalSewa, totalFB, durasi, itemFB) => {
    try {
      if (statusBaru === "Selesai") {
        const metode = prompt("Masukkan metode pembayaran (Cash / QRIS / Transfer):", "Cash") || "Cash";
        const jamSelesai = new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
        const tanggalHariIni = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });
        const totalAkhirSemua = Number(totalSewa || 0) + Number(totalFB || 0);

        console.log("Data untuk riwayat:", {
          nomorMeja, namaPelanggan, durasi, totalSewa, totalFB, itemFB
        });

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

        console.log("Menyimpan ke riwayat:", dataStrukBaru);

        // Simpan ke riwayat_transaksi
        const { error: insertError } = await supabase
          .from("riwayat_transaksi")
          .insert([dataStrukBaru]);
        
        if (insertError) {
          console.error("Error insert:", insertError);
          throw insertError;
        }

        // Hapus dari reservasi_billiard
        const { error: deleteError } = await supabase
          .from("reservasi_billiard")
          .delete()
          .eq("id", id);
        
        if (deleteError) throw deleteError;

        // Ambil data yang baru saja disimpan untuk ditampilkan di modal
        const { data: newData } = await supabase
          .from("riwayat_transaksi")
          .select("*")
          .eq("id_booking", dataStrukBaru.id_booking)
          .single();

        setModalStruk({ isOpen: true, data: newData || dataStrukBaru });
        await fetchData();
        alert("✅ Transaksi berhasil disimpan!");

      } else if (statusBaru === "Playing") {
        // Update status menjadi Playing
        const { error: updateError } = await supabase
          .from("reservasi_billiard")
          .update({ 
            statusPemesanan: statusBaru,
            jamMulai: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })
          })
          .eq("id", id);
        
        if (updateError) throw updateError;
        await fetchData();
        console.log("Status meja", id, "diubah menjadi Playing");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal: " + error.message);
    }
  };

  // BATALKAN BOOKING
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

  // PINDAH MEJA
  const tanganiPindahMeja = async (idMejaAsal, nomorMejaAsal) => {
    try {
      const semuaNomorMejaTerpakai = daftarMeja
        .filter(m => (m.statusPemesanan || m.status_pemesanan) === "Playing")
        .map(m => m.nomorMeja || m.nomor_meja || "").map(n => n.toLowerCase());
      
      const daftarSemuaMeja = ["Meja 1", "Meja 2", "Meja 3", "Meja 4", "Meja 5", "Meja 6", "Meja 7", "Meja 8", "Meja 9", "Meja 10", "Meja VIP 1", "Meja VIP 2"];
      const mejaTersedia = daftarSemuaMeja.filter(noMeja => !semuaNomorMejaTerpakai.includes(noMeja.toLowerCase()));

      if (mejaTersedia.length === 0) {
        alert("⚠️ Semua meja terisi!");
        return;
      }

      const inputMejaBaru = prompt(`Pindah dari ${nomorMejaAsal}\nMeja tersedia: ${mejaTersedia.join(", ")}\n\nMeja baru:`);
      if (!inputMejaBaru) return;

      const mejaTujuanValid = mejaTersedia.find(m => m.toLowerCase() === inputMejaBaru.trim().toLowerCase());
      if (!mejaTujuanValid) {
        alert("⚠️ Meja tidak tersedia!");
        return;
      }

      const { error } = await supabase
        .from("reservasi_billiard")
        .update({ nomorMeja: mejaTujuanValid })
        .eq("id", idMejaAsal);
      
      if (error) throw error;
      await fetchData();
      alert(`✅ Pindah ke ${mejaTujuanValid}`);
    } catch (error) {
      alert("Gagal: " + error.message);
    }
  };

  // CLOSING SHIFT
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
    try {
      const { error } = await supabase
        .from("reservasi_billiard")
        .update({ pesananFB: keranjangBaru })
        .eq("id", id);
      if (error) throw error;
      await fetchData();
      alert("✅ Pesanan disimpan");
    } catch (error) {
      alert("Gagal: " + error.message);
    }
  };

  // Helper function untuk ambil nilai dari meja (support camelCase dan snake_case)
  const getMejaValue = (meja, field) => {
    const camelCase = field.charAt(0).toLowerCase() + field.slice(1);
    const snakeCase = field.replace(/([A-Z])/g, '_$1').toLowerCase();
    return meja[camelCase] || meja[snakeCase] || "";
  };

  // FILTER
  const mejaTerfilter = daftarMeja.filter((meja) => {
    const statusPilihan = meja.statusPemesanan || meja.status_pemesanan || "Pending";
    const namaPelanggan = meja.namaPelanggan || meja.nama_pelanggan || "";
    const nomorMeja = meja.nomorMeja || meja.nomor_meja || "";
    
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

  if (loading && daftarMeja.length === 0) {
    return <div className="min-h-screen bg-[#090D1A] flex items-center justify-center text-emerald-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#090D1A] bg-gradient-to-tr from-[#090D1A] via-[#0E172A] to-[#0F172A] text-slate-100 p-6 md:p-8 font-sans">
      
      {/* HEADER */}
      <div className="no-print">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 border-b border-slate-800/60 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Royal Cue <span className="text-emerald-400">Dashboard</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">Sistem Billing & Kantin Terpadu</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3.5">
            <button
              onClick={tanganiClosingShift}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <Lock size={15} /> Tutup Shift
            </button>

            <div className="bg-slate-900/80 backdrop-blur-md border border-emerald-500/20 px-5 py-3 rounded-xl">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Omset Shift Aktif</p>
              <p className="text-xl font-black text-emerald-400">Rp {totalOmsetHariIni.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="bg-slate-950/40 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl flex flex-col lg:flex-row gap-4 justify-between items-center mb-8">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Cari meja atau pelanggan..." 
              value={cariNama} 
              onChange={(e) => setCariNama(e.target.value)} 
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500" 
            />
          </div>
          <div className="flex gap-1.5 bg-slate-900/90 p-1.5 rounded-xl">
            {["Semua", "Pending", "Playing", "Riwayat"].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setFilterAktif(tab)} 
                className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterAktif === tab 
                    ? "bg-emerald-500 text-slate-950" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {tab === "Riwayat" ? <History size={15} className="inline mr-1" /> : tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RENDER KONTEN */}
      <div className="no-print">
        {filterAktif === "Riwayat" ? (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden">
            <div className="p-4 bg-slate-950/40 border-b border-slate-800 text-xs font-bold text-slate-400">
              Laporan Transaksi Selesai ({riwayatTerfilter.length})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/60 text-[10px] font-bold text-slate-400">
                  <tr>
                    <th className="p-4">Waktu</th>
                    <th className="p-4">Meja</th>
                    <th className="p-4">Pelanggan</th>
                    <th className="p-4">Sewa</th>
                    <th className="p-4">Kantin</th>
                    <th className="p-4">Total</th>
                    <th className="p-4 text-center">Aksi</th>
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
                        <td className="p-4 text-xs">{item.waktu_selesai}</td>
                        <td className="p-4 font-bold text-emerald-400">{item.nomor_meja || "-"}</td>
                        <td className="p-4 font-bold text-white">{item.nama_pelanggan || "-"}</td>
                        <td className="p-4 text-xs">Rp {(item.total_sewa || 0).toLocaleString("id-ID")}</td>
                        <td className="p-4 text-xs text-amber-400">Rp {(item.total_fb || 0).toLocaleString("id-ID")}</td>
                        <td className="p-4 font-bold text-emerald-400">Rp {(item.total_akhir || 0).toLocaleString("id-ID")}</td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => setModalStruk({ isOpen: true, data: item })} 
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer transition-all"
                            title="Cetak Struk"
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
            {mejaTerfilter.length === 0 ? (
              <div className="col-span-full text-center text-slate-500 py-20">
                Tidak ada meja aktif. Silakan buat reservasi terlebih dahulu.
              </div>
            ) : (
              mejaTerfilter.map((meja) => {
                // Ambil nilai dengan support kedua format
                const statusSekarang = meja.statusPemesanan || meja.status_pemesanan || "Pending";
                const namaPelanggan = meja.namaPelanggan || meja.nama_pelanggan || "-";
                const nomorMeja = meja.nomorMeja || meja.nomor_meja || "Meja ?";
                const durasiBermain = meja.durasiBermain || meja.durasi_bermain || 1;
                const pesananFB = meja.pesananFB || meja.pesanan_fb || [];
                const idBooking = meja.idBooking || meja.id_booking || ("RC-" + String(meja.id).slice(-5));
                const jamMulai = meja.jamMulai || meja.jam_mulai || "-";
                
                const totalBelanjaFB = (pesananFB || []).reduce((acc, curr) => acc + ((curr.harga || 0) * (curr.qty || 1)), 0);
                const hargaPerJam = getHargaPerJam(nomorMeja);
                const totalBiayaSewa = (durasiBermain || 1) * hargaPerJam;
                const totalTagihan = totalBiayaSewa + totalBelanjaFB;
                const isPlaying = statusSekarang === "Playing";

                return (
                  <div key={meja.id} className="bg-slate-900/60 border rounded-2xl p-6 relative overflow-hidden hover:border-emerald-500/50 transition-all duration-300">
                    <div className={`absolute top-0 left-0 right-0 h-1 ${isPlaying ? "bg-sky-500" : "bg-amber-500"}`} />
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-black text-xl">🎱 {nomorMeja}</h3>
                        <p className="text-slate-500 text-[10px] font-mono">ID: {idBooking}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          disabled={!isPlaying} 
                          onClick={() => tanganiPindahMeja(meja.id, nomorMeja)} 
                          className={`p-2 rounded-xl border transition-all ${isPlaying ? "bg-purple-500/20 border-purple-500/30 text-purple-400 cursor-pointer hover:bg-purple-500/30 hover:scale-105" : "bg-slate-800/20 border-slate-800 text-slate-600 cursor-not-allowed"}`}
                          title="Pindah Meja"
                        >
                          <MoveHorizontal size={14} />
                        </button>
                        <button 
                          disabled={!isPlaying} 
                          onClick={() => setModalFB({ isOpen: true, mejaId: meja.id, nomorMeja: nomorMeja, pesananSaatIni: pesananFB })} 
                          className={`p-2 rounded-xl border transition-all ${isPlaying ? "bg-amber-500/20 border-amber-500/30 text-amber-400 cursor-pointer hover:bg-amber-500/30 hover:scale-105" : "bg-slate-800/20 border-slate-800 text-slate-600 cursor-not-allowed"}`}
                          title="Order Makanan/Minuman"
                        >
                          <Coffee size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-xs border-y border-slate-800/60 py-3 my-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">👤 Pelanggan:</span>
                        <span className="font-bold text-white text-sm">{namaPelanggan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">⏱️ Durasi:</span>
                        <span className="font-semibold text-slate-100">{durasiBermain} Jam</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">🕒 Jam Mulai:</span>
                        <span className="font-mono text-emerald-400">{jamMulai}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">💰 Sewa:</span>
                        <span className="font-semibold text-emerald-400">Rp {totalBiayaSewa.toLocaleString("id-ID")}</span>
                      </div>
                      {totalBelanjaFB > 0 && (
                        <div className="flex justify-between text-amber-400 bg-amber-500/10 p-2 rounded-lg">
                          <span>🍽️ Makanan/Minuman:</span>
                          <span className="font-bold">Rp {totalBelanjaFB.toLocaleString("id-ID")}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center bg-slate-950/60 p-3 rounded-xl mb-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL TAGIHAN</span>
                      <span className="text-xl font-black text-emerald-400 font-mono">Rp {totalTagihan.toLocaleString("id-ID")}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      {statusSekarang === "Pending" ? (
                        <>
                          <button 
                            onClick={() => ubahStatusMeja(meja.id, "Playing", namaPelanggan, nomorMeja, totalBiayaSewa, totalBelanjaFB, durasiBermain, pesananFB)} 
                            className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95 shadow-lg shadow-sky-950/20"
                          >
                            ▶️ START MAIN
                          </button>
                          <button 
                            onClick={() => batalkanBookingPending(meja.id, nomorMeja, namaPelanggan)} 
                            className="px-4 bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl cursor-pointer hover:bg-rose-500/30 transition-all"
                            title="Batalkan Booking"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button disabled className="flex-1 bg-slate-800/50 text-slate-600 font-bold py-3 rounded-xl text-xs uppercase tracking-wider cursor-not-allowed">
                            ▶️ START MAIN
                          </button>
                          <button 
                            disabled={!isPlaying} 
                            onClick={() => ubahStatusMeja(meja.id, "Selesai", namaPelanggan, nomorMeja, totalBiayaSewa, totalBelanjaFB, durasiBermain, pesananFB)} 
                            className={`flex-1 font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all ${isPlaying ? "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 cursor-pointer active:scale-95 shadow-lg shadow-rose-950/20" : "bg-slate-800/50 text-slate-600 cursor-not-allowed"}`}
                          >
                            ⏹️ STOP & BAYAR
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
              <span className="text-purple-400 font-bold text-xs uppercase tracking-wider">X-Report Closing</span>
              <button onClick={() => setModalClosing({ isOpen: false, reportData: null })} className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-slate-800">
                <X size={16} />
              </button>
            </div>
            <div className="bg-white text-black p-4 font-mono text-[11px] rounded-xl">
              <div className="text-center border-b border-dashed border-black/60 pb-2 mb-2">
                <h4 className="font-bold text-sm tracking-wide">ROYAL CUE BILLIARD</h4>
                <p className="text-[10px] font-bold tracking-widest">LAPORAN TUTUP SHIFT</p>
              </div>
              <div className="space-y-1">
                <div>WAKTU: {modalClosing.reportData.waktu}</div>
                <div>KASIR: {modalClosing.reportData.nama_kasir}</div>
                <div className="border-t border-dashed border-black/60 my-2"></div>
                <div className="flex justify-between"><span>Sewa Meja:</span><span>Rp {modalClosing.reportData.total_sewa_meja.toLocaleString("id-ID")}</span></div>
                <div className="flex justify-between"><span>Kantin / F&B:</span><span>Rp {modalClosing.reportData.total_kantin.toLocaleString("id-ID")}</span></div>
                <div className="border-t border-dashed border-black/60 my-2"></div>
                <div className="flex justify-between"><span>Tunai (Cash):</span><span>Rp {modalClosing.reportData.total_tunai.toLocaleString("id-ID")}</span></div>
                <div className="flex justify-between"><span>Non-Tunai:</span><span>Rp {modalClosing.reportData.total_non_tunai.toLocaleString("id-ID")}</span></div>
                <div className="border-t border-dashed border-black/60 my-2 pt-2 font-black flex justify-between text-sm">
                  <span>GRAND TOTAL:</span>
                  <span>Rp {modalClosing.reportData.grand_total.toLocaleString("id-ID")}</span>
                </div>
                <div className="text-center border-t border-dashed border-black/60 mt-4 pt-3 text-[9px] text-slate-500">
                  <p>Total Transaksi: {modalClosing.reportData.total_transaksi}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <button onClick={() => window.print()} className="py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-bold cursor-pointer transition-all">🖨️ Cetak Laporan</button>
              <button onClick={selesaikanClosingDanReset} className="py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold cursor-pointer transition-all">✅ Selesai & Reset Shift</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL STRUK PEMBAYARAN */}
      {modalStruk.isOpen && modalStruk.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
              <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Preview Struk Pembayaran</span>
              <button onClick={() => setModalStruk({ isOpen: false, data: null })} className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-slate-800">
                <X size={16} />
              </button>
            </div>
            <div className="bg-white text-black p-4 font-mono text-[11px] rounded-xl">
              <div className="text-center border-b border-dashed border-black/60 pb-2 mb-2">
                <h4 className="font-bold text-sm tracking-wide">ROYAL CUE BILLIARD</h4>
                <p className="text-[9px] text-slate-500">Jl. Utama Biliar No. 88</p>
              </div>
              <div className="space-y-0.5">
                <div>WAKTU: {modalStruk.data.waktu_selesai}</div>
                <div>MEJA: {modalStruk.data.nomor_meja}</div>
                <div>CUSTOMER: {modalStruk.data.nama_pelanggan}</div>
                <div className="border-t border-dashed border-black/60 my-2"></div>
                <div className="flex justify-between"><span>Sewa ({modalStruk.data.durasi} Jam):</span><span>Rp {modalStruk.data.total_sewa?.toLocaleString("id-ID")}</span></div>
                {modalStruk.data.pesanan_fb?.map((item, idx) => (
                  <div key={idx} className="pl-2 border-l border-slate-200 mt-1">
                    <div className="flex justify-between">
                      <span>- {item.nama}</span>
                      <span>Rp {((item.harga || 0) * (item.qty || 1)).toLocaleString("id-ID")}</span>
                    </div>
                    <div className="text-[9px] text-slate-500 ml-2">{item.qty} x Rp {(item.harga || 0).toLocaleString("id-ID")}</div>
                  </div>
                ))}
                <div className="border-t border-dashed border-black/60 my-2 pt-2 font-black flex justify-between text-sm">
                  <span>TOTAL:</span>
                  <span>Rp {modalStruk.data.total_akhir?.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-[10px] font-medium">
                  <span>METODE PEMBAYARAN:</span>
                  <span className="font-bold">{modalStruk.data.metode_pembayaran?.toUpperCase()}</span>
                </div>
                <div className="text-center border-t border-dashed border-black/60 mt-4 pt-3 text-[10px] font-bold tracking-widest">
                  <p>--- TERIMA KASIH ---</p>
                </div>
              </div>
            </div>
            <button onClick={() => window.print()} className="mt-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold cursor-pointer transition-all">🖨️ Cetak Struk</button>
          </div>
        </div>
      )}

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          body, html, #root, .min-h-screen {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
        }
      `}</style>

    </div>
  );
}