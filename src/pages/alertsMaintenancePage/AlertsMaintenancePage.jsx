import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

export default function AlertsMaintenancePage() {
  const [manutencoes, setManutencoes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [tiposManutencao, setTiposManutencao] = useState([]);
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [alertasGerados, setAlertasGerados] = useState([]);

  const DIAS_ALERTA = 10;
  const KM_ALERTA = 500;

  useEffect(() => {
    async function fetchData() {
      const [manSnap, veicSnap, tiposSnap, absSnap, alertasSnap] = await Promise.all([
        getDocs(collection(db, "manutencoes")),
        getDocs(collection(db, "veiculos")),
        getDocs(collection(db, "tiposManutencao")),
        getDocs(collection(db, "abastecimentos")),
        getDocs(collection(db, "alertasManutencao")),
      ]);

      setManutencoes(manSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setVeiculos(veicSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTiposManutencao(tiposSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAbastecimentos(absSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAlertasGerados(alertasSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    fetchData();
  }, []);

  const getUltimoKm = (veiculoId) => {
    const absVeic = abastecimentos.filter(a => a.caminhao === veiculoId);
    if (absVeic.length === 0) return 0;
    return Math.max(...absVeic.map(a => a.kmAbastecimento || 0));
  };

  const HOJE = new Date();

  const alertas = manutencoes.filter(m => {
    const proximaData = new Date(m.proximaData);
    const diasRestantes = (proximaData - HOJE) / (1000 * 60 * 60 * 24);
    const kmAtual = getUltimoKm(m.veiculoId);
    const kmRestante = m.proximoKm - kmAtual;
    return diasRestantes <= DIAS_ALERTA || kmRestante <= KM_ALERTA;
  });

  // Salvar alertas no banco somente quando alertas mudam (evita chamadas infinitas)
  useEffect(() => {
    alertas.forEach(async (a) => {
      const proximaData = new Date(a.proximaData);
      const diasRestantes = Math.ceil((proximaData - HOJE) / (1000 * 60 * 60 * 24));
      const kmAtual = getUltimoKm(a.veiculoId);
      const kmRestante = a.proximoKm - kmAtual;

      const existe = alertasGerados.some(ag =>
        ag.veiculoId === a.veiculoId &&
        ag.tipoManutencaoId === a.tipoManutencaoId &&
        ag.proximaData === a.proximaData &&
        ag.proximoKm === a.proximoKm
      );
      if (!existe) {
        try {
          await addDoc(collection(db, "alertasManutencao"), {
            veiculoId: a.veiculoId,
            tipoManutencaoId: a.tipoManutencaoId,
            proximaData: a.proximaData,
            proximoKm: a.proximoKm,
            dataGerado: new Date().toISOString(),
            diasRestantes,
            kmRestante,
          });
          // Atualiza localmente para não repetir
          setAlertasGerados(prev => [...prev, {
            veiculoId: a.veiculoId,
            tipoManutencaoId: a.tipoManutencaoId,
            proximaData: a.proximaData,
            proximoKm: a.proximoKm,
          }]);
        } catch (error) {
          console.error("Erro ao salvar alerta:", error);
        }
      }
    });
  }, [alertas, alertasGerados]);

  const formatarDataBR = (data) => {
    if (!data) return "";
    const d = new Date(data);
    return d.toLocaleDateString("pt-BR");
  };

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Alertas de Manutenção</h1>
      {alertas.length === 0 ? (
        <p style={styles.noAlerts}>Nenhum alerta de manutenção no momento.</p>
      ) : (
        <div style={styles.alertsGrid}>
          {alertas.map((a) => {
            const veic = veiculos.find((v) => v.id === a.veiculoId) || {};
            const tipo = tiposManutencao.find((t) => t.id === a.tipoManutencaoId) || {};

            const proximaData = new Date(a.proximaData);
            const diasRestantes = Math.ceil((proximaData - HOJE) / (1000 * 60 * 60 * 24));
            const kmAtual = getUltimoKm(a.veiculoId);
            const kmRestante = a.proximoKm - kmAtual;

            return (
              <article key={a.id} style={styles.card} aria-live="polite" aria-atomic="true">
                <h2 style={styles.cardHeader}>
                  <span style={styles.icon} role="img" aria-label="Carro">
                    🚗
                  </span>{" "}
                  {veic.placa || "Veículo desconhecido"} - {veic.modelo || "-"}
                </h2>
                <p style={styles.cardText}>
                  <strong>Manutenção:</strong> {tipo.nome || "Desconhecida"}
                </p>
                <p style={styles.cardText}>
                  <strong>Próxima Data:</strong> {formatarDataBR(a.proximaData)}{" "}
                  <span style={styles.dangerText}>({diasRestantes} dias restantes)</span>
                </p>
                <p style={styles.cardText}>
                  <strong>Próximo KM:</strong> {a.proximoKm}{" "}
                  <span style={styles.dangerText}>(faltam {kmRestante} km)</span>
                </p>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

const styles = {
  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "40px 24px",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    backgroundColor: "#f8fafc",
    color: "#1e293b",
    minHeight: "100vh",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 32,
    textAlign: "center",
    color: "#334155",
  },
  noAlerts: {
    fontSize: 18,
    color: "#64748b",
    textAlign: "center",
    marginTop: 40,
  },
  alertsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 24,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.07)",
    borderRadius: 16,
    padding: 24,
    width: 320,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    transition: "transform 0.2s ease",
    cursor: "default",
  },
  cardHeader: {
    fontSize: 20,
    fontWeight: 600,
    color: "#1e293b",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    fontSize: 24,
  },
  cardText: {
    fontSize: 16,
    color: "#475569",
    lineHeight: 1.4,
  },
  dangerText: {
    color: "#dc2626", // vermelho (tailwind red-600)
    fontWeight: 600,
  },
};
