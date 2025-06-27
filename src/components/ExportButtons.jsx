/* eslint-disable no-unused-vars */
// src/components/relatorios/ExportButtons.jsx
import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExportButtons({ filtros, aba }) {
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório - " + aba.toUpperCase(), 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [["Dado 1", "Dado 2", "Dado 3"]],
      body: [["Exemplo", "Exemplo", "Exemplo"]], // Substituir pelos dados reais
    });
    doc.save(`relatorio-${aba}.pdf`);
  };

  const exportarCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      ["Dado 1,Dado 2,Dado 3", "Exemplo,Exemplo,Exemplo"].join("\n"); // Substituir pelos dados reais
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio-${aba}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarExcel = () => {
    alert("Exportação para Excel será implementada em breve.");
  };

  return (
    <div className="flex gap-4">
      <button onClick={exportarPDF} className="bg-red-500 text-white px-4 py-2 rounded">Exportar PDF</button>
      <button onClick={exportarCSV} className="bg-green-500 text-white px-4 py-2 rounded">Exportar CSV</button>
      <button onClick={exportarExcel} className="bg-yellow-500 text-white px-4 py-2 rounded">Exportar Excel</button>
    </div>
  );
}
