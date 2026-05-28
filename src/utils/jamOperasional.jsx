// utils/jamOperasional.js

// Fungsi untuk mendapatkan hari dalam bahasa Indonesia
const getHari = (tanggal) => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[tanggal.getDay()];
};

// Fungsi untuk mengecek apakah jam mulai valid
export const cekJamOperasional = (tanggalMain, jamMulai) => {
  const date = new Date(tanggalMain);
  const hari = getHari(date);
  const [jam, menit] = jamMulai.split(':').map(Number);
  
  let jamBuka = 10;
  let jamTutup = 0;
  let isHariLibur = (hari === 'Sabtu' || hari === 'Minggu');
  
  if (isHariLibur) {
    // Sabtu - Minggu: 10:00 - 03:00 (dini hari)
    jamTutup = 3;
  } else {
    // Senin - Jumat: 10:00 - 02:00 (dini hari)
    jamTutup = 2;
  }
  
  // Validasi khusus untuk jam yang melewati tengah malam
  if (jamTutup < jamBuka) {
    // Jam tutup lebih kecil dari jam buka (melewati tengah malam)
    if (jam >= jamBuka) {
      return true; // Jam 10:00 - 23:59
    } else if (jam < jamTutup) {
      return true; // Jam 00:00 - jamTutup
    }
    return false;
  } else {
    // Normal (tidak melewati tengah malam)
    return jam >= jamBuka && jam < jamTutup;
  }
};

// Fungsi untuk mendapatkan jam operasional dalam format teks
export const getJamOperasionalText = () => {
  return {
    weekdays: "Senin - Jumat: 10:00 - 02:00 (dini hari)",
    weekend: "Sabtu - Minggu: 10:00 - 03:00 (dini hari)"
  };
};

// Fungsi untuk mendapatkan daftar jam yang tersedia
export const getJamTersedia = (tanggalMain) => {
  const date = new Date(tanggalMain);
  const hari = getHari(date);
  const isHariLibur = (hari === 'Sabtu' || hari === 'Minggu');
  const jamTutup = isHariLibur ? 3 : 2;
  
  const jamTersedia = [];
  
  // Jam 10:00 - 23:00
  for (let i = 10; i <= 23; i++) {
    jamTersedia.push(`${i.toString().padStart(2, '0')}:00`);
  }
  
  // Jam 00:00 - jamTutup (dini hari)
  for (let i = 0; i < jamTutup; i++) {
    jamTersedia.push(`${i.toString().padStart(2, '0')}:00`);
  }
  
  return jamTersedia;
};