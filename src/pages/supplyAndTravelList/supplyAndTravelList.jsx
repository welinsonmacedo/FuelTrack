import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";

export default function AbastecimentosList() {
  const [motoristas, setMotoristas] = useState([]);
  const [caminhoes, setCaminhoes] = useState([]);

  const [filtroMotorista, setFiltroMotorista] = useState("");
  const [filtroCaminhao, setFiltroCaminhao] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

  const [abastecimentos, setAbastecimentos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAbastecimento, setSelectedAbastecimento] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMotoristas() {
      const snap = await getDocs(collection(db, "motoristas"));
      const lista = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMotoristas(lista);
    }
    fetchMotoristas();
  }, []);

  useEffect(() => {
    async function fetchCaminhoes() {
      const snap = await getDocs(collection(db, "veiculos"));
      const lista = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCaminhoes(lista);
    }
    fetchCaminhoes();
  }, []);

  useEffect(() => {
    if (!motoristas.length || !caminhoes.length) return;

    async function fetchAbastecimentos() {
      setLoading(true);

      let q = collection(db, "abastecimentos");
      const constraints = [];

      if (filtroMotorista)
        constraints.push(where("motorista", "==", filtroMotorista));
      if (filtroCaminhao)
        constraints.push(where("caminhao", "==", filtroCaminhao));

      if (filtroDataInicio) {
        const dtInicio = new Date(filtroDataInicio);
        constraints.push(where("dataHora", ">=", dtInicio));
      }

      if (filtroDataFim) {
        const dtFim = new Date(filtroDataFim);
        dtFim.setHours(23, 59, 59, 999);
        constraints.push(where("dataHora", "<=", dtFim));
      }

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

      q = query(q, orderBy("dataHora", "desc"));

      const snap = await getDocs(q);
      const lista = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setAbastecimentos(lista);
      setLoading(false);
    }

    fetchAbastecimentos();
  }, [
    filtroMotorista,
    filtroCaminhao,
    filtroDataInicio,
    filtroDataFim,
    motoristas,
    caminhoes,
  ]);

  const nomeMotorista = (id) => {
    const m = motoristas.find((m) => m.id === id);
    return m ? m.nome : id;
  };

  const infoCaminhao = (id) => {
    const c = caminhoes.find((c) => c.id === id);
    return c ? `${c.placa} - ${c.modelo}` : id;
  };

  const placaCaminhao = (id) => {
    const c = caminhoes.find((c) => c.id === id);
    return c ? c.placa : id;
  };

  const abrirModal = (abastecimento) => {
    setSelectedAbastecimento(abastecimento);
    setModalOpen(true);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setSelectedAbastecimento(null);
  };

  const apagarAbastecimento = async (id) => {
    if (window.confirm("Tem certeza que deseja apagar este abastecimento?")) {
      await deleteDoc(doc(db, "abastecimentos", id));
      setAbastecimentos((prev) => prev.filter((a) => a.id !== id));
      fecharModal();
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Lista de Abastecimentos</h1>

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

        <input
          type="date"
          value={filtroDataInicio}
          onChange={(e) => setFiltroDataInicio(e.target.value)}
          style={styles.inputDate}
        />
        <input
          type="date"
          value={filtroDataFim}
          onChange={(e) => setFiltroDataFim(e.target.value)}
          style={styles.inputDate}
        />
      </section>

      {loading ? (
        <p>Carregando abastecimentos...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableTitle}>
              <th>Motorista</th>
              <th>Placa</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {abastecimentos.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: "center" }}>
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : (
              abastecimentos.map((a) => (
                <tr
                  key={a.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => abrirModal(a)}
                >
                  <td>{nomeMotorista(a.motorista)}</td>
                  <td>{placaCaminhao(a.caminhao)}</td>
                  <td>
                    {a.dataHora && typeof a.dataHora.toDate === "function"
                      ? a.dataHora.toDate().toLocaleDateString("pt-BR")
                      : new Date(a.dataHora).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {modalOpen && selectedAbastecimento && (
        <div style={styles.modalOverlay} onClick={fecharModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Detalhes do Abastecimento</h2>
            <p>
              <strong>Motorista:</strong>{" "}
              {nomeMotorista(selectedAbastecimento.motorista)}
            </p>
            <p>
              <strong>Caminhão:</strong>{" "}
              {infoCaminhao(selectedAbastecimento.caminhao)}
            </p>
            <p>
              <strong>Placa:</strong> {placaCaminhao(selectedAbastecimento.caminhao)}
            </p>
            <p>
              <strong>Data e Hora:</strong>{" "}
              {selectedAbastecimento.dataHora &&
              typeof selectedAbastecimento.dataHora.toDate === "function"
                ? selectedAbastecimento.dataHora
                    .toDate()
                    .toLocaleString("pt-BR")
                : new Date(selectedAbastecimento.dataHora).toLocaleString("pt-BR")}
            </p>
            <p>
              <strong>KM:</strong> {selectedAbastecimento.kmAbastecimento}
            </p>
            <p>
              <strong>Litros:</strong> {selectedAbastecimento.litros}
            </p>
            <p>
              <strong>Preço por Litro:</strong> R${" "}
              {Number(selectedAbastecimento.precoLitro).toFixed(2)}
            </p>

            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <button
                onClick={() =>
                  navigate(`/editFuelRegister/${selectedAbastecimento.id}`)
                }
                style={styles.button}
              >
                Editar
              </button>
              <button
                onClick={() => apagarAbastecimento(selectedAbastecimento.id)}
                style={{ ...styles.button, backgroundColor: "#e74c3c" }}
              >
                Apagar
              </button>
              <button onClick={fecharModal} style={styles.button}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1080px",
    margin: "30px auto",
    padding: "0 20px",
    fontFamily: "'Segoe UI', sans-serif",
    color: "#000000",
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    fontWeight: 600,
    color: "#00BCD4",
  },
  filters: {
    display: "flex",
    gap: 15,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  select: {
    flex: "1 1 180px",
    padding: "10px",
    fontSize: 16,
    borderRadius: 8,
    border: "1px solid #555",
    backgroundColor: "#ffffff",
    color: "#000000",
  },
  inputDate: {
    flex: "1 1 180px",
    padding: "10px",
    fontSize: 16,
    borderRadius: 8,
    border: "1px solid #555",
    backgroundColor: "#ffffff",
    color: "#000000",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    overflow: "hidden",
    boxShadow: "0 0 12px rgba(0,0,0,0.3)",
    textAlign: "center",
  },
  tableTitle: {
    backgroundColor: "#00BCD4",
    color: "white",
    fontWeight: "600",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    padding: 25,
    borderRadius: 10,
    maxWidth: 700,
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 0 20px rgba(0,0,0,0.5)",
    color: "#000000",
  },
  button: {
    padding: "10px 20px",
    fontSize: 16,
    cursor: "pointer",
    borderRadius: 6,
    border: "none",
    backgroundColor: "#00BCD4",
    color: "white",
    transition: "background 0.3s",
  },
};
