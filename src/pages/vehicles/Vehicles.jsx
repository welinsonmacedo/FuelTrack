import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import ListItem from "../../components/ListItem";
import { useUI } from "../../contexts/UIContext";

export default function Vehicles() {
  const [veiculos, setVeiculos] = useState([]);
  const [selectedVeiculo, setSelectedVeiculo] = useState(null);
  const [busca, setBusca] = useState("");
  const [loadingExcluir, setLoadingExcluir] = useState(false);
  const navigate = useNavigate();
  const { showAlert } = useUI();

  const fetchVeiculos = async () => {
    const querySnapshot = await getDocs(collection(db, "veiculos"));
    const lista = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setVeiculos(lista);
  };

  const handleExcluir = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este veículo?")) {
      try {
        setLoadingExcluir(true);
        await deleteDoc(doc(db, "veiculos", id));
        setSelectedVeiculo(null);
        showAlert("Veículo excluído com sucesso!", "success");
        fetchVeiculos();
      } catch (error) {
        showAlert("Erro ao excluir veículo.", "error");
        console.error(error);
      } finally {
        setLoadingExcluir(false);
      }
    }
  };

  useEffect(() => {
    fetchVeiculos();
  }, []);

  const veiculosFiltrados = veiculos.filter((veic) =>
    veic.placa.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Veículos</h1>
        <input
          type="text"
          placeholder="Buscar placa..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={styles.search}
        />
        <Button onClick={() => navigate("/truckregister")}>
          Cadastrar Veículo
        </Button>
      </div>

      <ul style={styles.list}>
        {veiculosFiltrados.map((veic) => (
          <ListItem
            key={veic.id}
            icon="🚛"
            text={`${veic.placa} - ${veic.modelo}`}
            onClick={() => setSelectedVeiculo(veic)}
          />
        ))}
        {veiculosFiltrados.length === 0 && (
          <li style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            Nenhum veículo cadastrado.
          </li>
        )}
      </ul>

      <Modal
        isOpen={!!selectedVeiculo}
        onClose={() => setSelectedVeiculo(null)}
        title={selectedVeiculo?.placa}
      >
        <div style={styles.infoRow}>
          <span style={styles.label}>Modelo:</span>
          <span>{selectedVeiculo?.modelo}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Marca:</span>
          <span>{selectedVeiculo?.marca}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Ano:</span>
          <span>{selectedVeiculo?.ano}</span>
        </div>

        <div style={styles.modalButtons}>
          <Button
            onClick={() => {
              navigate(`/truckedit/${selectedVeiculo.id}`);
              setSelectedVeiculo(null);
            }}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            onClick={() => handleExcluir(selectedVeiculo.id)}
            loading={loadingExcluir}
            disabled={loadingExcluir}
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
    marginBottom: "10px",
    fontSize: "14px",
  },
  label: {
    fontWeight: "bold",
    width: "90px",
  },
  modalButtons: {
    marginTop: "25px",
    display: "flex",
    justifyContent: "space-evenly",
    flexWrap: "wrap",
    gap: "10px",
  },
};
