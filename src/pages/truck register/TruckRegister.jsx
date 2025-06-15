import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../services/firebase"; // ajuste o caminho se necessário

export default function TruckRegister() {
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [marca, setMarca] = useState("");
  const [ano, setAno] = useState("");
  const [capacidadeTanque, setCapacidadeTanque] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação simples
    if (!placa || !modelo || !marca || !ano || !capacidadeTanque) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "veiculos"), {
        placa: placa.trim().toUpperCase(),
        modelo: modelo.trim(),
        marca: marca.trim(),
        ano: Number(ano),
        capacidadeTanque: Number(capacidadeTanque),
        criadoEm: new Date(),
      });

      alert("Caminhão cadastrado com sucesso!");

      // Resetar o formulário
      setPlaca("");
      setModelo("");
      setMarca("");
      setAno("");
      setCapacidadeTanque("");
    } catch (error) {
      console.error("Erro ao cadastrar caminhão:", error);
      alert("Erro ao cadastrar caminhão, tente novamente.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <h1 style={styles.title}>Cadastro de Veículos</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            placeholder="Placa"
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            style={styles.input}
            disabled={loading}
          />
          <input
            placeholder="Modelo"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            style={styles.input}
            disabled={loading}
          />
          <input
            placeholder="Marca"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            style={styles.input}
            disabled={loading}
          />
          <input
            placeholder="Ano"
            type="number"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            style={styles.input}
            disabled={loading}
          />
          <input
            placeholder="Capacidade Tanque Lts"
            type="number"
            value={capacidadeTanque}
            onChange={(e) => setCapacidadeTanque(e.target.value)}
            style={styles.input}
            disabled={loading}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Caminhão"}
          </button>
        </form>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
  },
  main: {
    flex: 1,
    padding: "40px",
    backgroundColor: "#ecf0f1",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 0 8px rgba(0,0,0,0.1)",
    maxWidth: "500px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "12px",
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
  },
};
