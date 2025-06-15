import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useNavigate } from 'react-router-dom';

export default function Drivers() {
  const [motoristas, setMotoristas] = useState([]);
 const navigate = useNavigate();
  const fetchMotoristas = async () => {
    const querySnapshot = await getDocs(collection(db, "motoristas"));
    const lista = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setMotoristas(lista);
  };

  const excluirMotorista = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este motorista?")) {
      await deleteDoc(doc(db, "motoristas", id));
      fetchMotoristas();
    }
  };

  useEffect(() => {
    fetchMotoristas();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Lista de Motoristas</h1>
      <button style={styles.button} onClick={() => navigate("driverregister")}>Cadastrar Motorista</button>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>CNH</th>
            <th>Categoria</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {motoristas.map((moto) => (
            <tr key={moto.id}>
              <td>{moto.nome}</td>
              <td>{moto.cpf}</td>
              <td>{moto.cnh}</td>
              <td>{moto.categoria}</td>
              <td>
               <button onClick={() => navigate(`driveredit/${moto.id}`)}>Editar</button>
                <button onClick={() => excluirMotorista(moto.id)} style={styles.delete}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
  }
};
