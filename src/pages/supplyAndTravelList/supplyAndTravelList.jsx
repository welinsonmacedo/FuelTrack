import React, { useEffect, useState } from "react";
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

      if (filtroMotorista) constraints.push(where("motorista", "==", filtroMotorista));
      if (filtroCaminhao) constraints.push(where("caminhao", "==", filtroCaminhao));

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
  console.log("Verificando motorista:", id, "=>", m ? m.nome : "Não encontrado");
  return m ? m.nome : id;
};

  const infoCaminhao = (id) => {
    if (!id || !caminhoes.length) return id;
    const c = caminhoes.find((c) => c.id === id);
    return c ? `${c.placa} - ${c.modelo}` : id;
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
          placeholder="Data Início"
        />
        <input
          type="date"
          value={filtroDataFim}
          onChange={(e) => setFiltroDataFim(e.target.value)}
          style={styles.inputDate}
          placeholder="Data Fim"
        />
      </section>

      {motoristas.length === 0 || caminhoes.length === 0 ? (
        <p>Carregando motoristas e caminhões...</p>
      ) : loading ? (
        <p>Carregando abastecimentos...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableTitle} >
              <th>Motorista</th>
              
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
                <tr key={a.id} style={{ cursor: "pointer" }} onClick={() => abrirModal(a)}>
                  <td>{nomeMotorista(a.motorista)}</td>
                 
                  <td>{new Date(a.dataHora).toLocaleDateString()}</td>
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
              <strong>Motorista:</strong> {nomeMotorista(selectedAbastecimento.motorista)}
            </p>
            <p>
              <strong>Caminhão:</strong> {infoCaminhao(selectedAbastecimento.caminhao)}
            </p>
            <p>
              <strong>Data e Hora:</strong>{" "}
              {new Date(selectedAbastecimento.dataHora).toLocaleString()}
            </p>
            <p>
              <strong>KM:</strong> {selectedAbastecimento.kmAbastecimento}
            </p>
            <p>
              <strong>Litros:</strong> {selectedAbastecimento.litros}
            </p>
            <p>
              <strong>Preço por Litro:</strong> R$ {Number(selectedAbastecimento.precoLitro).toFixed(2)}
            </p>

            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <button onClick={() => alert("Implementar edição aqui")} style={styles.button}>
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
  inputDate: {
    flex: "1 1 150px",
    padding: "8px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign:"left"
  },
    tableTitle: {
    backgroundColor:"#4a5f7e",
    padding:"5vw"
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
    maxWidth: 500,
    boxShadow: "0 2px 8px rgba(0,0,0,0.26)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "left",
  },
  button: {
    padding: "8px 12px",
    borderRadius: 5,
    border: "none",
    cursor: "pointer",
    backgroundColor: "#3498db",
    color: "white",
  },
};
