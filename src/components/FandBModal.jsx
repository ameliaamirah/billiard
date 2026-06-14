// src/components/FandBModal.jsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTimes, faPlus, faMinus, faShoppingCart, faTrash, 
  faUtensils, faCoffee, faBeer, faSmoking, faAppleAlt,
  faSearch, faSpinner, faImage, faChevronLeft
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../supabaseClient";

export default function FandBModal({ isOpen, onClose, mejaId, nomorMeja, pesananSaatIni, onSave }) {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [cart, setCart] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errorImages, setErrorImages] = useState({});
  const [showCart, setShowCart] = useState(false); // Untuk mobile: toggle tampilan keranjang

  const kategoriList = ["Semua", "Makanan", "Minuman", "Rokok", "Snack"];

  const getKategoriEmoji = (kategori) => {
    switch (kategori) {
      case "Makanan": return "🍽️";
      case "Minuman": return "🥤";
      case "Rokok": return "🚬";
      case "Snack": return "🍿";
      default: return "🍽️";
    }
  };

  const getKategoriIcon = (kategori) => {
    switch (kategori) {
      case "Makanan": return faUtensils;
      case "Minuman": return faCoffee;
      case "Rokok": return faSmoking;
      case "Snack": return faAppleAlt;
      default: return faUtensils;
    }
  };

  // Ambil data menu dari database
  const fetchMenu = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("menu_fb")
        .select("id, nama, harga, kategori, stok, is_active, gambar_url, gambar_base64")
        .eq("is_active", true)
        .order("kategori", { ascending: true })
        .order("nama", { ascending: true });

      if (error) throw error;
      setMenu(data || []);
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMenu();
      if (pesananSaatIni && pesananSaatIni.length > 0) {
        setCart(pesananSaatIni.map(item => ({ ...item, quantity: item.qty || 1 })));
      } else {
        setCart([]);
      }
      setShowCart(false); // Reset ke tampilan menu saat modal dibuka
    }
  }, [isOpen, pesananSaatIni]);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { 
        id: item.id, 
        nama: item.nama, 
        harga: item.harga, 
        kategori: item.kategori,
        gambar_url: item.gambar_url,
        gambar_base64: item.gambar_base64,
        quantity: 1 
      }];
    });
    // Optional: feedback visual
  };

  const updateQuantity = (itemId, delta) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing) {
        const newQuantity = existing.quantity + delta;
        if (newQuantity <= 0) {
          return prev.filter(i => i.id !== itemId);
        }
        return prev.map(i => 
          i.id === itemId ? { ...i, quantity: newQuantity } : i
        );
      }
      return prev;
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const getTotalHarga = () => {
    return cart.reduce((total, item) => total + (item.harga * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleSave = async () => {
    if (cart.length === 0) {
      alert("Tidak ada pesanan!");
      return;
    }

    setSaving(true);
    const pesananToSave = cart.map(item => ({
      id: item.id,
      nama: item.nama,
      harga: item.harga,
      qty: item.quantity
    }));

    const success = await onSave(mejaId, pesananToSave);
    setSaving(false);
    
    if (success) {
      onClose();
    }
  };

  const filteredMenu = menu.filter(item => {
    const matchKategori = filterKategori === "Semua" || item.kategori === filterKategori;
    const matchSearch = item.nama.toLowerCase().includes(search.toLowerCase());
    return matchKategori && matchSearch;
  });

  // Komponen Card Menu dengan GAMBAR
  const MenuItemCard = ({ item }) => {
    const [imgError, setImgError] = useState(false);
    const imageSource = item.gambar_url || item.gambar_base64 || null;
    
    return (
      <div 
        className="bg-slate-800/50 border border-slate-700 rounded-xl p-2 sm:p-3 hover:border-emerald-500/50 transition-all cursor-pointer active:scale-95 transform"
        onClick={() => addToCart(item)}
      >
        {/* GAMBAR MENU */}
        <div className="h-20 sm:h-24 bg-slate-700 rounded-lg mb-2 overflow-hidden relative">
          {imageSource && !imgError ? (
            <img 
              src={imageSource} 
              alt={item.nama} 
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => {
                console.error(`Gambar gagal dimuat untuk: ${item.nama}`);
                setImgError(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-700/50">
              <span className="text-2xl sm:text-3xl">{getKategoriEmoji(item.kategori)}</span>
              <span className="text-[7px] sm:text-[8px] text-slate-500 mt-1">No Image</span>
            </div>
          )}
        </div>
        
        <h4 className="font-bold text-white text-xs sm:text-sm truncate">{item.nama}</h4>
        <p className="text-emerald-400 font-bold text-[10px] sm:text-xs">
          Rp {item.harga.toLocaleString("id-ID")}
        </p>
        <button className="w-full mt-2 py-1.5 sm:py-2 bg-emerald-600/80 hover:bg-emerald-500 rounded-lg text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center gap-1 transition-all min-h-[32px]">
          <FontAwesomeIcon icon={faPlus} size={10} /> 
          <span className="hidden xs:inline">Tambah</span>
        </button>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl w-full max-w-[95%] sm:max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header - Responsive */}
        <div className="p-3 sm:p-4 md:p-5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
              <FontAwesomeIcon icon={faShoppingCart} className="text-emerald-400" />
              <span className="hidden xs:inline">Order Makanan & Minuman</span>
              <span className="xs:hidden">Pesan Menu</span>
            </h3>
            <p className="text-slate-400 text-[10px] sm:text-xs md:text-sm">
              Meja: <span className="text-emerald-400 font-bold">{nomorMeja}</span>
            </p>
          </div>
          
          {/* Mobile: Toggle Cart Button */}
          <div className="flex items-center gap-2 sm:hidden">
            {cart.length > 0 && (
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative bg-emerald-600/20 px-2.5 py-1.5 rounded-lg"
              >
                <FontAwesomeIcon icon={faShoppingCart} className="text-emerald-400 text-sm" />
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-black text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2 -m-2 min-w-[40px] min-h-[40px] flex items-center justify-center">
              <FontAwesomeIcon icon={faTimes} size={16} />
            </button>
          </div>
          
          {/* Desktop Close Button */}
          <button onClick={onClose} className="hidden sm:block text-slate-400 hover:text-white cursor-pointer p-2">
            <FontAwesomeIcon icon={faTimes} size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row h-full">
          
          {/* SISI KIRI: DAFTAR MENU - Show/hide based on mobile cart toggle */}
          <div className={`
            ${showCart ? 'hidden lg:block' : 'block'}
            flex-1 p-3 sm:p-4 md:p-5 border-r border-slate-800 overflow-y-auto
            max-h-[60vh] sm:max-h-[70vh]
          `}>
            {/* Search Bar */}
            <div className="mb-3 sm:mb-4">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs sm:text-sm" />
                <input
                  type="text"
                  placeholder="Cari menu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 sm:py-2.5 pl-9 sm:pl-10 pr-4 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Filter Kategori - Horizontal Scroll */}
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-3 sm:pb-4 mb-3 sm:mb-4 scrollbar-thin">
              {kategoriList.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterKategori(cat)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-bold whitespace-nowrap transition-all min-h-[32px] ${
                    filterKategori === cat 
                      ? "bg-emerald-500 text-black" 
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid Menu - Responsive */}
            {loading ? (
              <div className="flex justify-center py-10 sm:py-20">
                <FontAwesomeIcon icon={faSpinner} spin className="text-2xl sm:text-3xl text-emerald-400" />
              </div>
            ) : (
              <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                {filteredMenu.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {filteredMenu.length === 0 && !loading && (
              <div className="text-center text-slate-500 py-10 sm:py-20">
                <FontAwesomeIcon icon={faUtensils} className="text-3xl sm:text-4xl mb-2 opacity-30" />
                <p className="text-xs sm:text-sm">Tidak ada menu yang tersedia</p>
              </div>
            )}
          </div>

          {/* SISI KANAN: KERANJANG - Mobile toggle */}
          <div className={`
            ${showCart ? 'block' : 'hidden lg:block'}
            w-full lg:w-80 xl:w-96 bg-slate-950/50 p-3 sm:p-4 md:p-5 flex flex-col
            ${showCart ? 'h-full' : ''}
          `}>
            {/* Mobile: Back to Menu Button */}
            <div className="flex items-center justify-between mb-3 lg:hidden">
              <button
                onClick={() => setShowCart(false)}
                className="flex items-center gap-1 text-emerald-400 text-sm"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
                Kembali ke Menu
              </button>
              <span className="text-slate-400 text-xs">Keranjang</span>
            </div>

            <h4 className="text-white font-bold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
              <FontAwesomeIcon icon={faShoppingCart} className="text-emerald-400" />
              <span>Pesanan</span>
              {cart.length > 0 && (
                <span className="bg-emerald-500 text-black text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                  {getTotalItems()} item
                </span>
              )}
            </h4>

            {/* Cart Items - Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px] sm:max-h-[400px]">
              {cart.length === 0 ? (
                <div className="text-center text-slate-500 py-10">
                  <FontAwesomeIcon icon={faShoppingCart} className="text-3xl opacity-30 mb-2" />
                  <p className="text-xs">Keranjang kosong</p>
                  <p className="text-[10px] mt-1">Pilih menu dari sebelah kiri</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-slate-800/50 rounded-xl p-2 sm:p-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-xs sm:text-sm truncate">{item.nama}</p>
                        <p className="text-emerald-400 text-[10px] sm:text-xs">Rp {item.harga.toLocaleString("id-ID")}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-300 p-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
                      >
                        <FontAwesomeIcon icon={faTrash} size={10} className="sm:text-xs" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-600 transition-all min-w-[32px] min-h-[32px]"
                        >
                          <FontAwesomeIcon icon={faMinus} size={10} />
                        </button>
                        <span className="text-white text-xs sm:text-sm w-6 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-600 transition-all min-w-[32px] min-h-[32px]"
                        >
                          <FontAwesomeIcon icon={faPlus} size={10} />
                        </button>
                      </div>
                      <p className="text-white font-bold text-xs sm:text-sm">
                        Rp {(item.harga * item.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total and Actions */}
            <div className="border-t border-slate-800 pt-3 sm:pt-4 mt-3 sm:mt-4">
              <div className="flex justify-between mb-3 sm:mb-4">
                <span className="text-slate-400 text-xs sm:text-sm">Total:</span>
                <span className="text-emerald-400 font-bold text-base sm:text-xl">
                  Rp {getTotalHarga().toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 sm:py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-bold text-[11px] sm:text-sm transition-all min-h-[40px]"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || cart.length === 0}
                  className="flex-1 py-2 sm:py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold text-[11px] sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[40px]"
                >
                  {saving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faShoppingCart} />}
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}