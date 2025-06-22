import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function DriverRegister() {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId || "";
  const nomeDefault = location.state?.nome || "";
  const emailDefault = location.state?.email || "";

  const [nome, setNome] = useState(nomeDefault);
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [categoria, setCategoria] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "motoristas"), {
        userId,
        nome,
        telefone,
        cpf,
        categoria,
        email: emailDefault,
        criadoEm: new Date(),
      });

      setMensagem("Motorista cadastrado com sucesso!");
      navigate("/drivers"); // ou a rota de listagem de motoristas
    } catch (error) {
      console.error("Erro ao salvar motorista:", error);
      setMensagem("Erro ao cadastrar motorista.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Cadastrar Motorista</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Categoria CNH (Ex: D)"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Salvar Motorista
          </button>
          {mensagem && <p style={{ marginTop: 10 }}>{mensagem}</p>}
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    background: "#ecf0f1",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "12px",
    backgroundColor: "#2980b9",
    color: "#fff",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
