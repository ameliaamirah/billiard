// FandBModal.jsx
import { useState } from "react";
import { FaUtensils, FaPlus, FaMinus, FaTrash } from "react-icons/fa";

// Data menu tiruan (mock data) untuk Kantin Royal Cue
const MENU_KANTIN = [
  { id: "m1", nama: "Air Mineral Cold", harga: 5000, kategori: "Minuman" },
  { id: "m2", nama: "Kopi Hitam / Es Kopi", harga: 10000, kategori: "Minuman" },
  { id: "m3", nama: "Mie Instan Goreng/Rebus", harga: 12000, kategori: "Makanan" },
  { id: "m4", nama: "Kentang Goreng (French Fries)", harga: 15000, kategori: "Makanan" },
  { id: "m5", nama: "Rokok Filter (Per Bungkus)", harga: 35000, kategori: "Rokok" },
];

export default function FandBModal({ isOpen, onClose, mejaId, nomorMeja, pesananSaatIni, onSave }) {
  // State untuk menampung item belanjaan sementara di modal
  const [cart, setCart] = useState(pesananSaatIni || []);

  if (!isOpen) return null;

  const tambahKeKeranjang = (item) => {
    const ada = cart.find((x) => x.id === item.id);
    if (ada) {
      setCart(cart.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x)));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const kurangiDariKeranjang = (itemId) => {
    const target = cart.find((x) => x.id === itemId);
    if (!target) return;
    if (target.qty === 1) {
      setCart(cart.filter((x) => x.id !== itemId));
    } else {
      setCart(cart.map((x) => (x.id === itemId ? { ...x, qty: x.qty - 1 } : x)));
    }
  };

  const hapusItem = (itemId) => {
    setCart(cart.filter((x) => x.id !== itemId));
  };

  const hitungTotalCart = () => cart.reduce((acc, curr) => acc + curr.harga * curr.qty, 0);

  const handleSimpan = () => {
    onSave(mejaId, cart);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header Modal */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaUtensils className="text-[#00ff99]" />
            <h3 className="text-white font-bold text-sm md:text-base">
              Order Kantin & F&B — <span className="text-[#00ff99]">{nomorMeja}</span>
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer">✕</button>
        </div>

        {/* Isi Konten Utama Modal (Responsive Split Screen) */}
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          
          {/* Sisi Kiri: Daftar Menu */}
          <div className="w-full md:w-3/5 p-4 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-800 space-y-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Daftar Menu Tersedia</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MENU_KANTIN.map((menu) => (
                <div 
                  key={menu.id} 
                  onClick={() => tambahKeKeranjang(menu)}
                  className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex flex-col justify-between hover:border-[#00ff99]/40 cursor-pointer transition-all active:scale-98"
                >
                  <div>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-medium">{menu.kategori}</span>
                    <h4 className="text-white font-bold text-sm mt-1">{menu.nama}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#00ff99] mt-2">Rp {menu.harga.toLocaleString("id-ID")}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sisi Kanan: Ringkasan Keranjang Pesanan Meja */}
          <div className="w-full md:w-2/5 bg-slate-950/40 p-4 flex flex-col justify-between overflow-hidden">
            <div className="flex flex-col overflow-hidden h-full">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Pesanan Meja Ini</span>
              
              {cart.length === 0 ? (
                <div className="flex-grow flex items-center justify-center text-xs text-slate-600 font-medium italic">Belum ada pesanan F&B</div>
              ) : (
                <div className="flex-grow overflow-y-auto space-y-2 pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-slate-950 border border-slate-800/60 p-2.5 rounded-xl flex items-center justify-between">
                      <div className="max-w-[55%]">
                        <h5 className="text-white font-semibold text-xs truncate">{item.nama}</h5>
                        <span className="text-[10px] font-mono text-slate-500">Rp {(item.harga * item.qty).toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => kurangiDariKeranjang(item.id)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] cursor-pointer"><FaMinus /></button>
                        <span className="text-white font-mono text-xs font-bold w-4 text-center">{item.qty}</span>
                        <button type="button" onClick={() => tambahKeKeranjang(item)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] cursor-pointer"><FaPlus /></button>
                        <button type="button" onClick={() => hapusItem(item.id)} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg text-[10px] ml-1 cursor-pointer"><FaTrash /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total Akhir & Tombol Simpan */}
            <div className="pt-4 border-t border-slate-800 mt-3 space-y-3">
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-black text-slate-500 uppercase">Subtotal F&B</span>
                <span className="text-sm font-black text-[#00ff99]">Rp {hitungTotalCart().toLocaleString("id-ID")}</span>
              </div>
              <button 
                onClick={handleSimpan}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                Konfirmasi & Masukkan Bill Meja
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}