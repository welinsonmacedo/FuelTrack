import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";

export default function Suppliers() {
  const [fornecedores, setFornecedores] = useState([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const navigate = useNavigate();

  const fetchFornecedores = async () => {
    const querySnapshot = await getDocs(collection(db, "fornecedores"));
    const lista = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setFornecedores(lista);
  };

  const excluirFornecedor = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este fornecedor?")) {
      await deleteDoc(doc(db, "fornecedores", id));
      setFornecedorSelecionado(null);
      fetchFornecedores();
    }
  };

  useEffect(() => {
    fetchFornecedores();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Lista de Fornecedores</h1>
      <button style={styles.button} onClick={() => navigate("supplierRegister")}>
        Cadastrar Fornecedor
      </button>

      <ul style={styles.list}>
        {fornecedores.map((f) => (
          <li
            key={f.id}
            style={styles.listItem}
            onClick={() => setFornecedorSelecionado(f)}
          >
            {f.nomeFantasia || f.razaoSocial}
          </li>
        ))}
      </ul>

      {fornecedorSelecionado && (
        <div
          style={styles.modalOverlay}
          onClick={() => setFornecedorSelecionado(null)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "20px" }}>
              {fornecedorSelecionado.nomeFantasia || fornecedorSelecionado.razaoSocial}
            </h2>
            <div style={styles.infoRow}>
              <span style={styles.label}>Razão Social:</span>
              <span>{fornecedorSelecionado.razaoSocial}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>CNPJ:</span>
              <span>{fornecedorSelecionado.cnpj}</span>
            </div>

            <div style={styles.modalButtons}>
              <button
                style={styles.button}
                onClick={() => {
                  navigate(`supplieredit/${fornecedorSelecionado.id}`);
                  setFornecedorSelecionado(null);
                }}
              >
                Editar
              </button>

              <button
                style={styles.delete}
                onClick={() => excluirFornecedor(fornecedorSelecionado.id)}
              >
                Excluir
              </button>

              <button
                style={styles.cancel}
                onClick={() => setFornecedorSelecionado(null)}
              >
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
    padding: "40px",
    backgroundColor: "#ecf0f1",
    height: "100vh",
    overflowY: "auto",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
    color: "#2c3e50",
  },
  button: {
    flex: 1,
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px",
    fontWeight: "bold",
    fontSize: "14px",
    transition: "background-color 0.2s",
  },
  delete: {
    flex: 1,
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    padding: "10px 0",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px",
    fontWeight: "bold",
    fontSize: "14px",
    transition: "background-color 0.2s",
  },
  cancel: {
    flex: 1,
    backgroundColor: "#7f8c8d",
    color: "white",
    border: "none",
    padding: "10px 0",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
    transition: "background-color 0.2s",
  },
  list: {
    listStyle: "none",
    padding: 0,
    maxWidth: "400px",
  },
  listItem: {
    backgroundColor: "white",
    padding: "10px 15px",
    marginBottom: "8px",
    borderRadius: "5px",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modal: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    maxWidth: "400px",
    width: "90%",
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
  },
  infoRow: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "left",
    marginBottom: "10px",
  },
  label: {
    fontWeight: "bold",
    width: "120px",
  },
  modalButtons: {
    marginTop: "25px",
    display: "flex",
    justifyContent: "space-between",
  },
};
