// src/api/upload.js
// File ini akan dijalankan di server (Vite dev server)

export const uploadImageToPublic = async (file, fileName) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Simpan sebagai base64 di localStorage (simulasi)
      // Karena di Vite tidak bisa langsung write ke folder public
      const base64 = reader.result;
      localStorage.setItem(`menu_image_${fileName}`, base64);
      resolve(base64);
    };
    reader.onerror = reject;
  });
};