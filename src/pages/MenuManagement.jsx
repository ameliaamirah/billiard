import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, faEdit, faTrash, faSpinner, faTimes, 
  faSave, faSearch, faCheck, faUpload,
  faUtensils, faCoffee, faBeer, faSmoking, faAppleAlt,
  faCloudUploadAlt, faImage
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../supabaseClient";

export default function MenuManagement() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [form, setForm] = useState({
    nama: "",
    harga: "",
    kategori: "Makanan",
    stok: "",
    deskripsi: "",
    is_active: true,
    gambar_base64: ""
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const kategoriList = ["Semua", "Makanan", "Minuman", "Rokok", "Snack"];

  // Konversi file ke Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Ambil data menu dari Supabase
  const fetchMenu = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("menu_fb")
        .select("*")
        .order("kategori", { ascending: true })
        .order("nama", { ascending: true });
      
      if (error) throw error;
      
      // Format data untuk memastikan gambar_base64 ada
      const formattedData = (data || []).map(item => ({
        ...item,
        gambar_base64: item.gambar_base64 || item.gambar || null
      }));
      
      setMenu(formattedData);
    } catch (error) {
      console.error("Error fetching menu:", error);
      alert("Gagal memuat menu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran file (maks 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 2MB!");
        return;
      }
      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        alert("File harus berupa gambar!");
        return;
      }
      
      setUploading(true);
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
      
      // Konversi ke Base64
      const base64 = await convertToBase64(file);
      setForm({ ...form, gambar_base64: base64 });
      setUploading(false);
    }
  };

  // Simpan menu
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi form
    if (!form.nama.trim()) {
      alert("Nama menu harus diisi!");
      return;
    }
    if (!form.harga || parseInt(form.harga) <= 0) {
      alert("Harga harus diisi dengan angka yang valid!");
      return;
    }
    
    setSaving(true);
    
    try {
      const dataMenu = {
        nama: form.nama.trim(),
        harga: parseInt(form.harga),
        kategori: form.kategori,
        stok: parseInt(form.stok) || 0,
        deskripsi: form.deskripsi || "",
        is_active: form.is_active,
        gambar_base64: form.gambar_base64 || null,
        updated_at: new Date().toISOString()
      };
      
      if (editingItem) {
        // UPDATE menu
        const { error } = await supabase
          .from("menu_fb")
          .update(dataMenu)
          .eq("id", editingItem.id);
        
        if (error) throw error;
        alert("✅ Menu berhasil diupdate!");
      } else {
        // INSERT menu baru
        const { error } = await supabase
          .from("menu_fb")
          .insert([{ ...dataMenu, created_at: new Date().toISOString() }]);
        
        if (error) throw error;
        alert("✅ Menu baru berhasil ditambahkan!");
      }
      
      resetForm();
      await fetchMenu();
      
    } catch (error) {
      console.error("Error saving menu:", error);
      alert("Gagal menyimpan menu: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Hapus menu
  const deleteMenu = async (item) => {
    if (window.confirm(`Hapus menu "${item.nama}"?`)) {
      try {
        const { error } = await supabase
          .from("menu_fb")
          .delete()
          .eq("id", item.id);
        
        if (error) throw error;
        alert("✅ Menu berhasil dihapus!");
        await fetchMenu();
      } catch (error) {
        alert("Gagal menghapus menu: " + error.message);
      }
    }
  };

  // Aktif/Nonaktifkan menu
  const toggleStatus = async (item) => {
    try {
      const { error } = await supabase
        .from("menu_fb")
        .update({ 
          is_active: !item.is_active, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", item.id);
      
      if (error) throw error;
      await fetchMenu();
    } catch (error) {
      alert("Gagal mengubah status: " + error.message);
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      nama: "",
      harga: "",
      kategori: "Makanan",
      stok: "",
      deskripsi: "",
      is_active: true,
      gambar_base64: ""
    });
    setPreviewImage(null);
    setSelectedFile(null);
    setEditingItem(null);
    setModalOpen(false);
  };

  // Edit menu
  const editMenu = (item) => {
    setEditingItem(item);
    setForm({
      nama: item.nama,
      harga: item.harga,
      kategori: item.kategori,
      stok: item.stok || "",
      deskripsi: item.deskripsi || "",
      is_active: item.is_active,
      gambar_base64: item.gambar_base64 || ""
    });
    setPreviewImage(item.gambar_base64);
    setSelectedFile(null);
    setModalOpen(true);
  };

  // Filter menu
  const filteredMenu = menu.filter(item => {
    const matchKategori = filterKategori === "Semua" || item.kategori === filterKategori;
    const matchSearch = item.nama.toLowerCase().includes(search.toLowerCase());
    return matchKategori && matchSearch;
  });

  // Emoji untuk kategori
  const getKategoriEmoji = (kategori) => {
    switch (kategori) {
      case "Makanan": return "🍽️";
      case "Minuman": return "🥤";
      case "Rokok": return "🚬";
      case "Snack": return "🍿";
      default: return "🍽️";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a05] to-[#061010] text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">
              Manajemen <span className="text-[#00ff99]">Menu F&B</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">Kelola menu makanan, minuman, dan rokok</p>
          </div>
          
          <button
            onClick={() => setModalOpen(true)}
            className="bg-[#00aa66] hover:bg-[#00cc7a] px-4 py-2 rounded-xl font-bold text-xs uppercase flex items-center gap-2 cursor-pointer transition-all"
          >
            <FontAwesomeIcon icon={faPlus} /> Tambah Menu
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-[#00ff99]"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {kategoriList.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterKategori(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterKategori === cat 
                    ? "bg-[#00ff99] text-black" 
                    : "bg-slate-900/60 text-slate-400 hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Menu */}
        {loading ? (
          <div className="flex justify-center py-20">
            <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-[#00ff99]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMenu.map((item) => (
              <div key={item.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all">
                {/* Gambar */}
                <div className="h-32 bg-slate-800/50 relative">
                  {item.gambar_base64 ? (
                    <img 
                      src={item.gambar_base64} 
                      alt={item.nama} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Gambar error:", item.nama);
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-4xl">${getKategoriEmoji(item.kategori)}</div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {getKategoriEmoji(item.kategori)}
                    </div>
                  )}
                  {!item.is_active && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full">
                      Nonaktif
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-white text-sm">{item.nama}</h3>
                      <p className="text-[10px] text-slate-500">{item.kategori}</p>
                    </div>
                    <p className="text-[#00ff99] font-black text-sm">Rp {item.harga.toLocaleString("id-ID")}</p>
                  </div>
                  
                  {item.stok !== undefined && (
                    <p className={`text-[10px] ${item.stok < 10 ? "text-red-400" : "text-slate-400"}`}>
                      Stok: {item.stok}
                    </p>
                  )}
                  
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => editMenu(item)}
                      className="flex-1 py-1.5 bg-blue-600/80 hover:bg-blue-500 rounded-lg text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faEdit} size={10} /> Edit
                    </button>
                    <button
                      onClick={() => deleteMenu(item)}
                      className="flex-1 py-1.5 bg-rose-600/80 hover:bg-rose-500 rounded-lg text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faTrash} size={10} /> Hapus
                    </button>
                    <button
                      onClick={() => toggleStatus(item)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        item.is_active 
                          ? "bg-emerald-600/80 hover:bg-emerald-500" 
                          : "bg-slate-700 hover:bg-slate-600"
                      }`}
                    >
                      {item.is_active ? <FontAwesomeIcon icon={faCheck} size={10} /> : "Aktifkan"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredMenu.length === 0 && !loading && (
          <div className="text-center text-slate-500 py-20">
            <FontAwesomeIcon icon={faUtensils} className="text-4xl mb-3 opacity-30" />
            <p>Belum ada menu. Silakan tambah menu baru.</p>
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit Menu */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-5 bg-slate-950 border-b border-slate-800 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                  <FontAwesomeIcon icon={faUtensils} className="text-[#00ff99] mr-2" />
                  {editingItem ? "Edit Menu" : "Tambah Menu Baru"}
                </h3>
                <button onClick={resetForm} className="text-slate-400 hover:text-white cursor-pointer">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Nama Menu */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Nama Menu *</label>
                <input
                  type="text"
                  required
                  value={form.nama}
                  onChange={(e) => setForm({...form, nama: e.target.value})}
                  className="w-full bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-white text-sm focus:outline-none focus:border-[#00ff99] mt-1"
                  placeholder="Contoh: Mie Goreng Special"
                />
              </div>

              {/* Harga & Stok */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Harga (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={form.harga}
                    onChange={(e) => setForm({...form, harga: e.target.value})}
                    className="w-full bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-white text-sm focus:outline-none focus:border-[#00ff99] mt-1"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Stok</label>
                  <input
                    type="number"
                    value={form.stok}
                    onChange={(e) => setForm({...form, stok: e.target.value})}
                    className="w-full bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-white text-sm focus:outline-none focus:border-[#00ff99] mt-1"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Kategori */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Kategori</label>
                <select
                  value={form.kategori}
                  onChange={(e) => setForm({...form, kategori: e.target.value})}
                  className="w-full bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-white text-sm focus:outline-none focus:border-[#00ff99] mt-1 cursor-pointer"
                >
                  <option value="Makanan">🍽️ Makanan</option>
                  <option value="Minuman">🥤 Minuman</option>
                  <option value="Rokok">🚬 Rokok</option>
                  <option value="Snack">🍿 Snack</option>
                </select>
              </div>

              {/* Upload Gambar */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Gambar Menu</label>
                <div className="mt-2">
                  <div 
                    className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center hover:border-[#00ff99] transition-all cursor-pointer"
                    onClick={() => document.getElementById('imageUpload').click()}
                  >
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <FontAwesomeIcon icon={faCloudUploadAlt} className="text-3xl text-slate-500 mb-2" />
                    <p className="text-xs text-slate-400">Klik untuk pilih gambar</p>
                    <p className="text-[9px] text-slate-500 mt-1">Maksimal 2MB (JPG, PNG, WEBP)</p>
                  </div>
                </div>
                
                {/* Progress Upload */}
                {uploading && (
                  <div className="mt-3 text-center">
                    <FontAwesomeIcon icon={faSpinner} spin className="text-[#00ff99]" />
                    <span className="ml-2 text-xs text-slate-400">Memproses gambar...</span>
                  </div>
                )}
                
                {/* Preview Gambar */}
                {previewImage && !uploading && (
                  <div className="mt-3 p-2 bg-slate-800 rounded-lg relative">
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="w-24 h-24 object-cover rounded-lg mx-auto"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/200x200?text=Invalid+Image';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setSelectedFile(null);
                        setForm({...form, gambar_base64: ""});
                      }}
                      className="absolute top-0 right-0 bg-red-500 rounded-full p-1 m-1 hover:bg-red-600 transition-all"
                    >
                      <FontAwesomeIcon icon={faTimes} size={10} />
                    </button>
                    <p className="text-center text-[9px] text-emerald-400 mt-1">✅ Gambar siap disimpan</p>
                  </div>
                )}
              </div>

              {/* Deskripsi */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Deskripsi</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({...form, deskripsi: e.target.value})}
                  rows="2"
                  className="w-full bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-white text-sm focus:outline-none focus:border-[#00ff99] mt-1"
                  placeholder="Deskripsi menu (opsional)"
                />
              </div>

              {/* Status (hanya untuk edit) */}
              {editingItem && (
                <div className="flex items-center gap-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Status</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={form.is_active === true}
                        onChange={() => setForm({...form, is_active: true})}
                        className="w-4 h-4 accent-[#00ff99]"
                      />
                      <span className="text-sm">Aktif</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={form.is_active === false}
                        onChange={() => setForm({...form, is_active: false})}
                        className="w-4 h-4 accent-red-500"
                      />
                      <span className="text-sm">Nonaktif</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-bold text-xs uppercase cursor-pointer transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 py-3 bg-[#00aa66] hover:bg-[#00cc7a] rounded-xl text-white font-bold text-xs uppercase cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving || uploading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                  {editingItem ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}