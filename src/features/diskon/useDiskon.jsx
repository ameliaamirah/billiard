// src/hooks/useDiskon.js
import { useState, useCallback, useMemo } from "react";

export default function useDiskon(options = {}) {
  const {
    maxDiskon = null,        // Maksimal diskon (opsional)
    minTransaksi = 0,        // Minimal transaksi untuk diskon
    allowStacking = false,   // Apakah boleh stacking diskon
  } = options;

  const [diskonAktif, setDiskonAktif] = useState([]); // Array untuk multiple diskon
  const [diskonHistory, setDiskonHistory] = useState([]); // History diskon

  // Tambah diskon
  const applyDiskon = useCallback((nilai, keterangan, alasan, tipe = "nominal") => {
    // Validasi nilai diskon
    let nilaiDiskon = nilai;
    if (tipe === "persen") {
      if (nilai < 0 || nilai > 100) {
        console.error("Persentase diskon harus antara 0-100");
        return false;
      }
    } else {
      if (nilai < 0) {
        console.error("Nilai diskon tidak boleh negatif");
        return false;
      }
      if (maxDiskon && nilai > maxDiskon) {
        console.error(`Diskon melebihi batas maksimal Rp ${maxDiskon.toLocaleString("id-ID")}`);
        return false;
      }
    }

    const newDiskon = {
      id: Date.now(),
      nilai,
      keterangan,
      alasan,
      tipe,
      timestamp: new Date().toISOString(),
      expiry: null, // Bisa ditambahkan waktu kadaluarsa
    };

    if (allowStacking) {
      setDiskonAktif(prev => [...prev, newDiskon]);
    } else {
      setDiskonAktif([newDiskon]);
    }

    // Simpan ke history
    setDiskonHistory(prev => [newDiskon, ...prev].slice(0, 50));

    return true;
  }, [maxDiskon, allowStacking]);

  // Hapus diskon tertentu
  const removeDiskon = useCallback((id) => {
    setDiskonAktif(prev => prev.filter(d => d.id !== id));
  }, []);

  // Reset semua diskon
  const resetDiskon = useCallback(() => {
    setDiskonAktif([]);
  }, []);

  // Hitung total setelah diskon
  const hitungTotalSetelahDiskon = useCallback((totalAwal) => {
    if (totalAwal < minTransaksi) {
      return totalAwal;
    }

    let total = totalAwal;
    const appliedDiskon = [];

    for (const diskon of diskonAktif) {
      let potongan = 0;
      
      if (diskon.tipe === "persen") {
        potongan = (total * diskon.nilai) / 100;
      } else {
        potongan = diskon.nilai;
      }

      // Pastikan potongan tidak melebihi total
      potongan = Math.min(potongan, total);
      
      if (potongan > 0) {
        total -= potongan;
        appliedDiskon.push({ ...diskon, potongan });
      }
    }

    return Math.max(0, total);
  }, [diskonAktif, minTransaksi]);

  // Hitung total potongan
  const totalPotongan = useMemo(() => {
    if (diskonAktif.length === 0) return 0;
    // Catatan: ini hanya perkiraan, hitung akurat perlu total awal
    return diskonAktif.reduce((sum, d) => sum + d.nilai, 0);
  }, [diskonAktif]);

  // Cek apakah ada diskon aktif
  const hasDiskon = diskonAktif.length > 0;

  // Ambil diskon terakhir
  const diskonTerakhir = diskonAktif[diskonAktif.length - 1] || null;

  // Format diskon untuk display
  const getFormattedDiskon = useCallback((diskon) => {
    if (diskon.tipe === "persen") {
      return `${diskon.nilai}%`;
    }
    return `Rp ${diskon.nilai.toLocaleString("id-ID")}`;
  }, []);

  // Get diskon summary
  const getDiskonSummary = useCallback((totalAwal) => {
    const totalSetelah = hitungTotalSetelahDiskon(totalAwal);
    const potongan = totalAwal - totalSetelah;
    
    return {
      totalAwal,
      potongan,
      totalSetelah,
      jumlahDiskon: diskonAktif.length,
      daftarDiskon: diskonAktif,
    };
  }, [diskonAktif, hitungTotalSetelahDiskon]);

  return {
    // State
    diskonAktif,
    diskonHistory,
    hasDiskon,
    totalPotongan,
    diskonTerakhir,
    
    // Actions
    applyDiskon,
    removeDiskon,
    resetDiskon,
    hitungTotalSetelahDiskon,
    
    // Utilities
    getFormattedDiskon,
    getDiskonSummary,
  };
}