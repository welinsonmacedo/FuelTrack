import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";

export default function Drivers() {
  const [motoristas, setMotoristas] = useState([]);
  const [selectedMotorista, setSelectedMotorista] = useState(null);
  const navigate = useNavigate();

  const fetchMotoristas = async () => {
    const querySnapshot = await getDocs(collection(db, "motoristas"));
    const lista = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setMotoristas(lista);
  };

  const excluirMotorista = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este motorista?")) {
      await deleteDoc(doc(db, "motoristas", id));
      setSelectedMotorista(null);
      fetchMotoristas();
    }
  };

  useEffect(() => {
    fetchMotoristas();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Lista de Motoristas</h1>
      <button style={styles.button} onClick={() => navigate("driverregister")}>
        Cadastrar Motorista
      </button>

      <ul style={styles.list}>
        {motoristas.map((moto) => (
          <li
            key={moto.id}
            style={styles.listItem}
            onClick={() => setSelectedMotorista(moto)}
          >
            {moto.nome}
          </li>
        ))}
      </ul>

      {selectedMotorista && (
        <div style={styles.modalOverlay} onClick={() => setSelectedMotorista(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "20px" }}>{selectedMotorista.nome}</h2>

            {selectedMotorista.foto && (
              <img
                src={selectedMotorista.foto}
                alt="Foto do Motorista"
                style={{ width: "100px", maxHeight: "100px", objectFit: "cover", borderRadius: "5px", marginBottom: "15px" }}
              />
            )}

            <div style={styles.infoRow}><span style={styles.label}>CPF:</span> <span>{selectedMotorista.cpf}</span></div>
            <div style={styles.infoRow}><span style={styles.label}>CNH:</span> <span>{selectedMotorista.cnh}</span></div>
            <div style={styles.infoRow}><span style={styles.label}>Categoria:</span> <span>{selectedMotorista.categoria}</span></div>
            <div style={styles.infoRow}><span style={styles.label}>Telefone:</span> <span>{selectedMotorista.telefone}</span></div>
            <div style={styles.infoRow}><span style={styles.label}>WhatsApp:</span> <span>{selectedMotorista.whatsapp}</span></div>
            <div style={styles.infoRow}><span style={styles.label}>Email:</span> <span>{selectedMotorista.email}</span></div>

            {selectedMotorista.endereco && (
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
              <button
                style={styles.button}
                onClick={() => {
                  navigate(`driveredit/${selectedMotorista.id}`);
                  setSelectedMotorista(null);
                }}
              >
                Editar
              </button>

              <button
                style={styles.delete}
                onClick={() => excluirMotorista(selectedMotorista.id)}
              >
                Excluir
              </button>

              <button
                style={styles.cancel}
                onClick={() => setSelectedMotorista(null)}
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
    padding: "10px ",
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
    justifyContent: "space-between",
  },
};
