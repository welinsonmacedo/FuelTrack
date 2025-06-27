import React, { useState } from "react";
import FiltrosRelatorio from "./FilterReport";
import TabelaAbastecimentos from "./SupplyTable";
import TabelaViagens from "./TableTravel";
import TabelaDesempenho from "./PerformanceTable";
import GraficosDashboard from "./GraphicsDashboard";
import ExportButtons from "../../components/ExportButtons";

export default function RelatoriosPage() {
  const [filtros, setFiltros] = useState({});
  const [abaAtual, setAbaAtual] = useState("abastecimentos");
 



  return (
    <>
      <style>{`
        .container {
          max-width: 100%;
          margin: 0 auto;
          padding: 24px;
          background-color: #f9fafb;
          min-height: 100vh;
          font-family: Arial, sans-serif;
        }
        .card {
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
          display: flex;
          flex-direction: column;
        }
        .title {
          font-size: 2.25rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 24px;
          text-align: center;
        }
        .tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 16px;
          margin-top: 24px;
          justify-content: flex-start; /* alinhado à esquerda */
        }
        .tab-button {
          padding: 10px 24px;
          border-radius: 6px;
          font-weight: 600;
          background-color: #e5e7eb;
          color: #4b5563;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s ease;
          white-space: nowrap;
        }
        .tab-button:hover {
          background-color: #d1d5db;
        }
        .tab-button.active {
          background-color: #2563eb;
          color: white;
          box-shadow: 0 2px 8px rgb(37 99 235 / 0.4);
        }
        .filtros-wrapper {
          margin-bottom: 16px;
          width: 100%;
        }
        .toggle-btn {
          margin-top: 12px;
          padding: 8px 20px;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s ease;
          align-self: flex-start; /* botão alinhado à esquerda */
        }
        .toggle-btn:hover {
          background-color: #1d4ed8;
        }
        .content-area {
          margin-top: 16px;
          width: 100%;
        }
        .content-area > * {
          width: 100%; /* tabela ocupa 100% da largura */
        }
        .section {
          margin-top: 40px;
          width: 100%;
        }
      `}</style>

      <div className="container">
        <h1 className="title">----</h1>

        <div className="card">
          <div className="filtros-wrapper">
            <FiltrosRelatorio onFiltroChange={setFiltros} />
          </div>

          <div className="tabs">
            {["abastecimentos", "viagens", "desempenho"].map((aba) => (
              <button
                key={aba}
                onClick={() => {
                  setAbaAtual(aba);
                  
                }}
                className={`tab-button ${abaAtual === aba ? "active" : ""}`}
                type="button"
              >
                {aba.charAt(0).toUpperCase() + aba.slice(1)}
              </button>
            ))}
          </div>

         

          <div className="content-area">
            { abaAtual === "abastecimentos" && <TabelaAbastecimentos filtros={filtros} />}
            {abaAtual === "viagens" && <TabelaViagens filtros={filtros} />}
            {abaAtual === "desempenho" && <TabelaDesempenho filtros={filtros} />}
          </div>

          <div className="section">
            <GraficosDashboard filtros={filtros} />
          </div>

          <div className="section">
            <ExportButtons filtros={filtros} aba={abaAtual} />
          </div>
        </div>
      </div>
    </>
  );
}
