import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FaWallet, FaGamepad, FaUtensils, FaChartLine, 
  FaArrowUp, FaDownload, FaCalendarAlt, FaFileInvoiceDollar 
} from "react-icons/fa";

const LaporanKeuangan = () => {
  // State untuk filter waktu (Hari ini, Bulan ini, Semua)
  const [filterTime, setFilterTime] = useState("Bulan Ini");

  // Mock Data Ringkasan Keuangan Eksekutif
  const financialSummary = {
    totalRevenue: 14250000,
    billiardRevenue: 9850000,
    fnbRevenue: 4400000,
    growth: "+12.5% dari bulan lalu"
  };

  // Mock Data Riwayat Transaksi Terbaru
  const [transactions] = useState([
    { id: "TX-001", date: "16 Mei 2026", item: "Meja 04 - Billing (3 Jam)", category: "Billiard", amount: 150000, status: "Selesai" },
    { id: "TX-002", date: "16 Mei 2026", item: "Meja 04 - 2 Corndog, 2 Ice Lemon Tea", category: "F&B", amount: 50000, status: "Selesai" },
    { id: "TX-003", date: "15 Mei 2026", item: "Meja 06 (VIP) - Billing (2 Jam)", category: "Billiard", amount: 170000, status: "Selesai" },
    { id: "TX-004", date: "15 Mei 2026", item: "Meja 02 - Billing (1 Jam) + 1 Katsu", category: "Mixed", amount: 75000, status: "Selesai" },
    { id: "TX-005", date: "14 Mei 2026", item: "Meja 05 (VIP) - Billing (4 Jam)", category: "Billiard", amount: 340000, status: "Selesai" },
  ]);

  return (
    <div className="bg-[#020617] min-h-screen pt-28 pb-16 text-slate-100 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-5">
        
        {/* HEADER DASHBOARD */}
        <section className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-800 pb-8">
          <div>
            <h2 className="text-[#00ff99] font-bold tracking-[0.2em] uppercase text-xs mb-2">Financial Report</h2>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              <FaChartLine className="text-white" /> Analytics & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff99] to-[#00aa66]">Revenue</span>
            </h1>
          </div>
          
          {/* FILTER & DOWNLOAD BUTTON */}
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-bold text-slate-300">
              <FaCalendarAlt className="text-[#00ff99]" />
              <select 
                value={filterTime} 
                onChange={(e) => setFilterTime(e.target.value)}
                className="bg-transparent border-none outline-none text-white cursor-pointer"
              >
                <option value="Hari Ini" className="bg-[#020617]">Hari Ini</option>
                <option value="Bulan Ini" className="bg-[#020617]">Bulan Ini</option>
                <option value="Tahun Ini" className="bg-[#020617]">Tahun Ini</option>
              </select>
            </div>
            
            <button 
              onClick={() => alert("Mengunduh laporan keuangan (PDF/CSV)...")}
              className="bg-gradient-to-r from-[#00aa66] to-[#00ff99] text-black font-black text-xs px-5 py-3 rounded-xl flex items-center gap-2 uppercase tracking-wider shadow-lg hover:brightness-110 transition-all cursor-pointer w-full sm:w-auto justify-center"
            >
              <FaDownload /> Export Report
            </button>
          </div>
        </section>

        {/* FINANCIAL SUMMARY CARDS */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          
          {/* Card 1: Total Pendapatan */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-gradient-to-b from-[#0b1329] to-[#070a13] p-6 rounded-[2rem] border-2 border-[#00aa66]/30 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ff99]/5 rounded-bl-full pointer-events-none" />
            <div className="w-12 h-12 bg-[#00ff99]/10 text-[#00ff99] rounded-2xl flex items-center justify-center text-xl mb-4 border border-[#00ff99]/20">
              <FaWallet />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Pendapatan</p>
            <h3 className="text-2xl md:text-3xl font-black text-white mt-1">
              Rp {financialSummary.totalRevenue.toLocaleString("id-ID")}
            </h3>
            <span className="text-[10px] bg-[#00ff99]/10 text-[#00ff99] border border-[#00ff99]/20 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit mt-4">
              <FaArrowUp /> {financialSummary.growth}
            </span>
          </motion.div>

          {/* Card 2: Pendapatan Meja Biliar */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-[#0b1329]/60 p-6 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden"
          >
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center text-xl mb-4 border border-blue-500/20">
              <FaGamepad />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sewa Meja (Billing)</p>
            <h3 className="text-2xl font-black text-white mt-1">
              Rp {financialSummary.billiardRevenue.toLocaleString("id-ID")}
            </h3>
            
            {/* Progress Bar Persentase Kontribusi */}
            <div className="mt-5">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-1.5">
                <span>Kontribusi Finansial</span>
                <span className="text-blue-400">69%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "69%" }} />
              </div>
            </div>
          </motion.div>

          {/* Card 3: Pendapatan Cafe / F&B */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-[#0b1329]/60 p-6 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden sm:col-span-2 lg:col-span-1"
          >
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center text-xl mb-4 border border-amber-500/20">
              <FaUtensils />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Penjualan F&B</p>
            <h3 className="text-2xl font-black text-white mt-1">
              Rp {financialSummary.fnbRevenue.toLocaleString("id-ID")}
            </h3>
            
            {/* Progress Bar Persentase Kontribusi */}
            <div className="mt-5">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-1.5">
                <span>Kontribusi Finansial</span>
                <span className="text-amber-500">31%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "31%" }} />
              </div>
            </div>
          </motion.div>

        </section>

        {/* DETAIL TRANSAKSI TABEL */}
        <section className="bg-[#0b1329]/40 border border-slate-800/80 rounded-[2.5rem] p-6 md:p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-900 text-slate-400 border border-slate-800 rounded-xl flex items-center justify-center text-base">
              <FaFileInvoiceDollar />
            </div>
            <div>
              <h3 className="font-black text-base text-white uppercase tracking-tight">Riwayat Transaksi Kasir</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live Ledger Updates</p>
            </div>
          </div>

          {/* TABLE CONTAINER RESPONSIVE */}
          <div className="overflow-x-auto rounded-2xl border border-slate-900">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-900">
                  <th className="py-4 px-5">ID Transaksi</th>
                  <th className="py-4 px-5">Tanggal</th>
                  <th className="py-4 px-5">Detail Pembelian</th>
                  <th className="py-4 px-5">Kategori</th>
                  <th className="py-4 px-5 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-xs">
                {transactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-4 px-5 font-mono text-slate-400 font-bold">{tx.id}</td>
                    <td className="py-4 px-5 text-slate-400">{tx.date}</td>
                    <td className="py-4 px-5 font-black text-white">{tx.item}</td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wide ${
                        tx.category === "Billiard" 
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/10" 
                          : tx.category === "F&B"
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/10"
                          : "bg-purple-500/10 text-purple-400 border border-purple-500/10"
                      }`}>
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right font-black text-[#00ff99]">
                      Rp {tx.amount.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
};

export default LaporanKeuangan;