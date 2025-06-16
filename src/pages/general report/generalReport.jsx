import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function RelatorioMedias() {
  const [caminhao, setCaminhao] = useState("");
  const [motorista, setMotorista] = useState("");
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");

  const [listaCaminhoes, setListaCaminhoes] = useState([]);
  const [listaMotoristas, setListaMotoristas] = useState([]);

  const [dados, setDados] = useState([]);
  const [mediaGeral, setMediaGeral] = useState(0);
  const [mediaSobreMedia, setMediaSobreMedia] = useState(0);
  const [resumoMotoristas, setResumoMotoristas] = useState([]);

  // Mapas para consulta rápida dos dados
  const mapaCaminhoes = {};
  const mapaMotoristas = {};

  // Preencher os mapas sempre que listas mudarem
  listaCaminhoes.forEach((c) => {
    mapaCaminhoes[c.id] = c;
  });
  listaMotoristas.forEach((m) => {
    mapaMotoristas[m.id] = m;
  });

  // Função para carregar caminhões e motoristas
  async function carregarListas() {
    const qCaminhoes = query(collection(db, "veiculos"));
    const snapCaminhoes = await getDocs(qCaminhoes);
    const arrCaminhoes = snapCaminhoes.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setListaCaminhoes(arrCaminhoes);

    const qMotoristas = query(collection(db, "motoristas"));
    const snapMotoristas = await getDocs(qMotoristas);
    const arrMotoristas = snapMotoristas.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setListaMotoristas(arrMotoristas);
  }

  // Ao abrir a página, carregar listas e definir período do mês atual
  useEffect(() => {
    carregarListas();

    const now = new Date();
    const primeiroDiaMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const ultimoDiaMes = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setPeriodoInicio(primeiroDiaMes.toISOString().slice(0, 10));
    setPeriodoFim(ultimoDiaMes.toISOString().slice(0, 10));
  }, []);

  // Gerar relatório quando filtros ou listas mudarem (e período estiver definido)
  useEffect(() => {
    if (
      periodoInicio &&
      periodoFim &&
      listaCaminhoes.length > 0 &&
      listaMotoristas.length > 0
    ) {
      gerarRelatorio();
    }
  }, [
    caminhao,
    motorista,
    periodoInicio,
    periodoFim,
    listaCaminhoes,
    listaMotoristas,
  ]);

  async function gerarRelatorio(e) {
    if (e) e.preventDefault();

    if (!periodoInicio || !periodoFim) {
      alert("Informe o período inicial e final.");
      return;
    }

    const inicio = new Date(periodoInicio);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(periodoFim);
    fim.setHours(23, 59, 59, 999);

    // Consultar viagens com filtros
    const filtrosViagens = [
      where("dataFim", ">=", inicio.toISOString()),
      where("dataFim", "<=", fim.toISOString()),
    ];

    if (caminhao) filtrosViagens.push(where("caminhao", "==", caminhao));
    if (motorista) filtrosViagens.push(where("motorista", "==", motorista));

    const qViagens = query(collection(db, "viagens"), ...filtrosViagens);
    const snapViagens = await getDocs(qViagens);
    const listaViagens = snapViagens.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Consultar abastecimentos no mesmo período (para os filtros)
    const filtrosAbastecimentos = [
      where("dataHora", ">=", inicio.toISOString()),
      where("dataHora", "<=", fim.toISOString()),
    ];
    if (caminhao) filtrosAbastecimentos.push(where("caminhao", "==", caminhao));
    if (motorista)
      filtrosAbastecimentos.push(where("motorista", "==", motorista));

    const qAbastecimentos = query(
      collection(db, "abastecimentos"),
      ...filtrosAbastecimentos
    );
    const snapAbastecimentos = await getDocs(qAbastecimentos);
    const listaAbastecimentos = snapAbastecimentos.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Construir os dados do relatório combinando viagens e abastecimentos
    const dadosParaRelatorio = listaViagens.map((viagem) => {
      const kmRodado = viagem.kmFinal - viagem.kmInicial;

      // Filtrar abastecimentos desta viagem (entre dataInicio e dataFim da viagem)
      const litrosViagem = listaAbastecimentos
        .filter(
          (ab) =>
            ab.caminhao === viagem.caminhao &&
            ab.motorista === viagem.motorista &&
            new Date(ab.dataHora) >= new Date(viagem.dataInicio) &&
            new Date(ab.dataHora) <= new Date(viagem.dataFim)
        )
        .reduce((acc, ab) => acc + (ab.litros || 0), 0);

      const media = litrosViagem ? kmRodado / litrosViagem : 0;

      return {
        placa: mapaCaminhoes[viagem.caminhao]?.placa || "Sem placa",
        modelo: mapaCaminhoes[viagem.caminhao]?.modelo || "Sem modelo",
        kmRodado,
        litros: litrosViagem,
        media: Number(media.toFixed(2)),
        motoristaNome:
          mapaMotoristas[viagem.motorista]?.nome ||
          viagem.motorista ||
          "Sem nome",
      };
    });

    // Resumo por motorista
    const resumoMap = {};
    dadosParaRelatorio.forEach((item) => {
      const m = item.motoristaNome;
      if (!resumoMap[m]) resumoMap[m] = { km: 0, litros: 0 };
      resumoMap[m].km += item.kmRodado;
      resumoMap[m].litros += item.litros;
    });

    const resumoArray = Object.entries(resumoMap).map(([motorista, dados]) => {
      const mediaMotorista = dados.litros ? dados.km / dados.litros : 0;
      return {
        motorista,
        km: dados.km,
        litros: dados.litros,
        media: Number(mediaMotorista.toFixed(2)),
      };
    });

    // Cálculo média geral e média das médias
    const somaKM = dadosParaRelatorio.reduce((acc, i) => acc + i.kmRodado, 0);
    const somaLitros = dadosParaRelatorio.reduce((acc, i) => acc + i.litros, 0);
    const somaMedias = dadosParaRelatorio.reduce((acc, i) => acc + i.media, 0);

    const mediaG = somaLitros ? somaKM / somaLitros : 0;
    const mediaM = dadosParaRelatorio.length
      ? somaMedias / dadosParaRelatorio.length
      : 0;

    setDados(dadosParaRelatorio);
    setMediaGeral(Number(mediaG.toFixed(2)));
    setMediaSobreMedia(Number(mediaM.toFixed(2)));
    setResumoMotoristas(resumoArray);
  }
function formatarDataBrasileira(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}
  function exportarPDFResumoMotoristas(dadosResumo) {
    const doc = new jsPDF();
 doc.text(
  `Período: ${formatarDataBrasileira(periodoInicio)} até ${formatarDataBrasileira(periodoFim)}`,
  14,
  10
);
    doc.text("Resumo de Médias por Motorista", 14, 15);

    const head = [["Motorista", "Total KM", "Total Litros", "Média km/l"]];
    const body = dadosResumo.map((item) => [
      item.motorista,
      item.km.toFixed(2),
      item.litros.toFixed(2),
      item.media.toFixed(2),
    ]);

    autoTable(doc, {
      startY: 20,
      head: head,
      body: body,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    doc.save("resumo-motoristas.pdf");
  }

  function handleExportarPDF() {
    exportarPDFResumoMotoristas(resumoMotoristas);
  }

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <h1 style={styles.title}>Relatório de Médias</h1>

        <form onSubmit={gerarRelatorio} style={styles.form}>
          <select
            value={caminhao}
            onChange={(e) => setCaminhao(e.target.value)}
            style={styles.input}
          >
            <option value="">Todos Caminhões</option>
            {listaCaminhoes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.placa} – {c.modelo}
              </option>
            ))}
          </select>

          <select
            value={motorista}
            onChange={(e) => setMotorista(e.target.value)}
            style={styles.input}
          >
            <option value="">Todos Motoristas</option>
            {listaMotoristas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={periodoInicio}
            onChange={(e) => setPeriodoInicio(e.target.value)}
            style={styles.input}
          />
          <input
            type="date"
            value={periodoFim}
            onChange={(e) => setPeriodoFim(e.target.value)}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Gerar Relatório
          </button>
        </form>

        {dados.length > 0 && (
          <div style={styles.resultado}>
            <h2>Resultados Detalhados</h2>

            <div style={{ overflowX: "auto", width: "100%" }}>
              <table style={styles.tabela}>
                <thead>
                  <tr>
                    <th>Placa do Veículo</th>
                    <th>Modelo</th>
                    <th>Motorista</th>
                    <th>KM Rodado</th>
                    <th>Litros</th>
                    <th>Média km/l</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((d, i) => (
                    <tr key={i}>
                      <td>{d.placa}</td>
                      <td>{d.modelo}</td>
                      <td>{d.motoristaNome}</td>
                      <td>{d.kmRodado}</td>
                      <td>{d.litros.toFixed(2)}</td>
                      <td>{d.media}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p>
              <strong>Média Geral (total km / total litros):</strong>{" "}
              {mediaGeral} km/l
            </p>
            <p>
              <strong>Média das Médias:</strong> {mediaSobreMedia} km/l
            </p>

            <div style={{ width: "100%", height: 300, marginTop: 20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dados}>
                  <XAxis dataKey="placa" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="kmRodado" fill="#3498db" name="KM" />
                  <Bar dataKey="litros" fill="#2ecc71" name="Litros" />
                  <Bar dataKey="media" fill="#e67e22" name="Média" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <h2 style={{ marginTop: 40 }}>Resumo por Motorista</h2>
            <button
              onClick={handleExportarPDF}
              style={{ ...styles.button, marginBottom: 10 }}
            >
              Exportar Resumo PDF
            </button>

            <div style={{ overflowX: "auto", width: "100%" }}>
              <table style={styles.tabela}>
                <thead>
                  <tr>
                    <th>Motorista</th>
                    <th>KM Rodado</th>
                    <th>Litros</th>
                    <th>Média km/l</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((r, i) => (
                    <tr key={i}>
                      <td>{r.motoristaNome || "Sem nome"}</td>
                      <td>
                        {typeof r.kmRodado === "number"
                          ? r.kmRodado.toFixed(2)
                          : "0.00"}
                      </td>
                      <td>
                        {typeof r.litros === "number"
                          ? r.litros.toFixed(2)
                          : "0.00"}
                      </td>
                      <td>
                        {typeof r.media === "number"
                          ? r.media.toFixed(2)
                          : "0.00"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    fontFamily: "Arial",
    padding: 10,
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: 20,
    background: "#ecf0f1",
  },
  title: { fontSize: 26, marginBottom: 20 },
  form: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
    justifyContent: "center",
  },
  input: {
    padding: 10,
    borderRadius: 5,
    border: "1px solid #ccc",
    flex: "1 0 200px",
    minWidth: 0,
    boxSizing: "border-box",
  },
  button: {
    background: "#27ae60",
    color: "#fff",
    padding: 12,
    borderRadius: 5,
    border: "none",
    cursor: "pointer",
    flex: "1 0 150px",
    minWidth: 0,
  },
  resultado: {
    flex: 1, // ocupa o máximo do espaço vertical restante
    overflowY: "auto", // scroll interno se ultrapassar
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 0 8px rgba(0,0,0,0.1)",
    minHeight: 0, // importante para scroll funcionar em flex container
  },
  tabela: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 20,
    minWidth: "700px",
  },
};
