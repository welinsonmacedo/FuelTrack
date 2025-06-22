import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import ListItem from "../../components/ListItem";
import { useUI } from "../../contexts/UIContext";

export default function Drivers() {
  const [motoristas, setMotoristas] = useState([]);
  const [selectedMotorista, setSelectedMotorista] = useState(null);
  const [busca, setBusca] = useState("");
  const [loadingExcluir, setLoadingExcluir] = useState(false);
  const navigate = useNavigate();
  const { showAlert } = useUI();

  const fetchMotoristas = async () => {
    const querySnapshot = await getDocs(collection(db, "motoristas"));
    const lista = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setMotoristas(lista);
  };

  const excluirMotorista = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este motorista?")) {
      try {
        setLoadingExcluir(true);
        await deleteDoc(doc(db, "motoristas", id));
        setSelectedMotorista(null);
        showAlert("Motorista excluído com sucesso!", "success");
        fetchMotoristas();
      } catch (error) {
        showAlert("Erro ao excluir motorista.", "error");
        console.error(error);
      } finally {
        setLoadingExcluir(false);
      }
    }
  };

  useEffect(() => {
    fetchMotoristas();
  }, []);

  const motoristasFiltrados = motoristas.filter((moto) =>
    moto.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Motoristas</h1>
        <input
          type="text"
          placeholder="Buscar motorista..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={styles.search}
        />
        <Button onClick={() => navigate("driverregister")}>Cadastrar Motorista</Button>
      </div>

      <ul style={styles.list}>
        {motoristasFiltrados.map((moto) => (
          <ListItem
            key={moto.id}
            icon={moto.foto ? <img src={moto.foto} alt="foto" style={{ width: 30, height: 30, borderRadius: "50%" }} /> : "👤"}
            text={moto.nome}
            onClick={() => setSelectedMotorista(moto)}
          />
        ))}
      </ul>

      <Modal
        isOpen={!!selectedMotorista}
        onClose={() => setSelectedMotorista(null)}
        title={selectedMotorista?.nome}
      >
        {selectedMotorista?.foto && (
          <img
            src={selectedMotorista.foto}
            alt="Foto do Motorista"
            style={{ width: "100px", maxHeight: "100px", objectFit: "cover", borderRadius: "5px", marginBottom: "15px" }}
          />
        )}

        <div style={styles.infoRow}><span style={styles.label}>CPF:</span> <span>{selectedMotorista?.cpf}</span></div>
        <div style={styles.infoRow}><span style={styles.label}>CNH:</span> <span>{selectedMotorista?.cnh}</span></div>
        <div style={styles.infoRow}><span style={styles.label}>Categoria:</span> <span>{selectedMotorista?.categoria}</span></div>
        <div style={styles.infoRow}><span style={styles.label}>Telefone:</span> <span>{selectedMotorista?.telefone}</span></div>
        <div style={styles.infoRow}><span style={styles.label}>WhatsApp:</span> <span>{selectedMotorista?.whatsapp}</span></div>
        <div style={styles.infoRow}><span style={styles.label}>Email:</span> <span>{selectedMotorista?.email}</span></div>

        {selectedMotorista?.endereco && (
          <>
            <div style={styles.infoRow}><span style={styles.label}>CEP:</span> <span>{selectedMotorista.endereco.cep}</span></div>
            <div style={styles.infoRow}><span style={styles.label}>Rua:</span> <span>{selectedMotorista.endereco.rua}</span></div>
            <div style={styles.infoRow}><span style={styles.label}>Número:</span> <span>{selectedMotorista.endereco.numero}</span></div>
            <div style={styles.infoRow}><span style={styles.label}>Bairro:</span> <span>{selectedMotorista.endereco.bairro}</span></div>
            <div style={styles.infoRow}><span style={styles.label}>Cidade:</span> <span>{selectedMotorista.endereco.cidade}</span></div>
            <div style={styles.infoRow}><span style={styles.label}>Estado:</span> <span>{selectedMotorista.endereco.estado}</span></div>
          </>
        )}

        <div style={styles.modalButtons}>
          <Button onClick={() => {
            navigate(`driveredit/${selectedMotorista.id}`);
            setSelectedMotorista(null);
          }}>Editar</Button>

          <Button
            variant="danger"
            loading={loadingExcluir}
            disabled={loadingExcluir}
            onClick={() => excluirMotorista(selectedMotorista.id)}
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