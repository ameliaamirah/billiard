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

        // Simpan ke riwayat_transaksi
        const { error: insertError } = await supabase
          .from("riwayat_transaksi")
          .insert([dataStrukBaru]);
        
        if (insertError) throw insertError;

        // Hapus dari reservasi_billiard
        const { error: deleteError } = await supabase
          .from("reservasi_billiard")
          .delete()
          .eq("id", id);
        
        if (deleteError) throw deleteError;

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
        
        if (updateError) throw updateError;
        await fetchData();
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
        .filter(m => m.status_pemesanan === "Playing")
        .map(m => m.nomor_meja?.toLowerCase());
      
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
        .update({ nomor_meja: mejaTujuanValid })
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
        .update({ pesanan_fb: keranjangBaru })
        .eq("id", id);
      if (error) throw error;
      await fetchData();
      alert("✅ Pesanan disimpan");
    } catch (error) {
      alert("Gagal: " + error.message);
    }
  };

  // FILTER
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
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2"
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
                    <th className="p-4">Waktu</th><th className="p-4">Meja</th><th className="p-4">Pelanggan</th>
                    <th className="p-4">Sewa</th><th className="p-4">Kantin</th><th className="p-4">Total</th><th className="p-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {riwayatTerfilter.map((item, idx) => (
                    <tr key={idx} className="border-t border-slate-800/40">
                      <td className="p-4 text-xs">{item.waktu_selesai}</td>
                      <td className="p-4 font-bold text-emerald-400">{item.nomor_meja}</td>
                      <td className="p-4 font-bold text-white">{item.nama_pelanggan}</td>
                      <td className="p-4 text-xs">Rp {(item.total_sewa || 0).toLocaleString("id-ID")}</td>
                      <td className="p-4 text-xs text-amber-400">Rp {(item.total_fb || 0).toLocaleString("id-ID")}</td>
                      <td className="p-4 font-bold text-emerald-400">Rp {(item.total_akhir || 0).toLocaleString("id-ID")}</td>
                      <td className="p-4">
                        <button onClick={() => setModalStruk({ isOpen: true, data: item })} className="p-2 bg-slate-800 rounded-xl">
                          <Printer size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mejaTerfilter.map((meja) => {
              const statusSekarang = meja.status_pemesanan || "Pending";
              const totalBelanjaFB = (meja.pesanan_fb || []).reduce((acc, curr) => acc + ((curr.harga || 0) * (curr.qty || 1)), 0);
              const hargaPerJam = getHargaPerJam(meja.nomor_meja);
              const totalBiayaSewa = (meja.durasi_bermain || 1) * hargaPerJam;
              const totalTagihan = totalBiayaSewa + totalBelanjaFB;
              const isPlaying = statusSekarang === "Playing";

              return (
                <div key={meja.id} className="bg-slate-900/60 border rounded-2xl p-6 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 ${isPlaying ? "bg-sky-500" : "bg-amber-500"}`} />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-xl">🎱 {meja.nomor_meja || "Meja ?"}</h3>
                      <p className="text-slate-500 text-[10px]">ID: {meja.id_booking || "RC-" + String(meja.id).slice(-5)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button disabled={!isPlaying} onClick={() => tanganiPindahMeja(meja.id, meja.nomor_meja)} 
                        className={`p-2 rounded-xl border ${isPlaying ? "bg-purple-500/20 border-purple-500/30 text-purple-400 cursor-pointer" : "bg-slate-800/20 border-slate-800 text-slate-600 cursor-not-allowed"}`}>
                        <MoveHorizontal size={14} />
                      </button>
                      <button disabled={!isPlaying} onClick={() => setModalFB({ isOpen: true, mejaId: meja.id, nomorMeja: meja.nomor_meja, pesananSaatIni: meja.pesanan_fb || [] })} 
                        className={`p-2 rounded-xl border ${isPlaying ? "bg-amber-500/20 border-amber-500/30 text-amber-400 cursor-pointer" : "bg-slate-800/20 border-slate-800 text-slate-600 cursor-not-allowed"}`}>
                        <Coffee size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs border-y border-slate-800/60 py-3 my-3">
                    <div className="flex justify-between"><span>👤 Pelanggan:</span><span className="font-bold text-white">{meja.nama_pelanggan || "-"}</span></div>
                    <div className="flex justify-between"><span>⏱️ Durasi:</span><span>{meja.durasi_bermain || 1} Jam</span></div>
                    <div className="flex justify-between"><span>💰 Sewa:</span><span className="text-emerald-400">Rp {totalBiayaSewa.toLocaleString("id-ID")}</span></div>
                    {totalBelanjaFB > 0 && <div className="flex justify-between text-amber-400"><span>🍽️ Makanan:</span><span>Rp {totalBelanjaFB.toLocaleString("id-ID")}</span></div>}
                  </div>

                  <div className="flex justify-between items-center bg-slate-950/60 p-3 rounded-xl mb-4">
                    <span className="text-[10px] font-bold text-slate-400">TOTAL</span>
                    <span className="text-xl font-black text-emerald-400">Rp {totalTagihan.toLocaleString("id-ID")}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {statusSekarang === "Pending" ? (
                      <>
                        <button onClick={() => ubahStatusMeja(meja.id, "Playing", meja.nama_pelanggan, meja.nomor_meja, totalBiayaSewa, totalBelanjaFB, meja.durasi_bermain, meja.pesanan_fb || [])} 
                          className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold py-3 rounded-xl text-xs">
                          ▶️ Start Main
                        </button>
                        <button onClick={() => batalkanBookingPending(meja.id, meja.nomor_meja, meja.nama_pelanggan)} 
                          className="px-4 bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl">
                          <Trash2 size={15} />
                        </button>
                      </>
                    ) : (
                      <button disabled={!isPlaying} onClick={() => ubahStatusMeja(meja.id, "Selesai", meja.nama_pelanggan, meja.nomor_meja, totalBiayaSewa, totalBelanjaFB, meja.durasi_bermain, meja.pesanan_fb || [])} 
                        className={`flex-1 font-bold py-3 rounded-xl text-xs ${isPlaying ? "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 cursor-pointer" : "bg-slate-800/50 text-slate-600 cursor-not-allowed"}`}>
                        ⏹️ Stop & Bayar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODALS */}
      <FandBModal isOpen={modalFB.isOpen} onClose={() => setModalFB({ ...modalFB, isOpen: false })} 
        mejaId={modalFB.mejaId} nomorMeja={modalFB.nomorMeja} pesananSaatIni={modalFB.pesananSaatIni} onSave={simpanPesananKantin} />

      {/* MODAL CLOSING */}
      {modalClosing.isOpen && modalClosing.reportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full">
            <div className="flex justify-between mb-4">
              <span className="text-purple-400 font-bold">X-Report Closing</span>
              <button onClick={() => setModalClosing({ isOpen: false, reportData: null })}><X size={16} /></button>
            </div>
            <div className="bg-white text-black p-4 font-mono text-[11px] rounded-xl">
              <div className="text-center border-b pb-2 mb-2"><h4 className="font-bold">ROYAL CUE BILLIARD</h4><p>LAPORAN TUTUP SHIFT</p></div>
              <div>WAKTU: {modalClosing.reportData.waktu}</div>
              <div>KASIR: {modalClosing.reportData.nama_kasir}</div>
              <div>TOTAL TRANSAKSI: {modalClosing.reportData.total_transaksi}</div>
              <div className="border-t my-2"></div>
              <div className="flex justify-between"><span>Sewa Meja:</span><span>Rp {modalClosing.reportData.total_sewa_meja.toLocaleString("id-ID")}</span></div>
              <div className="flex justify-between"><span>Kantin:</span><span>Rp {modalClosing.reportData.total_kantin.toLocaleString("id-ID")}</span></div>
              <div className="flex justify-between"><span>Tunai:</span><span>Rp {modalClosing.reportData.total_tunai.toLocaleString("id-ID")}</span></div>
              <div className="flex justify-between"><span>Non-Tunai:</span><span>Rp {modalClosing.reportData.total_non_tunai.toLocaleString("id-ID")}</span></div>
              <div className="border-t my-2 pt-2 font-bold flex justify-between"><span>GRAND TOTAL:</span><span>Rp {modalClosing.reportData.grand_total.toLocaleString("id-ID")}</span></div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <button onClick={() => window.print()} className="py-2 bg-purple-600 rounded-xl text-sm font-bold">Cetak</button>
              <button onClick={selesaikanClosingDanReset} className="py-2 bg-emerald-600 rounded-xl text-sm font-bold">Selesai & Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL STRUK */}
      {modalStruk.isOpen && modalStruk.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full">
            <div className="flex justify-between mb-4">
              <span className="text-slate-400 font-bold">Struk Pembayaran</span>
              <button onClick={() => setModalStruk({ isOpen: false, data: null })}><X size={16} /></button>
            </div>
            <div className="bg-white text-black p-4 font-mono text-[11px] rounded-xl">
              <div className="text-center border-b pb-2 mb-2"><h4 className="font-bold">ROYAL CUE BILLIARD</h4></div>
              <div>WAKTU: {modalStruk.data.waktu_selesai}</div>
              <div>MEJA: {modalStruk.data.nomor_meja}</div>
              <div>CUSTOMER: {modalStruk.data.nama_pelanggan}</div>
              <div className="border-t my-2"></div>
              <div className="flex justify-between"><span>Sewa ({modalStruk.data.durasi} Jam):</span><span>Rp {modalStruk.data.total_sewa.toLocaleString("id-ID")}</span></div>
              {modalStruk.data.pesanan_fb?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs"><span>{item.nama} x{item.qty}:</span><span>Rp {(item.harga * item.qty).toLocaleString("id-ID")}</span></div>
              ))}
              <div className="border-t my-2 pt-2 font-bold flex justify-between"><span>TOTAL:</span><span>Rp {modalStruk.data.total_akhir.toLocaleString("id-ID")}</span></div>
              <div className="flex justify-between"><span>BAYAR:</span><span>{modalStruk.data.metode_pembayaran?.toUpperCase()}</span></div>
              <div className="text-center mt-4 pt-2 border-t"><p>--- TERIMA KASIH ---</p></div>
            </div>
            <button onClick={() => window.print()} className="mt-4 py-2 bg-emerald-600 rounded-xl text-sm font-bold">Cetak Struk</button>
          </div>
        </div>
      )}

    </div>
  );
}