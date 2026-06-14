// src/pages/MenuManagement.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, faEdit, faTrash, faSpinner, faTimes, 
  faSave, faSearch, faCheck, faUpload,
  faUtensils, faCloudUploadAlt, faImage, faSyncAlt,
  faChevronLeft, faChevronRight, faFilter
} from "@fortawesome/free-solid-svg-icons";
import { menuService } from "../services/menuService";
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";

export default function MenuManagement() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  const [form, setForm] = useState({
    nama: "",
    harga: "",
    kategori: "Makanan",
    stok: "",
    deskripsi: "",
    is_active: true,
    gambar_url: ""
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const kategoriList = ["Semua", "Makanan", "Minuman", "Rokok", "Snack"];

  // Responsive items per page
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(6);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(9);
      } else {
        setItemsPerPage(12);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchMenu = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const data = await menuService.getAllMenuAdmin(forceRefresh);
      setMenu(data);
    } catch (error) {
      console.error("Error fetching menu:", error);
      alert("Gagal memuat menu: " + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleRefresh = () => {
    fetchMenu(true);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 2MB!");
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert("File harus berupa gambar!");
        return;
      }
      
      setUploading(true);
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
      
      try {
        const imageUrl = await menuService.uploadImage(file);
        setForm({ ...form, gambar_url: imageUrl });
      } catch (error) {
        console.error("Upload error:", error);
        alert("Gagal upload gambar: " + error.message);
        setPreviewImage(null);
        setSelectedFile(null);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
        gambar_url: form.gambar_url || null
      };
      
      if (editingItem) {
        if (editingItem.gambar_url && editingItem.gambar_url !== form.gambar_url) {
          await menuService.deleteImage(editingItem.gambar_url);
        }
        await menuService.updateMenu(editingItem.id, dataMenu);
        alert("✅ Menu berhasil diupdate!");
      } else {
        await menuService.addMenu(dataMenu);
        alert("✅ Menu baru berhasil ditambahkan!");
      }
      
      resetForm();
      await fetchMenu(true);
    } catch (error) {
      console.error("Error saving menu:", error);
      alert("Gagal menyimpan menu: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteMenu = async (item) => {
    if (window.confirm(`Hapus menu "${item.nama}"?`)) {
      try {
        if (item.gambar_url) {
          await menuService.deleteImage(item.gambar_url);
        }
        await menuService.deleteMenu(item.id);
        alert("✅ Menu berhasil dihapus!");
        await fetchMenu(true);
      } catch (error) {
        alert("Gagal menghapus menu: " + error.message);
      }
    }
  };

  const toggleStatus = async (item) => {
    try {
      await menuService.updateMenu(item.id, { is_active: !item.is_active });
      await fetchMenu(true);
    } catch (error) {
      alert("Gagal mengubah status: " + error.message);
    }
  };

  const resetForm = () => {
    setForm({
      nama: "",
      harga: "",
      kategori: "Makanan",
      stok: "",
      deskripsi: "",
      is_active: true,
      gambar_url: ""
    });
    setPreviewImage(null);
    setSelectedFile(null);
    setEditingItem(null);
    setModalOpen(false);
  };

  const editMenu = (item) => {
    setEditingItem(item);
    setForm({
      nama: item.nama,
      harga: item.harga,
      kategori: item.kategori,
      stok: item.stok || "",
      deskripsi: item.deskripsi || "",
      is_active: item.is_active,
      gambar_url: item.gambar_url || ""
    });
    setPreviewImage(item.gambar_url);
    setSelectedFile(null);
    setModalOpen(true);
  };

  // Filter dan Pagination
  const filteredMenu = menu.filter(item => {
    const matchKategori = filterKategori === "Semua" || item.kategori === filterKategori;
    const matchSearch = item.nama.toLowerCase().includes(search.toLowerCase());
    return matchKategori && matchSearch;
  });

  const totalPages = Math.ceil(filteredMenu.length / itemsPerPage);
  const paginatedMenu = filteredMenu.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getKategoriEmoji = (kategori) => {
    switch (kategori) {
      case "Makanan": return "🍽️";
      case "Minuman": return "🥤";
      case "Rokok": return "🚬";
      case "Snack": return "🍿";
      default: return "🍽️";
    }
  };

  const getKategoriColor = (kategori) => {
    switch (kategori) {
      case "Makanan": return "bg-orange-500/20 text-orange-400";
      case "Minuman": return "bg-blue-500/20 text-blue-400";
      case "Rokok": return "bg-red-500/20 text-red-400";
      case "Snack": return "bg-purple-500/20 text-purple-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {[...Array(itemsPerPage)].map((_, i) => (
        <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden animate-pulse">
          <div className="h-28 sm:h-32 bg-slate-800/50"></div>
          <div className="p-3 sm:p-4">
            <div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-800 rounded w-1/2 mb-3"></div>
            <div className="flex gap-2">
              <div className="h-7 sm:h-6 bg-slate-800 rounded flex-1"></div>
              <div className="h-7 sm:h-6 bg-slate-800 rounded flex-1"></div>
              <div className="h-7 sm:h-6 bg-slate-800 rounded w-8"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#020a05]">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <AdminNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-[#00ff99] text-[10px] sm:text-xs font-black uppercase tracking-[3px] sm:tracking-[4px] mb-1 sm:mb-2">
                Manajemen
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
                Manajemen <span className="text-[#00ff99]">Menu F&B</span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Kelola menu makanan, minuman, rokok, dan snack
              </p>
            </div>
            
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl font-bold text-[10px] sm:text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all min-h-[44px]"
              >
                <FontAwesomeIcon icon={faSyncAlt} spin={refreshing} className="text-xs sm:text-sm" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="flex-1 sm:flex-none bg-[#00aa66] hover:bg-[#00cc7a] px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl font-bold text-[10px] sm:text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all min-h-[44px]"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs sm:text-sm" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Section */}
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 mb-6">
            <div className="relative flex-1">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs sm:text-sm" />
              <input
                type="text"
                placeholder="Cari menu..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-3 sm:py-3.5 pl-9 sm:pl-11 pr-4 text-white text-sm focus:outline-none focus:border-[#00ff99]"
              />
            </div>
            
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="lg:hidden flex items-center justify-center gap-2 bg-slate-800 py-3 rounded-xl font-bold text-xs uppercase min-h-[44px]"
            >
              <FontAwesomeIcon icon={faFilter} />
              Filter Kategori
            </button>
            
            {/* Desktop Filter */}
            <div className="hidden lg:flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {kategoriList.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setFilterKategori(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
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

          {/* Mobile Filter Dropdown */}
          {showMobileFilter && (
            <div className="lg:hidden mb-4 p-3 bg-slate-900/40 border border-slate-800 rounded-xl">
              <div className="grid grid-cols-2 gap-2">
                {kategoriList.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setFilterKategori(cat);
                      setShowMobileFilter(false);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                      filterKategori === cat 
                        ? "bg-[#00ff99] text-black" 
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Info & Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <p className="text-slate-400 text-xs sm:text-sm">
              Menampilkan <span className="text-white font-bold">{paginatedMenu.length}</span> dari{" "}
              <span className="text-white font-bold">{filteredMenu.length}</span> menu
            </p>
            {filteredMenu.length > itemsPerPage && (
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-all min-h-[40px] min-w-[40px]"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <span className="px-3 sm:px-4 py-2 bg-slate-800 rounded-lg text-white text-sm">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-2 bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-all min-h-[40px] min-w-[40px]"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </div>

          {/* Grid Menu */}
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {paginatedMenu.map((item) => (
                <div key={item.id} className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all group">
                  {/* Image Section */}
                  <div className="h-28 sm:h-32 bg-slate-800/50 relative overflow-hidden">
                    {item.gambar_url ? (
                      <img 
                        src={item.gambar_url} 
                        alt={item.nama} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-3xl sm:text-4xl">${getKategoriEmoji(item.kategori)}</div>`;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl">
                        {getKategoriEmoji(item.kategori)}
                      </div>
                    )}
                    {!item.is_active && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full font-bold">
                        Nonaktif
                      </div>
                    )}
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-3 sm:p-4">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm sm:text-base truncate">
                          {item.nama}
                        </h3>
                        <span className={`inline-block text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full mt-1 ${getKategoriColor(item.kategori)}`}>
                          {item.kategori}
                        </span>
                      </div>
                      <p className="text-[#00ff99] font-black text-sm sm:text-base whitespace-nowrap">
                        Rp {item.harga.toLocaleString("id-ID")}
                      </p>
                    </div>
                    
                    {item.stok !== undefined && (
                      <p className={`text-[9px] sm:text-[10px] mt-1 ${item.stok < 10 ? "text-red-400" : "text-slate-400"}`}>
                        Stok: {item.stok}
                      </p>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => editMenu(item)}
                        className="flex-1 py-2 sm:py-1.5 bg-blue-600/80 hover:bg-blue-500 rounded-lg text-white text-[10px] sm:text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer min-h-[36px]"
                      >
                        <FontAwesomeIcon icon={faEdit} className="text-[10px] sm:text-xs" />
                        <span className="hidden xs:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => deleteMenu(item)}
                        className="flex-1 py-2 sm:py-1.5 bg-rose-600/80 hover:bg-rose-500 rounded-lg text-white text-[10px] sm:text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer min-h-[36px]"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-[10px] sm:text-xs" />
                        <span className="hidden xs:inline">Hapus</span>
                      </button>
                      <button
                        onClick={() => toggleStatus(item)}
                        className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg text-[10px] sm:text-[10px] font-bold transition-all cursor-pointer min-h-[36px] min-w-[36px] ${
                          item.is_active 
                            ? "bg-emerald-600/80 hover:bg-emerald-500" 
                            : "bg-slate-700 hover:bg-slate-600"
                        }`}
                      >
                        {item.is_active ? <FontAwesomeIcon icon={faCheck} className="text-[10px] sm:text-xs" /> : "Aktif"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredMenu.length === 0 && !loading && (
            <div className="text-center text-slate-500 py-16 sm:py-20">
              <FontAwesomeIcon icon={faUtensils} className="text-3xl sm:text-4xl mb-3 opacity-30" />
              <p className="text-sm sm:text-base">Belum ada menu. Silakan tambah menu baru.</p>
            </div>
          )}
        </div>
      </main>

      {/* MODAL TAMBAH/EDIT MENU - Responsive */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl w-full max-w-[95%] sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider">
                  <FontAwesomeIcon icon={faUtensils} className="text-[#00ff99] mr-2" />
                  {editingItem ? "Edit Menu" : "Tambah Menu Baru"}
                </h3>
                <button 
                  onClick={resetForm} 
                  className="text-slate-400 hover:text-white cursor-pointer p-2 -m-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Nama Menu *
                </label>
                <input
                  type="text"
                  required
                  value={form.nama}
                  onChange={(e) => setForm({...form, nama: e.target.value})}
                  className="w-full bg-slate-900/60 border border-slate-800 p-3 sm:p-3.5 rounded-xl text-white text-sm focus:outline-none focus:border-[#00ff99]"
                  placeholder="Contoh: Mie Goreng Special"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase block mb-1">
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.harga}
                    onChange={(e) => setForm({...form, harga: e.target.value})}
                    className="w-full bg-slate-900/60 border border-slate-800 p-3 sm:p-3.5 rounded-xl text-white text-sm focus:outline-none focus:border-[#00ff99]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase block mb-1">
                    Stok
                  </label>
                  <input
                    type="number"
                    value={form.stok}
                    onChange={(e) => setForm({...form, stok: e.target.value})}
                    className="w-full bg-slate-900/60 border border-slate-800 p-3 sm:p-3.5 rounded-xl text-white text-sm focus:outline-none focus:border-[#00ff99]"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Kategori
                </label>
                <select
                  value={form.kategori}
                  onChange={(e) => setForm({...form, kategori: e.target.value})}
                  className="w-full bg-slate-900/60 border border-slate-800 p-3 sm:p-3.5 rounded-xl text-white text-sm focus:outline-none focus:border-[#00ff99] cursor-pointer"
                >
                  <option value="Makanan">🍽️ Makanan</option>
                  <option value="Minuman">🥤 Minuman</option>
                  <option value="Rokok">🚬 Rokok</option>
                  <option value="Snack">🍿 Snack</option>
                </select>
              </div>

              {/* Upload Gambar */}
              <div>
                <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Gambar Menu
                </label>
                <div className="mt-2">
                  <div 
                    className="border-2 border-dashed border-slate-700 rounded-xl p-3 sm:p-4 text-center hover:border-[#00ff99] transition-all cursor-pointer"
                    onClick={() => document.getElementById('imageUpload').click()}
                  >
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <FontAwesomeIcon icon={faCloudUploadAlt} className="text-2xl sm:text-3xl text-slate-500 mb-2" />
                    <p className="text-[11px] sm:text-xs text-slate-400">Klik untuk pilih gambar</p>
                    <p className="text-[8px] sm:text-[9px] text-slate-500 mt-1">Maksimal 2MB (JPG, PNG, WEBP)</p>
                  </div>
                </div>
                
                {uploading && (
                  <div className="mt-3 text-center">
                    <FontAwesomeIcon icon={faSpinner} spin className="text-[#00ff99]" />
                    <span className="ml-2 text-xs text-slate-400">Upload gambar...</span>
                  </div>
                )}
                
                {previewImage && !uploading && (
                  <div className="mt-3 p-2 bg-slate-800 rounded-lg relative">
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg mx-auto"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/200x200?text=Invalid+Image';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setSelectedFile(null);
                        setForm({...form, gambar_url: ""});
                      }}
                      className="absolute top-0 right-0 bg-red-500 rounded-full p-1.5 m-1 hover:bg-red-600 transition-all min-h-[28px] min-w-[28px] flex items-center justify-center"
                    >
                      <FontAwesomeIcon icon={faTimes} size={10} />
                    </button>
                    <p className="text-center text-[8px] sm:text-[9px] text-emerald-400 mt-1">
                      ✅ Gambar siap disimpan
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({...form, deskripsi: e.target.value})}
                  rows="2"
                  className="w-full bg-slate-900/60 border border-slate-800 p-3 sm:p-3.5 rounded-xl text-white text-sm focus:outline-none focus:border-[#00ff99]"
                  placeholder="Deskripsi menu (opsional)"
                />
              </div>

              {editingItem && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase">
                    Status
                  </label>
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
                  className="flex-1 py-3 sm:py-3.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-bold text-[10px] sm:text-xs uppercase cursor-pointer transition-all min-h-[48px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 py-3 sm:py-3.5 bg-[#00aa66] hover:bg-[#00cc7a] rounded-xl text-white font-bold text-[10px] sm:text-xs uppercase cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px]"
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