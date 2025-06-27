import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import dayjs from "dayjs";

export default function TabelaAbastecimentos({ filtros }) {
  const [dados, setDados] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  useEffect(() => {
    const fetchAbastecimentos = async () => {
      try {
        const [absSnap, motoristasSnap, veiculosSnap, postosSnap] =
          await Promise.all([
            getDocs(collection(db, "abastecimentos")),
            getDocs(collection(db, "motoristas")),
            getDocs(collection(db, "veiculos")),
            getDocs(collection(db, "fornecedores")),
          ]);

        // Mapas para pegar nome/placa/razaoSocial a partir do ID
        const motoristasMap = {};
        motoristasSnap.docs.forEach((doc) => {
          motoristasMap[doc.id] = doc.data().nome;
        });

        const veiculosMap = {};
        veiculosSnap.docs.forEach((doc) => {
          veiculosMap[doc.id] = doc.data().placa;
        });

        const postosMap = {};
        postosSnap.docs.forEach((doc) => {
          postosMap[doc.id] = doc.data().razaoSocial;
        });

        // Montar lista básica com dados do Firestore
        const listaRaw = absSnap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            motoristaId: d.motorista,
            veiculoId: d.caminhao,
            postoId: d.fornecedor,
            data: d.dataHora, // string no formato "YYYY-MM-DD"
            litros: d.litros || 0,
            valorTotal: d.valorTotal || 0,
            kmAbastecimento: d.kmAbastecimento || 0,
          };
        });

        // Ordenar por veículo e data crescente
        listaRaw.sort((a, b) => {
          if (a.veiculoId === b.veiculoId) {
            return dayjs(a.data).isBefore(dayjs(b.data)) ? -1 : 1;
          }
          return a.veiculoId.localeCompare(b.veiculoId);
        });

        // Calcular média km/l para cada abastecimento baseado no anterior do mesmo veículo
        const listaComMedia = listaRaw.map((item, idx, arr) => {
          // Procura o último abastecimento do mesmo veículo antes deste
          let anteriorIndex = -1;
          for (let i = idx - 1; i >= 0; i--) {
            if (arr[i].veiculoId === item.veiculoId) {
              anteriorIndex = i;
              break;
            }
          }

          if (anteriorIndex === -1) return { ...item, media: null };

          const anterior = arr[anteriorIndex];
          const kmRodados = item.kmAbastecimento - anterior.kmAbastecimento;
          const litrosConsumidos = item.litros;

          if (kmRodados > 0 && litrosConsumidos > 0) {
            return { ...item, media: kmRodados / litrosConsumidos };
          }

          return { ...item, media: null };
        });

        // Mapear nomes para exibição
        const lista = listaComMedia.map((item) => ({
          ...item,
          nomeMotorista: motoristasMap[item.motoristaId] || "Desconhecido",
          placaVeiculo: veiculosMap[item.veiculoId] || "Desconhecido",
          nomePosto: postosMap[item.postoId] || "Desconhecido",
        }));

        // Aplicar filtros
        const filtrado = lista.filter((item) => {
          const data = dayjs(item.data);
          const dentroPeriodo =
            (!filtros.dataInicio ||
              data.isAfter(dayjs(filtros.dataInicio).subtract(1, "day"))) &&
            (!filtros.dataFim || data.isBefore(dayjs(filtros.dataFim).add(1, "day")));
          const motoristaOk =
            !filtros.motorista || item.motoristaId === filtros.motorista;
          const veiculoOk =
            !filtros.veiculo || item.veiculoId === filtros.veiculo;
          return dentroPeriodo && motoristaOk && veiculoOk;
        });

        setDados(filtrado);
        setPaginaAtual(1);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchAbastecimentos();
  }, [filtros]);

  const totalPaginas = Math.ceil(dados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const dadosPagina = dados.slice(inicio, fim);

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

      <div className="table-container" role="region" aria-label="Tabela de Abastecimentos">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Motorista</th>
              <th>Veículo</th>
              <th>Posto</th>
              <th>Litros</th>
              <th>Valor Total</th>
              <th>Média KM/L</th>
            </tr>
          </thead>
          <tbody>
            {dadosPagina.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                  Nenhum dado encontrado.
                </td>
              </tr>
            ) : (
              dadosPagina.map((item) => (
                <tr key={item.id}>
                  <td>{item.data ? dayjs(item.data).format("DD/MM/YYYY") : "Sem data"}</td>
                  <td>{item.nomeMotorista}</td>
                  <td>{item.placaVeiculo}</td>
                  <td>{item.nomePosto}</td>
                  <td>{item.litros.toFixed(2)}</td>
                  <td>R$ {item.valorTotal.toFixed(2)}</td>
                  <td>{item.media !== null ? item.media.toFixed(2) + " km/l" : "—"}</td>
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
