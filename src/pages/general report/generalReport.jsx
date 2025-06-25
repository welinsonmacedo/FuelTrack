 
import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase"; // Certifique-se de que o caminho para o firebase.js está correto
import jsPDF from "jspdf";
import "jspdf-autotable" // Importar jspdf-autotable para funcionalidades de tabela no PDF
import "./style.css"; // Se você tiver um arquivo CSS separado
// --- Styles (Definição dos estilos em um objeto JavaScript) ---
const styles = {
  pageContainer: {
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f4f7ff", // Um azul claro suave
    color: "#333",
    minHeight: "100vh",
  },
  pageTitle: {
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "2.5em",
    fontWeight: "600",
  },
  tabsContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "20px",
    borderBottom: "2px solid #e0e0e0",
    paddingBottom: "5px",
    gap: "10px", // Espaçamento entre os botões das abas
  },
  tab: {
    backgroundColor: "#f0f0f0",
    border: "1px solid #ddd",
    borderRadius: "5px 5px 0 0",
    padding: "10px 15px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "background-color 0.3s, color 0.3s, border-color 0.3s",
    "&:hover": {
      backgroundColor: "#e9e9e9",
    },
  },
  tabActive: {
    backgroundColor: "#007bff",
    color: "white",
    border: "1px solid #007bff",
    borderRadius: "5px 5px 0 0",
    padding: "10px 15px",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 -2px 8px rgba(0, 123, 255, 0.2)", // Sombra para aba ativa
  },
  filtrosContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    alignItems: "flex-end", // Alinha os itens à base
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#555",
    fontSize: "0.9em",
  },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "1em",
    width: "180px", // Largura padrão para inputs
    boxSizing: "border-box", // Inclui o padding na largura total
  },
  select: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "1em",
    width: "200px", // Um pouco mais largo para selects
    backgroundColor: "#fff",
    cursor: "pointer",
  },
  btnLimpar: {
    backgroundColor: "#dc3545", // Vermelho
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "10px 15px",
    cursor: "pointer",
    fontSize: "1em",
    fontWeight: "bold",
    transition: "background-color 0.3s",
    "&:hover": {
      backgroundColor: "#c82333",
    },
    alignSelf: 'flex-end',
  },
  contentArea: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  loadingText: {
    textAlign: "center",
    fontSize: "1.2em",
    color: "#007bff",
    padding: "40px 0",
  },
  tableContainer: {
    overflowX: "auto", // Permite rolagem horizontal para tabelas grandes
    marginTop: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
  },
  th: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "12px",
    textAlign: "left",
    borderBottom: "1px solid #ddd",
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #eee",
    textAlign: "left",
    fontSize: "0.95em",
  },
  tr: {
    "&:nth-child(even)": {
      backgroundColor: "#f9f9f9",
    },
    "&:hover": {
        backgroundColor: "#f1f1f1",
    }
  },
  btnPdf: {
    backgroundColor: "#28a745", // Verde para exportar PDF
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "10px 20px",
    cursor: "pointer",
    fontSize: "1em",
    fontWeight: "bold",
    marginTop: "20px",
    transition: "background-color 0.3s",
    "&:hover": {
      backgroundColor: "#218838",
    },
  },
  summaryContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", // Ajuste para telas menores
    gap: "20px",
    marginBottom: "20px",
  },
  summaryBox: {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
    borderLeft: "5px solid #007bff", // Borda colorida para destaque
  },
  summaryTitle: {
    color: "#007bff",
    borderBottom: "1px solid #ddd",
    paddingBottom: "8px",
    marginBottom: "15px",
  },
  list: {
    margin: "5px 0 0 15px",
    padding: 0,
    listStyleType: "disc",
  },
  infoText: {
    textAlign: "center",
    padding: "20px",
    color: "#666",
  }
};

