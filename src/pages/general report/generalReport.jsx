import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase"; // Assuming this path is correct
import jsPDF from "jspdf";

export default function RelatoriosFrota() {
  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]); // NEW: State for suppliers
  const [viagens, setViagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const [abaAtiva, setAbaAtiva] = useState("ranking");
  const [dataInicioFiltro, setDataInicioFiltro] = useState("");
  const [dataFimFiltro, setDataFimFiltro] = useState("");
  const [filtroMotorista, setFiltroMotorista] = useState("");
  const [filtroVeiculo, setFiltroVeiculo] = useState("");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchData() {
      // Fetch Motoristas
      const motoristasSnap = await getDocs(collection(db, "motoristas"));
      setMotoristas(
        motoristasSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      // Fetch Veiculos
      const veiculosSnap = await getDocs(collection(db, "veiculos"));
      setVeiculos(
        veiculosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      // NEW: Fetch Fornecedores
      const fornecedoresSnap = await getDocs(collection(db, "fornecedores"));
      setFornecedores(
        fornecedoresSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    }
    fetchData();
  }, []);

  async function fetchAbastecimentosDasViagens(viagens) {
    const abastecimentosPorViagem = {};

    for (const viagem of viagens) {
      const q = query(
        collection(db, "abastecimentos"),
        where("viagemId", "==", viagem.id)
      );
      const snap = await getDocs(q);
      abastecimentosPorViagem[viagem.id] = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    return abastecimentosPorViagem;
  }

  const normalizarData = (d) => (d?.toDate ? d.toDate() : new Date(d));

  useEffect(() => {
    async function fetchViagens() {
      setLoading(true);

      let q = collection(db, "viagens");
      const filtros = [];
      if (filtroMotorista)
        filtros.push(where("motorista", "==", filtroMotorista));
      if (filtroVeiculo) filtros.push(where("caminhao", "==", filtroVeiculo));
      if (dataInicioFiltro)
        filtros.push(where("dataInicio", ">=", new Date(dataInicioFiltro)));
      if (dataFimFiltro)
        filtros.push(where("dataFim", "<=", new Date(dataFimFiltro)));

      if (filtros.length > 0) q = query(q, ...filtros);
      else q = query(q, orderBy("dataInicio", "desc"));

      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => {
        const viagem = { id: doc.id, ...doc.data() };
        viagem.dataInicio = normalizarData(viagem.dataInicio);
        viagem.dataFim = normalizarData(viagem.dataFim);
        return viagem;
      });

      const abastecimentosMap = await fetchAbastecimentosDasViagens(data);
      const viagensComAbastecimento = data.map((viagem) => {
        const abastecimentos = abastecimentosMap[viagem.id] || [];
        const litrosTotal = abastecimentos.reduce(
          (sum, a) => sum + (a.litros || 0),
          0
        );
        const custoTotal = abastecimentos.reduce(
          (sum, a) => sum + (a.precoLitro ?? 0) * (a.litros ?? 0),
          0
        );

        return {
          ...viagem,
          abastecimentos,
          litros: litrosTotal,
          custoTotal: custoTotal,
        };
      });

      setViagens(viagensComAbastecimento);
      setLoading(false);
    }

    fetchViagens();
  }, [filtroMotorista, filtroVeiculo, dataInicioFiltro, dataFimFiltro]);

  const nomeMotorista = (id) => {
    const m = motoristas.find((m) => m.id === id);
    return m ? m.nome : "Desconhecido";
  };

  const infoVeiculo = (id) => {
    const v = veiculos.find((v) => v.id === id);
    return v ? `${v.placa} - ${v.modelo}` : "Desconhecido";
  };

function nomeFornecedor(id) {
  const fornecedor = fornecedores.find((f) => f.id === id);
  return fornecedor ? fornecedor.nomeFantasia || fornecedor.razaoSocial : "Desconhecido";
}


  const consumoTotalLitros = viagens.reduce(
    (acc, v) => acc + (v.litros ?? 0),
    0
  );
  const kmTotalRodado = viagens.reduce(
    (acc, v) => acc + ((v.kmFinal ?? 0) - (v.kmInicial ?? 0)),
    0
  );
  const custoTotal = viagens.reduce((acc, v) => acc + (v.custoTotal ?? 0), 0);
  const consumoMedioKmL =
    consumoTotalLitros > 0 ? kmTotalRodado / consumoTotalLitros : 0;
  const custoPorKm = kmTotalRodado > 0 ? custoTotal / kmTotalRodado : 0;

  const rankingMotoristas = (() => {
    const map = {};
    viagens.forEach((v) => {
      if (!v.motorista) return;
      const id = v.motorista;
      const kmRodados = (v.kmFinal ?? 0) - (v.kmInicial ?? 0);
      const litros = v.litros ?? 0;
      const custo = v.custoTotal ?? 0;
      if (!map[id]) map[id] = { motoristaId: id, litros: 0, km: 0, custo: 0 };
      map[id].litros += litros;
      map[id].km += kmRodados;
      map[id].custo += custo;
    });
    return Object.values(map)
      .map((item) => {
        const nome = nomeMotorista(item.motoristaId);
        const consumoMedio = item.litros > 0 ? item.km / item.litros : 0;
        const custoKm = item.km > 0 ? item.custo / item.km : 0;
        return {
          motorista: nome,
          litros: item.litros,
          km: item.km,
          custo: item.custo,
          consumoMedio,
          custoPorKm: custoKm,
        };
      })
      .sort((a, b) => b.consumoMedio - a.consumoMedio);
  })();

  const rankingVeiculos = (() => {
    const map = {};
    viagens.forEach((v) => {
      if (!v.caminhao) return;
      const id = v.caminhao;
      const kmRodados = (v.kmFinal ?? 0) - (v.kmInicial ?? 0);
      const litros = v.litros ?? 0;
      const custo = v.custoTotal ?? 0;
      if (!map[id]) map[id] = { veiculoId: id, litros: 0, km: 0, custo: 0 };
      map[id].litros += litros;
      map[id].km += kmRodados;
      map[id].custo += custo;
    });
    return Object.values(map)
      .map((item) => {
        const nome = infoVeiculo(item.veiculoId);
        const consumoMedio = item.litros > 0 ? item.km / item.litros : 0;
        const custoKm = item.km > 0 ? item.custo / item.km : 0;
        return {
          veiculo: nome,
          litros: item.litros,
          km: item.km,
          custo: item.custo,
          consumoMedio,
          custoPorKm: custoKm,
        };
      })
      .sort((a, b) => b.consumoMedio - a.consumoMedio);
  })();

  const custoPorFornecedor = (() => {
    const map = {};
    viagens.forEach((v) => {
      if (!v.abastecimentos || v.abastecimentos.length === 0) return;

      v.abastecimentos.forEach((abastecimento) => {
        const fornecedorId = abastecimento.fornecedor;
        const custo =
          abastecimento.valor ||
          (abastecimento.precoLitro && abastecimento.litros
            ? abastecimento.precoLitro * abastecimento.litros
            : 0);
        if (!map[fornecedorId]) map[fornecedorId] = 0;
        map[fornecedorId] += custo;
      });
    });

    return Object.entries(map)
      .map(([fornecedorId, custo]) => ({
        fornecedorId,
        fornecedorNome: nomeFornecedor(fornecedorId),
        custo,
      }))
      .sort((a, b) => b.custo - a.custo);
  })();

  const mediaPorViagem = (() => {
    if (viagens.length === 0) return { litros: 0, custo: 0 };

    const totalLitros = viagens.reduce((acc, v) => acc + (v.litros ?? 0), 0);
    const totalCusto = viagens.reduce((acc, v) => acc + (v.custoTotal ?? 0), 0);

    return {
      litros: totalLitros / viagens.length,
      custo: totalCusto / viagens.length,
    };
  })();

  const exportarPDF = (titulo, colunas, linhas) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(titulo, 14, 20);

  const startX = 14;
  let y = 30;

  // Ajuste a largura da coluna conforme necessário
  const colWidths = colunas.map(() => 45); // aumentei para 45 para dar mais espaço

  // Cabeçalho
  colunas.forEach((h, i) => {
    doc.setFontSize(12);
    doc.text(h, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
  });
  y += 14; // aumentei espaçamento para 14

  linhas.forEach((linha) => {
    linha.forEach((text, i) => {
      // Texto simples
      doc.text(
        String(text),
        startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
        y
      );
    });
    y += 14; // mesma linha de espaçamento

    // Quebra de página
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save(titulo.toLowerCase().replace(/\s/g, "_") + ".pdf");
};

  function renderCustoPorFornecedor() {
    if (custoPorFornecedor.length === 0)
      return <p style={styles.noDataText}>Nenhum dado disponível.</p>;

    if (isMobile) {
      return (
        <div style={styles.cardsContainer}>
          {custoPorFornecedor.map((f, idx) => (
            <div key={f.fornecedorId} style={{ marginBottom: 15 }}>
              <h3 style={styles.cardTitle}>
                #{idx + 1} - {f.fornecedorNome /* já tem o nome aqui */}
              </h3>
              <p>
                <strong>Custo total (R$):</strong> R$ {f.custo.toFixed(2)}
              </p>
            </div>
          ))}

          <button
            style={styles.btnPdf}
            onClick={() =>
              exportarPDF(
                "Custo por Fornecedor",
                ["Pos.", "Fornecedor", "Custo Total (R$)"],
                custoPorFornecedor.map((f, i) => [
                  i + 1,
                  f.fornecedorNome,
                  f.custo.toFixed(2),
                ])
              )
            }
          >
            Exportar PDF Custo por Fornecedor
          </button>
        </div>
      );
    }

    return (
      <>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Posição</th>
              <th style={styles.th}>Fornecedor</th>
              <th style={styles.th}>Custo Total (R$)</th>
            </tr>
          </thead>
          <tbody>
            {custoPorFornecedor.map((f, idx) => (
              <tr
                key={f.fornecedorId}
                style={{
                  backgroundColor: idx % 2 === 0 ? "#e9f0ff" : "#f7fbff",
                }}
              >
                <td style={styles.td}>{idx + 1}</td>
                <td style={styles.td}>{f.fornecedorNome}</td>
                <td style={styles.td}>R$ {f.custo.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          style={styles.btnPdf}
          onClick={() =>
            exportarPDF(
              "Custo por Fornecedor",
              ["Pos.", "Fornecedor", "Custo Total (R$)"],
              custoPorFornecedor.map((f, i) => [
                i + 1,
                f.nomeFantasia,
                f.custo.toFixed(2),
              ])
            )
          }
        >
          Exportar PDF Custo por Fornecedor
        </button>
      </>
    );
  }

  function renderMediaPorViagem() {
    return (
      <div style={styles.summaryBox}>
        <h3>Média por Viagem</h3>
        <p>
          <strong>Litros médios consumidos:</strong>{" "}
          {mediaPorViagem.litros.toFixed(2)}
        </p>
        <p>
          <strong>Custo médio por viagem (R$):</strong> R${" "}
          {mediaPorViagem.custo.toFixed(2)}
        </p>
      </div>
    );
  }

  // Relatório por período: resumo geral
  function renderResumoPeriodo() {
    return (
      <div>
        <div style={styles.filtrosContainer}>
          <div>
            <label>Data Início: </label>
            <input
              type="date"
              value={dataInicioFiltro}
              onChange={(e) => setDataInicioFiltro(e.target.value)}
              style={styles.input}
            />
          </div>
          <div>
            <label>Data Fim: </label>
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
              setDataInicioFiltro("");
              setDataFimFiltro("");
            }}
          >
            Limpar Filtros
          </button>
        </div>
        <div style={styles.summaryBox}>
          <h3>Resumo do Período</h3>
          <p>
            <strong>Consumo Total (litros):</strong>{" "}
            {consumoTotalLitros.toFixed(2)}
          </p>
          <p>
            <strong>Km Total Rodado:</strong> {kmTotalRodado.toFixed(0)}
          </p>
          <p>
            <strong>Consumo Médio (km/l):</strong> {consumoMedioKmL.toFixed(2)}
          </p>
          <p>
            <strong>Custo Total (R$):</strong> R$ {custoTotal.toFixed(2)}
          </p>
          <p>
            <strong>Custo por Km (R$):</strong> R$ {custoPorKm.toFixed(4)}
          </p>
        </div>
        <button
          style={styles.btnPdf}
          onClick={() =>
            exportarPDF(
              "Resumo do Período",
              ["Métrica", "Valor"],
              [
                ["Consumo Total (litros)", consumoTotalLitros.toFixed(2)],
                ["Km Total Rodado", kmTotalRodado.toFixed(0)],
                ["Consumo Médio (km/l)", consumoMedioKmL.toFixed(2)],
                ["Custo Total (R$)", `R$ ${custoTotal.toFixed(2)}`],
                ["Custo por Km (R$)", `R$ ${custoPorKm.toFixed(4)}`],
              ]
            )
          }
        >
          Exportar PDF Resumo
        </button>
      </div>
    );
  }

  // Relatório viagens detalhadas
  function renderViagensDetalhadas() {
    if (viagens.length === 0)
      return <p style={styles.noDataText}>Nenhum dado disponível.</p>;

    if (isMobile) {
      return (
        <div style={styles.cardsContainer}>
          {viagens.map((v, idx) => (
            <div key={v.id || idx} style={styles.card}>
              <h3 style={styles.cardTitle}>Viagem #{idx + 1}</h3>
              <p>
                <strong>Motorista:</strong> {nomeMotorista(v.motorista)}
              </p>
              <p>
                <strong>Veículo:</strong> {infoVeiculo(v.caminhao)}
              </p>
              <p>
                <strong>Data Início:</strong>{" "}
                {v.dataInicio?.toLocaleDateString()}
              </p>
              <p>
                <strong>Data Fim:</strong> {v.dataFim?.toLocaleDateString()}
              </p>
              <p>
                <strong>Km Inicial:</strong> {v.kmInicial}
              </p>
              <p>
                <strong>Km Final:</strong> {v.kmFinal}
              </p>
              <p>
                <strong>Litros Consumidos:</strong> {v.litros.toFixed(2)}
              </p>
              <p>
                <strong>Custo Total (R$):</strong> R$ {v.custoTotal.toFixed(2)}
              </p>
            </div>
          ))}
          <button
            style={styles.btnPdf}
            onClick={() =>
              exportarPDF(
                "Relatório Viagens Detalhadas",
                [
                  "Motorista",
                  "Veículo",
                  "Data Início",
                  "Data Fim",
                  "Km Inicial",
                  "Km Final",
                  "Litros",
                  "Custo Total (R$)",
                ],
                viagens.map((v) => [
                  nomeMotorista(v.motorista),
                  infoVeiculo(v.caminhao),
                  v.dataInicio?.toLocaleDateString(),
                  v.dataFim?.toLocaleDateString(),
                  v.kmInicial,
                  v.kmFinal,
                  v.litros.toFixed(2),
                  v.custoTotal.toFixed(2),
                ])
              )
            }
          >
            Exportar PDF Viagens Detalhadas
          </button>
        </div>
      );
    }

    return (
      <>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Motorista</th>
              <th style={styles.th}>Veículo</th>
              <th style={styles.th}>Data Início</th>
              <th style={styles.th}>Data Fim</th>
              <th style={styles.th}>Km Inicial</th>
              <th style={styles.th}>Km Final</th>
              <th style={styles.th}>Litros</th>
              <th style={styles.th}>Custo Total (R$)</th>
            </tr>
          </thead>
          <tbody>
            {viagens.map((v, idx) => (
              <tr
                key={v.id || idx}
                style={{
                  backgroundColor: idx % 2 === 0 ? "#e9f0ff" : "#f7fbff",
                }}
              >
                <td style={styles.td}>{nomeMotorista(v.motorista)}</td>
                <td style={styles.td}>{infoVeiculo(v.caminhao)}</td>
                <td style={styles.td}>{v.dataInicio?.toLocaleDateString()}</td>
                <td style={styles.td}>{v.dataFim?.toLocaleDateString()}</td>
                <td style={styles.td}>{v.kmInicial}</td>
                <td style={styles.td}>{v.kmFinal}</td>
                <td style={styles.td}>{v.litros.toFixed(2)}</td>
                <td style={styles.td}>R$ {v.custoTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          style={styles.btnPdf}
          onClick={() =>
            exportarPDF(
              "Relatório Viagens Detalhadas",
              [
                "Motorista",
                "Veículo",
                "Data Início",
                "Data Fim",
                "Km Inicial",
                "Km Final",
                "Litros",
                "Custo Total (R$)",
              ],
              viagens.map((v) => [
                nomeMotorista(v.motorista),
                infoVeiculo(v.caminhao),
                v.dataInicio?.toLocaleDateString(),
                v.dataFim?.toLocaleDateString(),
                v.kmInicial,
                v.kmFinal,
                v.litros.toFixed(2),
                v.custoTotal.toFixed(2),
              ])
            )
          }
        >
          Exportar PDF Viagens Detalhadas
        </button>
      </>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <h1 style={styles.pageTitle}>Sistema Completo de Relatórios - Frota</h1>

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

      <div style={styles.filtrosContainer}>
        <div>
          <label>Motorista:</label>
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
        <div>
          <label>Veículo:</label>
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
        <div>
          <label>Data Início:</label>
          <input
            type="date"
            value={dataInicioFiltro}
            onChange={(e) => setDataInicioFiltro(e.target.value)}
            style={styles.input}
          />
        </div>
        <div>
          <label>Data Fim:</label>
          <input
            type="date"
            value={dataFimFiltro}
            onChange={(e) => setDataFimFiltro(e.target.value)}
            style={styles.input}
          />
        </div>
      </div>

      <div style={styles.contentArea}>
        {loading && <p>Carregando dados...</p>}

        {!loading && abaAtiva === "ranking" && (
          <>
            <h2>Ranking de Motoristas</h2>
            {rankingMotoristas.length === 0 ? (
              <p style={styles.noDataText}>Nenhum dado disponível.</p>
            ) : isMobile ? (
              <div style={styles.cardsContainer}>
                {rankingMotoristas.map((r, idx) => (
                  <div key={idx} style={styles.card}>
                    <h3 style={styles.cardTitle}>
                      #{idx + 1} - {r.motorista}
                    </h3>
                    <p>
                      <strong>Litros consumidos:</strong> {r.litros.toFixed(2)}
                    </p>
                    <p>
                      <strong>Km rodados:</strong> {r.km.toFixed(0)}
                    </p>
                    <p>
                      <strong>Consumo médio (km/l):</strong>{" "}
                      {r.consumoMedio.toFixed(2)}
                    </p>
                    <p>
                      <strong>Custo total (R$):</strong> R$ {r.custo.toFixed(2)}
                    </p>
                    <p>
                      <strong>Custo por Km (R$):</strong> R${" "}
                      {r.custoPorKm.toFixed(4)}
                    </p>
                  </div>
                ))}
                <button
                  style={styles.btnPdf}
                  onClick={() =>
                    exportarPDF(
                      "Ranking de Motoristas",
                      [
                        "Pos.",
                        "Motorista",
                        "Litros",
                        "Km",
                        "Consumo Médio (km/l)",
                        "Custo Total (R$)",
                        "Custo por Km (R$)",
                      ],
                      rankingMotoristas.map((r, i) => [
                        i + 1,
                        r.motorista,
                        r.litros.toFixed(2),
                        r.km.toFixed(0),
                        r.consumoMedio.toFixed(2),
                        r.custo.toFixed(2),
                        r.custoPorKm.toFixed(4),
                      ])
                    )
                  }
                >
                  Exportar PDF Ranking Motoristas
                </button>
              </div>
            ) : (
              <>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Posição</th>
                      <th style={styles.th}>Motorista</th>
                      <th style={styles.th}>Litros</th>
                      <th style={styles.th}>Km</th>
                      <th style={styles.th}>Consumo Médio (km/l)</th>
                      <th style={styles.th}>Custo Total (R$)</th>
                      <th style={styles.th}>Custo por Km (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingMotoristas.map((r, idx) => (
                      <tr
                        key={idx}
                        style={{
                          backgroundColor:
                            idx % 2 === 0 ? "#e9f0ff" : "#f7fbff",
                        }}
                      >
                        <td style={styles.td}>{idx + 1}</td>
                        <td style={styles.td}>{r.motorista}</td>
                        <td style={styles.td}>{r.litros.toFixed(2)}</td>
                        <td style={styles.td}>{r.km.toFixed(0)}</td>
                        <td style={styles.td}>{r.consumoMedio.toFixed(2)}</td>
                        <td style={styles.td}>R$ {r.custo.toFixed(2)}</td>
                        <td style={styles.td}>R$ {r.custoPorKm.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  style={styles.btnPdf}
                  onClick={() =>
                    exportarPDF(
                      "Ranking de Motoristas",
                      [
                        "Pos.",
                        "Motorista",
                        "Litros",
                        "Km",
                        "Consumo Médio (km/l)",
                        "Custo Total (R$)",
                        "Custo por Km (R$)",
                      ],
                      rankingMotoristas.map((r, i) => [
                        i + 1,
                        r.motorista,
                        r.litros.toFixed(2),
                        r.km.toFixed(0),
                        r.consumoMedio.toFixed(2),
                        r.custo.toFixed(2),
                        r.custoPorKm.toFixed(4),
                      ])
                    )
                  }
                >
                  Exportar PDF Ranking Motoristas
                </button>
              </>
            )}
          </>
        )}

        {!loading && abaAtiva === "porVeiculo" && (
          <>
            <h2>Ranking de Veículos</h2>
            {rankingVeiculos.length === 0 ? (
              <p style={styles.noDataText}>Nenhum dado disponível.</p>
            ) : isMobile ? (
              <div style={styles.cardsContainer}>
                {rankingVeiculos.map((r, idx) => (
                  <div key={idx} style={styles.card}>
                    <h3 style={styles.cardTitle}>
                      #{idx + 1} - {r.veiculo}
                    </h3>
                    <p>
                      <strong>Litros consumidos:</strong> {r.litros.toFixed(2)}
                    </p>
                    <p>
                      <strong>Km rodados:</strong> {r.km.toFixed(0)}
                    </p>
                    <p>
                      <strong>Consumo médio (km/l):</strong>{" "}
                      {r.consumoMedio.toFixed(2)}
                    </p>
                    <p>
                      <strong>Custo total (R$):</strong> R$ {r.custo.toFixed(2)}
                    </p>
                    <p>
                      <strong>Custo por Km (R$):</strong> R${" "}
                      {r.custoPorKm.toFixed(4)}
                    </p>
                  </div>
                ))}
                <button
                  style={styles.btnPdf}
                  onClick={() =>
                    exportarPDF(
                      "Ranking de Veículos",
                      [
                        "Pos.",
                        "Veículo",
                        "Litros",
                        "Km",
                        "Consumo Médio (km/l)",
                        "Custo Total (R$)",
                        "Custo por Km (R$)",
                      ],
                      rankingVeiculos.map((r, i) => [
                        i + 1,
                        r.veiculo,
                        r.litros.toFixed(2),
                        r.km.toFixed(0),
                        r.consumoMedio.toFixed(2),
                        r.custo.toFixed(2),
                        r.custoPorKm.toFixed(4),
                      ])
                    )
                  }
                >
                  Exportar PDF Ranking Veículos
                </button>
              </div>
            ) : (
              <>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Posição</th>
                      <th style={styles.th}>Veículo</th>
                      <th style={styles.th}>Litros</th>
                      <th style={styles.th}>Km</th>
                      <th style={styles.th}>Consumo Médio (km/l)</th>
                      <th style={styles.th}>Custo Total (R$)</th>
                      <th style={styles.th}>Custo por Km (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingVeiculos.map((r, idx) => (
                      <tr
                        key={idx}
                        style={{
                          backgroundColor:
                            idx % 2 === 0 ? "#e9f0ff" : "#f7fbff",
                        }}
                      >
                        <td style={styles.td}>{idx + 1}</td>
                        <td style={styles.td}>{r.veiculo}</td>
                        <td style={styles.td}>{r.litros.toFixed(2)}</td>
                        <td style={styles.td}>{r.km.toFixed(0)}</td>
                        <td style={styles.td}>{r.consumoMedio.toFixed(2)}</td>
                        <td style={styles.td}>R$ {r.custo.toFixed(2)}</td>
                        <td style={styles.td}>R$ {r.custoPorKm.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  style={styles.btnPdf}
                  onClick={() =>
                    exportarPDF(
                      "Ranking de Veículos",
                      [
                        "Pos.",
                        "Veículo",
                        "Litros",
                        "Km",
                        "Consumo Médio (km/l)",
                        "Custo Total (R$)",
                        "Custo por Km (R$)",
                      ],
                      rankingVeiculos.map((r, i) => [
                        i + 1,
                        r.veiculo,
                        r.litros.toFixed(2),
                        r.km.toFixed(0),
                        r.consumoMedio.toFixed(2),
                        r.custo.toFixed(2),
                        r.custoPorKm.toFixed(4),
                      ])
                    )
                  }
                >
                  Exportar PDF Ranking Veículos
                </button>
              </>
            )}
          </>
        )}

        {!loading && abaAtiva === "porPeriodo" && (
          <>
            <h2>Resumo Período</h2>
            {renderResumoPeriodo()}
          </>
        )}

        {!loading && abaAtiva === "porViagem" && (
          <>
            <h2>Viagens Detalhadas</h2>
            {renderViagensDetalhadas()}
          </>
        )}

        {!loading && abaAtiva === "porFornecedor" && (
          <>
            <h2>Custo por Fornecedor</h2>
            {renderCustoPorFornecedor()}
          </>
        )}

        {!loading && abaAtiva === "mediaViagem" && (
          <>
            <h2>Média por Viagem</h2>
            {renderMediaPorViagem()}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  pageTitle: {
    color: "#333",
    textAlign: "center",
    marginBottom: "30px",
  },
  tabsContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "20px",
    borderBottom: "2px solid #ccc",
  },
  tab: {
    padding: "10px 15px",
    margin: "0 5px",
    cursor: "pointer",
    border: "none",
    backgroundColor: "#f0f0f0",
    borderRadius: "5px 5px 0 0",
    fontWeight: "bold",
    color: "#555",
    transition: "background-color 0.3s ease",
  },
  tabActive: {
    padding: "10px 15px",
    margin: "0 5px",
    cursor: "pointer",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: "5px 5px 0 0",
    fontWeight: "bold",
    borderBottom: "2px solid #0056b3",
  },
  filtrosContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    marginBottom: "20px",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  select: {
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  contentArea: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
  },
  th: {
    border: "1px solid #ddd",
    padding: "10px",
    backgroundColor: "#007bff",
    color: "white",
    textAlign: "left",
  },
  td: {
    border: "1px solid #ddd",
    padding: "10px",
    textAlign: "left",
  },
  cardsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "20px",
  },
  card: {
    border: "1px solid #eee",
    borderRadius: "8px",
    padding: "15px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    backgroundColor: "#fff",
  },
  cardTitle: {
    color: "#007bff",
    marginBottom: "10px",
  },
  noDataText: {
    textAlign: "center",
    color: "#777",
    fontStyle: "italic",
  },
  summaryBox: {
    backgroundColor: "#eaf6ff",
    border: "1px solid #b3d9ff",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
  },
  btnPdf: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "20px",
    display: "block", // Makes the button take full width if in a block layout
    margin: "20px auto 0 auto", // Centers the button
  },
  btnLimpar: {
    backgroundColor: "#dc3545",
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
  },
};
