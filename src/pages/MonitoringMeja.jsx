import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaCircle, FaCashRegister, FaUtensils, FaGamepad, 
  FaClock, FaCheckCircle, FaStopwatch, FaPlus, FaSignOutAlt 
} from "react-icons/fa";

// Import komponen PaymentModal yang sudah kita buat sebelumnya
import PaymentModal from "./PaymentModal";

const MonitoringMeja = () => {
  // 1. DATA STATE MEJA
  const [tables, setTables] = useState([
    { id: 1, name: "Meja 01 (Reguler)", status: "Tersedia", type: "Reguler", price: 50000, timeLeft: 0, foodOrders: [] },
    { id: 2, name: "Meja 02 (Reguler)", status: "Digunakan", type: "Reguler", price: 50000, timeLeft: 2400, foodOrders: [{ name: "Corndog Mozzarella", qty: 2, price: 15000 }] },
    { id: 3, name: "Meja 03 (Reguler)", status: "Tersedia", type: "Reguler", price: 50000, timeLeft: 0, foodOrders: [] },
    { id: 4, name: "Meja 04 (Reguler)", status: "Digunakan", type: "Reguler", price: 50000, timeLeft: 5400, foodOrders: [{ name: "Chicken Katsu", qty: 1, price: 25000 }, { name: "Ice Lemon Tea", qty: 2, price: 10000 }] },
    { id: 5, name: "Meja 05 (VIP - Emerald)", status: "Tersedia", type: "VIP", price: 85000, timeLeft: 0, foodOrders: [] },
    { id: 6, name: "Meja 06 (VIP - Emerald)", status: "Digunakan", type: "VIP", price: 85000, timeLeft: 120, foodOrders: [] },
  ]);

  // Menu Makanan untuk fitur simulasi Tambah F&B Kasir
  const menuFNB = [
    { name: "Corndog Mozzarella", price: 15000 },
    { name: "Chicken Katsu", price: 25000 },
    { name: "Ice Lemon Tea", price: 10000 }
  ];

  const [selectedTable, setSelectedTable] = useState(null);
  const [duration, setDuration] = useState(1);
  const [totalCost, setTotalCost] = useState(0);

  // STATE BARU: Pengontrol visibility modal pembayaran dan penampung data kalkulasi final
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ tableName: "", totalAmount: 0, id: null });

  // 2. SIMULASI COUNTDOWN TIMER (Berjalan tiap detik untuk meja 'Digunakan')
  useEffect(() => {
    const timer = setInterval(() => {
      setTables((prevTables) =>
        prevTables.map((table) => {
          if (table.status === "Digunakan" && table.timeLeft > 0) {
            const nextTime = table.timeLeft - 1;
            if (nextTime === 0) {
              return { ...table, status: "Tersedia", timeLeft: 0 };
            }
            return { ...table, timeLeft: nextTime };
          }
          return table;
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update real-time data di panel kanan jika kasir sedang melihat meja aktif tersebut
  useEffect(() => {
    if (selectedTable) {
      const liveData = tables.find((t) => t.id === selectedTable.id);
      setSelectedTable(liveData);
    }
  }, [tables]);

  // Format hitungan detik ke bentuk Jam:Menit:Detik
  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const pilihMeja = (table) => {
    setSelectedTable(table);
    if (table.status === "Tersedia") {
      setDuration(1);
      setTotalCost(table.price * 1);
    }
  };

  const handleDurationChange = (jam) => {
    setDuration(jam);
    if (selectedTable) {
      setTotalCost(selectedTable.price * jam);
    }
  };

  // AKSI: Aktivasi Billing & Menyalakan Lampu Meja IoT
  const handleStartGame = () => {
    setTables(tables.map(t => t.id === selectedTable.id ? {
      ...t,
      status: "Digunakan",
      timeLeft: duration * 3600 
    } : t));
    alert(`[IoT Trigger] Sinyal dikirim! Billing ${selectedTable.name} Aktif, lampu dinyalakan.`);
  };

  // AKSI: Tambah Pesanan Snack Langsung Masuk ke Nota Meja Terkait
  const handleAddFood = (item) => {
    setTables(tables.map(t => {
      if (t.id === selectedTable.id) {
        const exist = t.foodOrders.find(f => f.name === item.name);
        if (exist) {
          return {
            ...t,
            foodOrders: t.foodOrders.map(f => f.name === item.name ? { ...f, qty: f.qty + 1 } : f)
          };
        } else {
          return { ...t, foodOrders: [...t.foodOrders, { ...item, qty: 1 }] };
        }
      }
      return t;
    }));
  };

  // PERBAIKAN AKSI: Trigger Modal Pembayaran (Tidak langsung mengosongkan meja di sini)
  const handleCheckOut = () => {
    const costBilliard = selectedTable.price * (duration || 1);
    const costFood = selectedTable.foodOrders.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const grandTotal = costBilliard + costFood;

    // Simpan data kalkulasi ke state untuk dikirim ke PaymentModal
    setCheckoutData({
      id: selectedTable.id,
      tableName: selectedTable.name,
      totalAmount: grandTotal
    });

    // Buka popup modal kasir digital
    setIsPayModalOpen(true);
  };

  // PERBAIKAN UTAMA: Menyimpan data otomatis ke Laporan Keuangan (localStorage) saat Lunas
  const handlePaymentSuccessExecution = () => {
    // 1. Ambil data laporan lama dari localStorage browser (jika belum ada, buat array kosong [])
    const riwayatLaporan = JSON.parse(localStorage.getItem("royal_cue_laporan")) || [];

    // 2. Buat objek data transaksi baru berbentuk rapi
    const transaksiBaru = {
      id: Date.now(), // Unique ID memakai timestamp
      tanggal: new Date().toLocaleDateString("id-ID"),
      waktu: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }),
      keterangan: `Sewa ${checkoutData.tableName}`,
      jumlah: checkoutData.totalAmount,
      metode: "QRIS / Tunai" 
    };

    // 3. Masukkan data baru ke baris paling atas laporan, lalu simpan kembali
    const laporanTerbaru = [transaksiBaru, ...riwayatLaporan];
    localStorage.setItem("royal_cue_laporan", JSON.stringify(laporanTerbaru));

    // 4. Ubah status data meja biliar kembali kosong/tersedia
    setTables(tables.map(t => t.id === checkoutData.id ? { 
      ...t, 
      status: "Tersedia", 
      timeLeft: 0, 
      foodOrders: [] 
    } : t));
    
    setSelectedTable(null);
    setIsPayModalOpen(false); // Tutup modal otomatis setelah lunas
  };

  return (
    <div className="bg-[#020617] min-h-screen pt-28 pb-12 text-slate-100 overflow-x-hidden">
      
      {/* HEADER SECTION */}
      <section className="px-5 max-w-6xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-800 pb-8">
          <div>
            <h2 className="text-[#00ff99] font-bold tracking-[0.2em] uppercase text-xs mb-2">Operation Dashboard</h2>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              <FaGamepad className="text-white" /> Live Table <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff99] to-[#00aa66]">Monitoring</span>
            </h1>
          </div>
          <div className="flex gap-6 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <FaCircle className="text-[#00ff99] animate-pulse shadow-[0_0_10px_#00ff99]" /> 
              <span className="text-slate-300">TERSEDIA</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <FaCircle className="text-rose-500 shadow-[0_0_10px_#f43f5e]" /> 
              <span className="text-slate-300">IN-GAME (PLAYING)</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 items-start">
        
        {/* KIRI: GRID UNIT MEJA BILIAR */}
        <div className="lg:col-span-8">
          <div className="grid sm:grid-cols-2 gap-5">
            {tables.map((table) => (
              <motion.div
                key={table.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => pilihMeja(table)}
                className={`group p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden cursor-pointer ${
                  table.status === "Tersedia" 
                    ? "bg-[#0b1329]/60 border-slate-800 hover:border-[#00ff99]/50 shadow-xl" 
                    : "bg-rose-950/10 border-rose-900/40 hover:border-rose-500/50"
                } ${selectedTable?.id === table.id ? "ring-2 ring-[#00ff99] bg-[#0b1329]" : ""}`}
              >
                <div className="flex justify-between items-center mb-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    table.type === "VIP" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-slate-800 text-slate-400"
                  }`}>
                    {table.type}
                  </span>
                  <div className={`h-2 w-2 rounded-full ${
                    table.status === "Tersedia" ? "bg-[#00ff99] shadow-[0_0_8px_#00ff99]" : "bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-ping"
                  }`} />
                </div>

                <h3 className="text-xl font-black mb-1 text-white group-hover:text-[#00ff99] transition-colors">{table.name}</h3>
                
                {table.status === "Tersedia" ? (
                  <p className="text-slate-400 text-xs font-light">
                    Tarif: <span className="text-slate-200 font-bold">Rp {table.price.toLocaleString("id-ID")}</span> / Jam
                  </p>
                ) : (
                  <div className="flex items-center gap-2 mt-2 bg-rose-950/40 border border-rose-900/30 px-3 py-1.5 rounded-xl w-fit text-rose-400 font-mono text-sm font-bold">
                    <FaStopwatch className="animate-spin-slow" /> {formatTime(table.timeLeft)}
                  </div>
                )}

                <div className="mt-8 flex justify-between items-center">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    table.status === "Tersedia" ? "text-[#00ff99]" : "text-rose-400"
                  }`}>
                    {table.status === "Tersedia" ? "KOSONG" : "SEDANG BERMAIN"}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white group-hover:bg-[#00ff99] group-hover:text-black transition-all">
                    <FaCheckCircle className="text-sm" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* KANAN: PANEL ADAPTIF CONSOLE KASIR */}
        <div className="lg:col-span-4 lg:sticky lg:top-28">
          <div className="bg-[#0b1329] p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl backdrop-blur-md relative overflow-hidden">
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#00ff99]/10 text-[#00ff99] rounded-2xl flex items-center justify-center text-xl border border-[#00ff99]/20">
                <FaCashRegister />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight text-white uppercase">Console Kasir</h3>
                <p className="text-[10px] text-slate-500 tracking-widest uppercase">Smart Core Engine</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {selectedTable ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  
                  <div className={`p-5 rounded-2xl border ${selectedTable.status === "Tersedia" ? "bg-slate-950/60 border-slate-800" : "bg-rose-950/20 border-rose-900/30"}`}>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Meja Dikontrol</span>
                    <h4 className={`font-black text-lg ${selectedTable.status === "Tersedia" ? "text-[#00ff99]" : "text-rose-400"}`}>{selectedTable.name}</h4>
                  </div>

                  {/* KONDISI A: MEJA KOSONG (OPEN BILLING) */}
                  {selectedTable.status === "Tersedia" && (
                    <>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
                          <FaClock className="text-[#00ff99]" /> Durasi Sewa
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[1, 2, 3, 4].map((jam) => (
                            <button key={jam} onClick={() => handleDurationChange(jam)}
                              className={`py-2.5 rounded-xl text-xs font-black transition-all border ${duration === jam ? "bg-[#00ff99] border-[#00ff99] text-black" : "bg-slate-900 border-slate-800 text-slate-400"}`}>
                              {jam}H
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-500 uppercase font-black">Estimasi Billing</span>
                          <span className="text-xl font-black text-white">Rp {totalCost.toLocaleString("id-ID")}</span>
                        </div>
                        <button onClick={handleStartGame} className="w-full bg-gradient-to-r from-[#00aa66] to-[#00ff99] text-black font-black text-xs py-3.5 rounded-xl uppercase tracking-wider cursor-pointer">
                          Nyalakan Lampu Meja
                        </button>
                      </div>
                    </>
                  )}

                  {/* KONDISI B: MEJA SEDANG AKTIF (INPUT F&B & STOP ACTION) */}
                  {selectedTable.status === "Digunakan" && (
                    <>
                      <div className="border-t border-b border-slate-800/80 py-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
                          <FaUtensils className="text-amber-500" /> Pesanan Makanan & Camilan
                        </span>
                        
                        {selectedTable.foodOrders.length === 0 ? (
                          <p className="text-xs text-slate-500 italic py-1">Belum ada pesanan makanan di meja ini.</p>
                        ) : (
                          <div className="space-y-2 max-h-24 overflow-y-auto pr-1">
                            {selectedTable.foodOrders.map((food, i) => (
                              <div key={i} className="flex justify-between text-xs bg-slate-950/40 px-3 py-2 rounded-xl border border-slate-900">
                                <span className="text-slate-300 font-medium">{food.name} <b className="text-[#00ff99]">x{food.qty}</b></span>
                                <span className="text-slate-400 font-bold">Rp {(food.price * food.qty).toLocaleString("id-ID")}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-dashed border-slate-800">
                          <span className="text-[9px] uppercase font-bold text-slate-500 block mb-2">Input Menu Cepat:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {menuFNB.map((snack, idx) => (
                              <button key={idx} onClick={() => handleAddFood(snack)} className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-slate-300 transition-all cursor-pointer">
                                <FaPlus className="text-[8px] text-amber-500" /> {snack.name.split(" ")[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span>Total Pesanan F&B:</span>
                          <span className="font-bold text-slate-200">Rp {selectedTable.foodOrders.reduce((s, i) => s + (i.price * i.qty), 0).toLocaleString("id-ID")}</span>
                        </div>
                        <button onClick={handleCheckOut} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black text-xs py-3.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20 cursor-pointer">
                          <FaSignOutAlt /> Hentikan & Cetak Nota
                        </button>
                      </div>
                    </>
                  )}

                </motion.div>
              ) : (
                <div className="text-center py-16 px-4 border border-dashed border-slate-800 rounded-[2rem] bg-slate-950/20">
                  <div className="w-12 h-12 bg-slate-900 text-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                    <FaGamepad size={20} />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium uppercase tracking-widest">
                    Pilih meja di samping <br /> untuk manajemen kontrol
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </section>

      {/* RENDER MODAL PEMBAYARAN */}
      <PaymentModal 
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        tableName={checkoutData.tableName}
        totalAmount={checkoutData.totalAmount}
        onPaymentSuccess={handlePaymentSuccessExecution}
      />
    </div> 
  );
};

export default MonitoringMeja;