import React from "react";
import { useNavigate } from "react-router-dom";

export default function GeneralRegistration() {
  const navigate = useNavigate();

  const navegarPara = (rota) => {
    navigate(rota);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>Central de Cadastros</h1>
      <div style={styles.botoes}>
        
         <button style={styles.botao} onClick={() => navegarPara("/travelRegistration")}>
          Cadastro de Viagens
        </button>
        <button style={styles.botao} onClick={() => navegarPara("/supplyRegistration")}>
          Cadastro de Abastecimentos
        </button>
        <button style={styles.botao} onClick={() => navegarPara("/linkRefuelingTravel")}>
          Vincular Abastecimentos
        </button>
        <button style={styles.botao} onClick={() => navegarPara("/drivers/driverregister")}>
          Cadastro de Motoristas
        </button>
        <button style={styles.botao} onClick={() => navegarPara("/truckregister")}>
          Cadastro de Veículos
        </button>
        <button style={styles.botao} onClick={() => navegarPara("/userregister")}>
          Cadastro de Usuários
        </button>
        <button style={styles.botao} onClick={() => navegarPara("/supplierRegister")}>
          Cadastro de Fornecedores
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
    height: "100%",
  },
  titulo: {
    fontSize: "28px",
    marginBottom: "30px",
    color: "#2c3e50",
  },
  botoes: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
    maxWidth: "400px",
  },
  botao: {
    padding: "15px",
    fontSize: "18px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#3498db",
    color: "#fff",
    transition: "background-color 0.3s",
  },
};
