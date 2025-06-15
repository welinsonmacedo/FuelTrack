import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function EditTruckRegister() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [veiculo, setVeiculo] = useState({
    placa: "",
    modelo: "",
    marca: "",
    ano: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVeiculo = async () => {
      try {
        const docRef = doc(db, "veiculos", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setVeiculo(docSnap.data());
        } else {
          alert("Veículo não encontrado.");
          navigate("/drivers"); // ou outra página padrão
        }
      } catch (error) {
        console.error("Erro ao buscar veículo:", error);
        alert("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchVeiculo();
  }, [id, navigate]);

  const handleChange = (e) => {
    setVeiculo({ ...veiculo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!veiculo.placa || !veiculo.modelo || !veiculo.marca || !veiculo.ano) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const docRef = doc(db, "veiculos", id);
      await updateDoc(docRef, veiculo);
      alert("Veículo atualizado com sucesso!");
      navigate("/drivers"); // ou /vehicles, ajuste conforme seu fluxo
    } catch (error) {
      console.error("Erro ao atualizar veículo:", error);
      alert("Erro ao atualizar veículo.");
    }
  };

  if (loading) {
    return <p>Carregando dados do veículo...</p>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Editar Veículo</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Placa:
          <input
            type="text"
            name="placa"
            value={veiculo.placa}
            onChange={handleChange}
            style={styles.input}
            maxLength={8}
          />
        </label>

        <label style={styles.label}>
          Modelo:
          <input
            type="text"
            name="modelo"
            value={veiculo.modelo}
            onChange={handleChange}
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Marca:
          <input
            type="text"
            name="marca"
            value={veiculo.marca}
            onChange={handleChange}
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Ano:
          <input
            type="number"
            name="ano"
            value={veiculo.ano}
            onChange={handleChange}
            style={styles.input}
            min="1900"
            max={new Date().getFullYear() + 1}
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
