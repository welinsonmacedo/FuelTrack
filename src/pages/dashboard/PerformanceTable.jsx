import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import dayjs from "dayjs";

export default function TabelaDesempenho({ filtros }) {
  const [ranking, setRanking] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  useEffect(() => {
    const fetchDesempenho = async () => {
      const snapshot = await getDocs(collection(db, "abastecimentos"));
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const filtrado = lista.filter((item) => {
        const data = dayjs(item.data);
        const dentroPeriodo =
          (!filtros.dataInicio || data.isAfter(dayjs(filtros.dataInicio).subtract(1, "day"))) &&
          (!filtros.dataFim || data.isBefore(dayjs(filtros.dataFim).add(1, "day")));
        const motoristaOk = !filtros.motorista || item.motorista === filtros.motorista;
        const veiculoOk = !filtros.veiculo || item.veiculo === filtros.veiculo;
        return dentroPeriodo && motoristaOk && veiculoOk;
      });

      const agrupado = {};
      filtrado.forEach((item) => {
        if (!agrupado[item.motorista]) {
          agrupado[item.motorista] = { litros: 0, km: 0, total: 0 };
        }
        agrupado[item.motorista].litros += parseFloat(item.litros);
        agrupado[item.motorista].km += parseFloat(item.kmRodado || 0);
        agrupado[item.motorista].total += parseFloat(item.valorTotal);
      });

      const resultado = Object.entries(agrupado)
        .map(([motorista, dados]) => ({
          motorista,
          media: dados.km && dados.litros ? dados.km / dados.litros : 0,
          custoKm: dados.km ? dados.total / dados.km : 0,
        }))
        .sort((a, b) => a.media - b.media);

      setRanking(resultado);
      setPaginaAtual(1); // resetar página ao filtrar
    };

    fetchDesempenho();
  }, [filtros]);

  // Paginação
  const totalPaginas = Math.ceil(ranking.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const dadosPagina = ranking.slice(inicio, fim);

  function mudarPagina(novaPagina) {
    if (novaPagina < 1 || novaPagina > totalPaginas) return;
    setPaginaAtual(novaPagina);
  }

  return (
    <>
      <style>{`
        .table-container {
          overflow-x: auto;
          margin-top: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-family: Arial, sans-serif;
          font-size: 1rem;
          color: #374151;
          box-shadow: 0 2px 8px rgb(0 0 0 / 0.05);
          border-radius: 8px;
          overflow: hidden;
        }
        th, td {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          text-align: left;
        }
        th {
          background-color: #f3f4f6;
          font-weight: 700;
          color: #111827;
          position: sticky;
          top: 0;
          z-index: 1;
        }
        tr:hover {
          background-color: #f9fafb;
        }
        .pagination {
          margin-top: 12px;
          display: flex;
          justify-content: center;
          gap: 8px;
          user-select: none;
        }
        .page-btn {
          padding: 8px 14px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: white;
          color: #374151;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s ease;
        }
        .page-btn:hover:not(.disabled) {
          background-color: #2563eb;
          color: white;
          border-color: #2563eb;
        }
        .page-btn.disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        .page-info {
          padding: 8px 14px;
          color: #6b7280;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Motorista</th>
              <th>Média KM/L</th>
              <th>Custo por KM</th>
            </tr>
          </thead>
          <tbody>
            {dadosPagina.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                  Nenhum dado encontrado.
                </td>
              </tr>
            ) : (
              dadosPagina.map((item, index) => (
                <tr key={index}>
                  <td>{item.motorista}</td>
                  <td>{item.media.toFixed(2)} km/L</td>
                  <td>R$ {item.custoKm.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination" aria-label="Paginação da tabela">
        <button
          className={`page-btn ${paginaAtual === 1 ? "disabled" : ""}`}
          onClick={() => mudarPagina(paginaAtual - 1)}
          disabled={paginaAtual === 1}
          aria-label="Página anterior"
        >
          &lt; Anterior
        </button>
        <span className="page-info">
          Página {paginaAtual} de {totalPaginas || 1}
        </span>
        <button
          className={`page-btn ${paginaAtual === totalPaginas ? "disabled" : ""}`}
          onClick={() => mudarPagina(paginaAtual + 1)}
          disabled={paginaAtual === totalPaginas}
          aria-label="Próxima página"
        >
          Próxima &gt;
        </button>
      </div>
    </>
  );
}
