// src/components/PrintClosingReport.jsx
import React from "react";

export default function PrintClosingReport({ data }) {
  return (
    <div id="print-content" style={{ 
      padding: "20px", 
      fontFamily: "monospace", 
      fontSize: "12px",
      maxWidth: "280px",
      margin: "0 auto"
    }}>
      <div style={{ textAlign: "center", borderBottom: "1px dashed #000", paddingBottom: "10px", marginBottom: "10px" }}>
        <h3 style={{ margin: 0 }}>ROYAL CUE BILLIARD</h3>
        <p style={{ fontSize: "10px", margin: "5px 0 0" }}>LAPORAN TUTUP SHIFT</p>
      </div>
      
      <div style={{ marginBottom: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>WAKTU:</span>
          <span style={{ fontWeight: "bold" }}>{data.waktu}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>KASIR:</span>
          <span style={{ fontWeight: "bold" }}>{data.nama_kasir}</span>
        </div>
      </div>
      
      <div style={{ borderTop: "1px dashed #000", margin: "10px 0" }}></div>
      
      <div style={{ marginBottom: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Sewa Meja:</span>
          <span>Rp {data.total_sewa_meja.toLocaleString("id-ID")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Kantin:</span>
          <span>Rp {data.total_kantin.toLocaleString("id-ID")}</span>
        </div>
      </div>
      
      <div style={{ borderTop: "1px dashed #000", margin: "10px 0" }}></div>
      
      <div style={{ marginBottom: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Tunai:</span>
          <span>Rp {data.total_tunai.toLocaleString("id-ID")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Non-Tunai:</span>
          <span>Rp {data.total_non_tunai.toLocaleString("id-ID")}</span>
        </div>
      </div>
      
      <div style={{ borderTop: "1px dashed #000", margin: "10px 0", paddingTop: "5px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
          <span>TOTAL:</span>
          <span style={{ color: "green" }}>Rp {data.grand_total.toLocaleString("id-ID")}</span>
        </div>
      </div>
      
      <div style={{ textAlign: "center", borderTop: "1px dashed #000", marginTop: "15px", paddingTop: "10px", fontSize: "9px" }}>
        <p>Total Transaksi: {data.total_transaksi}</p>
        <p style={{ marginTop: "5px" }}>Terima Kasih</p>
      </div>
    </div>
  );
}