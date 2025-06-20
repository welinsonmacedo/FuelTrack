import React, { useState } from "react";
import { db } from "../../services/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function RouteRegistration() {
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [km, setKm] = useState("");
  const [sigla, setSigla] = useState("");

  const salvarRota = async (e) => {
    e.preventDefault();

    if (!origem || !destino || !km || !sigla) {
      alert("Preencha todos os campos.");
      return;
    }

    if (isNaN(Number(km)) || Number(km) <= 0) {
      alert("Informe uma distância válida em KM.");
      return;
    }

    const novaRota = {
      origem: origem.trim(),
      destino: destino.trim(),
      km: Number(km),
      sigla: sigla.trim().toUpperCase(),
      criadoEm: new Date(),
    };

    try {
      await addDoc(collection(db, "rotas"), novaRota);
      alert("Rota cadastrada com sucesso!");
      setOrigem("");
      setDestino("");
      setKm("");
      setSigla("");
    } catch (error) {
      console.error("Erro ao cadastrar rota:", error);
      alert("Erro ao cadastrar rota. Tente novamente.");
    }
  };

  const styles = {
    container: {
      maxWidth: 600,
      margin: "40px auto",
      padding: 20,
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f7f9fc",
      borderRadius: 8,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    title: {
      fontSize: 24,
      marginBottom: 20,
      color: "#34495e",
      textAlign: "center",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: 15,
    },
    input: {
      padding: 12,
      borderRadius: 5,
      border: "1px solid #ccc",
      fontSize: 16,
    },
    button: {
      padding: 12,
      borderRadius: 5,
      border: "none",
      backgroundColor: "#2980b9",
      color: "white",
      fontSize: 16,
      cursor: "pointer",
      marginTop: 10,
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Cadastro de Rotas</h1>
      <form onSubmit={salvarRota} style={styles.form}>
        <input
          type="text"
          placeholder="Origem"
          value={origem}
          onChange={(e) => setOrigem(e.target.value)}
          style={styles.input}
          maxLength={50}
        />
        <input
          type="text"
          placeholder="Destino"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
          style={styles.input}
          maxLength={50}
        />
        <input
          type="number"
          placeholder="Distância em KM"
          value={km}
          onChange={(e) => setKm(e.target.value)}
          style={styles.input}
          min="1"
          step="any"
        />
        <input
          type="text"
          placeholder="Sigla da Rota"
          value={sigla}
          onChange={(e) => setSigla(e.target.value)}
          style={styles.input}
          maxLength={10}
        />
        <button type="submit" style={styles.button}>
          Cadastrar Rota
        </button>
      </form>
    </div>
  );
}
