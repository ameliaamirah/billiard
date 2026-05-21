import { useEffect, useState } from "react";
import { 
  FaPlay, FaStop, FaPrint, FaDiceD6, FaUser, FaInfoCircle, 
  FaClock, FaSearch, FaMinusCircle, FaPlusCircle, FaSignOutAlt, 
  FaWallet, FaCashRegister, FaUtensils, FaMoneyBillWave, FaQrcode 
} from "react-icons/fa";
import FandBModal from "../components/FandBModal"; 

/* ========================================================
    🕒 SUB-KOMPONEN: LIVE TIMER (COUNTDOWN & STOPWATCH)
   ======================================================== */
function TableTimer({ jamMulai, durasiJam, status }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isOvertime, setIsOvertime] = useState(false);

  useEffect(() => {
    if (status !== "Playing" || !jamMulai) {
      setTimeLeft(durasiJam > 0 ? `${durasiJam} Jam (Statis)` : "Bebas");
      return;
    }

    const interval = setInterval(() => {
      const sekarang = new Date();
      const [jam, menit] = jamMulai.split(":").map(Number);
      const waktuMulai = new Date();
      waktuMulai.setHours(jam, menit, 0, 0);

      if (waktuMulai > sekarang) {
        waktuMulai.setDate(waktuMulai.getDate() - 1);
      }

      const selisihMilidetik = sekarang - waktuMulai;

      if (durasiJam > 0) {
        const totalDurasiMilidetik = durasiJam * 60 * 60 * 1000;
        const sisaMilidetik = totalDurasiMilidetik - selisihMilidetik;

        if (sisaMilidetik <= 0) {
          setIsOvertime(true);
          const overTimeMili = Math.abs(sisaMilidetik);
          const h = Math.floor(overTimeMili / 3600000);
          const m = Math.floor((overTimeMili % 3600000) / 60000);
          const s = Math.floor((overTimeMili % 60000) / 1000);
          setTimeLeft(`Habis! (+${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")})`);
        } else {
          setIsOvertime(false);
          const h = Math.floor(sisaMilidetik / 3600000);
          const m = Math.floor((sisaMilidetik % 3600000) / 60000);
          const s = Math.floor((sisaMilidetik % 60000) / 1000);
          setTimeLeft(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
        }
      } else {
        setIsOvertime(false);
        const h = Math.floor(selisihMilidetik / 3600000);
        const m = Math.floor((selisihMilidetik % 3600000) / 60000);
        const s = Math.floor((selisihMilidetik % 60000) / 1000);
        setTimeLeft(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [jamMulai, durasiJam, status]);

  return (
    <span className={`font-mono font-bold ${isOvertime ? "text-rose-500 animate-pulse" : "text-[#00ff99]"}`}>
      {timeLeft}
    </span>
  );
}

/* ========================================================
    🖥️ KOMPONEN UTAMA: KASIR DASHBOARD (V.2.5 - MULTI-PAYMENT & SLIM LAYOUT)
   ======================================================== */
export default function KasirDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Utama: Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  // State Utama: Keuangan Laci
  const [modalAwal, setModalAwal] = useState(0);
  const [pengeluaranList, setPengeluaranList] = useState([]);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [tempExpense, setTempExpense] = useState({ amount: "", note: "" });

  // State Kontrol per Meja (Diskon, Charge, F&B, & Metode Pembayaran)
  const [diskonMap, setDiskonMap] = useState({});
  const [chargeMap, setChargeMap] = useState({});
  const [fbMap, setFbMap] = useState({});
  const [paymentMethodMap, setPaymentMethodMap] = useState({}); 
  const [activeFbModal, setActiveFbModal] = useState(null);

  const token = localStorage.getItem("token");

  const getHeaders = () => {
    const headers = { "Content-Type": "application/json" };
    if (token && token !== "null" && token !== "undefined") {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/kasir/reservasi", { headers: getHeaders() });
      const result = await res.json();
      if (Array.isArray(result)) { setData(result); }
      else if (result.success && Array.isArray(result.data)) { setData(result.data); }
    } catch (error) { 
      console.error("Fetch error:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchData();
    const autoRefreshInterval = setInterval(() => { fetchData(); }, 10000);
    return () => clearInterval(autoRefreshInterval);
  }, []);

  const startGame = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/api/kasir/start/${id}`, { method: "POST", headers: getHeaders() });
      if ((await res.json()).success) fetchData();
    } catch (error) { alert("Gagal koneksi ke server!"); }
  };

  const stopGame = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/api/kasir/stop/${id}`, { method: "POST", headers: getHeaders() });
      if ((await res.json()).success) fetchData();
    } catch (error) { alert("Gagal koneksi ke server!"); }
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!tempExpense.amount || !tempExpense.note) return;
    setPengeluaranList([...pengeluaranList, { id: Date.now(), amount: parseInt(tempExpense.amount), note: tempExpense.note }]);
    setTempExpense({ amount: "", note: "" });
    setIsExpenseOpen(false);
  };

  /* ========================================================
      🔥 CETAK REKAP LAPORAN TUTUP SHIFT LENGKAP (58MM)
     ======================================================== */
  const handleTutupShift = () => {
    const konfirmasi = window.confirm("Yakin ingin tutup shift & cetak rekap?");
    if (!konfirmasi) return;

    let omsetTunai = 0; 
    let omsetQris = 0;  

    data.forEach((item) => {
      if (item.statusPemesanan === "Selesai" || item.statusPemesanan === "Playing") {
        const hrg = (item.nomorMeja || "").toLowerCase().includes("vip") ? 80000 : 50000;
        const dur = parseInt(item.durasiBermain || item.durasi) || 1;
        
        const totalMeja = (hrg * dur);
        const disc = diskonMap[item.id] || 0;
        const chg = chargeMap[item.id] || 0;
        
        const pesananMeja = fbMap[item.id] || [];
        const totalKantin = pesananMeja.reduce((acc, curr) => acc + (curr.harga * curr.qty), 0);

        const netTransactionBill = totalMeja - disc + chg + totalKantin;
        const metode = paymentMethodMap[item.id] || "TUNAI";

        if (metode === "QRIS") {
          omsetQris += netTransactionBill;
        } else {
          omsetTunai += netTransactionBill;
        }
      }
    });

    const sumPengeluaran = pengeluaranList.reduce((acc, curr) => acc + curr.amount, 0);
    const wajibLaci = modalAwal + omsetTunai - sumPengeluaran;
    const totalOmsetGabungan = omsetTunai + omsetQris;
    const waktu = new Date().toLocaleString("id-ID");

    const pWin = window.open("", "_blank", "width=360,height=600");
    if (!pWin) {
      alert("Gagal membuka jendela cetak. Periksa izin pop-up browser Anda!");
      return;
    }

    pWin.document.write(`
      <html>
        <head>
          <title>Laporan Shift</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap'); 
            @page { size: 58mm auto; margin: 0; } 
            body { font-family: 'Inconsolata', monospace; width: 44mm; margin: 0 auto; padding: 5px 0; font-size: 9px; line-height: 1.3; color:#000; } 
            .divider { border-top: 1px dashed #000; margin: 5px 0; } 
            .flex { display: flex; justify-content: space-between; } 
            .font-bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div style="text-align:center"><h2 style="margin:0; font-size:12px;">LAPORAN SHIFT</h2><small>ROYAL CUE BILLIARD</small></div>
          <div class="divider"></div>
          <div class="flex"><span>Waktu:</span><span>${waktu}</span></div>
          <div class="divider"></div>
          <div class="flex"><span>Modal Awal:</span><span>Rp ${modalAwal.toLocaleString("id-ID")}</span></div>
          <div class="flex"><span>Omset Tunai (+):</span><span>Rp ${omsetTunai.toLocaleString("id-ID")}</span></div>
          <div class="flex"><span>Omset QRIS (+):</span><span>Rp ${omsetQris.toLocaleString("id-ID")}</span></div>
          <div class="flex"><span>Biaya Laci (-):</span><span>Rp ${sumPengeluaran.toLocaleString("id-ID")}</span></div>
          <div class="divider"></div>
          <div class="flex font-bold"><span>TOT. OMSET:</span><span>Rp ${totalOmsetGabungan.toLocaleString("id-ID")}</span></div>
          <div class="flex font-bold" style="font-size:10px; margin-top:2px;"><span>WAJIB LACI:</span><span>Rp ${wajibLaci.toLocaleString("id-ID")}</span></div>
          <div class="divider"></div>
          <p style="font-size:7.5px; word-break: break-all; margin: 2px 0;">Rincian Biaya: ${pengeluaranList.map(p => p.note + " (" + p.amount.toLocaleString("id-ID") + ")").join(", ") || "-"}</p>
          <script>window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 100); };</script>
        </body>
      </html>
    `);
    pWin.document.close();
  };

  /* ========================================================
      🔥 CETAK STRUK TRANSAKSI MEJA PELANGGAN (THERMAL POOR-FIX)
     ======================================================== */
  const printStruk = (id) => {
    const item = data.find(x => x.id === id);
    if (!item) {
      alert("Data transaksi meja tidak ditemukan!");
      return;
    }

    const hrg = (item.nomorMeja || "").toLowerCase().includes("vip") ? 80000 : 50000;
    const dur = parseInt(item.durasiBermain || item.durasi) || 1;
    const totalAwal = hrg * dur;
    const disc = diskonMap[id] || 0;
    const chg = chargeMap[id] || 0;
    
    const pesananMeja = fbMap[id] || [];
    const totalKantinMeja = pesananMeja.reduce((acc, curr) => acc + (curr.harga * curr.qty), 0);
    const finalTotal = totalAwal - disc + chg + totalKantinMeja;
    const namaPlg = item.namaPelanggan || item.nama || "Pelanggan";
    const metodeBayar = paymentMethodMap[id] || "TUNAI"; 

    const pWin = window.open("", "_blank", "width=360,height=500");
    if (!pWin) {
      alert("Gagal membuka jendela cetak. Periksa izin pop-up browser Anda!");
      return;
    }

    pWin.document.write(`
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap');
            /* Memaksa browser mengatur viewport kertas sesuai printer thermal roll 58mm */
            @page { size: 58mm auto; margin: 0; } 
            body { 
              font-family: 'Inconsolata', monospace; 
              width: 44mm; 
              margin: 0 auto; 
              padding: 5px 0; 
              font-size: 9.5px; 
              line-height: 1.3; 
              color: #000;
            }
            .text-center { text-align: center; }
            .flex-row { display: flex; justify-content: space-between; }
            .divider { border-top: 1px dashed #000; margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <h3 style="margin: 0; font-size:12px;">ROYAL CUE</h3>
            <small>BILLIARD & STUDIO</small>
          </div>
          <div class="divider"></div>
          <div class="flex-row"><span>Cust:</span><span>${namaPlg}</span></div>
          <div class="flex-row"><span>Meja:</span><span>${item.nomorMeja || "Meja"}</span></div>
          <div class="flex-row"><span>Waktu:</span><span>${dur} Jam</span></div>
          <div class="divider"></div>
          <div class="flex-row"><span>Sewa Meja</span><span>Rp ${totalAwal.toLocaleString("id-ID")}</span></div>
          
          ${pesananMeja.length > 0 ? `
            <div class="divider"></div>
            ${pesananMeja.map(p => `
              <div class="flex-row" style="font-size: 8.5px;">
                <span>* ${p.qty}x ${p.nama}</span>
                <span>Rp ${(p.harga * p.qty).toLocaleString("id-ID")}</span>
              </div>
            `).join("")}
          ` : ""}
          
          <div class="divider"></div>
          ${disc > 0 ? `<div class="flex-row"><span>Diskon (-)</span><span>Rp ${disc.toLocaleString("id-ID")}</span></div>` : ""}
          ${chg > 0 ? `<div class="flex-row"><span>Charge (+)</span><span>Rp ${chg.toLocaleString("id-ID")}</span></div>` : ""}
          <div class="divider"></div>
          <div class="flex-row" style="font-weight: bold; font-size: 10px;"><span>TOTAL:</span><span>Rp ${finalTotal.toLocaleString("id-ID")}</span></div>
          <div class="text-center">
            <hr class="divider">
            <p style="font-weight: bold; margin: 2px 0; font-size: 10px;">* LUNAS (${metodeBayar}) *</p>
            <small>Terima Kasih!</small>
          </div>
          <script>window.onload=function(){ window.print(); setTimeout(function() { window.close(); }, 100); }</script>
        </body>
      </html>
    `);
    pWin.document.close();
  };

  const filteredData = data.filter(i => {
    const matches = (i.namaPelanggan || i.nama || "").toLowerCase().includes(searchQuery.toLowerCase()) || (i.nomorMeja || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matches && (statusFilter === "Semua" || (i.statusPemesanan || "Pending").toLowerCase() === statusFilter.toLowerCase());
  });

  if (loading) {
    return <div className="p-8 text-center text-slate-400 font-medium animate-pulse">Memuat dashboard kasir Royal Cue...</div>;
  }

  return (
    // ⬇️ Penyesuaian Jarak: Menggunakan pt-1, pb-4, dan space-y-4 agar tampilan nempel presisi ke atas/navbar
    <div className="px-4 pb-4 md:px-8 md:pb-8 pt-1 max-w-7xl mx-auto space-y-4">
      
      {/* 🏷️ JUDUL HALAMAN & STATUS LIVE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-1.5 border-b border-slate-900 pb-2">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            MONITOR KASIR <span className="text-[#00ff99]">ROYAL CUE</span>
          </h1>
          <p className="text-[11px] text-slate-500">Sistem Pemantauan Reservasi Meja Biliar Real-time</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-900/30 px-3 py-1 rounded-full text-[10px] font-bold text-[#00ff99]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff99] animate-pulse"></span>
          SUPABASE LIVE CONNECTED
        </div>
      </div>

      {/* 🛠️ CONTROL PANEL */}
      <div className="flex flex-col xl:flex-row gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-xl backdrop-blur-xl">
        <div className="flex flex-wrap gap-2 items-center border-b xl:border-b-0 xl:border-r border-slate-800 pb-3 xl:pb-0 xl:pr-4">
          <div className="flex items-center gap-2.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <FaWallet className="text-emerald-500 text-xs" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase font-bold">Modal Awal</span>
              <input 
                type="number" 
                value={modalAwal || ""} 
                placeholder="0"
                onChange={(e) => setModalAwal(parseInt(e.target.value) || 0)}
                className="bg-transparent text-white font-mono font-bold outline-none w-20 text-xs"
              />
            </div>
          </div>
          
          <button 
            onClick={() => setIsExpenseOpen(true)}
            className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 px-3 py-2.5 rounded-lg text-[11px] font-bold text-rose-400 transition-all active:scale-95 cursor-pointer"
          >
            <FaMinusCircle size={11} /> Kas Keluar
          </button>
        </div>

        <div className="flex-grow flex flex-col md:flex-row gap-2.5 items-center">
          <div className="relative w-full">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
            <input
              type="text"
              placeholder="Cari meja/nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 py-2 text-xs text-white focus:outline-none focus:border-slate-700"
            />
          </div>
          
          <div className="flex gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto">
            {["Semua", "Pending", "Playing", "Selesai"].map(s => (
              <button 
                key={s} 
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-md text-[11px] font-bold tracking-tight cursor-pointer transition-all ${statusFilter === s ? "bg-slate-800 text-[#00ff99]" : "text-slate-500"}`}
              >
                {s}
              </button>
            ))}
          </div>

          <button onClick={handleTutupShift} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-lg text-xs font-black text-white shadow-lg whitespace-nowrap cursor-pointer transition-all active:scale-95">
            <FaSignOutAlt size={11} /> TUTUP SHIFT
          </button>
        </div>
      </div>

      {/* EXPENSE MODAL OVERLAY */}
      {isExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-sm"><FaCashRegister /> Catat Kas Keluar</h3>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <input 
                type="number" placeholder="Nominal (Rp)" autoFocus required
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white outline-none focus:border-emerald-500 text-xs font-mono"
                value={tempExpense.amount} onChange={e => setTempExpense({...tempExpense, amount: e.target.value})}
              />
              <input 
                type="text" placeholder="Keterangan (Contoh: Beli Galon)" required
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white outline-none focus:border-emerald-500 text-xs"
                value={tempExpense.note} onChange={e => setTempExpense({...tempExpense, note: e.target.value})}
              />
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setIsExpenseOpen(false)} className="flex-1 py-2 text-slate-400 hover:text-white font-bold text-xs cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs cursor-pointer transition-all">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRID KARTU MEJA */}
      {filteredData.length === 0 ? (
        <div className="text-center p-10 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-500 text-xs">
          Tidak ada data kontrol meja yang cocok.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((item) => {
            const hrg = (item.nomorMeja || "").toLowerCase().includes("vip") ? 80000 : 50000;
            const dur = parseInt(item.durasiBermain || item.durasi) || 0;
            const disc = diskonMap[item.id] || 0;
            const chg = chargeMap[item.id] || 0;
            
            const pesananMeja = fbMap[item.id] || [];
            const totalKantinMeja = pesananMeja.reduce((acc, curr) => acc + (curr.harga * curr.qty), 0);
            
            const totalFinal = (hrg * (dur || 1)) - disc + chg + totalKantinMeja;
            const statusAktif = item.statusPemesanan || "Pending";
            const currentPaymentMethod = paymentMethodMap[item.id] || "TUNAI";

            return (
              <div key={item.id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 backdrop-blur-md flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-xl space-y-3">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-black text-white">
                      <FaDiceD6 className="text-[#00ff99]" /> {item.nomorMeja || "Meja -"}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      statusAktif === "Playing" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-amber-500/10 text-amber-400"
                    }`}>{statusAktif}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white"><FaUser className="text-slate-500 text-[10px]" /><span>{item.namaPelanggan || "Tanpa Nama"}</span></div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-semibold"><FaClock className="text-[#00ff99]" /><span>Waktu: <TableTimer jamMulai={item.jamMulai} durasiJam={dur} status={statusAktif} /></span></div>
                  </div>

                  <button 
                    onClick={() => setActiveFbModal({ id: item.id, nomorMeja: item.nomorMeja || "Meja" })}
                    className="w-full py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-slate-300 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FaUtensils className="text-[#00ff99] text-[9px]" /> 
                    Order Kantin {pesananMeja.length > 0 && `(${pesananMeja.reduce((a, b) => a + b.qty, 0)} Item)`}
                  </button>

                  <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800/40">
                    <div>
                      <input 
                        type="number" placeholder="Diskon" 
                        value={diskonMap[item.id] || ""} 
                        onChange={e => setDiskonMap({...diskonMap, [item.id]: Math.max(0, parseInt(e.target.value) || 0)})} 
                        className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded-md text-[10px] text-white font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <input 
                        type="number" placeholder="Charge" 
                        value={chargeMap[item.id] || ""} 
                        onChange={e => setChargeMap({...chargeMap, [item.id]: Math.max(0, parseInt(e.target.value) || 0)})} 
                        className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded-md text-[10px] text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 💳 TOGGLE MINI METHOD */}
                  <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 border border-slate-800/60 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPaymentMethodMap({ ...paymentMethodMap, [item.id]: "TUNAI" })}
                      className={`py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${currentPaymentMethod === "TUNAI" ? "bg-slate-800 text-emerald-400 border border-slate-700" : "text-slate-600"}`}
                    >
                      <FaMoneyBillWave size={10} /> Tunai
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethodMap({ ...paymentMethodMap, [item.id]: "QRIS" })}
                      className={`py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${currentPaymentMethod === "QRIS" ? "bg-slate-800 text-sky-400 border border-slate-700" : "text-slate-600"}`}
                    >
                      <FaQrcode size={10} /> QRIS
                    </button>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-2.5 flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Total Bill</span>
                    <span className="text-sm font-black text-[#00ff99]">Rp {totalFinal.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-2">
                  <button onClick={() => startGame(item.id)} disabled={statusAktif === "Playing" || statusAktif === "Selesai"} className="flex flex-col items-center py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg font-bold text-[11px] cursor-pointer transition-all active:scale-95"><FaPlay size={9} /><span>Start</span></button>
                  <button onClick={() => stopGame(item.id)} disabled={statusAktif !== "Playing"} className="flex flex-col items-center py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg font-bold text-[11px] cursor-pointer transition-all active:scale-95"><FaStop size={9} /><span>Stop</span></button>
                  <button onClick={() => printStruk(item.id)} className="flex flex-col items-center py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-[11px] cursor-pointer transition-all active:scale-95"><FaPrint size={9} /><span>Struk</span></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL KANTIN F&B */}
      {activeFbModal && (
        <FandBModal
          isOpen={activeFbModal !== null}
          onClose={() => setActiveFbModal(null)}
          mejaId={activeFbModal.id}
          nomorMeja={activeFbModal.nomorMeja}
          pesananSaatIni={fbMap[activeFbModal.id] || []}
          onSave={(idMeja, dataBelanjaan) => setFbMap({ ...fbMap, [idMeja]: dataBelanjaan })}
        />
      )}

    </div>
  );
}