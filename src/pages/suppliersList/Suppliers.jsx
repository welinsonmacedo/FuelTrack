import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import ListItem from "../../components/ListItem";
import { useUI } from "../../contexts/UIContext";

export default function Suppliers() {
  const [fornecedores, setFornecedores] = useState([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const [busca, setBusca] = useState("");
  const [loadingExcluir, setLoadingExcluir] = useState(false);
  const navigate = useNavigate();
  const { showAlert } = useUI();

  const fetchFornecedores = async () => {
    const querySnapshot = await getDocs(collection(db, "fornecedores"));
    const lista = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setFornecedores(lista);
  };

  const excluirFornecedor = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este fornecedor?")) {
      try {
        setLoadingExcluir(true);
        await deleteDoc(doc(db, "fornecedores", id));
        setFornecedorSelecionado(null);
        showAlert("Fornecedor excluído com sucesso!", "success");
        fetchFornecedores();
      } catch (error) {
        showAlert("Erro ao excluir fornecedor.", "error");
        console.error(error);
      } finally {
        setLoadingExcluir(false);
      }
    }
  };

  useEffect(() => {
    fetchFornecedores();
  }, []);

  const fornecedoresFiltrados = fornecedores.filter((f) =>
    (f.nomeFantasia || f.razaoSocial || "").toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Fornecedores</h1>
        <input
          type="text"
          placeholder="Buscar fornecedor..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={styles.search}
        />
        <Button onClick={() => navigate("/supplierregister")}>Cadastrar Fornecedor</Button>
      </div>

      <ul style={styles.list}>
        {fornecedoresFiltrados.map((f) => (
          <ListItem
            key={f.id}
            icon="🏢"
            text={f.nomeFantasia || f.razaoSocial}
            onClick={() => setFornecedorSelecionado(f)}
          />
        ))}
        {fornecedoresFiltrados.length === 0 && (
          <li style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            Nenhum fornecedor encontrado.
          </li>
        )}
      </ul>

      <Modal
        isOpen={!!fornecedorSelecionado}
        onClose={() => setFornecedorSelecionado(null)}
        title={fornecedorSelecionado?.nomeFantasia || fornecedorSelecionado?.razaoSocial}
      >
        <div style={styles.infoRow}>
          <span style={styles.label}>Razão Social:</span>
          <span>{fornecedorSelecionado?.razaoSocial}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Nome Fantasia:</span>
          <span>{fornecedorSelecionado?.nomeFantasia}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>CNPJ:</span>
          <span>{fornecedorSelecionado?.cnpj}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Endereço:</span>
          <span>{fornecedorSelecionado?.endereco}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Telefone:</span>
          <span>{fornecedorSelecionado?.telefone}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Tipo:</span>
          <span>{fornecedorSelecionado?.tipo}</span>
        </div>

        <div style={styles.modalButtons}>
          <Button
            onClick={() => {
              navigate(`/supplieredit/${fornecedorSelecionado.id}`);
              setFornecedorSelecionado(null);
            }}
          >
            Editar
          </Button>

          <Button
            variant="danger"
            loading={loadingExcluir}
            disabled={loadingExcluir}
            onClick={() => excluirFornecedor(fornecedorSelecionado.id)}
          >
            Excluir
          </Button>

        
        </div>
      </Modal>
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
  header: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  title: {
    fontSize: "24px",
    color: "#2c3e50",
  },
  search: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    flex: 1,
    minWidth: "200px",
  },
  list: {
    listStyle: "none",
    padding: 0,
    maxWidth: "500px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: "10px",
    fontSize: "14px",
  },
  label: {
    fontWeight: "bold",
    width: "120px",
  },
  modalButtons: {
    marginTop: "25px",
    display: "flex",
    justifyContent: "space-evenly",
    flexWrap: "wrap",
    gap: "10px",
  },
};
