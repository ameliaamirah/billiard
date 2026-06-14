// src/components/PrintClosingReport.jsx
import React from "react";

export default function PrintClosingReport({ data }) {
  // Default values untuk mencegah error jika data undefined
  const printData = {
    waktu: data?.waktu || new Date().toLocaleString("id-ID"),
    nama_kasir: data?.nama_kasir || "-",
    total_sewa_meja: data?.total_sewa_meja || 0,
    total_kantin: data?.total_kantin || 0,
    total_tunai: data?.total_tunai || 0,
    total_non_tunai: data?.total_non_tunai || 0,
    grand_total: data?.grand_total || 0,
    total_transaksi: data?.total_transaksi || 0,
    shift: data?.shift || "Shift",
    jam_mulai: data?.jam_mulai || "-",
    jam_selesai: data?.jam_selesai || "-",
    qris_amount: data?.qris_amount || 0,
    transfer_amount: data?.transfer_amount || 0,
  };

  const formatRupiah = (angka) => {
    return `Rp ${(angka || 0).toLocaleString("id-ID")}`;
  };

  const formatTanggal = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRataRataTransaksi = () => {
    if (printData.total_transaksi === 0) return 0;
    return printData.grand_total / printData.total_transaksi;
  };

  return (
    <div 
      id="print-content" 
      className="p-3 font-mono text-[10px] bg-white text-black mx-auto"
      style={{ 
        width: "280px",
        maxWidth: "280px",
        minHeight: "auto",
        fontFamily: "'Courier New', 'Monaco', monospace"
      }}
    >
      {/* ================= HEADER ================= */}
      <div className="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
        <h3 className="text-base font-bold m-0 tracking-tight">ROYAL CUE</h3>
        <p className="text-[8px] m-0 text-gray-600">BILLIARD & F&B STUDIO</p>
        <div className="my-1">
          <p className="text-[8px] m-0 text-gray-600">Jl. Jawa No. 10, Banyuwangi</p>
          <p className="text-[8px] m-0 text-gray-600">Telp: 0812-3456-7890</p>
        </div>
        <div className="border-t border-dashed border-gray-300 my-1"></div>
        <p className="text-[9px] font-bold m-0 tracking-wide">LAPORAN TUTUP SHIFT</p>
      </div>

      {/* ================= INFO SHIFT & KASIR ================= */}
      <div className="mb-2 space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-600">Shift:</span>
          <span className="font-bold uppercase">{printData.shift}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Kasir:</span>
          <span className="font-bold">{printData.nama_kasir}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Jam:</span>
          <span className="font-mono text-[9px]">{printData.jam_mulai} - {printData.jam_selesai}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tanggal:</span>
          <span className="font-mono text-[9px]">{printData.waktu.split(" ")[0]}</span>
        </div>
      </div>

      {/* ================= DIVIDER ================= */}
      <div className="border-t border-dashed border-gray-400 my-1"></div>

      {/* ================= PENDAPATAN ================= */}
      <div className="mb-2">
        <p className="font-bold text-center text-[9px] mb-1 tracking-wide">PENDAPATAN</p>
        <div className="flex justify-between">
          <span>Sewa Meja</span>
          <span>{formatRupiah(printData.total_sewa_meja)}</span>
        </div>
        <div className="flex justify-between">
          <span>Kantin / F&B</span>
          <span>{formatRupiah(printData.total_kantin)}</span>
        </div>
      </div>

      {/* ================= DIVIDER ================= */}
      <div className="border-t border-dashed border-gray-400 my-1"></div>

      {/* ================= METODE PEMBAYARAN ================= */}
      <div className="mb-2">
        <p className="font-bold text-center text-[9px] mb-1 tracking-wide">METODE BAYAR</p>
        <div className="flex justify-between">
          <span>Tunai (Cash)</span>
          <span>{formatRupiah(printData.total_tunai)}</span>
        </div>
        <div className="flex justify-between">
          <span>Non-Tunai</span>
          <span>{formatRupiah(printData.total_non_tunai)}</span>
        </div>
        
        {/* Rincian Non-Tunai - hanya tampil jika ada */}
        {(printData.qris_amount > 0 || printData.transfer_amount > 0) && (
          <div className="pl-2 mt-0.5 space-y-0.5 text-[9px] text-gray-500">
            {printData.qris_amount > 0 && (
              <div className="flex justify-between">
                <span>├ QRIS</span>
                <span>{formatRupiah(printData.qris_amount)}</span>
              </div>
            )}
            {printData.transfer_amount > 0 && (
              <div className="flex justify-between">
                <span>└ Transfer</span>
                <span>{formatRupiah(printData.transfer_amount)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= DIVIDER ================= */}
      <div className="border-t border-dashed border-gray-400 my-1"></div>

      {/* ================= TOTAL ================= */}
      <div className="mb-2 pt-0.5">
        <div className="flex justify-between font-bold text-[11px]">
          <span>TOTAL PENDAPATAN:</span>
          <span className="text-green-700">{formatRupiah(printData.grand_total)}</span>
        </div>
      </div>

      {/* ================= DIVIDER ================= */}
      <div className="border-t border-dashed border-gray-400 my-1"></div>

      {/* ================= RINGKASAN ================= */}
      <div className="mb-2">
        <p className="font-bold text-center text-[9px] mb-1 tracking-wide">RINGKASAN</p>
        <div className="flex justify-between">
          <span>Total Transaksi:</span>
          <span className="font-bold">{printData.total_transaksi} transaksi</span>
        </div>
        <div className="flex justify-between mt-0.5">
          <span>Rata-rata per transaksi:</span>
          <span>{formatRupiah(getRataRataTransaksi())}</span>
        </div>
      </div>

      {/* ================= DIVIDER ================= */}
      <div className="border-t border-dashed border-gray-400 my-1"></div>

      {/* ================= CATATAN (Opsional) ================= */}
      {data?.catatan && (
        <>
          <div className="mb-2">
            <p className="font-bold text-[9px] mb-0.5">CATATAN:</p>
            <p className="text-[8px] text-gray-600 break-words whitespace-pre-wrap">
              {data.catatan}
            </p>
          </div>
          <div className="border-t border-dashed border-gray-400 my-1"></div>
        </>
      )}

      {/* ================= FOOTER ================= */}
      <div className="text-center mt-2">
        <div className="border-t border-dashed border-gray-400 pt-1 mb-1"></div>
        <p className="text-[8px] text-gray-500 mb-0.5">
          Dicetak: {formatTanggal(new Date())}
        </p>
        <div className="my-1">
          <p className="text-[8px] text-gray-600">===============================</p>
        </div>
        <p className="font-bold text-[10px] text-black mb-0.5">TERIMA KASIH</p>
        <p className="text-[7px] text-gray-500">Royal Cue Studio - Banyuwangi</p>
        <p className="text-[7px] text-gray-400 mt-1">*** Laporan Tutup Shift ***</p>
      </div>
    </div>
  );
}