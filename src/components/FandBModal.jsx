import { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUtensils, faPlus, faMinus, faTrash, faTimes, faSearch, faStickyNote, faSave } from "@fortawesome/free-solid-svg-icons";

const MENU_KANTIN = [
  { id: "m1", nama: "Air Mineral Cold", harga: 5000, kategori: "Minuman" },
  { id: "m2", nama: "Kopi Hitam", harga: 10000, kategori: "Minuman" },
  { id: "m3", nama: "Es Kopi", harga: 10000, kategori: "Minuman" },
  { id: "m4", nama: "Mie Instan Goreng", harga: 12000, kategori: "Makanan" },
  { id: "m5", nama: "Mie Instan Rebus", harga: 12000, kategori: "Makanan" },
  { id: "m6", nama: "Kentang Goreng (French Fries)", harga: 15000, kategori: "Makanan" },
  { id: "m7", nama: "Rokok Filter", harga: 35000, kategori: "Rokok" },
  { id: "m8", nama: "Es Teh Manis", harga: 6000, kategori: "Minuman" },
  { id: "m9", nama: "Es Jeruk", harga: 8000, kategori: "Minuman" },
  { id: "m10", nama: "Nasi Goreng", harga: 18000, kategori: "Makanan" },
];

export default function FandBModal({ isOpen, onClose, mejaId, nomorMeja, pesananSaatIni, onSave }) {
  // SEMUA HOOKS HARUS DIPANGGIL DI SINI, SEBELUM conditional return
  const [cart, setCart] = useState([]);
  const [kategori, setKategori] = useState("Semua");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // useEffect untuk load pesanan yang sudah ada
  useEffect(() => {
    if (isOpen && pesananSaatIni && pesananSaatIni.length > 0) {
      setCart(pesananSaatIni);
    } else if (isOpen) {
      setCart([]);
    }
  }, [isOpen, pesananSaatIni]);

  // useMemo untuk filter menu - PASTIKAN DIPANGGIL SETELAH SEMUA useState
  const menuFiltered = useMemo(() => {
    return MENU_KANTIN.filter((m) => {
      const matchKategori = kategori === "Semua" || m.kategori === kategori;
      const matchSearch = m.nama.toLowerCase().includes(search.toLowerCase());
      return matchKategori && matchSearch;
    });
  }, [kategori, search]);

  // HARUS DITARUH DI AKHIR, SETELAH SEMUA HOOKS
  if (!isOpen) return null;

  // Fungsi tambah ke keranjang
  const tambahKeKeranjang = (item) => {
    const ada = cart.find((x) => x.id === item.id);
    if (ada) {
      setCart(cart.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x)));
    } else {
      setCart([...cart, { ...item, qty: 1, catatan: "" }]);
    }
  };

  // Kurangi quantity
  const kurangiQuantity = (itemId) => {
    const item = cart.find(x => x.id === itemId);
    if (item.qty === 1) {
      setCart(cart.filter(x => x.id !== itemId));
    } else {
      setCart(cart.map((x) => (x.id === itemId ? { ...x, qty: x.qty - 1 } : x)));
    }
  };

  // Hapus item dari keranjang
  const hapusItem = (itemId) => {
    setCart(cart.filter(x => x.id !== itemId));
  };

  // Update catatan
  const updateCatatan = (itemId, note) => {
    setCart(cart.map((x) => (x.id === itemId ? { ...x, catatan: note } : x)));
  };

  // Hitung total
  const hitungTotalCart = () => cart.reduce((acc, curr) => acc + curr.harga * curr.qty, 0);

  // Simpan pesanan
  const handleSave = async () => {
    if (onSave) {
      setLoading(true);
      await onSave(mejaId, cart);
      setLoading(false);
      onClose();
    } else {
      console.error("onSave function not provided");
      alert("Terjadi kesalahan: Fungsi simpan tidak tersedia");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm">
            <FontAwesomeIcon icon={faUtensils} className="text-[#00ff99] mr-2" /> 
            Order Makanan & Minuman — {nomorMeja || "Meja"}
          </h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white cursor-pointer transition-all"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          
          {/* Kiri: Daftar Menu & Filter */}
          <div className="w-full md:w-3/5 p-4 overflow-y-auto border-r border-slate-800">
            {/* Search Bar */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-grow">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3.5 text-slate-600 text-xs" />
                <input 
                  placeholder="Cari menu..." 
                  className="w-full bg-slate-950 border border-slate-800 py-2.5 pl-9 rounded-lg text-xs text-white focus:outline-none focus:border-[#00ff99] transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            {/* Kategori Filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {["Semua", "Makanan", "Minuman", "Rokok"].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setKategori(cat)} 
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                    kategori === cat 
                      ? "bg-[#00ff99] text-black" 
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Daftar Menu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {menuFiltered.length === 0 ? (
                <div className="col-span-full text-center text-slate-500 py-10">
                  <FontAwesomeIcon icon={faUtensils} className="text-3xl mb-2 opacity-30" />
                  <p className="text-xs">Menu tidak ditemukan</p>
                </div>
              ) : (
                menuFiltered.map((menu) => (
                  <div 
                    key={menu.id} 
                    onClick={() => tambahKeKeranjang(menu)} 
                    className="bg-slate-950 border border-slate-800 p-3 rounded-xl hover:border-[#00ff99]/40 hover:bg-slate-900 cursor-pointer transition-all"
                  >
                    <h4 className="text-white font-bold text-xs">{menu.nama}</h4>
                    <p className="text-[#00ff99] text-xs font-mono mt-1">Rp {menu.harga.toLocaleString("id-ID")}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Kanan: Keranjang */}
          <div className="w-full md:w-2/5 bg-slate-950/40 p-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                <FontAwesomeIcon icon={faStickyNote} className="mr-1" /> PESANAN
              </h4>
              {cart.length > 0 && (
                <span className="text-[10px] text-emerald-400">{cart.length} item</span>
              )}
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <div className="text-center text-slate-500 py-10">
                  <FontAwesomeIcon icon={faUtensils} className="text-3xl mb-2 opacity-30" />
                  <p className="text-xs">Keranjang kosong</p>
                  <p className="text-[9px] mt-1">Klik menu untuk menambah</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h5 className="text-white text-xs font-bold">{item.nama}</h5>
                        <p className="text-[#00ff99] text-[9px] font-mono mt-0.5">
                          Rp {item.harga.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => kurangiQuantity(item.id)} 
                          className="w-6 h-6 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-[10px] cursor-pointer transition-all"
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                        <span className="text-white text-xs font-bold w-5 text-center">{item.qty}</span>
                        <button 
                          onClick={() => tambahKeKeranjang(item)} 
                          className="w-6 h-6 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-[10px] cursor-pointer transition-all"
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                        <button 
                          onClick={() => hapusItem(item.id)} 
                          className="w-6 h-6 bg-rose-500/20 hover:bg-rose-500/40 rounded-lg text-rose-400 text-[10px] cursor-pointer transition-all"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                    <input 
                      type="text"
                      placeholder="Catatan (misal: kurang gula, pedas)" 
                      className="w-full bg-slate-800 border border-slate-700 p-1.5 rounded-lg text-[9px] text-slate-300 focus:outline-none focus:border-[#00ff99] transition-all"
                      value={item.catatan || ""}
                      onChange={(e) => updateCatatan(item.id, e.target.value)}
                    />
                  </div>
                ))
              )}
            </div>
            
            {/* Footer Keranjang */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex justify-between text-white font-bold mb-4">
                <span className="text-xs uppercase tracking-wider">Subtotal</span>
                <span className="text-base font-black text-emerald-400">
                  Rp {hitungTotalCart().toLocaleString("id-ID")}
                </span>
              </div>
              <button 
                onClick={handleSave} 
                disabled={loading}
                className="w-full py-3 bg-[#00ff99] hover:bg-[#00cc7a] text-black font-black text-xs rounded-xl uppercase transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} /> Simpan Pesanan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}