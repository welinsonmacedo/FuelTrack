import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";

export default function TravelAndSupplyRegistration() {
  const [motorista, setMotorista] = useState("");
  const [caminhao, setCaminhao] = useState("");
  const [kmInicial, setKmInicial] = useState("");
  const [kmFinal, setKmFinal] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [obs, setObs] = useState("");
  const [litros, setLitros] = useState("");
  const [precoLitro, setPrecoLitro] = useState("");

  const [motoristas, setMotoristas] = useState([]);
  const [caminhoes, setCaminhoes] = useState([]);
  const [kmMaxAnterior, setKmMaxAnterior] = useState(null);
  const [capacidadeTanque, setCapacidadeTanque] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const buscarMotoristas = async () => {
      const snap = await getDocs(collection(db, "motoristas"));
      const lista = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMotoristas(lista);
    };
    buscarMotoristas();
  }, []);

  useEffect(() => {
    const buscarCaminhoes = async () => {
      const snap = await getDocs(collection(db, "veiculos"));
      const lista = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCaminhoes(lista);
    };
    buscarCaminhoes();
  }, []);

  useEffect(() => {
    const buscarUltimoKM = async () => {
      if (!caminhao) {
        setKmMaxAnterior(null);
        setCapacidadeTanque(null);
        return;
      }

      const caminhaoSelecionado = caminhoes.find(c => c.id === caminhao);
      if (caminhaoSelecionado) {
        setCapacidadeTanque(caminhaoSelecionado.capacidadeTanque || 0);
      }

      const q = query(
        collection(db, "abastecimentos"),
        where("caminhao", "==", caminhao),
        orderBy("kmAbastecimento", "desc"),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        setKmMaxAnterior(snap.docs[0].data().kmAbastecimento);
      } else {
        setKmMaxAnterior(0);
      }
    };
    buscarUltimoKM();
  }, [caminhao, caminhoes]);

  const salvarTudo = async (e) => {
    e.preventDefault();

    if (!motorista || !caminhao || !kmInicial || !kmFinal || !dataInicio || !dataFim || !litros || !precoLitro) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (Number(kmInicial) < Number(kmMaxAnterior)) {
      alert(`O KM inicial (${kmInicial}) não pode ser menor que o último registrado (${kmMaxAnterior})`);
      return;
    }

    if (Number(litros) > Number(capacidadeTanque)) {
      alert(`A quantidade abastecida (${litros} L) não pode exceder a capacidade do tanque (${capacidadeTanque} L).`);
      return;
    }

    const viagem = {
      motorista,
      caminhao,
      kmInicial: Number(kmInicial),
      kmFinal: Number(kmFinal),
      dataInicio,
      dataFim,
      observacoes: obs,
      criadoEm: new Date(),
    };

    const abastecimento = {
      caminhao,
      motorista,
      dataHora: dataFim,
      kmAbastecimento: Number(kmFinal),
      litros: Number(litros),
      precoLitro: Number(precoLitro),
      vinculoViagem: true,
      criadoEm: new Date(),
    };

    await addDoc(collection(db, "viagens"), viagem);
    await addDoc(collection(db, "abastecimentos"), abastecimento);

    alert("Viagem e abastecimento salvos com sucesso!");

    setMotorista("");
    setCaminhao("");
    setKmInicial("");
    setKmFinal("");
    setDataInicio("");
    setDataFim("");
    setObs("");
    setLitros("");
    setPrecoLitro("");
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
    },
  };

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <h1 style={styles.title}>Cadastro de Viagem + Abastecimento</h1>

        <section style={styles.card}>
          <form onSubmit={salvarTudo} style={styles.form}>
            <h2>Informações Gerais</h2>
            <select value={motorista} onChange={(e) => setMotorista(e.target.value)} style={styles.input}>
              <option value="">Selecionar Motorista</option>
              {motoristas.map((m) => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>

            <select value={caminhao} onChange={(e) => setCaminhao(e.target.value)} style={styles.input}>
              <option value="">Selecionar Caminhão</option>
              {caminhoes.map((c) => (
                <option key={c.id} value={c.id}>{c.placa} - {c.modelo}</option>
              ))}
            </select>

            <h2>Dados da Viagem</h2>
            <input placeholder="KM Inicial" type="number" value={kmInicial} onChange={(e) => setKmInicial(e.target.value)} style={styles.input} />
            <input placeholder="KM Final" type="number" value={kmFinal} onChange={(e) => setKmFinal(e.target.value)} style={styles.input} />
            <input placeholder="Data Início" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={styles.input} />
            <input placeholder="Data Fim (e hora do abastecimento)" type="datetime-local" value={dataFim} onChange={(e) => setDataFim(e.target.value)} style={styles.input} />
            <textarea placeholder="Observações" value={obs} onChange={(e) => setObs(e.target.value)} style={styles.textarea} />

            <h2>Dados do Abastecimento ⛽</h2>
            <input placeholder="Litros Abastecidos" type="number" value={litros} onChange={(e) => setLitros(e.target.value)} style={styles.input} />
            <input placeholder="Preço por Litro" type="number" step="0.01" value={precoLitro} onChange={(e) => setPrecoLitro(e.target.value)} style={styles.input} />

            <button type="submit" style={styles.button}>Salvar Tudo</button>
          </form>
        </section>
      </main>
    </div>
  );
}
