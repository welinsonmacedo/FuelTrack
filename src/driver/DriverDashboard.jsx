import React, { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";

export default function DriverDashboard() {
  const { user } = useUser();
  const [viagens, setViagens] = useState([]);
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [mediaGeral, setMediaGeral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mesFiltro, setMesFiltro] = useState("");
  const [placasMap, setPlacasMap] = useState({});
  const navigate = useNavigate();
  useEffect(() => {
    if (!user || user.tipo !== "motorista") return;

    async function fetchData() {
      setLoading(true);

      const qMotorista = query(
        collection(db, "motoristas"),
        where("userId", "==", user.uid)
      );
      const snapMotorista = await getDocs(qMotorista);

      if (snapMotorista.empty) {
        setViagens([]);
        setAbastecimentos([]);
        setMediaGeral(null);
        setLoading(false);
        return;
      }

      const motoristaId = snapMotorista.docs[0].id;

      const snapCaminhoes = await getDocs(collection(db, "veiculos"));
      const caminhaoMap = {};
      snapCaminhoes.forEach((doc) => {
        caminhaoMap[doc.id] = doc.data().placa || "Sem placa";
      });
      setPlacasMap(caminhaoMap);

      let qViagens = query(
        collection(db, "viagens"),
        where("motorista", "==", motoristaId)
      );
      const snapViagens = await getDocs(qViagens);
      let dadosViagens = snapViagens.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (mesFiltro) {
        const [ano, mes] = mesFiltro.split("-");
        dadosViagens = dadosViagens.filter((v) => {
          const inicio = v.dataInicio.toDate();
          return (
            inicio.getFullYear() === Number(ano) &&
            inicio.getMonth() + 1 === Number(mes)
          );
        });
      }

      setViagens(dadosViagens);

      const snapAbastecimentos = await getDocs(
        query(
          collection(db, "abastecimentos"),
          where("motorista", "==", motoristaId)
        )
      );
      const dadosAbastecimentos = snapAbastecimentos.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAbastecimentos(dadosAbastecimentos);

      // Média geral
      let totalLitros = 0;
      let totalKm = 0;
      dadosAbastecimentos.forEach((a) => {
        const viagem = dadosViagens.find((v) => v.id === a.viagemId);
        if (viagem) {
          const km = viagem.kmFinal - viagem.kmInicial;
          totalLitros += a.litros || 0;
          totalKm += km || 0;
        }
      });

      setMediaGeral(
        totalLitros > 0 ? (totalKm / totalLitros).toFixed(2) : null
      );
      setLoading(false);
    }

    fetchData();
  }, [user, mesFiltro]);

  function abastecimentosDaViagem(viagemId) {
    return abastecimentos.filter((a) => a.viagemId === viagemId);
  }

  function formatarData(data) {
    if (!data) return "Sem data";
    if (typeof data.toDate === "function")
      return data.toDate().toLocaleString();
    const d = new Date(data);
    return isNaN(d.getTime()) ? "Sem data" : d.toLocaleString();
  }

  if (!user || user.tipo !== "motorista") {
    return (
      <p style={styles.error}>
        Acesso negado. Apenas motoristas podem acessar essa página.
      </p>
    );
  }

  if (loading) return <p style={styles.loading}>Carregando dados...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Bem-vindo, {user.nome || "Motorista"}</h1>

      <div style={styles.filtroContainer}>
        <label>Filtrar por mês:</label>
        <input
          type="month"
          value={mesFiltro}
          onChange={(e) => setMesFiltro(e.target.value)}
          style={styles.input}
        />
      </div>

      <h2 style={styles.subtitulo}>Suas Viagens</h2>

      {viagens.length === 0 && (
        <p style={styles.semDados}>Nenhuma viagem encontrada para o período.</p>
      )}

      {viagens.map((v) => {
        const abs = abastecimentosDaViagem(v.id);
        let totalLitros = 0;
        let kmRodado = v.kmFinal - v.kmInicial;
        abs.forEach((a) => {
          totalLitros += a.litros || 0;
        });
        const mediaViagem =
          totalLitros > 0 ? (kmRodado / totalLitros).toFixed(2) : null;
        const placa = placasMap[v.caminhao] || "Desconhecida";

        return (
          <div key={v.id} style={styles.card}>
            <div>
              <strong>Placa:</strong> {placa}
            </div>
            <div>
              <strong>Sigla:</strong> {v.sigla}
            </div>
            <div>
              <strong>Período:</strong>{" "}
              {v.dataInicio.toDate().toLocaleDateString()} até{" "}
              {v.dataFim.toDate().toLocaleDateString()}
            </div>
            <div>
              <strong>Média da viagem:</strong>{" "}
              {mediaViagem ? `${mediaViagem} km/l` : "Sem dados"}
            </div>

            {abs.length > 0 ? (
              <div style={{ marginTop: 10 }}>
                <strong>Abastecimentos:</strong>
                {abs.map((a) => (
                  <div key={a.id} style={styles.abastecimento}>
                    <div>Data: {formatarData(a.dataHora)}</div>
                    <div>Litros: {a.litros}</div>
                    <div>Km da Viagem: {kmRodado}</div>
                    <button
                      style={styles.botao}
                      onClick={() => navigate(`/checklist/${v.id}`)}
                    >
                      Checklist
                    </button>
                    <button
                      style={styles.botao}
                      onClick={() =>
                        alert(`Ler cupom do abastecimento ${a.id}`)
                      }
                    >
                      Ler Cupom
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={styles.semDados}>Sem abastecimentos vinculados.</p>
            )}
          </div>
        );
      })}

      <h2 style={styles.subtitulo}>Média Geral</h2>
      <p>{mediaGeral ? `${mediaGeral} km/l` : "Sem dados para cálculo."}</p>
    </div>
  );
}

const styles = {
  container: {
    padding: 16,
    backgroundColor: "#f0f2f5",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitulo: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  filtroContainer: {
    marginBottom: 20,
  },
  input: {
    padding: 8,
    fontSize: 16,
    borderRadius: 6,
    border: "1px solid #ccc",
    marginLeft: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
  },
  abastecimento: {
    backgroundColor: "#f9f9f9",
    padding: 8,
    marginTop: 10,
    borderRadius: 6,
    border: "1px solid #ddd",
  },
  botao: {
    padding: "6px 10px",
    marginTop: 8,
    marginRight: 8,
    backgroundColor: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 14,
  },
  loading: {
    padding: 20,
    textAlign: "center",
    fontSize: 16,
  },
  error: {
    padding: 20,
    textAlign: "center",
    color: "red",
  },
  semDados: {
    color: "#777",
    fontSize: 14,
    marginTop: 8,
  },
};
