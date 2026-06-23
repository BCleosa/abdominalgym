import * as XLSX from "xlsx";

export function exportToExcel(rows, filename, sheetName = "Sheet1") {
  if (!rows || rows.length === 0) {
    alert("Tidak ada data untuk diekspor.");
    return;
  }
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const tanggal = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `${filename}_${tanggal}.xlsx`);
}