import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

export default function SupplyRegistration() {
  const [motorista, setMotorista] = useState("");
  const [caminhao, setCaminhao] = useState("");
  const [kmAbastecimento, setKmAbastecimento] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [litros, setLitros] = useState("");
  const [precoLitro, setPrecoLitro] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [nf, setNf] = useState("");
  const [viagemId, setViagemId] = useState("");

  const [motoristas, setMotoristas] = useState([]);
  const [caminhoes, setCaminhoes] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [viagens, setViagens] = useState([]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Buscar motoristas
      const motoristasSnap = await getDocs(collection(db, "motoristas"));
      setMotoristas(
        motoristasSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      // Buscar caminhões
      const caminhoesSnap = await getDocs(collection(db, "veiculos"));
      const caminhoesData = caminhoesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCaminhoes(caminhoesData);

      // Buscar fornecedores
      const fornecedoresSnap = await getDocs(collection(db, "fornecedores"));
      setFornecedores(
        fornecedoresSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      // Buscar viagens e cruzar com placas
      const viagensSnap = await getDocs(collection(db, "viagens"));
      const viagensComPlaca = viagensSnap.docs.map((doc) => {
        const viagemData = doc.data();
        const caminhaoRelacionado = caminhoesData.find(
          (c) => c.id === viagemData.caminhao
        );

        return {
          id: doc.id,
          ...viagemData,
          placa: caminhaoRelacionado?.placa || "Placa não encontrada",
        };
      });

      setViagens(viagensComPlaca);
    };

    fetchData();
  }, []);

  const salvarAbastecimento = async (e) => {
    e.preventDefault();

    if (
      !motorista ||
      !caminhao ||
      !kmAbastecimento ||
      !dataHora ||
      !litros ||
      !precoLitro ||
      !fornecedor ||
      !nf
    ) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const abastecimento = {
      caminhao,
      motorista,
      kmAbastecimento: Number(kmAbastecimento),
      dataHora,
      litros: Number(litros),
      precoLitro: Number(precoLitro),
      fornecedor,
      notaFiscal: nf,
      viagemId: viagemId || null,
      vinculoViagem: viagemId ? true : false,  // <-- Aqui está o campo novo
      criadoEm: new Date(),
    };

    try {
      await addDoc(collection(db, "abastecimentos"), abastecimento);
      alert("Abastecimento salvo com sucesso!");

      // Resetar campos
      setMotorista("");
      setCaminhao("");
      setKmAbastecimento("");
      setDataHora("");
      setLitros("");
      setPrecoLitro("");
      setFornecedor("");
      setNf("");
      setViagemId("");
    } catch (error) {
      console.error("Erro ao salvar abastecimento:", error);
      alert("Erro ao salvar abastecimento.");
    }
  };

  const formatarDataBR = (dataISO) => {
    if (!dataISO) return "";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR");
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
    button: {
      backgroundColor: "#2980b9",
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
        <h1 style={styles.title}>Cadastro de Abastecimento ⛽</h1>
        <section style={styles.card}>
          <form onSubmit={salvarAbastecimento} style={styles.form}>
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
              type="number"
              placeholder="KM do Abastecimento"
              value={kmAbastecimento}
              onChange={(e) => setKmAbastecimento(e.target.value)}
              style={styles.input}
            />

            <input
              type="date"
              placeholder="Data e Hora"
              value={dataHora}
              onChange={(e) => setDataHora(e.target.value)}
              style={styles.input}
            />

            <input
              type="number"
              placeholder="Litros"
              value={litros}
              onChange={(e) => setLitros(e.target.value)}
              style={styles.input}
            />

            <input
              type="number"
              step="0.01"
              placeholder="Preço por Litro"
              value={precoLitro}
              onChange={(e) => setPrecoLitro(e.target.value)}
              style={styles.input}
            />

            <select
              value={fornecedor}
              onChange={(e) => setFornecedor(e.target.value)}
              style={styles.input}
            >
              <option value="">Selecionar Fornecedor</option>
              {fornecedores.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.razaoSocial}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Número da Nota Fiscal"
              value={nf}
              onChange={(e) => setNf(e.target.value)}
              style={styles.input}
            />

            <select
              value={viagemId}
              onChange={(e) => setViagemId(e.target.value)}
              style={styles.input}
            >
              <option value="">(Opcional) Vincular a Viagem</option>
              {viagens.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} - {formatarDataBR(v.dataInicio)}
                </option>
              ))}
            </select>

            <button type="submit" style={styles.button}>
              Salvar Abastecimento
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
