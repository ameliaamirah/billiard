// src/utils/printHelper.js
export const printClosingReport = (componentId = "print-content") => {
  const printContent = document.getElementById(componentId);
  
  if (!printContent) {
    console.error("Print content not found!");
    return;
  }

  // Buat iframe untuk print (lebih bersih)
  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.width = "0px";
  iframe.style.height = "0px";
  iframe.style.border = "none";
  document.body.appendChild(iframe);
  
  const iframeDoc = iframe.contentWindow.document;
  
  // CSS untuk print thermal
  const printStyles = `
    <style>
      @page {
        size: 58mm auto;
        margin: 0mm;
      }
      body {
        margin: 0;
        padding: 8px;
        font-family: 'Courier New', 'Monaco', monospace;
        background: white;
        color: black;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
      }
      .text-center { text-align: center; }
      .border-b { border-bottom: 1px dashed #ccc; }
      .border-t { border-top: 1px dashed #ccc; }
      .border-dashed { border-style: dashed; }
      .font-bold { font-weight: bold; }
      .text-gray-500 { color: #6b7280; }
      .text-gray-600 { color: #4b5563; }
      .text-green-700 { color: #15803d; }
      .flex { display: flex; }
      .justify-between { justify-content: space-between; }
      .mb-1 { margin-bottom: 0.25rem; }
      .mb-2 { margin-bottom: 0.5rem; }
      .mt-1 { margin-top: 0.25rem; }
      .mt-2 { margin-top: 0.5rem; }
      .pl-2 { padding-left: 0.5rem; }
      .p-3 { padding: 0.75rem; }
      .mx-auto { margin-left: auto; margin-right: auto; }
      .space-y-1 > * + * { margin-top: 0.25rem; }
      .space-y-0-5 > * + * { margin-top: 0.125rem; }
    </style>
  `;
  
  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Laporan Tutup Shift - Royal Cue</title>
        ${printStyles}
      </head>
      <body>
        ${printContent.outerHTML}
      </body>
    </html>
  `);
  iframeDoc.close();
  
  iframe.contentWindow.focus();
  iframe.contentWindow.print();
  
  // Hapus iframe setelah print (delay untuk memastikan print dialog tertutup)
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1000);
};

// Fungsi print dengan preview (opsional)
export const previewClosingReport = (data) => {
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) {
    alert("Popup blocker mungkin aktif. Izinkan popup untuk preview.");
    return;
  }
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Preview Laporan - Royal Cue</title>
        <style>
          @page {
            size: 58mm auto;
            margin: 0mm;
          }
          body {
            margin: 0;
            padding: 16px;
            font-family: 'Courier New', monospace;
            background: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .preview-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            padding: 8px;
          }
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .preview-container {
              box-shadow: none;
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
          .no-print {
            text-align: center;
            margin-top: 20px;
          }
          button {
            background: #00aa66;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            margin: 0 5px;
          }
          button:hover {
            background: #008855;
          }
        </style>
      </head>
      <body>
        <div>
          <div class="preview-container" id="print-content">
            ${document.getElementById('print-content')?.outerHTML || 'Loading...'}
          </div>
          <div class="no-print">
            <button onclick="window.print()">🖨️ Print</button>
            <button onclick="window.close()">✖️ Tutup</button>
          </div>
        </div>
        <script>
          // Load content if needed
        <\/script>
      </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};