import React, { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { startOfDay, endOfDay } from "date-fns";

export default function TravelRegistration() {
  const [motoristas, setMotoristas] = useState([]);
  const [caminhoes, setCaminhoes] = useState([]);
  const [rotas, setRotas] = useState([]);

  const [motorista, setMotorista] = useState("");
  const [caminhao, setCaminhao] = useState("");
  const [kmInicial, setKmInicial] = useState("");
  const [kmFinal, setKmFinal] = useState("");
  const [rotaSelecionada, setRotaSelecionada] = useState("");
  const [obs, setObs] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  // Novos campos
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [tipoCarga, setTipoCarga] = useState("");
  const [valorFrete, setValorFrete] = useState("");
  const [notaFiscal, setNotaFiscal] = useState("");
  const [status, setStatus] = useState("");
  const [tipoViagem, setTipoViagem] = useState("");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const motoristasSnap = await getDocs(collection(db, "motoristas"));
      setMotoristas(motoristasSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      const caminhoesSnap = await getDocs(collection(db, "veiculos"));
      setCaminhoes(caminhoesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      const rotasSnap = await getDocs(collection(db, "rotas"));
      setRotas(rotasSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchData();
  }, []);

  async function existeViagemNoMesmoDia({ motoristaId, caminhaoId, data }) {
    const viagensRef = collection(db, "viagens");
    const inicioDia = startOfDay(new Date(data));
    const fimDia = endOfDay(new Date(data));

    const qMotorista = query(
      viagensRef,
      where("motorista", "==", motoristaId),
      where("dataInicio", ">=", inicioDia),
      where("dataInicio", "<=", fimDia)
    );

    const qCaminhao = query(
      viagensRef,
      where("caminhao", "==", caminhaoId),
      where("dataInicio", ">=", inicioDia),
      where("dataInicio", "<=", fimDia)
    );

    const [snapMotorista, snapCaminhao] = await Promise.all([
      getDocs(qMotorista),
      getDocs(qCaminhao),
    ]);

    return !snapMotorista.empty || !snapCaminhao.empty;
  }

  const salvarViagem = async (e) => {
    e.preventDefault();

    if (!motorista || !caminhao || !kmInicial || !kmFinal || !rotaSelecionada || !dataInicio || !dataFim) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (Number(kmFinal) < Number(kmInicial)) {
      alert("O KM Final não pode ser menor que o KM Inicial.");
      return;
    }

    const rota = rotas.find((r) => r.id === rotaSelecionada);
    if (!rota) {
      alert("Selecione uma rota válida.");
      return;
    }

    const conflito = await existeViagemNoMesmoDia({
      motoristaId: motorista,
      caminhaoId: caminhao,
      data: dataInicio,
    });

    if (conflito) {
      const confirma = window.confirm(
        "Já existe uma viagem para este motorista ou caminhão nesta data. Deseja continuar?"
      );
      if (!confirma) return;
    }

    const novaViagem = {
      motorista,
      caminhao,
      kmInicial: Number(kmInicial),
      kmFinal: Number(kmFinal),
      dataInicio: new Date(dataInicio),
      dataFim: new Date(dataFim),
      origem: rota.origem,
      destino: rota.destino,
      kmRota: rota.km,
      sigla: rota.sigla,
      observacoes: obs,
      tipoCarga,
      valorFrete: Number(valorFrete),
      notaFiscal,
      status,
      tipoViagem,
      criadoEm: new Date(),
    };

    try {
      await addDoc(collection(db, "viagens"), novaViagem);
      alert("Viagem salva com sucesso!");
      setMotorista("");
      setCaminhao("");
      setKmInicial("");
      setKmFinal("");
      setRotaSelecionada("");
      setObs("");
      setDataInicio("");
      setDataFim("");
      setTipoCarga("");
      setValorFrete("");
      setNotaFiscal("");
      setStatus("");
      setTipoViagem("");
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
            <select value={motorista} onChange={(e) => setMotorista(e.target.value)} style={styles.input}>
              <option value="">Selecionar Motorista</option>
              {motoristas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>

            <select value={caminhao} onChange={(e) => setCaminhao(e.target.value)} style={styles.input}>
              <option value="">Selecionar Caminhão</option>
              {caminhoes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.placa} - {c.modelo}
                </option>
              ))}
            </select>

            <select value={rotaSelecionada} onChange={(e) => setRotaSelecionada(e.target.value)} style={styles.input}>
              <option value="">Selecionar Rota</option>
              {rotas.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.sigla} - {r.origem} → {r.destino} ({r.km} km)
                </option>
              ))}
            </select>

            <input type="number" placeholder="KM Inicial" value={kmInicial} onChange={(e) => setKmInicial(e.target.value)} style={styles.input} />
            <input type="number" placeholder="KM Final" value={kmFinal} onChange={(e) => setKmFinal(e.target.value)} style={styles.input} />

            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={styles.input} />
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} style={styles.input} />

            <input type="text" placeholder="Tipo de Carga" value={tipoCarga} onChange={(e) => setTipoCarga(e.target.value)} style={styles.input} />
            <input type="number" placeholder="Valor do Frete (R$)" value={valorFrete} onChange={(e) => setValorFrete(e.target.value)} style={styles.input} />
            <input type="text" placeholder="Nº Nota Fiscal" value={notaFiscal} onChange={(e) => setNotaFiscal(e.target.value)} style={styles.input} />

            <select value={status} onChange={(e) => setStatus(e.target.value)} style={styles.input}>
              <option value="">Status da Viagem</option>
              <option value="planejada">Planejada</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluida">Concluída</option>
            </select>

            <select value={tipoViagem} onChange={(e) => setTipoViagem(e.target.value)} style={styles.input}>
              <option value="">Tipo de Viagem</option>
              <option value="ida">Ida</option>
              <option value="ida_volta">Ida e Volta</option>
              <option value="volta">Volta</option>
            </select>

            <textarea placeholder="Observações" value={obs} onChange={(e) => setObs(e.target.value)} style={styles.textarea} />

            <button type="submit" style={styles.button}>
              Salvar Viagem
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
