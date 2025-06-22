import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import Card from "../../components/Card";
import Alert from "../alertsMaintenancePage/AlertsMaintenancePage";

export default function Dashboard() {
  const [dados, setDados] = useState({
    motoristasDisponiveis: 0,
    motoristasTotal: 0,
    veiculosDisponiveis: 0,
    veiculosTotal: 0,
    viagens: 0,
    abastecimentos: 0,
  });
  const [avisos, setAvisos] = useState([]);
  const [mesAtual, setMesAtual] = useState(new Date());

  const formatarMesAno = (data) =>
    data.toLocaleString("pt-BR", { month: "long", year: "numeric" });

  const alterarMes = (incremento) => {
    const novoMes = new Date(mesAtual);
    novoMes.setMonth(novoMes.getMonth() + incremento);
    setMesAtual(novoMes);
  };

  useEffect(() => {
    async function fetchData() {
      const hoje = new Date();

      // Buscar viagens
      const viagensSnap = await getDocs(collection(db, "viagens"));
      const viagens = viagensSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filtra viagens em andamento (dataAtual entre dataInicio e dataFim)
      const viagensEmAndamento = viagens.filter((v) => {
        if (!v.dataInicio || !v.dataFim) return false;

        let dataInicio, dataFim;
        try {
          dataInicio = v.dataInicio.toDate
            ? v.dataInicio.toDate()
            : new Date(v.dataInicio);
          dataFim = v.dataFim.toDate ? v.dataFim.toDate() : new Date(v.dataFim);
        } catch {
          console.log("Erro na conversão da data", v.dataInicio, v.dataFim);
          return false;
        }

        console.log(
          "Viagem",
          v.id,
          "dataInicio",
          dataInicio,
          "dataFim",
          dataFim
        );

        return hoje >= dataInicio && hoje <= dataFim;
      });

      // Extrai ids motorista e veículo
      const motoristasEmViagemIds = viagensEmAndamento
        .map((v) => v.motorista)
        .filter((id) => typeof id === "string");

      const veiculosEmViagemIds = viagensEmAndamento
        .map((v) => v.caminhao || v.caminhao || null)
        .filter((id) => typeof id === "string");

      // Busca motoristas
      const motoristasSnap = await getDocs(collection(db, "motoristas"));
      const motoristas = motoristasSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Disponíveis: não em viagem e disponíveis no campo
      const motoristasDisponiveis = motoristas.filter(
        (m) => !motoristasEmViagemIds.includes(m.id)
      );

      // Busca veículos
      const veiculosSnap = await getDocs(collection(db, "veiculos"));
      const veiculos = veiculosSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const veiculosDisponiveis = veiculos.filter(
        (v) => !veiculosEmViagemIds.includes(v.id)
      );
      // Filtro por mês (viagens e abastecimentos)
      const inicioMes = new Date(
        mesAtual.getFullYear(),
        mesAtual.getMonth(),
        1
      );
      const fimMes = new Date(
        mesAtual.getFullYear(),
        mesAtual.getMonth() + 1,
        0
      );
      console.log("Motoristas em viagem:", motoristasEmViagemIds);
      console.log("Veículos em viagem:", veiculosEmViagemIds);
      console.log(
        "Motoristas disponíveis:",
        motoristasDisponiveis.map((m) => m.id)
      );
      console.log(
        "Veículos disponíveis:",
        veiculosDisponiveis.map((v) => v.id)
      );

      const viagensMes = viagens.filter((v) => {
        if (!v.dataInicio) return false;

        let dataInicio;
        try {
          dataInicio = v.dataInicio.toDate
            ? v.dataInicio.toDate()
            : new Date(v.dataInicio);
        } catch {
          return false;
        }

        return dataInicio >= inicioMes && dataInicio <= fimMes;
      });

      const abastecimentosSnap = await getDocs(
        collection(db, "abastecimentos")
      );
      const abastecimentos = abastecimentosSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const abastecimentosMes = abastecimentos.filter((a) => {
        if (!a.data) return false;

        let data;
        try {
          data = a.data.toDate ? a.data.toDate() : new Date(a.data);
        } catch {
          return false;
        }

        return data >= inicioMes && data <= fimMes;
      });

      setDados({
        motoristasDisponiveis: motoristasDisponiveis.length,
        motoristasTotal: motoristas.length,
        veiculosDisponiveis: veiculosDisponiveis.length,
        veiculosTotal: veiculos.length,
        viagens: viagensMes.length,
        abastecimentos: abastecimentosMes.length,
      });
    }

    async function fetchAvisos() {
      const snapshot = await getDocs(collection(db, "avisos"));
      const lista = snapshot.docs.map((doc) => doc.data());
      setAvisos(lista);
    }

    fetchData();
    fetchAvisos();
  }, [mesAtual]);

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <div style={styles.cardsSection}>
          <h2 style={styles.sectionTitle}>Status Geral</h2>
          <div style={styles.cardsContainer}>
            <Card title="Motoristas Disponíveis" icon="👨‍✈️">
              {dados.motoristasDisponiveis} de {dados.motoristasTotal}
            </Card>
            <Card title="Veículos Disponíveis" icon="🚛">
              {dados.veiculosDisponiveis} de {dados.veiculosTotal}
            </Card>
          </div>
        </div>

        <div style={styles.headerBox}>
          <div style={styles.mesControle}>
            <button onClick={() => alterarMes(-1)} style={styles.btnMes}>
              ◀
            </button>
            <span style={styles.mesTexto}>{formatarMesAno(mesAtual)}</span>
            <button onClick={() => alterarMes(1)} style={styles.btnMes}>
              ▶
            </button>
          </div>
        </div>

        <div style={styles.cardsSection}>
          <h2 style={styles.sectionTitle}>Resumo do Mês</h2>
          <div style={styles.cardsContainer}>
            <Card title="Viagens" icon="🛣️">
              {dados.viagens} realizadas
            </Card>
            <Card title="Abastecimentos" icon="⛽">
              {dados.abastecimentos} registrados
            </Card>
          </div>
        </div>

        <div style={styles.alertSection}>
          <h2>Avisos de Manutenção</h2>
          {avisos.length === 0 ? (
            <p>Nenhum aviso disponível.</p>
          ) : (
            avisos.map((aviso, index) => (
              <Alert key={index} variant={aviso.tipo || "warning"}>
                {aviso.mensagem}
              </Alert>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f6f8",
    minHeight: "100vh",
   
  },
  main: {
    width: "100%",
    maxWidth: "1200px",
    padding: "40px 20px",
  },
  title: {
    fontSize: "32px",
    marginBottom: "10px",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  headerBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "30px",
    gap: "20px",
  },
  mesControle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  btnMes: {
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  mesTexto: {
    fontWeight: "bold",
    fontSize: "16px",
    textTransform: "capitalize",
    color: "#34495e",
  },
  cardsSection: {
    marginBottom: "40px",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  sectionTitle: {
    fontSize: "20px",
    marginBottom: "16px",
    color: "#2c3e50",
  },
  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  alertSection: {
    marginTop: "40px",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
};
