import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GeneralRegistration() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navigateTo = (path) => navigate(path);

  return (
    <main style={styles.container}>
      

      <section
        style={{
          ...styles.panel,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 28 : 48,
        }}
      >
        <Card title="Cadastros" icon="📋">
          <Button onClick={() => navigateTo("/travelRegistration")} icon="🛣️">
            Viagens
          </Button>
          <Button onClick={() => navigateTo("/supplyRegistration")} icon="⛽">
          Abastecimentos
          </Button>
          <Button onClick={() => navigateTo("/drivers/driverregister")} icon="👷‍♂️">
            Motoristas
          </Button>
          <Button onClick={() => navigateTo("/truckregister")} icon="🚛">
           Veículos
          </Button>
          <Button onClick={() => navigateTo("/userregister")} icon="👤">
            Usuários
          </Button>
          <Button onClick={() => navigateTo("/supplierRegister")} icon="🏢">
            Fornecedores
          </Button>
          <Button onClick={() => navigateTo("/routeregistration")} icon="🗺️">
            Rotas
          </Button>
        </Card>

        <Card title="Manutenção" icon="🛠️">
          <Button onClick={() => navigateTo("/typesmaintenance")} icon="⚙️">
            Tipos de Manutenção
          </Button>
          <Button onClick={() => navigateTo("/maintenance")} icon="🔧">
            Manutenção
          </Button>
          <Button onClick={() => navigateTo("/alertsmaintenance")} icon="🚨">
            Alertas de Manutenção
          </Button>
          <Button onClick={() => navigateTo("/odometerpage")} icon="📟">
            Odômetros
          </Button>
            <Button onClick={() => navigateTo("/checklist")} icon="📟">
            Checklist
          </Button>
        </Card>

        <Card title="Utilitários" icon="🔗">
          <Button onClick={() => navigateTo("/linkRefuelingTravel")} icon="🔄">
            Vincular Abastecimentos
          </Button>
        </Card>
      </section>
    </main>
  );
}

function Card({ title, icon, children }) {
  return (
    <section
      aria-labelledby={`${title.replace(/\s+/g, "").toLowerCase()}-title`}
      style={styles.card}
    >
      <h2 id={`${title.replace(/\s+/g, "").toLowerCase()}-title`} style={styles.cardTitle}>
        <span aria-hidden="true" style={styles.cardIcon}>
          {icon}
        </span>
        {title}
      </h2>
      <div style={styles.buttonsContainer}>{children}</div>
    </section>
  );
}

function Button({ children, onClick, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.button}
      aria-label={children}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <span style={styles.buttonIcon} aria-hidden="true">
        {icon}
      </span>
      {children}
    </button>
  );
}

const styles = {
  container: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "56px 32px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    backgroundColor: "#f5f7fa",
    minHeight: "100vh",
    color: "#1e293b",
  },
 
  panel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  card: {
   
    backdropFilter: "blur(14px)",
    borderRadius: 10,
    padding: 36,

    flex: 1,
    minWidth: 280,
    display: "flex",
    flexDirection: "column",
    gap: 28,
   
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    userSelect: "none",
    cursor: "default",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
    display: "flex",
    alignItems: "center",
    gap: 12,
    userSelect: "none",
  },
  cardIcon: {
    fontSize: 28,
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  button: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffffa0",
    color: "#000",
    border: "none",
    borderRadius: 7,
    padding: "14px 22px",
    fontSize: 17,
    fontWeight: 600,
    boxShadow:
      "0 8px 20px rgba(37, 99, 235, 0.3), inset 0 -3px 0 rgba(0, 0, 0, 0.12)",
    cursor: "pointer",
    userSelect: "none",
    transition:
      "background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s ease",
  },
  buttonIcon: {
    fontSize: 22,
  },
};

