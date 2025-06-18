import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function EditTravelRegister() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [viagem, setViagem] = useState({
    motorista: "",
    caminhao: "",
    kmInicial: "",
    kmFinal: "",
    dataInicio: "",
    dataFim: "",
    observacoes: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViagem = async () => {
      try {
        const docRef = doc(db, "viagens", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setViagem(docSnap.data());
        } else {
          alert("Viagem não encontrada.");
          navigate("/travels");
        }
      } catch (error) {
        console.error("Erro ao buscar viagem:", error);
        alert("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchViagem();
  }, [id, navigate]);

  const handleChange = (e) => {
    setViagem({ ...viagem, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const docRef = doc(db, "viagens", id);
      await updateDoc(docRef, viagem);
      alert("Viagem atualizada com sucesso!");
      navigate("/travels");
    } catch (error) {
      console.error("Erro ao atualizar viagem:", error);
      alert("Erro ao atualizar viagem.");
    }
  };

  if (loading) return <p>Carregando dados da viagem...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Editar Viagem</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          KM Inicial:
          <input
            type="number"
            name="kmInicial"
            value={viagem.kmInicial}
            onChange={handleChange}
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          KM Final:
          <input
            type="number"
            name="kmFinal"
            value={viagem.kmFinal}
            onChange={handleChange}
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Data Início:
          <input
            type="date"
            name="dataInicio"
            value={viagem.dataInicio}
            onChange={handleChange}
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Data Fim:
          <input
            type="date"
            name="dataFim"
            value={viagem.dataFim}
            onChange={handleChange}
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Observações:
          <textarea
            name="observacoes"
            value={viagem.observacoes}
            onChange={handleChange}
            style={{ ...styles.input, height: "80px" }}
          />
        </label>
        <button type="submit" style={styles.button}>
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    backgroundColor: "#ecf0f1",
    height: "100%",
    maxWidth: "600px",
    margin: "auto",
    borderRadius: "8px",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
    color: "#2c3e50",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "15px",
    fontSize: "16px",
    color: "#34495e",
  },
  input: {
    marginTop: "5px",
    padding: "8px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    width: "100%",
    boxSizing: "border-box",
  },
  button: {
    marginTop: "20px",
    backgroundColor: "#3498db",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

