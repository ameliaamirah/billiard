import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaMoneyBillWave, FaQrcode, FaTimes, FaCheckCircle, FaPrint } from "react-icons/fa";

const PaymentModal = ({ isOpen, onClose, tableName, totalAmount, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState(""); // cash atau qris
  const [cashAmount, setCashAmount] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const changeAmount = cashAmount ? parseInt(cashAmount) - totalAmount : 0;

  // TAMBAH: Fungsi reset state saat modal ditutup (X) agar data tidak tersisa
  const handleCloseModal = () => {
    setPaymentMethod("");
    setCashAmount("");
    setIsSuccess(false);
    onClose();
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    
    // TAMBAH: Validasi keamanan tambahan sebelum eksekusi callback
    if (!paymentMethod) return;
    if (paymentMethod === "cash" && changeAmount < 0) return;

    // PERBAIKAN: Eksekusi callback sukses SEKARANG secara instan 
    // agar data langsung aman masuk ke laporan keuangan di localStorage
    onPaymentSuccess();

    // Jalankan efek animasi sukses di screen kasir
    setIsSuccess(true);
    
    setTimeout(() => {
      // UBAH: Menggunakan fungsi handleCloseModal terpusat setelah animasi selesai
      handleCloseModal();
    }, 2500); // Sisa 2.5 detik murni digunakan untuk simulasi animasi sukses & cetak nota
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[250] p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0b1329] border border-slate-800 rounded-[2.5rem] p-6 md:p-8 max-w-md w-full relative overflow-hidden"
      >
        {/* JIKA PEMBAYARAN SUKSES (ANIMASI BERHASIL) */}
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <motion.div 
              initial={{ scale: 0.5 }} 
              animate={{ scale: 1 }} 
              className="text-[#00ff99] text-6xl mb-4"
            >
              <FaCheckCircle />
            </motion.div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Pembayaran Sukses!</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-[280px]">
              Transaksi {tableName} berhasil dibukukan ke sistem laporan keuangan.
            </p>
            <button 
              type="button"
              className="mt-6 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 hover:text-white transition-colors"
            >
              <FaPrint /> Cetak Nota Fisik
            </button>
          </div>
        ) : (
          /* FORM PILIHAN METODE BAYAR */
          <>
            {/* UBAH: onClick diubah menggunakan handleCloseModal agar state dibersihkan */}
            <button type="button" onClick={handleCloseModal} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors cursor-pointer">
              <FaTimes size={16} />
            </button>

            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">Kasir Pembayaran</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-6">Finalize Billing for {tableName}</p>

            {/* RINGKASAN TAGIHAN */}
            <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-2xl mb-6 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tagihan</span>
              <span className="text-xl font-mono font-black text-[#00ff99]">
                Rp {totalAmount.toLocaleString("id-ID")}
              </span>
            </div>

            {/* PILIHAN METODE BAYAR */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  paymentMethod === "cash" 
                    ? "bg-[#00ff99]/10 text-[#00ff99] border-[#00ff99]" 
                    : "bg-slate-950/40 border-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                <FaMoneyBillWave size={20} /> Tunai / Cash
              </button>

              <button 
                type="button"
                onClick={() => setPaymentMethod("qris")}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  paymentMethod === "qris" 
                    ? "bg-blue-500/10 text-blue-400 border-blue-500" 
                    : "bg-slate-950/40 border-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                <FaQrcode size={20} /> QRIS / E-Wallet
              </button>
            </div>

            {/* FORM DINAMIS BERDASARKAN PILIHAN */}
            <form onSubmit={handleProcessPayment} className="space-y-4">
              {paymentMethod === "cash" && (
                <div className="transition-all duration-300">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Uang Diterima (Cash In)</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="Contoh: 100000" 
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-[#00ff99]"
                  />
                  {changeAmount >= 0 && cashAmount && (
                    <div className="mt-3 text-right">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Uang Kembalian</span>
                      <span className="text-sm font-mono font-bold text-amber-400">Rp {changeAmount.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === "qris" && (
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl w-44 h-44 mx-auto mb-2 border-4 border-blue-500/30">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=RoyalCueStudio" 
                    alt="QRIS QR Code" 
                    className="w-36 h-36 object-contain"
                  />
                </div>
              )}

              {paymentMethod && (
                <button 
                  type="submit" 
                  disabled={paymentMethod === "cash" && changeAmount < 0}
                  className={`w-full font-black text-xs py-3.5 rounded-xl uppercase tracking-widest mt-2 cursor-pointer shadow-lg transition-all ${
                    paymentMethod === "cash" && changeAmount < 0
                      ? "bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#00aa66] to-[#00ff99] text-black hover:brightness-110"
                  }`}
                >
                  Konfirmasi Lunas
                </button>
              )}
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentModal;