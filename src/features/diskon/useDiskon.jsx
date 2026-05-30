import { useState } from "react";

export default function useDiskon() {
  const [diskonAktif, setDiskonAktif] = useState({ 
    aktif: false, 
    nilai: 0, 
    keterangan: "", 
    alasan: "" 
  });

  const applyDiskon = (diskon, keterangan, alasan) => {
    setDiskonAktif({
      aktif: true,
      nilai: diskon,
      keterangan: keterangan,
      alasan: alasan
    });
  };

  const resetDiskon = () => {
    setDiskonAktif({
      aktif: false,
      nilai: 0,
      keterangan: "",
      alasan: ""
    });
  };

  const hitungTotalSetelahDiskon = (totalAwal) => {
    if (diskonAktif.aktif) {
      return Math.max(0, totalAwal - diskonAktif.nilai);
    }
    return totalAwal;
  };

  return {
    diskonAktif,
    applyDiskon,
    resetDiskon,
    hitungTotalSetelahDiskon
  };
}