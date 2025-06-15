import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";

export default function Vehicles() {
  const [veiculos, setVeiculos] = useState([]);
  const navigate = useNavigate();

  const fetchVeiculos = async () => {
    const querySnapshot = await getDocs(collection(db, "veiculos"));
    const lista = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setVeiculos(lista);
  };

  const excluirVeiculo = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este veículo?")) {
      await deleteDoc(doc(db, "veiculos", id));
      fetchVeiculos();
    }
  };

  useEffect(() => {
    fetchVeiculos();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Lista de Veículos</h1>
      <button
        style={styles.button}
        onClick={() => navigate("/truckregister")}
      >
        Cadastrar Veículo
      </button>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Placa</th>
            <th>Modelo</th>
            <th>Marca</th>
            <th>Ano</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {veiculos.map((veic) => (
            <tr key={veic.id}>
              <td>{veic.placa}</td>
              <td>{veic.modelo}</td>
              <td>{veic.marca}</td>
              <td>{veic.ano}</td>
              <td>
                <button
                  onClick={() => navigate(`/truckregister/edit/${veic.id}`)}
                >
                  Editar
                </button>
                <button
                  onClick={() => excluirVeiculo(veic.id)}
                  style={styles.delete}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
          {veiculos.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>
                Nenhum veículo cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    backgroundColor: "#ecf0f1",
    height: "100%",
    overflowY: "auto",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
    color: "#2c3e50",
  },
  button: {
    backgroundColor: "#3498db",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  delete: {
    marginLeft: "10px",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
