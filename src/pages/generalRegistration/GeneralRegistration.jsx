import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GeneralRegistration() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navegarPara = (rota) => {
    navigate(rota);
  };

  const layoutStyles = isMobile
    ? { ...styles.painel, flexDirection: "column", display: "flex", gap: "20px" }
    : styles.painel;

  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>Painel de Cadastros e Manutenção</h1>

      <div style={layoutStyles}>
        {/* Seção: Cadastros Principais */}
        <div style={styles.card}>
          <h2 style={styles.subtitulo}>📋 Cadastros Principais</h2>
          <div style={styles.botoes}>
            <Botao texto="Cadastro de Viagens" onClick={() => navegarPara("/travelRegistration")} />
            <Botao texto="Cadastro de Abastecimentos" onClick={() => navegarPara("/supplyRegistration")} />
            <Botao texto="Cadastro de Motoristas" onClick={() => navegarPara("/drivers/driverregister")} />
            <Botao texto="Cadastro de Veículos" onClick={() => navegarPara("/truckregister")} />
            <Botao texto="Cadastro de Usuários" onClick={() => navegarPara("/userregister")} />
            <Botao texto="Cadastro de Fornecedores" onClick={() => navegarPara("/supplierRegister")} />
            <Botao texto="Cadastro de Rotas" onClick={() => navegarPara("/routeregistration")} />
          </div>
        </div>

        {/* Seção: Manutenção e Odômetro */}
        <div style={styles.card}>
          <h2 style={styles.subtitulo}>🛠️ Manutenção e Odômetro</h2>
          <div style={styles.botoes}>
            <Botao texto="Tipos de Manutenção" onClick={() => navegarPara("/typesmaintenance")} />
            <Botao texto="Manutenção" onClick={() => navegarPara("/maintenance")} />
            <Botao texto="Alertas de Manutenção" onClick={() => navegarPara("/alertsmaintenance")} />
            <Botao texto="Odômetros" onClick={() => navegarPara("/odometerpage")} />
          </div>
        </div>

        {/* Seção: Utilitários */}
        <div style={styles.card}>
          <h2 style={styles.subtitulo}>🔗 Utilitários</h2>
          <div style={styles.botoes}>
            <Botao texto="Vincular Abastecimentos" onClick={() => navegarPara("/linkRefuelingTravel")} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Botao({ texto, onClick }) {
  return (
    <button style={styles.botao} onClick={onClick}>
      {texto}
    </button>
  );
}

const styles = {
  container: {
    padding: "40px 20px",
    backgroundColor: "#ecf0f1",
    minHeight: "100vh",
  },
  titulo: {
    fontSize: "28px",
    textAlign: "center",
    marginBottom: "40px",
    color: "#2c3e50",
  },
  painel: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "30px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  subtitulo: {
    fontSize: "20px",
    marginBottom: "10px",
    color: "#34495e",
  },
  botoes: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  botao: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#3498db",
    color: "#fff",
    transition: "background-color 0.3s",
  },
};
