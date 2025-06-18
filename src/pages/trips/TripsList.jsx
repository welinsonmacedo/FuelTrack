import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../../services/firebase";

export default function ViagensList() {
  const [viagens, setViagens] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [caminhoes, setCaminhoes] = useState([]);
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viagemSelecionada, setViagemSelecionada] = useState(null);
  const [filtroMotorista, setFiltroMotorista] = useState("");
  const [filtroCaminhao, setFiltroCaminhao] = useState("");

  useEffect(() => {
    async function fetchMotoristas() {
      const snap = await getDocs(collection(db, "motoristas"));
      setMotoristas(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }
    fetchMotoristas();
  }, []);

  useEffect(() => {
    async function fetchCaminhoes() {
      const snap = await getDocs(collection(db, "veiculos"));
      setCaminhoes(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }
    fetchCaminhoes();
  }, []);

  useEffect(() => {
    async function fetchViagens() {
      setLoading(true);
      let q = collection(db, "viagens");
      const filtros = [];

      if (filtroMotorista)
        filtros.push(where("motorista", "==", filtroMotorista));
      if (filtroCaminhao)
        filtros.push(where("caminhao", "==", filtroCaminhao));

      if (filtros.length > 0) q = query(q, ...filtros);

      q = query(q, orderBy("dataInicio", "desc"));
      const snap = await getDocs(q);
      setViagens(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }

    fetchViagens();
  }, [filtroMotorista, filtroCaminhao]);

  useEffect(() => {
    async function fetchAbastecimentos() {
      if (!viagemSelecionada) return;

      const q = query(
        collection(db, "abastecimentos"),
        where("viagemId", "==", viagemSelecionada.id)
      );
      const snap = await getDocs(q);
      setAbastecimentos(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }

    fetchAbastecimentos();
  }, [viagemSelecionada]);

  const nomeMotorista = (id) => {
    const m = motoristas.find((m) => m.id === id);
    return m ? m.nome : id;
  };

  const infoCaminhao = (id) => {
    const c = caminhoes.find((c) => c.id === id);
    return c ? `${c.placa} - ${c.modelo}` : id;
  };

  const abrirModal = (viagem) => {
    setViagemSelecionada(viagem);
    setModalOpen(true);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setViagemSelecionada(null);
    setAbastecimentos([]);
  };

  const apagarViagem = async (id) => {
    if (window.confirm("Deseja apagar esta viagem?")) {
      await deleteDoc(doc(db, "viagens", id));
      setViagens((prev) => prev.filter((v) => v.id !== id));
      fecharModal();
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Lista de Viagens</h1>

      <section style={styles.filters}>
        <select
          value={filtroMotorista}
          onChange={(e) => setFiltroMotorista(e.target.value)}
          style={styles.select}
        >
          <option value="">Filtrar por Motorista</option>
          {motoristas.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>

        <select
          value={filtroCaminhao}
          onChange={(e) => setFiltroCaminhao(e.target.value)}
          style={styles.select}
        >
          <option value="">Filtrar por Caminhão</option>
          {caminhoes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.placa} - {c.modelo}
            </option>
          ))}
        </select>
      </section>

      {loading ? (
        <p>Carregando viagens...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableTitle}>
              <th>Motorista</th>
              <th>Caminhão</th>
              <th>Data Início</th>
              <th>Data Fim</th>
            </tr>
          </thead>
          <tbody>
            {viagens.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  Nenhuma viagem encontrada.
                </td>
              </tr>
            ) : (
              viagens.map((v) => (
                <tr
                  key={v.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => abrirModal(v)}
                >
                  <td>{nomeMotorista(v.motorista)}</td>
                  <td>{infoCaminhao(v.caminhao)}</td>
                  <td>{v.dataInicio}</td>
                  <td>{v.dataFim}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {modalOpen && viagemSelecionada && (
        <div style={styles.modalOverlay} onClick={fecharModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 10 }}>🚚 Detalhes da Viagem</h2>
            <div style={{ marginBottom: 10 }}>
              <p><strong>Motorista:</strong> {nomeMotorista(viagemSelecionada.motorista)}</p>
              <p><strong>Caminhão:</strong> {infoCaminhao(viagemSelecionada.caminhao)}</p>
              <p><strong>Data Início:</strong> {viagemSelecionada.dataInicio}</p>
              <p><strong>Data Fim:</strong> {viagemSelecionada.dataFim}</p>
              <p><strong>KM Inicial:</strong> {viagemSelecionada.kmInicial}</p>
              <p><strong>KM Final:</strong> {viagemSelecionada.kmFinal}</p>
              <p><strong>Observações:</strong> {viagemSelecionada.observacoes || "Nenhuma"}</p>
            </div>

            <hr style={{ margin: "15px 0" }} />

            <h3 style={{ marginBottom: 5 }}>⛽ Abastecimentos da Viagem</h3>
            {abastecimentos.length === 0 ? (
              <p>Nenhum abastecimento registrado para essa viagem.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f2f2f2" }}>
                    <th style={styles.cell}>Data/Hora</th>
                    <th style={styles.cell}>Litros</th>
                    <th style={styles.cell}>Preço (R$)</th>
                    <th style={styles.cell}>Total (R$)</th>
                    <th style={styles.cell}>KM</th>
                    <th style={styles.cell}>NF</th>
                  </tr>
                </thead>
                <tbody>
                  {abastecimentos.map((a) => (
                    <tr key={a.id}>
                      <td style={styles.cell}>{a.dataHora || "-"}</td>
                      <td style={styles.cell}>{a.litros ?? "-"}</td>
                      <td style={styles.cell}>{a.precoLitro?.toFixed(2) ?? "-"}</td>
                      <td style={styles.cell}>
                        {a.litros && a.precoLitro ? `R$ ${(a.litros * a.precoLitro).toFixed(2)}` : "-"}
                      </td>
                      <td style={styles.cell}>{a.kmAbastecimento ?? "-"}</td>
                      <td style={styles.cell}>{a.notaFiscal ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <button onClick={() => alert("Editar viagem")} style={styles.button}>Editar</button>
              <button onClick={() => apagarViagem(viagemSelecionada.id)} style={{ ...styles.button, backgroundColor: "#e74c3c" }}>Apagar</button>
              <button onClick={fecharModal} style={styles.button}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "900px",
    margin: "0 auto",
  },
  title: {
    marginBottom: "15px",
    color: "#2c3e50",
    fontSize: "20px",
  },
  filters: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
    flexWrap: "wrap",
  },
  select: {
    flex: "1 1 150px",
    padding: "8px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  tableTitle: {
    backgroundColor: "#4a5f7e",
    color: "white",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    minWidth: 300,
    maxWidth: 600,
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.26)",
  },
  button: {
    padding: "8px 12px",
    borderRadius: 5,
    border: "none",
    cursor: "pointer",
    backgroundColor: "#3498db",
    color: "white",
  },
  cell: {
    border: "1px solid #ccc",
    padding: "6px 8px",
    textAlign: "center",
    fontSize: "14px",
  },
};
