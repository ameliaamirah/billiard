import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FaUtensils, FaBoxes, FaExclamationTriangle, FaPlus, 
  FaEdit, FaTrashAlt, FaSave, FaTimes 
} from "react-icons/fa";

const InventoryPage = () => {
  // 1. MOCK DATA STOK BAHAN BAKU (DAPUR)
  const [ingredients, setIngredients] = useState([
    { id: 1, name: "Keju Mozzarella", stock: 15, unit: "Kg", minStock: 5 },
    { id: 2, name: "Sosis Jumbo", stock: 8, unit: "Pack", minStock: 10 }, // Ini akan memicu alert stok menipis
    { id: 3, name: "Daging Ayam Fillet", stock: 22, unit: "Kg", minStock: 8 },
    { id: 4, name: "Sirup Lemon Tea", stock: 3, unit: "Galon", minStock: 2 },
    { id: 5, name: "Tepung Panir (Panko)", stock: 4, unit: "Kg", minStock: 5 }, // Ini juga memicu alert
  ]);

  // 2. MOCK DATA MENU F&B YANG DIJUAL
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: "Corndog Mozzarella", category: "Snack", price: 15000, isAvailable: true },
    { id: 2, name: "Chicken Katsu", category: "Heavy Meal", price: 25000, isAvailable: true },
    { id: 3, name: "Ice Lemon Tea", category: "Drink", price: 10000, isAvailable: true },
  ]);

  // State Kontrol Modal / Form Tambah Item Baru
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "Snack", price: "" });

  // Hitung jumlah bahan baku yang stoknya di bawah batas minimum (minStock)
  const lowStockCount = ingredients.filter(ing => ing.stock <= ing.minStock).length;

  const handleAddMenu = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    
    const itemBaru = {
      id: menuItems.length + 1,
      name: newItem.name,
      category: newItem.category,
      price: parseInt(newItem.price),
      isAvailable: true
    };

    setMenuItems([...menuItems, itemBaru]);
    setNewItem({ name: "", category: "Snack", price: "" });
    setIsModalOpen(false);
    alert(`Menu ${itemBaru.name} berhasil ditambahkan ke daftar jual!`);
  };

  const toggleAvailability = (id) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
    ));
  };

  return (
    <div className="bg-[#020617] min-h-screen pt-28 pb-16 text-slate-100 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-5">
        
        {/* HEADER SECTION */}
        <section className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-800 pb-8">
          <div>
            <h2 className="text-[#00ff99] font-bold tracking-[0.2em] uppercase text-xs mb-2">Kitchen & Stock Control</h2>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              <FaBoxes className="text-white" /> F&B <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff99] to-[#00aa66]">Inventory</span>
            </h1>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-[#00aa66] to-[#00ff99] text-black font-black text-xs px-5 py-3.5 rounded-xl flex items-center gap-2 uppercase tracking-wider shadow-lg hover:brightness-110 transition-all cursor-pointer w-full sm:w-auto justify-center"
          >
            <FaPlus /> Tambah Menu Baru
          </button>
        </section>

        {/* SUMMARY CARDS & ALERT AREA */}
        <section className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#0b1329]/60 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center text-xl border border-blue-500/20">
              <FaUtensils />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Aktif Menu Jual</p>
              <h3 className="text-2xl font-black text-white">{menuItems.length} Produk</h3>
            </div>
          </div>

          <div className="bg-[#0b1329]/60 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center text-xl border border-emerald-500/20">
              <FaBoxes />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Item Bahan Baku</p>
              <h3 className="text-2xl font-black text-white">{ingredients.length} Jenis</h3>
            </div>
          </div>

          {/* Card Warning Stok Menipis */}
          <div className={`p-6 rounded-2xl border flex items-center gap-4 transition-all ${
            lowStockCount > 0 
              ? "bg-rose-950/20 border-rose-900/50 text-rose-400 animate-pulse" 
              : "bg-[#0b1329]/60 border-slate-800 text-slate-400"
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border ${
              lowStockCount > 0 ? "bg-rose-500/20 border-rose-500/30 text-rose-400" : "bg-slate-900 border-slate-800"
            }`}>
              <FaExclamationTriangle />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Peringatan Kritis</p>
              <h3 className="text-2xl font-black text-white">{lowStockCount} Bahan Menipis</h3>
            </div>
          </div>
        </section>

        {/* UTAMA: GRID DATA INDEKS (BAHAN BAKU VS DAFTAR JUAL) */}
        <section className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* KIRI: MONITORING BAHAN KUE & SNACK (5 KOLOM) */}
          <div className="lg:col-span-5 bg-[#0b1329]/40 border border-slate-800 p-6 rounded-[2rem]">
            <h3 className="font-black text-sm text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-3 bg-blue-500 rounded-full" /> Sisa Stok Gudang Dapur
            </h3>
            <div className="space-y-3">
              {ingredients.map((ing) => {
                const isLow = ing.stock <= ing.minStock;
                return (
                  <div key={ing.id} className={`p-4 rounded-xl border flex justify-between items-center ${
                    isLow ? "bg-rose-950/10 border-rose-900/30" : "bg-slate-950/40 border-slate-900"
                  }`}>
                    <div>
                      <h4 className="text-xs font-black text-white">{ing.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Batas Min: {ing.minStock} {ing.unit}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-mono font-bold ${isLow ? "text-rose-400" : "text-[#00ff99]"}`}>
                        {ing.stock} {ing.unit}
                      </span>
                      {isLow && <span className="block text-[8px] font-black uppercase text-rose-500 tracking-tight mt-0.5">Belanja Lagi!</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* KANAN: MANAJEMEN MENU JUALAN F&B (7 KOLOM) */}
          <div className="lg:col-span-7 bg-[#0b1329]/40 border border-slate-800 p-6 rounded-[2rem]">
            <h3 className="font-black text-sm text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-3 bg-[#00ff99] rounded-full" /> Katalog Menu Terintegrasi Kasir
            </h3>
            
            <div className="overflow-x-auto rounded-xl border border-slate-900">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-900">
                    <th className="py-3 px-4">Nama Menu</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Harga Jual</th>
                    <th className="py-3 px-4 text-center">Status Jual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60 text-xs">
                  {menuItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/30">
                      <td className="py-3.5 px-4 font-black text-white">{item.name}</td>
                      <td className="py-3.5 px-4 text-slate-400">{item.category}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#00ff99]">Rp {item.price.toLocaleString("id-ID")}</td>
                      <td className="py-3.5 px-4 text-center">
                        <button 
                          onClick={() => toggleAvailability(item.id)}
                          className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            item.isAvailable 
                              ? "bg-[#00ff99]/10 text-[#00ff99] border border-[#00ff99]/20" 
                              : "bg-slate-800 text-slate-500 border border-slate-700/50"
                          }`}
                        >
                          {item.isAvailable ? "Ready" : "Habis"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* MODAL / POPUP: FORM TAMBAH MENU BARU */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0b1329] border border-slate-800 rounded-[2rem] p-8 max-w-md w-full relative"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors cursor-pointer">
                <FaTimes size={16} />
              </button>
              
              <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tight">Tambah Menu Jual</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-6">Royal Cue Culinary Asset</p>

              <form onSubmit={handleAddMenu} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Nama Makanan/Minuman</label>
                  <input type="text" required placeholder="Contoh: French Fries" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00ff99] transition-colors" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Kategori</label>
                  <select value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00ff99] transition-colors">
                    <option value="Snack">Snack / Camilan</option>
                    <option value="Heavy Meal">Makanan Berat</option>
                    <option value="Drink">Minuman</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Harga Rupiah (Rp)</label>
                  <input type="number" required placeholder="Contoh: 18000" value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-[#00ff99] transition-colors" />
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-[#00aa66] to-[#00ff99] text-black font-black text-xs py-3.5 rounded-xl uppercase tracking-widest mt-2 cursor-pointer shadow-lg hover:brightness-110 transition-all">
                  Simpan Menu
                </button>
              </form>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InventoryPage;