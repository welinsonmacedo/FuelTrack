import React, { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function ConfirmMaintenanceDoneModal({
  isOpen,
  onClose,
  manutencao,
  onConfirm,
}) {
  const [fornecedores, setFornecedores] = useState([]);
  const [oficinaId, setOficinaId] = useState("");
  const [dataExecucao, setDataExecucao] = useState("");
  const [kmExecucao, setKmExecucao] = useState("");

  useEffect(() => {
    if (isOpen) {
      async function fetchOficinas() {
        try {
          const q = query(
            collection(db, "fornecedores"),
            where("tipo", "==", "Manutenção")
          );
          const snapshot = await getDocs(q);
          const oficinas = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFornecedores(oficinas);
        } catch (error) {
          console.error("Erro ao buscar oficinas:", error);
        }
      }

      fetchOficinas();

      setOficinaId(manutencao?.oficinaId || "");
      setDataExecucao("");
      setKmExecucao(manutencao?.kmRealizacao || "");
    }
  }, [isOpen, manutencao]);

  const handleConfirm = () => {
    if (!oficinaId || !dataExecucao || !kmExecucao) {
      alert("Preencha todos os campos antes de confirmar.");
      return;
    }
    onConfirm({ oficinaId, dataExecucao, kmExecucao });
  };

  if (!isOpen) return null;

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <h2>Confirmar Serviço Realizado</h2>

        <label>
          Oficina:
          <select
            value={oficinaId}
            onChange={(e) => setOficinaId(e.target.value)}
            style={styles.select}
          >
            <option value="">Selecione a oficina</option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.razaoSocial}
              </option>
            ))}
          </select>
        </label>

        <label>
          Data de Execução:
          <input
            type="date"
            value={dataExecucao}
            onChange={(e) => setDataExecucao(e.target.value)}
            style={styles.input}
          />
        </label>

        <label>
          KM na Execução:
          <input
            type="number"
            value={kmExecucao}
            onChange={(e) => setKmExecucao(e.target.value)}
            style={styles.input}
            min="0"
          />
        </label>

        <div style={styles.buttons}>
          <button onClick={handleConfirm} style={styles.confirmBtn}>
            Confirmar
          </button>
          <button onClick={onClose} style={styles.cancelBtn}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: 320,
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  select: {
    width: "100%",
    padding: 8,
    fontSize: 16,
  },
  input: {
    width: "100%",
    padding: 8,
    fontSize: 16,
    marginTop: 5,
  },
  buttons: {
    marginTop: 15,
    display: "flex",
    justifyContent: "space-between",
  },
  confirmBtn: {
    backgroundColor: "#27ae60",
    border: "none",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: 6,
    cursor: "pointer",
  },
  cancelBtn: {
    backgroundColor: "#ccc",
    border: "none",
    color: "#333",
    padding: "10px 20px",
    borderRadius: 6,
    cursor: "pointer",
  },
};
