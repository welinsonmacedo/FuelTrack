import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function EditFuelRegister() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [abastecimento, setAbastecimento] = useState({
    caminhao: "",
    motorista: "",
    dataHora: "",
    kmAbastecimento: "",
    litros: "",
    precoLitro: "",
    fornecedor: "",
    notaFiscal: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAbastecimento() {
      try {
        const docRef = doc(db, "abastecimentos", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Tratamento seguro para o campo dataHora
          let dataHoraConvertida = "";
          if (data.dataHora) {
            if (typeof data.dataHora.toDate === "function") {
              // Firestore Timestamp
              dataHoraConvertida = data.dataHora.toDate().toISOString().slice(0, 16);
            } else if (data.dataHora instanceof Date) {
              // Já um Date do JS
              dataHoraConvertida = data.dataHora.toISOString().slice(0, 16);
            } else if (typeof data.dataHora === "string") {
              // String ISO (ex: "2023-06-22T14:00")
              dataHoraConvertida = data.dataHora.slice(0, 16);
            }
          }

          setAbastecimento({
            ...data,
            dataHora: dataHoraConvertida,
          });
        } else {
          alert("Abastecimento não encontrado.");
          navigate("/fuel");
        }
      } catch (error) {
        console.error("Erro ao buscar abastecimento:", error);
        alert("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    }

    fetchAbastecimento();
  }, [id, navigate]);

  const handleChange = (e) => {
    setAbastecimento({ ...abastecimento, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const docRef = doc(db, "abastecimentos", id);
      await updateDoc(docRef, {
        ...abastecimento,
        dataHora: abastecimento.dataHora
          ? Timestamp.fromDate(new Date(abastecimento.dataHora))
          : null,
      });
      alert("Abastecimento atualizado com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao atualizar abastecimento.");
    }
  };

  if (loading) return <p>Carregando dados do abastecimento...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Editar Abastecimento</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Litros:
          <input
            type="number"
            name="litros"
            value={abastecimento.litros}
            onChange={handleChange}
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Preço por Litro:
          <input
            type="number"
            step="0.01"
            name="precoLitro"
            value={abastecimento.precoLitro}
            onChange={handleChange}
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          KM do Abastecimento:
          <input
            type="number"
            name="kmAbastecimento"
            value={abastecimento.kmAbastecimento}
            onChange={handleChange}
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Data e Hora:
          <input
            type="datetime-local"
            name="dataHora"
            value={abastecimento.dataHora}
            onChange={handleChange}
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Nota Fiscal:
          <input
            type="text"
            name="notaFiscal"
            value={abastecimento.notaFiscal}
            onChange={handleChange}
            style={styles.input}
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
