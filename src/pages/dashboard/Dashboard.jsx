import React from "react";

export default function Dashboard() {
  return (
    <div style={styles.container}>
    
     

      {/* Conteúdo */}
      <main style={styles.main}>
        <h1 style={styles.title}>Bem-vindo ao Painel do Gestor</h1>
        <p>Escolha uma opção no menu ao lado para começar.</p>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  sidebar: {
    width: "250px",
    backgroundColor: "#2c3e50",
    color: "#ecf0f1",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
  },
  logo: {
    fontSize: "24px",
    marginBottom: "40px",
    textAlign: "center",
  },
  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  menuItem: {
    backgroundColor: "transparent",
    border: "none",
    color: "#ecf0f1",
    fontSize: "16px",
    padding: "10px",
    textAlign: "left",
    cursor: "pointer",
    borderRadius: "5px",
    transition: "background-color 0.2s",
  },
  menuItemHover: {
    backgroundColor: "#34495e",
  },
  main: {
    flex: 1,
    padding: "40px",
    backgroundColor: "#ecf0f1",
  },
  title: {
    fontSize: "28px",
    marginBottom: "20px",
  }
};
