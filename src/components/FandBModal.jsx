// src/components/FandBModal.jsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTimes, faPlus, faMinus, faShoppingCart, faTrash, 
  faUtensils, faCoffee, faBeer, faSmoking, faAppleAlt,
  faSearch, faSpinner, faImage
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

  // Ambil data menu dari database (terhubung dengan Menu Management)
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
      // Load pesanan yang sudah ada ke cart
      if (pesananSaatIni && pesananSaatIni.length > 0) {
        setCart(pesananSaatIni.map(item => ({ ...item, quantity: item.qty || 1 })));
      } else {
        setCart([]);
      }
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
    // Prioritas: gambar_url > gambar_base64
    const imageSource = item.gambar_url || item.gambar_base64 || null;
    
    return (
      <div 
        className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 hover:border-emerald-500/50 transition-all cursor-pointer"
        onClick={() => addToCart(item)}
      >
        {/* GAMBAR MENU - DIPERBAIKI */}
        <div className="h-24 bg-slate-700 rounded-lg mb-2 overflow-hidden relative">
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
              <span className="text-3xl">{getKategoriEmoji(item.kategori)}</span>
              <span className="text-[8px] text-slate-500 mt-1">No Image</span>
            </div>
          )}
        </div>
        
        <h4 className="font-bold text-white text-sm truncate">{item.nama}</h4>
        <p className="text-emerald-400 font-bold text-xs">Rp {item.harga.toLocaleString("id-ID")}</p>
        <button className="w-full mt-2 py-1.5 bg-emerald-600/80 hover:bg-emerald-500 rounded-lg text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-all">
          <FontAwesomeIcon icon={faPlus} size={10} /> Tambah
        </button>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <FontAwesomeIcon icon={faShoppingCart} className="text-emerald-400" />
              Order Makanan & Minuman
            </h3>
            <p className="text-slate-400 text-sm">Meja: <span className="text-emerald-400 font-bold">{nomorMeja}</span></p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <FontAwesomeIcon icon={faTimes} size={20} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-full">
          
          {/* SISI KIRI: DAFTAR MENU */}
          <div className="flex-1 p-5 border-r border-slate-800 overflow-y-auto max-h-[70vh]">
            <div className="mb-4">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari menu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Filter Kategori */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
              {kategoriList.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterKategori(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    filterKategori === cat 
                      ? "bg-emerald-500 text-black" 
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid Menu */}
            {loading ? (
              <div className="flex justify-center py-20">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-emerald-400" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredMenu.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {filteredMenu.length === 0 && !loading && (
              <div className="text-center text-slate-500 py-20">
                <FontAwesomeIcon icon={faUtensils} className="text-4xl mb-2 opacity-30" />
                <p>Tidak ada menu yang tersedia</p>
              </div>
            )}
          </div>

          {/* SISI KANAN: KERANJANG */}
          <div className="w-full lg:w-96 bg-slate-950/50 p-5 flex flex-col">
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faShoppingCart} className="text-emerald-400" />
              Pesanan
              {cart.length > 0 && (
                <span className="bg-emerald-500 text-black text-xs px-2 py-0.5 rounded-full">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} item
                </span>
              )}
            </h4>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[400px]">
              {cart.length === 0 ? (
                <p className="text-center text-slate-500 py-10">Keranjang kosong</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-slate-800/50 rounded-xl p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">{item.nama}</p>
                        <p className="text-emerald-400 text-xs">Rp {item.harga.toLocaleString("id-ID")}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FontAwesomeIcon icon={faTrash} size={12} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-600"
                        >
                          <FontAwesomeIcon icon={faMinus} size={10} />
                        </button>
                        <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-600"
                        >
                          <FontAwesomeIcon icon={faPlus} size={10} />
                        </button>
                      </div>
                      <p className="text-white font-bold text-sm">
                        Rp {(item.harga * item.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-800 pt-4 mt-4">
              <div className="flex justify-between mb-4">
                <span className="text-slate-400">Total:</span>
                <span className="text-emerald-400 font-bold text-xl">
                  Rp {getTotalHarga().toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-bold text-sm transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || cart.length === 0}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faShoppingCart} />}
                  {saving ? "Menyimpan..." : "Simpan Pesanan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}