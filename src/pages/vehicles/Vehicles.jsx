import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import ListItem from "../../components/ListItem";
import { useUI } from "../../contexts/UIContext";

export default function Vehicles() {
  const [veiculos, setVeiculos] = useState([]);
  const [selectedVeiculo, setSelectedVeiculo] = useState(null);
  const [busca, setBusca] = useState("");

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
  
        await deleteDoc(doc(db, "veiculos", id));
        setSelectedVeiculo(null);
        showAlert("Veículo excluído com sucesso!", "success");
        fetchVeiculos();
      } catch (error) {
        showAlert("Erro ao excluir veículo.", "error");
        console.error(error);
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
        <button onClick={() => navigate("/truckregister")}>
          Cadastrar Veículo
        </button>
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
        title={` ${selectedVeiculo?.placa}`}
        onEdit={() => {
          navigate(`/truckregister/edit/${selectedVeiculo.id}`);
          setSelectedVeiculo(null);
        }}
        onDelete={() => handleExcluir(selectedVeiculo.id)}
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
        <div style={styles.infoRow}>
          <span style={styles.label}>Status:</span>
          <span>{selectedVeiculo?.status}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Renavam:</span>
          <span>{selectedVeiculo?.renavam}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Chassi:</span>
          <span>{selectedVeiculo?.chassi}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Nº CRLV:</span>
          <span>{selectedVeiculo?.numeroCRLV}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Licenciamento:</span>
          <span>
            {selectedVeiculo?.vencimentoLicenciamento
              ? new Date(selectedVeiculo.vencimentoLicenciamento).toLocaleDateString("pt-BR")
              : "—"}
          </span>
        </div>

        {selectedVeiculo?.documentoUrl && (
          <div style={styles.infoRow}>
            <span style={styles.label}>Documento:</span>
            <a
              href={selectedVeiculo.documentoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2980b9", textDecoration: "underline" }}
            >
              Visualizar
            </a>
          </div>
        )}
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
};
