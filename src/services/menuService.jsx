// src/services/menuService.js
import { supabase } from "../supabaseClient";

// Cache untuk menu
let menuCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

export const menuService = {
  // Ambil semua menu (dengan cache)
  async getAllMenu(forceRefresh = false) {
    const now = Date.now();
    
    // Gunakan cache jika masih valid
    if (!forceRefresh && menuCache && (now - lastFetchTime) < CACHE_DURATION) {
      console.log("Menggunakan cache menu");
      return menuCache;
    }
    
    console.log("Mengambil data dari server...");
    
    try {
      const { data, error } = await supabase
        .from("menu_fb")
        .select("id, nama, harga, kategori, stok, deskripsi, is_active, gambar_url, created_at, updated_at")
        .eq("is_active", true)
        .order("kategori", { ascending: true })
        .order("nama", { ascending: true });
      
      if (error) throw error;
      
      // Simpan ke cache
      menuCache = data || [];
      lastFetchTime = now;
      
      return menuCache;
    } catch (error) {
      console.error("Error fetching menu:", error);
      return menuCache || [];
    }
  },
  
  // Ambil menu untuk admin (termasuk yang tidak aktif)
  async getAllMenuAdmin(forceRefresh = false) {
    const now = Date.now();
    
    if (!forceRefresh && menuCache && (now - lastFetchTime) < CACHE_DURATION) {
      return menuCache;
    }
    
    try {
      const { data, error } = await supabase
        .from("menu_fb")
        .select("*")
        .order("kategori", { ascending: true })
        .order("nama", { ascending: true });
      
      if (error) throw error;
      
      menuCache = data || [];
      lastFetchTime = now;
      
      return menuCache;
    } catch (error) {
      console.error("Error fetching menu:", error);
      return menuCache || [];
    }
  },
  
  // Tambah menu baru
  async addMenu(menuData) {
    const { data, error } = await supabase
      .from("menu_fb")
      .insert([{
        ...menuData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    
    // Invalidate cache
    menuCache = null;
    
    return data;
  },
  
  // Update menu
  async updateMenu(id, menuData) {
    const { data, error } = await supabase
      .from("menu_fb")
      .update({
        ...menuData,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select();
    
    if (error) throw error;
    
    // Invalidate cache
    menuCache = null;
    
    return data;
  },
  
  // Hapus menu
  async deleteMenu(id) {
    const { error } = await supabase
      .from("menu_fb")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    
    // Invalidate cache
    menuCache = null;
  },
  
  // Upload gambar ke storage
  async uploadImage(file) {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) throw uploadError;
    
    // Dapatkan URL publik
    const { data: urlData } = supabase.storage
      .from('menu-images')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  },
  
  // Hapus gambar dari storage
  async deleteImage(imageUrl) {
    if (!imageUrl) return;
    
    // Extract filename dari URL
    const fileName = imageUrl.split('/').pop();
    if (!fileName) return;
    
    const { error } = await supabase.storage
      .from('menu-images')
      .remove([fileName]);
    
    if (error) console.error("Error deleting image:", error);
  }
};