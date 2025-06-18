import React, { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

export default function TravelRegistration() {
  const [motoristas, setMotoristas] = useState([]);
  const [caminhoes, setCaminhoes] = useState([]);

  const [motorista, setMotorista] = useState("");
  const [caminhao, setCaminhao] = useState("");
  const [kmInicial, setKmInicial] = useState("");
  const [kmFinal, setKmFinal] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [obs, setObs] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const motoristasSnap = await getDocs(collection(db, "motoristas"));
      setMotoristas(motoristasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const caminhoesSnap = await getDocs(collection(db, "veiculos"));
      setCaminhoes(caminhoesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchData();
  }, []);

  const salvarViagem = async (e) => {
    e.preventDefault();

    if (
      !motorista ||
      !caminhao ||
      !kmInicial ||
      !kmFinal ||
      !dataInicio ||
      !dataFim ||
      !origem ||
      !destino
    ) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const novaViagem = {
      motorista,
      caminhao,
      kmInicial: Number(kmInicial),
      kmFinal: Number(kmFinal),
      dataInicio,
      dataFim,
      origem,
      destino,
      observacoes: obs,
      criadoEm: new Date(),
    };

    try {
      await addDoc(collection(db, "viagens"), novaViagem);
      alert("Viagem salva com sucesso!");
      setMotorista("");
      setCaminhao("");
      setKmInicial("");
      setKmFinal("");
      setDataInicio("");
      setDataFim("");
      setOrigem("");
      setDestino("");
      setObs("");
    } catch (error) {
      console.error("Erro ao salvar viagem:", error);
      alert("Erro ao salvar viagem.");
    }
  };

  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      fontFamily: "Arial, sans-serif",
      flexDirection: isMobile ? "column" : "row",
    },
    main: {
      flex: 1,
      padding: isMobile ? "20px" : "40px",
      backgroundColor: "#ecf0f1",
      overflowY: "auto",
    },
    title: {
      fontSize: isMobile ? "20px" : "26px",
      marginBottom: "20px",
      color: "#2c3e50",
      textAlign: isMobile ? "center" : "left",
    },
    card: {
      backgroundColor: "#ffffff",
      borderRadius: "10px",
      padding: isMobile ? "20px" : "30px",
      marginBottom: "30px",
      boxShadow: "0 0 8px rgba(0,0,0,0.1)",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "15px",
    },
    input: {
      padding: "10px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      fontSize: "16px",
      width: "90%",
    },
    textarea: {
      padding: "10px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      fontSize: "16px",
      minHeight: "80px",
      width: "90%",
    },
    button: {
      backgroundColor: "#27ae60",
      color: "#fff",
      padding: "12px",
      borderRadius: "5px",
      border: "none",
      fontSize: "16px",
      cursor: "pointer",
      marginTop: "20px",
      width: "92%",
    },
  };

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <h1 style={styles.title}>Cadastro de Viagem</h1>
        <section style={styles.card}>
          <form onSubmit={salvarViagem} style={styles.form}>
            <select
              value={motorista}
              onChange={(e) => setMotorista(e.target.value)}
              style={styles.input}
            >
              <option value="">Selecionar Motorista</option>
              {motoristas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>

            <select
              value={caminhao}
              onChange={(e) => setCaminhao(e.target.value)}
              style={styles.input}
            >
              <option value="">Selecionar Caminhão</option>
              {caminhoes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.placa} - {c.modelo}
                </option>
              ))}
            </select>

            <input
              placeholder="KM Inicial"
              type="number"
              value={kmInicial}
              onChange={(e) => setKmInicial(e.target.value)}
              style={styles.input}
            />
            <input
              placeholder="KM Final"
              type="number"
              value={kmFinal}
              onChange={(e) => setKmFinal(e.target.value)}
              style={styles.input}
            />
            <input
              placeholder="Data Início"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              style={styles.input}
            />
            <input
              placeholder="Data Fim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              style={styles.input}
            />

            <input
              placeholder="Origem"
              type="text"
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              style={styles.input}
            />
            <input
              placeholder="Destino"
              type="text"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              style={styles.input}
            />

            <textarea
              placeholder="Observações"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              style={styles.textarea}
            />
            <button type="submit" style={styles.button}>
              Salvar Viagem
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