// --- Componente principal RelatoriosFrota ---
export default function RelatoriosFrota() {
  // --- Estados ---
  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [viagens, setViagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const [abaAtiva, setAbaAtiva] = useState("ranking"); // Aba inicial
  const [dataInicioFiltro, setDataInicioFiltro] = useState("");
  const [dataFimFiltro, setDataFimFiltro] = useState("");
  const [filtroMotorista, setFiltroMotorista] = useState("");
  const [filtroVeiculo, setFiltroVeiculo] = useState("");

  // --- Efeito para detectar tamanho da tela (responsividade) ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Normalização de datas de Firestore Timestamp para Date objects ---
  const normalizarData = (d) => (d?.toDate ? d.toDate() : d ? new Date(d) : null);

  // --- Função para buscar abastecimentos de viagens específicas ---
  async function fetchAbastecimentosDasViagens(viagensIds) {
    if (viagensIds.length === 0) return {};

    const abastecimentosPorViagem = {};
    const batchSize = 10; // Firebase 'in' query limite é 10
    for (let i = 0; i < viagensIds.length; i += batchSize) {
      const batch = viagensIds.slice(i, i + batchSize);
      const q = query(
        collection(db, "abastecimentos"),
        where("viagemId", "in", batch)
      );
      const snap = await getDocs(q);
      snap.docs.forEach((doc) => {
        const abastecimento = doc.data();
        if (!abastecimentosPorViagem[abastecimento.viagemId]) {
          abastecimentosPorViagem[abastecimento.viagemId] = [];
        }
        abastecimentosPorViagem[abastecimento.viagemId].push({ id: doc.id, ...abastecimento });
      });
    }
    return abastecimentosPorViagem;
  }

  // --- Função para buscar manutenções de veículos específicos ---
  async function fetchManutencoesDosVeiculos(veiculosIds) {
    if (veiculosIds.length === 0) return [];
    const uniqueVeiculosIds = [...new Set(veiculosIds)]; // Remove duplicatas

    const allManutencoes = [];
    const batchSize = 10;
    for (let i = 0; i < uniqueVeiculosIds.length; i += batchSize) {
      const batch = uniqueVeiculosIds.slice(i, i + batchSize);
      const q = query(
        collection(db, "manutencoes"),
        where("veiculoId", "in", batch)
      );
      const snap = await getDocs(q);
      snap.docs.forEach(doc => allManutencoes.push({ id: doc.id, ...doc.data() }));
    }
    return allManutencoes;
  }

  // --- Efeito para carregar todos os dados iniciais ---
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [
          motoristasSnap,
          veiculosSnap,
          fornecedoresSnap,
          // Manutenções e Viagens serão carregadas e filtradas no useEffect abaixo
        ] = await Promise.all([
          getDocs(collection(db, "motoristas")),
          getDocs(collection(db, "veiculos")),
          getDocs(collection(db, "fornecedores")),
        ]);

        setMotoristas(motoristasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setVeiculos(veiculosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setFornecedores(fornecedoresSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      } finally {
        setLoading(false); // Define como false após a primeira carga
      }
    }
    fetchData();
  }, []);

  // --- Efeito para aplicar filtros e calcular custos (executa em mudanças de filtro) ---
  useEffect(() => {
    async function fetchViagensFiltradas() {
      setLoading(true);

      try {
        let qRef = collection(db, "viagens");
        const filtrosFirestore = [];

        if (filtroMotorista) filtrosFirestore.push(where("motorista", "==", filtroMotorista));
        if (filtroVeiculo) filtrosFirestore.push(where("caminhao", "==", filtroVeiculo));
        if (dataInicioFiltro) filtrosFirestore.push(where("dataInicio", ">=", new Date(dataInicioFiltro)));
        if (dataFimFiltro) filtrosFirestore.push(where("dataFim", "<=", new Date(dataFimFiltro)));

        // Adiciona orderBy se não houver um filtro de range que impeça (Firebase limita)
        if (filtrosFirestore.length === 0 || !dataInicioFiltro) { // Simplificado para fins de exemplo
            qRef = query(qRef, ...filtrosFirestore, orderBy("dataInicio", "desc"));
        } else {
            qRef = query(qRef, ...filtrosFirestore);
        }

        const snap = await getDocs(qRef);
        let viagensProcessadas = snap.docs.map((doc) => {
          const viagem = { id: doc.id, ...doc.data() };
          viagem.dataInicio = normalizarData(viagem.dataInicio);
          viagem.dataFim = normalizarData(viagem.dataFim);
          return viagem;
        });

        const viagensIds = viagensProcessadas.map(v => v.id);
        const veiculosIdsDasViagens = [...new Set(viagensProcessadas.map(v => v.caminhao).filter(Boolean))];

        const [abastecimentosMap, allManutencoes] = await Promise.all([
          fetchAbastecimentosDasViagens(viagensIds),
          fetchManutencoesDosVeiculos(veiculosIdsDasViagens)
        ]);

        setManutencoes(allManutencoes); // Atualiza o estado de manutenções

        // Calcular custos totais para cada viagem
        const viagensCompletas = viagensProcessadas.map((viagem) => {
          const abastecimentos = abastecimentosMap[viagem.id] || [];

          // Cálculos de combustível
          const litrosTotal = abastecimentos.reduce((sum, a) => sum + (a.litros || 0), 0);
          const custoCombustivel = abastecimentos.reduce(
            (sum, a) => sum + (a.precoLitro ?? 0) * (a.litros ?? 0),
            0
          );

          // Cálculos de manutenção para este veículo (filtrando pelo veiculoId da viagem)
          const manutencoesVeiculoDaViagem = allManutencoes.filter(m => m.veiculoId === viagem.caminhao);
          const custoManutencao = manutencoesVeiculoDaViagem.reduce(
            (sum, m) => sum + (m.custo || 0),
            0
          );

          // Cálculo de depreciação (simplificado - 1% do valor do veículo por 1.000 km)
          const veiculo = veiculos.find(v => v.id === viagem.caminhao);
          const kmRodados = (viagem.kmFinal || 0) - (viagem.kmInicial || 0);
          const custoDepreciacao = veiculo?.valor
            ? (parseFloat(veiculo.valor) * 0.01 * kmRodados) / 1000
            : 0; // Garantir que veiculo.valor é um número

          return {
            ...viagem,
            abastecimentos,
            litros: litrosTotal,
            kmRodados,
            custoCombustivel,
            custoManutencao,
            custoDepreciacao,
            custoTotal: custoCombustivel + custoManutencao + custoDepreciacao,
            eficiencia: litrosTotal > 0 ? kmRodados / litrosTotal : 0
          };
        });

        setViagens(viagensCompletas);

      } catch (error) {
        console.error("Erro ao carregar e processar viagens:", error);
      } finally {
        setLoading(false);
      }
    }

    // Executa a busca de viagens filtradas sempre que os filtros ou a lista de veículos (para depreciação) muda
    fetchViagensFiltradas();
  }, [filtroMotorista, filtroVeiculo, dataInicioFiltro, dataFimFiltro, veiculos]);


  // --- Funções auxiliares para obter nomes e informações de IDs ---
  const nomeMotorista = (id) => motoristas.find((m) => m.id === id)?.nome || "Desconhecido";
  const nomeFornecedor = (id) => fornecedores.find((f) => f.id === id)?.nomeFantasia || "Desconhecido";

  const infoVeiculo = (id) => {
    const v = veiculos.find((v) => v.id === id);
    return v ? `${v.placa} - ${v.modelo} (${v.ano})` : "Desconhecido";
  };

  // --- Cálculos principais da frota (para o Resumo do Período) ---
  const calcularMetricasFrota = () => {
    if (viagens.length === 0) {
        return {
            consumoTotalLitros: 0, kmTotalRodado: 0, custoCombustivel: 0,
            custoManutencao: 0, custoDepreciacao: 0, custoTotal: 0,
            consumoMedioKmL: 0, custoPorKm: 0, disponibilidade: 0,
            totalViagens: 0, diasOperacionais: 0
        };
    }

    const consumoTotalLitros = viagens.reduce((acc, v) => acc + (v.litros || 0), 0);
    const kmTotalRodado = viagens.reduce((acc, v) => acc + (v.kmRodados || 0), 0);

    // Custos totais agregados das viagens já processadas
    const custoCombustivel = viagens.reduce((acc, v) => acc + (v.custoCombustivel || 0), 0);
    const custoManutencao = viagens.reduce((acc, v) => acc + (v.custoManutencao || 0), 0);
    const custoDepreciacao = viagens.reduce((acc, v) => acc + (v.custoDepreciacao || 0), 0);
    const custoTotal = custoCombustivel + custoManutencao + custoDepreciacao;

    // Eficiência
    const consumoMedioKmL = consumoTotalLitros > 0 ? kmTotalRodado / consumoTotalLitros : 0;
    const custoPorKm = kmTotalRodado > 0 ? custoTotal / kmTotalRodado : 0;

    // Disponibilidade (simplificada: dias com viagens / total de dias no período)
    const datasViagens = new Set();
    viagens.forEach(v => {
        if (v.dataInicio) datasViagens.add(v.dataInicio.toDateString());
        if (v.dataFim && v.dataInicio?.toDateString() !== v.dataFim?.toDateString()) { // Conta se a viagem durou mais de um dia
            const start = new Date(v.dataInicio);
            const end = new Date(v.dataFim);
            for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
                datasViagens.add(new Date(d).toDateString());
            }
        }
    });

    const diasOperacionais = datasViagens.size;
    let diasNoPeriodo = 0;
    if (dataInicioFiltro && dataFimFiltro) {
        const start = new Date(dataInicioFiltro);
        const end = new Date(dataFimFiltro);
        diasNoPeriodo = (end - start) / (1000 * 60 * 60 * 24) + 1;
    } else {
        // Se não há filtro de data, use um período default ou o range de datas das viagens
        if (viagens.length > 0) {
            const minDate = new Date(Math.min(...viagens.map(v => v.dataInicio?.getTime()).filter(Boolean)));
            const maxDate = new Date(Math.max(...viagens.map(v => v.dataFim?.getTime()).filter(Boolean)));
            if (minDate && maxDate && !isNaN(minDate) && !isNaN(maxDate)) {
                 diasNoPeriodo = (maxDate - minDate) / (1000 * 60 * 60 * 24) + 1;
            } else {
                diasNoPeriodo = 30; // Fallback
            }
        } else {
            diasNoPeriodo = 30; // Fallback
        }
    }

    const disponibilidade = diasNoPeriodo > 0 ? (diasOperacionais / diasNoPeriodo) * 100 : 0;

    return {
      consumoTotalLitros,
      kmTotalRodado,
      custoCombustivel,
      custoManutencao,
      custoDepreciacao,
      custoTotal,
      consumoMedioKmL,
      custoPorKm,
      disponibilidade,
      totalViagens: viagens.length,
      diasOperacionais
    };
  };

  const metricasFrota = calcularMetricasFrota();

  // --- Ranking de Motoristas ---
  const rankingMotoristas = (() => {
    const map = {};

    viagens.forEach((v) => {
      if (!v.motorista) return;

      const id = v.motorista;
      if (!map[id]) {
        map[id] = {
          motoristaId: id,
          litros: 0,
          km: 0,
          custoCombustivel: 0,
          custoTotal: 0,
          viagens: 0,
          tempoConducao: 0, // em horas
        };
      }

      map[id].litros += v.litros || 0;
      map[id].km += v.kmRodados || 0;
      map[id].custoCombustivel += v.custoCombustivel || 0;
      map[id].custoTotal += v.custoTotal || 0;
      map[id].viagens += 1;

      // Calcular tempo de condução (horas)
      if (v.dataInicio && v.dataFim) {
        const horas = (v.dataFim.getTime() - v.dataInicio.getTime()) / (1000 * 60 * 60);
        map[id].tempoConducao += horas;
      }
    });

    return Object.values(map)
      .map((item) => {
        const consumoMedio = item.litros > 0 ? item.km / item.litros : 0; // km/litro
        const custoKm = item.km > 0 ? item.custoTotal / item.km : 0; // Custo por km
        const kmPorHora = item.tempoConducao > 0 ? item.km / item.tempoConducao : 0; // km/h

        return {
          motorista: nomeMotorista(item.motoristaId),
          litros: item.litros,
          km: item.km,
          viagens: item.viagens,
          tempoConducao: item.tempoConducao,
          kmPorHora,
          custoCombustivel: item.custoCombustivel,
          custoTotal: item.custoTotal,
          consumoMedio,
          custoPorKm: custoKm,
        };
      })
      .sort((a, b) => b.km - a.km); // Ordena por Km rodado (pode ser ajustado)
  })();

  // --- Ranking de Veículos ---
  const rankingVeiculos = (() => {
    const map = {};

    viagens.forEach((v) => {
      if (!v.caminhao) return;

      const id = v.caminhao;
      if (!map[id]) {
        map[id] = {
          veiculoId: id,
          litros: 0,
          km: 0,
          custoCombustivel: 0,
          custoManutencao: 0,
          custoDepreciacao: 0,
          custoTotal: 0,
          viagens: 0,
          avarias: 0,
        };
      }

      map[id].litros += v.litros || 0;
      map[id].km += v.kmRodados || 0;
      map[id].custoCombustivel += v.custoCombustivel || 0;
      map[id].custoManutencao += v.custoManutencao || 0; // Manutenção já calculada por viagem
      map[id].custoDepreciacao += v.custoDepreciacao || 0; // Depreciação já calculada por viagem
      map[id].custoTotal += v.custoTotal || 0;
      map[id].viagens += 1;
    });

    // Contar avarias por veículo (diretamente do estado de manutenções)
    manutencoes.forEach((m) => {
      if (m.veiculoId && m.tipo === "avaria") { // Supondo que você tenha um campo 'tipo' em manutenções
        if (!map[m.veiculoId]) {
          map[m.veiculoId] = { veiculoId: m.veiculoId, avarias: 0, litros: 0, km: 0, custoCombustivel: 0, custoManutencao: 0, custoDepreciacao: 0, custoTotal: 0, viagens: 0 }; // Inicializa se não houver viagens para o veículo
        }
        map[m.veiculoId].avarias += 1;
      }
    });

    return Object.values(map)
      .map((item) => {
        const veiculoData = veiculos.find(v => v.id === item.veiculoId) || {};
        const consumoMedio = item.litros > 0 ? item.km / item.litros : 0; // km/litro
        const custoKm = item.km > 0 ? item.custoTotal / item.km : 0; // Custo por km
        const indiceAvarias = item.km > 0 ? (item.avarias / item.km) * 1000 : 0; // avarias por 1.000 km

        return {
          veiculo: infoVeiculo(item.veiculoId),
          modelo: veiculoData.modelo || 'N/A',
          ano: veiculoData.ano || 'N/A',
          litros: item.litros,
          km: item.km,
          viagens: item.viagens,
          custoCombustivel: item.custoCombustivel,
          custoManutencao: item.custoManutencao,
          custoDepreciacao: item.custoDepreciacao,
          custoTotal: item.custoTotal,
          consumoMedio,
          custoPorKm: custoKm,
          avarias: item.avarias,
          indiceAvarias,
          vidaUtil: veiculoData.vidaUtilKm || 0, // Supondo que o campo é 'vidaUtilKm'
          kmRestante: veiculoData.vidaUtilKm ? Math.max(0, veiculoData.vidaUtilKm - item.km) : 0,
        };
      })
      .sort((a, b) => b.km - a.km); // Ordena por Km rodado
  })();

  // --- Custo por Fornecedor ---
  const custoPorFornecedor = (() => {
    const map = {};

    viagens.forEach((v) => {
      if (!v.abastecimentos || v.abastecimentos.length === 0) return;

      v.abastecimentos.forEach((abastecimento) => {
        const fornecedorId = abastecimento.fornecedor; // Supondo que o abastecimento tem o ID do fornecedor
        if (!fornecedorId) return;

        const custo = abastecimento.valor ||
                      (abastecimento.precoLitro && abastecimento.litros
                      ? abastecimento.precoLitro * abastecimento.litros
                      : 0);

        if (!map[fornecedorId]) {
          map[fornecedorId] = {
            fornecedorId,
            custo: 0,
            litros: 0,
            abastecimentosCount: 0, // Renomeado para evitar conflito com 'abastecimentos' array
          };
        }

        map[fornecedorId].custo += custo;
        map[fornecedorId].litros += abastecimento.litros || 0;
        map[fornecedorId].abastecimentosCount += 1;
      });
    });

    // Calcular preço médio e mapear para o formato final
    return Object.values(map)
      .map(item => ({
        fornecedorNome: nomeFornecedor(item.fornecedorId),
        custo: item.custo,
        litros: item.litros,
        abastecimentos: item.abastecimentosCount,
        precoMedioLitro: item.litros > 0 ? item.custo / item.litros : 0,
      }))
      .sort((a, b) => b.custo - a.custo); // Ordena por custo total
  })();

  // --- Média por Viagem ---
  const mediaPorViagem = (() => {
    if (viagens.length === 0) {
      return {
        litros: 0, km: 0, custo: 0, eficiencia: 0,
        tempoMedio: 0, velocidadeMedia: 0
      };
    }

    const totalViagens = viagens.length;
    const totalLitros = viagens.reduce((acc, v) => acc + (v.litros || 0), 0);
    const totalKm = viagens.reduce((acc, v) => acc + (v.kmRodados || 0), 0);
    const totalCusto = viagens.reduce((acc, v) => acc + (v.custoTotal || 0), 0);
    const totalTempoConducao = viagens.reduce((acc, v) => {
      if (v.dataInicio && v.dataFim) {
        return acc + (v.dataFim.getTime() - v.dataInicio.getTime());
      }
      return acc;
    }, 0) / (1000 * 60 * 60); // Converter para horas

    return {
      litros: totalLitros / totalViagens,
      km: totalKm / totalViagens,
      custo: totalCusto / totalViagens,
      eficiencia: totalLitros > 0 ? totalKm / totalLitros : 0, // km/litro
      tempoMedio: totalTempoConducao / totalViagens, // horas por viagem
      velocidadeMedia: totalTempoConducao > 0 ? totalKm / totalTempoConducao : 0 // km/h
    };
  })();

  // --- Exportar para PDF (com jspdf-autotable) ---
  const exportarPDF = (titulo, colunas, linhas, orientacao = 'portrait') => {
    const doc = new jsPDF({
      orientation: orientacao,
      unit: 'mm',
      format: 'a4'
    });

    // Título do documento
    doc.setFontSize(18);
    doc.text(titulo, 14, 20);

    // Período do relatório
    if (dataInicioFiltro || dataFimFiltro) {
      doc.setFontSize(10);
      const inicio = dataInicioFiltro ? new Date(dataInicioFiltro).toLocaleDateString('pt-BR') : 'Início';
      const fim = dataFimFiltro ? new Date(dataFimFiltro).toLocaleDateString('pt-BR') : 'Fim';
      doc.text(`Período: ${inicio} a ${fim}`, 14, 28);
    }

    // Gerar tabela com autoTable
    doc.autoTable({
      startY: dataInicioFiltro || dataFimFiltro ? 35 : 28, // Ajusta a posição inicial Y se houver período
      head: [colunas],
      body: linhas,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [0, 123, 255], // Cor azul para o cabeçalho
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [249, 249, 249] // Cor para linhas alternadas
      },
      margin: { top: 10, right: 14, bottom: 10, left: 14 },
    });

    // Rodapé com data de emissão
    const pageCount = doc.internal.pages.length;
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
        doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 14, doc.internal.pageSize.height - 10);
    }

    doc.save(`${titulo.toLowerCase().replace(/\s/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // --- Subcomponentes para renderização de tabelas/resumos ---

  // Ranking de Motoristas
  const RankingMotoristas = ({ data, isMobile, onExport }) => (
    <div>
      <h2>Ranking de Motoristas</h2>
      {data.length === 0 ? (
        <p style={styles.infoText}>Nenhum dado de motorista encontrado para os filtros aplicados.</p>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Motorista</th>
                {!isMobile && <th style={styles.th}>Viagens</th>}
                <th style={styles.th}>Km Rodados</th>
                {!isMobile && <th style={styles.th}>Litros</th>}
                <th style={styles.th}>Consumo Médio (km/l)</th>
                <th style={styles.th}>Custo Total (R$)</th>
                {!isMobile && <th style={styles.th}>Custo/Km (R$)</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} style={styles.tr}>
                  <td style={styles.td}>{item.motorista}</td>
                  {!isMobile && <td style={styles.td}>{item.viagens}</td>}
                  <td style={styles.td}>{item.km.toFixed(0)}</td>
                  {!isMobile && <td style={styles.td}>{item.litros.toFixed(2)}</td>}
                  <td style={styles.td}>{item.consumoMedio.toFixed(2)}</td>
                  <td style={styles.td}>{item.custoTotal.toFixed(2)}</td>
                  {!isMobile && <td style={styles.td}>{item.custoPorKm.toFixed(4)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button style={styles.btnPdf} onClick={onExport}>
        Exportar Ranking Motoristas PDF
      </button>
    </div>
  );

  // Ranking de Veículos
  const RankingVeiculos = ({ data, isMobile, onExport }) => (
    <div>
      <h2>Ranking de Veículos</h2>
      {data.length === 0 ? (
        <p style={styles.infoText}>Nenhum dado de veículo encontrado para os filtros aplicados.</p>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Veículo</th>
                {!isMobile && <th style={styles.th}>Km Rodados</th>}
                <th style={styles.th}>Consumo Médio (km/l)</th>
                <th style={styles.th}>Custo Total (R$)</th>
                {!isMobile && <th style={styles.th}>Custo/Km (R$)</th>}
                <th style={styles.th}>Avarias</th>
                {!isMobile && <th style={styles.th}>Km p/ Avaria (por 1000km)</th>}
                {!isMobile && <th style={styles.th}>Vida Útil Restante (Km)</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} style={styles.tr}>
                  <td style={styles.td}>{item.veiculo}</td>
                  {!isMobile && <td style={styles.td}>{item.km.toFixed(0)}</td>}
                  <td style={styles.td}>{item.consumoMedio.toFixed(2)}</td>
                  <td style={styles.td}>{item.custoTotal.toFixed(2)}</td>
                  {!isMobile && <td style={styles.td}>{item.custoPorKm.toFixed(4)}</td>}
                  <td style={styles.td}>{item.avarias}</td>
                  {!isMobile && <td style={styles.td}>{item.indiceAvarias.toFixed(2)}</td>}
                  {!isMobile && <td style={styles.td}>{item.vidaUtil ? item.kmRestante.toFixed(0) : 'N/A'}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button style={styles.btnPdf} onClick={onExport}>
        Exportar Ranking Veículos PDF
      </button>
    </div>
  );

  // Custo por Fornecedor
  const CustoFornecedor = ({ data, onExport }) => (
    <div>
      <h2>Custo por Fornecedor (Abastecimentos)</h2>
      {data.length === 0 ? (
        <p style={styles.infoText}>Nenhum dado de custo por fornecedor encontrado para os filtros aplicados.</p>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Fornecedor</th>
                <th style={styles.th}>Qtd. Abastecimentos</th>
                <th style={styles.th}>Litros Comprados</th>
                <th style={styles.th}>Preço Médio/Litro (R$)</th>
                <th style={styles.th}>Custo Total (R$)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} style={styles.tr}>
                  <td style={styles.td}>{item.fornecedorNome}</td>
                  <td style={styles.td}>{item.abastecimentos}</td>
                  <td style={styles.td}>{item.litros.toFixed(2)}</td>
                  <td style={styles.td}>{item.precoMedioLitro.toFixed(3)}</td>
                  <td style={styles.td}>{item.custo.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button style={styles.btnPdf} onClick={onExport}>
        Exportar Custo Fornecedor PDF
      </button>
    </div>
  );

  // Média por Viagem
  const MediaViagem = ({ data, onExport }) => (
    <div>
      <h2>Média por Viagem</h2>
      {viagens.length === 0 ? (
        <p style={styles.infoText}>Nenhum dado de viagem encontrado para calcular a média.</p>
      ) : (
        <div style={styles.summaryContainer}>
          <div style={styles.summaryBox}>
            <h3 style={styles.summaryTitle}>Métricas Médias</h3>
            <p><strong>Km médio por viagem:</strong> {data.km.toFixed(1)} km</p>
            <p><strong>Litros médio por viagem:</strong> {data.litros.toFixed(2)} litros</p>
            <p><strong>Custo médio por viagem:</strong> R$ {data.custo.toFixed(2)}</p>
            <p><strong>Tempo médio por viagem:</strong> {data.tempoMedio.toFixed(1)} horas</p>
            <p><strong>Velocidade média:</strong> {data.velocidadeMedia.toFixed(1)} km/h</p>
            <p><strong>Eficiência média:</strong> {data.eficiencia.toFixed(2)} km/l</p>
          </div>
        </div>
      )}
      <button style={styles.btnPdf} onClick={onExport}>
        Exportar Média por Viagem PDF
      </button>
    </div>
  );

  // Viagens Detalhadas
  const ViagensDetalhadas = ({ data, isMobile, onExport }) => (
    <div>
      <h2>Viagens Detalhadas</h2>
      {data.length === 0 ? (
        <p style={styles.infoText}>Nenhuma viagem encontrada para os filtros aplicados.</p>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Motorista</th>
                <th style={styles.th}>Veículo</th>
                <th style={styles.th}>Data Início</th>
                {!isMobile && <th style={styles.th}>Data Fim</th>}
                <th style={styles.th}>Km Rodados</th>
                {!isMobile && <th style={styles.th}>Litros</th>}
                <th style={styles.th}>Custo Total (R$)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} style={styles.tr}>
                  <td style={styles.td}>{nomeMotorista(item.motorista)}</td>
                  <td style={styles.td}>{infoVeiculo(item.caminhao)}</td>
                  <td style={styles.td}>{item.dataInicio?.toLocaleDateString('pt-BR') || 'N/A'}</td>
                  {!isMobile && <td style={styles.td}>{item.dataFim?.toLocaleDateString('pt-BR') || 'N/A'}</td>}
                  <td style={styles.td}>{item.kmRodados.toFixed(0)}</td>
                  {!isMobile && <td style={styles.td}>{item.litros.toFixed(2)}</td>}
                  <td style={styles.td}>{item.custoTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button style={styles.btnPdf} onClick={onExport}>
        Exportar Viagens Detalhadas PDF
      </button>
    </div>
  );

  // --- Renderização Principal do Componente ---
  return (
    <div style={styles.pageContainer}>
      <h1 style={{ ...styles.pageTitle, fontSize: isMobile ? "1.8em" : "2.5em" }}>
        Relatório Completo de Frota
      </h1>

      {/* --- Abas de Navegação --- */}
      <div style={styles.tabsContainer}>
        <button
          style={abaAtiva === "ranking" ? styles.tabActive : styles.tab}
          onClick={() => setAbaAtiva("ranking")}
        >
          Ranking Motoristas
        </button>
        <button
          style={abaAtiva === "porVeiculo" ? styles.tabActive : styles.tab}
          onClick={() => setAbaAtiva("porVeiculo")}
        >
          Ranking Veículos
        </button>
        <button
          style={abaAtiva === "porPeriodo" ? styles.tabActive : styles.tab}
          onClick={() => setAbaAtiva("porPeriodo")}
        >
          Resumo Período
        </button>
        <button
          style={abaAtiva === "porViagem" ? styles.tabActive : styles.tab}
          onClick={() => setAbaAtiva("porViagem")}
        >
          Viagens Detalhadas
        </button>
        <button
          style={abaAtiva === "porFornecedor" ? styles.tabActive : styles.tab}
          onClick={() => setAbaAtiva("porFornecedor")}
        >
          Custo por Fornecedor
        </button>
        <button
          style={abaAtiva === "mediaViagem" ? styles.tabActive : styles.tab}
          onClick={() => setAbaAtiva("mediaViagem")}
        >
          Média por Viagem
        </button>
      </div>

      {/* --- Controles de Filtro --- */}
      <div style={styles.filtrosContainer}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Motorista:</label>
          <select
            style={styles.select}
            value={filtroMotorista}
            onChange={(e) => setFiltroMotorista(e.target.value)}
          >
            <option value="">Todos</option>
            {motoristas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Veículo:</label>
          <select
            style={styles.select}
            value={filtroVeiculo}
            onChange={(e) => setFiltroVeiculo(e.target.value)}
          >
            <option value="">Todos</option>
            {veiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placa} - {v.modelo}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Data Início:</label>
          <input
            type="date"
            value={dataInicioFiltro}
            onChange={(e) => setDataInicioFiltro(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Data Fim:</label>
          <input
            type="date"
            value={dataFimFiltro}
            onChange={(e) => setDataFimFiltro(e.target.value)}
            style={styles.input}
          />
        </div>
        <button
          style={styles.btnLimpar}
          onClick={() => {
            setFiltroMotorista("");
            setFiltroVeiculo("");
            setDataInicioFiltro("");
            setDataFimFiltro("");
          }}
        >
          Limpar Filtros
        </button>
      </div>

      <div style={styles.contentArea}>
        {loading && <p style={styles.loadingText}>Carregando dados...</p>}

        {!loading && (
          <>
            {abaAtiva === "ranking" && (
              <RankingMotoristas
                data={rankingMotoristas}
                isMobile={isMobile}
                onExport={() => exportarPDF(
                  "Ranking de Motoristas",
                  ["Motorista", "Viagens", "Km", "Litros", "Cons. Médio", "Custo Total"],
                  rankingMotoristas.map((r) => [
                    r.motorista,
                    r.viagens,
                    r.km.toFixed(0),
                    r.litros.toFixed(2),
                    r.consumoMedio.toFixed(2),
                    `R$ ${r.custoTotal.toFixed(2)}`
                  ]),
                  'landscape' // Orientação paisagem para mais colunas
                )}
              />
            )}

            {abaAtiva === "porVeiculo" && (
              <RankingVeiculos
                data={rankingVeiculos}
                isMobile={isMobile}
                onExport={() => exportarPDF(
                  "Ranking de Veículos",
                  ["Veículo", "Km", "Cons. Médio", "Custo Total", "Avarias", "Km p/ Avaria", "Vida Útil Restante"],
                  rankingVeiculos.map((r) => [
                    r.veiculo,
                    r.km.toFixed(0),
                    r.consumoMedio.toFixed(2),
                    `R$ ${r.custoTotal.toFixed(2)}`,
                    r.avarias,
                    r.indiceAvarias.toFixed(2),
                    r.vidaUtil ? `${r.kmRestante.toFixed(0)} km` : 'N/A'
                  ]),
                  'landscape'
                )}
              />
            )}

            {abaAtiva === "porPeriodo" && (
                <div>
                    <h2>Resumo do Período</h2>
                    {viagens.length === 0 ? (
                        <p style={styles.infoText}>Nenhum dado de viagem encontrado para o período selecionado.</p>
                    ) : (
                        <div style={styles.summaryContainer}>
                            <div style={styles.summaryBox}>
                                <h3 style={styles.summaryTitle}>Desempenho</h3>
                                <p><strong>Km Total Rodado:</strong> {metricasFrota.kmTotalRodado.toFixed(0)} km</p>
                                <p><strong>Consumo Total:</strong> {metricasFrota.consumoTotalLitros.toFixed(2)} litros</p>
                                <p><strong>Consumo Médio:</strong> {metricasFrota.consumoMedioKmL.toFixed(2)} km/l</p>
                                <p><strong>Disponibilidade:</strong> {metricasFrota.disponibilidade.toFixed(1)}%</p>
                            </div>

                            <div style={styles.summaryBox}>
                                <h3 style={styles.summaryTitle}>Custos</h3>
                                <p><strong>Combustível:</strong> R$ {metricasFrota.custoCombustivel.toFixed(2)}</p>
                                <p><strong>Manutenção:</strong> R$ {metricasFrota.custoManutencao.toFixed(2)}</p>
                                <p><strong>Depreciação:</strong> R$ {metricasFrota.custoDepreciacao.toFixed(2)}</p>
                                <p><strong>Custo Total:</strong> R$ {metricasFrota.custoTotal.toFixed(2)}</p>
                                <p><strong>Custo por Km:</strong> R$ {metricasFrota.custoPorKm.toFixed(4)}</p>
                            </div>

                            <div style={styles.summaryBox}>
                                <h3 style={styles.summaryTitle}>Operacional</h3>
                                <p><strong>Total Viagens:</strong> {metricasFrota.totalViagens}</p>
                                <p><strong>Dias Operacionais:</strong> {metricasFrota.diasOperacionais}</p>
                                <p><strong>Média por Viagem:</strong></p>
                                <ul style={styles.list}>
                                    <li>{mediaPorViagem.km?.toFixed(1)} km</li>
                                    <li>{mediaPorViagem.tempoMedio?.toFixed(1)} horas</li>
                                    <li>R$ {mediaPorViagem.custo?.toFixed(2)}</li>
                                </ul>
                            </div>
                        </div>
                    )}
                    <button
                        style={styles.btnPdf}
                        onClick={() => {
                            const dados = [
                                ["Km Total Rodado", `${metricasFrota.kmTotalRodado.toFixed(0)} km`],
                                ["Consumo Total", `${metricasFrota.consumoTotalLitros.toFixed(2)} litros`],
                                ["Consumo Médio", `${metricasFrota.consumoMedioKmL.toFixed(2)} km/l`],
                                ["Disponibilidade", `${metricasFrota.disponibilidade.toFixed(1)}%`],
                                ["Custo Combustível", `R$ ${metricasFrota.custoCombustivel.toFixed(2)}`],
                                ["Custo Manutenção", `R$ ${metricasFrota.custoManutencao.toFixed(2)}`],
                                ["Custo Depreciação", `R$ ${metricasFrota.custoDepreciacao.toFixed(2)}`],
                                ["Custo Total", `R$ ${metricasFrota.custoTotal.toFixed(2)}`],
                                ["Custo por Km", `R$ ${metricasFrota.custoPorKm.toFixed(4)}`],
                                ["Total Viagens", metricasFrota.totalViagens],
                                ["Dias Operacionais", metricasFrota.diasOperacionais],
                                ["Média km/viagem", `${mediaPorViagem.km?.toFixed(1)} km`],
                                ["Média tempo/viagem", `${mediaPorViagem.tempoMedio?.toFixed(1)} horas`],
                                ["Média custo/viagem", `R$ ${mediaPorViagem.custo?.toFixed(2)}`]
                            ];
                            exportarPDF(
                                "Resumo do Período",
                                ["Métrica", "Valor"],
                                dados,
                                'portrait'
                            );
                        }}
                    >
                        Exportar Resumo Período PDF
                    </button>
                </div>
            )}

            {abaAtiva === "porViagem" && (
              <ViagensDetalhadas
                data={viagens}
                isMobile={isMobile}
                onExport={() => exportarPDF(
                  "Viagens Detalhadas",
                  ["Motorista", "Veículo", "Data Início", "Data Fim", "Km Rodados", "Litros", "Custo Total"],
                  viagens.map((v) => [
                    nomeMotorista(v.motorista),
                    infoVeiculo(v.caminhao),
                    v.dataInicio?.toLocaleDateString('pt-BR') || 'N/A',
                    v.dataFim?.toLocaleDateString('pt-BR') || 'N/A',
                    v.kmRodados.toFixed(0),
                    v.litros.toFixed(2),
                    `R$ ${v.custoTotal.toFixed(2)}`
                  ]),
                  'landscape'
                )}
              />
            )}

            {abaAtiva === "porFornecedor" && (
              <CustoFornecedor
                data={custoPorFornecedor}
                isMobile={isMobile}
                onExport={() => exportarPDF(
                  "Custo por Fornecedor (Abastecimentos)",
                  ["Fornecedor", "Qtd. Abastecimentos", "Litros Comprados", "Preço Médio/Litro", "Custo Total"],
                  custoPorFornecedor.map((f) => [
                    f.fornecedorNome,
                    f.abastecimentos,
                    f.litros.toFixed(2),
                    `R$ ${f.precoMedioLitro.toFixed(3)}`,
                    `R$ ${f.custo.toFixed(2)}`
                  ])
                )}
              />
            )}

            {abaAtiva === "mediaViagem" && (
              <MediaViagem
                data={mediaPorViagem}
                onExport={() => exportarPDF(
                  "Média por Viagem",
                  ["Métrica", "Valor"],
                  [
                    ["Km médio por viagem", `${mediaPorViagem.km?.toFixed(1)} km`],
                    ["Litros médio por viagem", `${mediaPorViagem.litros?.toFixed(2)} litros`],
                    ["Custo médio por viagem", `R$ ${mediaPorViagem.custo?.toFixed(2)}`],
                    ["Tempo médio por viagem", `${mediaPorViagem.tempoMedio?.toFixed(1)} horas`],
                    ["Velocidade média", `${mediaPorViagem.velocidadeMedia?.toFixed(1)} km/h`],
                    ["Eficiência média", `${mediaPorViagem.eficiencia?.toFixed(2)} km/l`],
                  ]
                )}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}