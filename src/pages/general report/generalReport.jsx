import React, { useEffect, useState, useMemo } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function RelatorioDashboardInterativo() {
  const [viagens, setViagens] = useState([]);
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [motoristasMap, setMotoristasMap] = useState({});
  const [veiculosMap, setVeiculosMap] = useState({});

  const [filtroMes, setFiltroMes] = useState("Todos");
  const [filtroMotorista, setFiltroMotorista] = useState("Todos");

  useEffect(() => {
    async function carregar() {
      const viagensSnap = await getDocs(collection(db, "viagens"));
      const abastecimentosSnap = await getDocs(collection(db, "abastecimentos"));
      const motoristasSnap = await getDocs(collection(db, "motoristas"));
      const veiculosSnap = await getDocs(collection(db, "veiculos"));

      const motoristasTemp = {};
      motoristasSnap.forEach((doc) => {
        motoristasTemp[doc.id] = doc.data().nome;
      });
      setMotoristasMap(motoristasTemp);

      const veiculosTemp = {};
      veiculosSnap.forEach((doc) => {
        veiculosTemp[doc.id] = doc.data().placa;
      });
      setVeiculosMap(veiculosTemp);

      setViagens(viagensSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setAbastecimentos(abastecimentosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }
    carregar();
  }, []);

  const parseDate = (data) => {
    if (!data) return null;
    if (typeof data?.toDate === "function") return data.toDate();
    return new Date(data);
  };

  const mesesDisponiveis = useMemo(() => {
    const mesesSet = new Set();
    [...viagens, ...abastecimentos].forEach((item) => {
      const data = parseDate(item.dataHora || item.data || item.dataInicio || item.dataFim);
      if (!data || isNaN(data)) return;
      const mesAno = data.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
      mesesSet.add(mesAno);
    });
    return ["Todos", ...Array.from(mesesSet).sort()];
  }, [viagens, abastecimentos]);

  const motoristasDisponiveis = useMemo(() => {
    return ["Todos", ...Object.values(motoristasMap).sort()];
  }, [motoristasMap]);

  const viagensFiltradas = useMemo(() => {
    return viagens.filter((v) => {
      const data = parseDate(v.dataHora || v.data || v.dataInicio || v.dataFim);
      if (filtroMes !== "Todos") {
        const mesAno = data?.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
        if (mesAno !== filtroMes) return false;
      }
      if (filtroMotorista !== "Todos") {
        if ((motoristasMap[v.motorista] || v.motorista) !== filtroMotorista) return false;
      }
      return true;
    });
  }, [viagens, filtroMes, filtroMotorista, motoristasMap]);

  const abastecimentosFiltrados = useMemo(() => {
    return abastecimentos.filter((a) => {
      const data = parseDate(a.dataHora || a.data);
      if (filtroMes !== "Todos") {
        const mesAno = data?.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
        if (mesAno !== filtroMes) return false;
      }
      if (filtroMotorista !== "Todos") {
        if ((motoristasMap[a.motorista] || a.motorista) !== filtroMotorista) return false;
      }
      return true;
    });
  }, [abastecimentos, filtroMes, filtroMotorista, motoristasMap]);

  const totalViagens = viagensFiltradas.length;
  const totalAbastecimentos = abastecimentosFiltrados.length;
  const mediaGeralConsumo = viagensFiltradas.length > 0
    ? (viagensFiltradas.reduce((acc, v) => acc + (v.media || 0), 0) / viagensFiltradas.length).toFixed(2)
    : "0";

  const rankingMotoristasPorMedia = useMemo(() => {
    const medias = {};
    viagensFiltradas.forEach((v) => {
      if (v.motorista && v.media) {
        if (!medias[v.motorista]) medias[v.motorista] = [];
        medias[v.motorista].push(v.media);
      }
    });
    return Object.entries(medias)
      .map(([id, arr]) => ({
        nome: motoristasMap[id] || id,
        media: (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2),
      }))
      .sort((a, b) => parseFloat(a.media) - parseFloat(b.media));
  }, [viagensFiltradas, motoristasMap]);

  const rankingMotoristasPorKM = useMemo(() => {
    const kms = {};
    viagensFiltradas.forEach((v) => {
      if (v.motorista && v.kmFinal && v.kmInicial) {
        const kmRodado = v.kmFinal - v.kmInicial;
        if (!kms[v.motorista]) kms[v.motorista] = 0;
        kms[v.motorista] += kmRodado;
      }
    });
    return Object.entries(kms)
      .map(([id, km]) => ({ nome: motoristasMap[id] || id, km }))
      .sort((a, b) => b.km - a.km);
  }, [viagensFiltradas, motoristasMap]);

  const rankingVeiculosMaisUsados = useMemo(() => {
    const uso = {};
    viagensFiltradas.forEach((v) => {
      if (v.caminhao) {
        if (!uso[v.caminhao]) uso[v.caminhao] = 0;
        uso[v.caminhao]++;
      }
    });
    return Object.entries(uso)
      .map(([id, qtd]) => ({ placa: veiculosMap[id] || id, viagens: qtd }))
      .sort((a, b) => b.viagens - a.viagens);
  }, [viagensFiltradas, veiculosMap]);

  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f4f7fa",
    borderRadius: "12px",
  };
  const filtrosContainer = {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "32px",
  };
  const filtroStyle = {
    display: "flex",
    flexDirection: "column",
    minWidth: "180px",
    flex: "1 1 180px",
  };
  const selectStyle = {
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
  };
  const cardsContainer = {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "32px",
  };
  const cardStyle = {
    flex: "1 1 300px",
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  };
  const cardTitle = {
    fontSize: "1.2rem",
    marginBottom: "12px",
    fontWeight: "600",
    color: "#1f2937",
  };
  const cardValue = {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#0f172a",
  };

  return (
    <div style={containerStyle}>
      <div style={filtrosContainer}>
        <div style={filtroStyle}>
          <label htmlFor="filtroMes" style={{ marginBottom: "6px", fontWeight: "600" }}>
            Filtrar por mês:
          </label>
          <select
            id="filtroMes"
            style={selectStyle}
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
          >
            {mesesDisponiveis.map((mes) => (
              <option key={mes} value={mes}>{mes}</option>
            ))}
          </select>
        </div>

        <div style={filtroStyle}>
          <label htmlFor="filtroMotorista" style={{ marginBottom: "6px", fontWeight: "600" }}>
            Filtrar por motorista:
          </label>
          <select
            id="filtroMotorista"
            style={selectStyle}
            value={filtroMotorista}
            onChange={(e) => setFiltroMotorista(e.target.value)}
          >
            {motoristasDisponiveis.map((mot) => (
              <option key={mot} value={mot}>{mot}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={cardsContainer}>
        <div style={cardStyle}>
          <div style={cardTitle}>Total de Viagens</div>
          <div style={cardValue}>{totalViagens}</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Total de Abastecimentos</div>
          <div style={cardValue}>{totalAbastecimentos}</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Média Geral de Consumo (km/L)</div>
          <div style={cardValue}>{mediaGeralConsumo}</div>
        </div>
      </div>

      <div style={cardsContainer}>
        <div style={cardStyle}>
          <div style={cardTitle}>🏁 Ranking por Consumo</div>
          <ul style={{ textAlign: "left", paddingLeft: "16px" }}>
            {rankingMotoristasPorMedia.map((m, i) => (
              <li key={i}>{i + 1}. {m.nome} - {m.media} km/L</li>
            ))}
          </ul>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>📊 Ranking por KM Rodado</div>
          <ul style={{ textAlign: "left", paddingLeft: "16px" }}>
            {rankingMotoristasPorKM.map((m, i) => (
              <li key={i}>{i + 1}. {m.nome} - {m.km} km</li>
            ))}
          </ul>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>🚚 Veículos Mais Usados</div>
          <ul style={{ textAlign: "left", paddingLeft: "16px" }}>
            {rankingVeiculosMaisUsados.map((v, i) => (
              <li key={i}>{i + 1}. {v.placa} - {v.viagens} viagens</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}