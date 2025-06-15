/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function GeneralReport() {
  const [caminhao, setCaminhao] = useState("");
  const [motorista, setMotorista] = useState("");
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");
  const [dados, setDados] = useState([]);
  const [mediaGeral, setMediaGeral] = useState(0);
  const [mediaSobreMedia, setMediaSobreMedia] = useState(0);

  const [listaCaminhoes, setListaCaminhoes] = useState([]);
  const [listaMotoristas, setListaMotoristas] = useState([]);

  // Dados resumo por motorista
  const [resumoMotoristas, setResumoMotoristas] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const snapV = await getDocs(collection(db, "veiculos"));
      setListaCaminhoes(snapV.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const snapM = await getDocs(collection(db, "motoristas"));
      setListaMotoristas(snapM.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchData();
  }, []);

  const gerarRelatorio = async (e) => {
    e.preventDefault();

    if (!periodoInicio || !periodoFim) {
      alert("Informe o período inicial e final.");
      return;
    }

    const inicio = new Date(periodoInicio);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(periodoFim);
    fim.setHours(23, 59, 59, 999);

    let filtros = [
      where("dataFim", ">=", inicio.toISOString()),
      where("dataFim", "<=", fim.toISOString()),
    ];
    if (caminhao) filtros.push(where("caminhao", "==", caminhao));
    if (motorista) filtros.push(where("motorista", "==", motorista));

    const q = query(collection(db, "viagens"), ...filtros);
    const snapshot = await getDocs(q);

    let lista = [];
    let somaKM = 0;
    let somaLitros = 0;
    let somaMedias = 0;

    // Para resumo por motorista
    const resumoMap = {};

    for (const docSnap of snapshot.docs) {
      const v = docSnap.data();
      const kmRodado = v.kmFinal - v.kmInicial;

      const abSnap = await getDocs(
        query(
          collection(db, "abastecimentos"),
          where("caminhao", "==", v.caminhao),
          where("motorista", "==", v.motorista),
          where("dataHora", "==", v.dataFim)
        )
      );
      let litros = 0;
      abSnap.forEach(a => litros += a.data().litros);

      const media = litros ? kmRodado / litros : 0;
      somaKM += kmRodado;
      somaLitros += litros;
      somaMedias += media;

      lista.push({
        nome: `Viagem ${docSnap.id.substring(0, 5)}`,
        km: kmRodado,
        litros,
        media: Number(media.toFixed(2)),
      });

      // Construir resumo por motorista
      if (!resumoMap[v.motorista]) {
        resumoMap[v.motorista] = { km: 0, litros: 0 };
      }
      resumoMap[v.motorista].km += kmRodado;
      resumoMap[v.motorista].litros += litros;
    }

    // Após agrupar resumo, formatar array e puxar nome do motorista
    const resumoArray = Object.entries(resumoMap).map(([idMotorista, dados]) => {
      const motoristaObj = listaMotoristas.find(m => m.id === idMotorista);
      const nomeMotorista = motoristaObj ? motoristaObj.nome : idMotorista;
      const mediaMotorista = dados.litros ? dados.km / dados.litros : 0;

      return {
        motorista: nomeMotorista,
        km: dados.km,
        litros: dados.litros,
        media: Number(mediaMotorista.toFixed(2)),
      };
    });

    const mediaG = somaLitros ? somaKM / somaLitros : 0;
    const mediaM = lista.length ? somaMedias / lista.length : 0;

    setDados(lista);
    setMediaGeral(Number(mediaG.toFixed(2)));
    setMediaSobreMedia(Number(mediaM.toFixed(2)));
    setResumoMotoristas(resumoArray);
  };

  // Exportar PDF resumo motoristas
  function exportarPDFResumoMotoristas(dadosResumo) {
    const doc = new jsPDF();

    doc.text("Resumo de Médias por Motorista", 14, 15);

    const head = [['Motorista', 'Total KM', 'Total Litros', 'Média km/l']];
    const body = dadosResumo.map(item => [
      item.motorista,
      item.km.toFixed(2),
      item.litros.toFixed(2),
      item.media.toFixed(2),
    ]);

    doc.autoTable({
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
          <select value={caminhao} onChange={e => setCaminhao(e.target.value)} style={styles.input}>
            <option value="">Todos Caminhões</option>
            {listaCaminhoes.map(c => (
              <option key={c.id} value={c.id}>{c.placa} – {c.modelo}</option>
            ))}
          </select>

          <select value={motorista} onChange={e => setMotorista(e.target.value)} style={styles.input}>
            <option value="">Todos Motoristas</option>
            {listaMotoristas.map(m => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>

          <input type="date" value={periodoInicio} onChange={e => setPeriodoInicio(e.target.value)} style={styles.input} />
          <input type="date" value={periodoFim} onChange={e => setPeriodoFim(e.target.value)} style={styles.input} />

          <button type="submit" style={styles.button}>Gerar Relatório</button>
        </form>

        {dados.length > 0 && (
          <div style={styles.resultado}>
            <h2>Resultados Detalhados</h2>

            <div style={{ overflowX: "auto", width: "100%" }}>
              <table style={styles.tabela}>
                <thead><tr><th>Viagem</th><th>KM</th><th>Litros</th><th>Média km/l</th></tr></thead>
                <tbody>{dados.map((d,i)=>(
                  <tr key={i}>
                    <td>{d.nome}</td><td>{d.km}</td><td>{d.litros}</td><td>{d.media}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>

            <p><strong>Média Geral (total km / total litros):</strong> {mediaGeral} km/l</p>
            <p><strong>Média das Médias:</strong> {mediaSobreMedia} km/l</p>

            <div style={{ width: "100%", height: 300, marginTop: 20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dados}>
                  <XAxis dataKey="nome"/>
                  <YAxis/>
                  <Tooltip/>
                  <Legend/>
                  <Bar dataKey="km" fill="#3498db" name="KM"/>
                  <Bar dataKey="litros" fill="#2ecc71" name="Litros"/>
                  <Bar dataKey="media" fill="#e67e22" name="Média"/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* NOVO RELATÓRIO RESUMO POR MOTORISTA */}
            <h2 style={{ marginTop: 40 }}>Resumo por Motorista</h2>
            <button onClick={handleExportarPDF} style={{ ...styles.button, marginBottom: 10 }}>
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
                  {resumoMotoristas.map((r, i) => (
                    <tr key={i}>
                      <td>{r.motorista}</td>
                      <td>{r.km.toFixed(2)}</td>
                      <td>{r.litros.toFixed(2)}</td>
                      <td>{r.media.toFixed(2)}</td>
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
    display:"flex",
    height:"100vh",
    fontFamily:"Arial",
    flexDirection: "column",  // Para responsividade vertical em mobile
    padding: 10,
  },
  main: {
    flex:1,
    padding:20,
    background:"#ecf0f1",
    overflowY:"auto",
    maxWidth: "100%",
  },
  title: { fontSize:26, marginBottom:20 },
  form: {
    display:"flex",
    flexWrap:"wrap",
    gap:10,
    marginBottom:30,
    justifyContent: "center",
  },
  input: {
    padding:10,
    borderRadius:5,
    border:"1px solid #ccc",
    flex:"1 0 200px",
    minWidth: 0,
    boxSizing: "border-box",
  },
  button: {
    background:"#27ae60",
    color:"#fff",
    padding:12,
    borderRadius:5,
    border:"none",
    cursor:"pointer",
    flex:"1 0 150px",
    minWidth: 0,
  },
  resultado: {
    background:"#fff",
    padding:20,
    borderRadius:10,
    boxShadow:"0 0 8px rgba(0,0,0,0.1)",
  },
  tabela: {
    width:"100%",
    borderCollapse:"collapse",
    marginTop:20,
    minWidth:"600px",
  },
};
