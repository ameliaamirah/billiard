import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCrown, 
  faUsers, 
  faClock, 
  faCheckCircle, 
  faTimesCircle, 
  faSignOutAlt, 
  faCalendarAlt, 
  faChartLine,
  faMoneyBillWave,
  faClipboardList
} from "@fortawesome/free-solid-svg-icons";

export default function AdminDashboard() {

  const statistik = {
    totalReservasi: 124,
    reservasiHariIni: 18,
    totalMember: 92,
    pendapatanHariIni: "Rp 2.450.000",
  };

  const dataReservasi = [
    { id: "RC-928172", pelanggan: "Anggy Mutydinata", meja: "VIP 1", status: "Disetujui", jam: "19:00" },
    { id: "RC-882716", pelanggan: "Ahmad Rivaldi", meja: "Meja 3", status: "Pending", jam: "20:00" },
    { id: "RC-221817", pelanggan: "Siska Putri", meja: "VIP 2", status: "Ditolak", jam: "21:00" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#020a05] text-white flex">

      {/* SIDEBAR */}
      <aside className="w-[280px] bg-slate-950 border-r border-slate-800 p-6 hidden lg:flex flex-col justify-between fixed h-screen">
        <div>
          {/* LOGO */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
            <div className="w-12 h-12 rounded-xl bg-[#00ff99]/10 border border-[#00ff99]/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faCrown} className="text-[#00ff99] text-xl" />
            </div>
            <div>
              <h1 className="font-black text-lg">Royal Cue</h1>
              <p className="text-xs text-slate-400 uppercase tracking-widest">Admin System</p>
            </div>
          </div>

          {/* MENU */}
          <div className="mt-8 space-y-3">
            <div className="bg-[#00ff99]/10 border border-[#00ff99]/20 text-[#00ff99] px-4 py-3 rounded-xl font-bold">
              Dashboard
            </div>
            <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl font-bold text-slate-300">
              Reservasi
            </div>
            <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl font-bold text-slate-300">
              Member
            </div>
          </div>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 py-4 rounded-xl font-black transition-all"
        >
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 lg:ml-[280px] p-6 lg:p-10">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div>
            <p className="text-[#00ff99] text-xs font-black uppercase tracking-[4px] mb-2">Royal Cue Studio</p>
            <h1 className="text-3xl lg:text-5xl font-black">Dashboard <span className="text-[#00ff99]">Admin</span></h1>
          </div>
          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-5 py-4 rounded-2xl">
            <div className="w-3 h-3 bg-[#00ff99] rounded-full animate-pulse" />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">System Status</p>
              <p className="text-sm font-black text-[#00ff99]">Server Connected</p>
            </div>
          </div>
        </div>

        {/* CARD STATISTIK */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Reservasi", val: statistik.totalReservasi, icon: faClipboardList, color: "text-white" },
            { label: "Reservasi Hari Ini", val: statistik.reservasiHariIni, icon: faCalendarAlt, color: "text-blue-400" },
            { label: "Total Member", val: statistik.totalMember, icon: faUsers, color: "text-purple-400" },
            { label: "Pendapatan", val: statistik.pendapatanHariIni, icon: faMoneyBillWave, color: "text-[#00ff99]" },
          ].map((item, i) => (
            <div key={i} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-2">{item.label}</p>
                <h2 className={`text-2xl xl:text-4xl font-black ${item.color}`}>{item.val}</h2>
              </div>
              <FontAwesomeIcon icon={item.icon} className="text-slate-700 text-3xl" />
            </div>
          ))}
        </div>

        {/* TABLE */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-black">Data Reservasi</h2>
          </div>
          <table className="w-full">
            <thead className="bg-slate-900 text-left text-slate-400 text-xs uppercase">
              <tr>
                <th className="p-5">ID</th>
                <th className="p-5">Pelanggan</th>
                <th className="p-5">Meja</th>
                <th className="p-5">Jam</th>
                <th className="p-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {dataReservasi.map((item) => (
                <tr key={item.id} className="border-t border-slate-800">
                  <td className="p-5">{item.id}</td>
                  <td className="p-5">{item.pelanggan}</td>
                  <td className="p-5">{item.meja}</td>
                  <td className="p-5"><FontAwesomeIcon icon={faClock} className="mr-2" />{item.jam}</td>
                  <td className="p-5">
                    {item.status === "Disetujui" && <span className="text-emerald-400 font-bold"><FontAwesomeIcon icon={faCheckCircle} className="mr-2"/>Disetujui</span>}
                    {item.status === "Pending" && <span className="text-amber-400 font-bold"><FontAwesomeIcon icon={faClock} className="mr-2"/>Pending</span>}
                    {item.status === "Ditolak" && <span className="text-red-400 font-bold"><FontAwesomeIcon icon={faTimesCircle} className="mr-2"/>Ditolak</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}