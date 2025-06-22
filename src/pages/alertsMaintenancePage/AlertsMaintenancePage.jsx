import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // 1. Importa useNavigate
import "./style.css";
export default function AlertsMaintenancePage({ isDashboard = false }) {
  const [manutencoes, setManutencoes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [tiposManutencao, setTiposManutencao] = useState([]);
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [alertasGerados, setAlertasGerados] = useState([]);

  const HOJE = new Date();

  const navigate = useNavigate(); // 2. Cria a instância do navigate

  useEffect(() => {
    async function fetchData() {
      const [manSnap, veicSnap, tiposSnap, absSnap, alertasSnap] =
        await Promise.all([
          getDocs(collection(db, "manutencoes")),
          getDocs(collection(db, "veiculos")),
          getDocs(collection(db, "tiposManutencao")),
          getDocs(collection(db, "abastecimentos")),
          getDocs(collection(db, "alertasManutencao")),
        ]);

      setManutencoes(manSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setVeiculos(veicSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setTiposManutencao(
        tiposSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
      setAbastecimentos(absSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setAlertasGerados(
        alertasSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    }
    fetchData();
  }, []);

  const getUltimoKm = (veiculoId) => {
    const absVeic = abastecimentos.filter((a) => a.caminhao === veiculoId);
    if (absVeic.length === 0) return 0;
    return Math.max(...absVeic.map((a) => a.kmAbastecimento || 0));
  };

  // Filtra manutenções que precisam de alerta (data ou km)
  const alertas = manutencoes.filter((m) => {
    if (m.feita || !m.proximaData || !m.proximoKm) return false;

    const proximaData = new Date(m.proximaData);

    // Pega antecedência no tipo de manutenção
    const tipo = tiposManutencao.find((t) => t.id === m.tipoManutencaoId);
    if (!tipo) return false;

    const antecedenciaDias = Number(tipo.antecedenciaDias) || 0;
    const antecedenciaKm = Number(tipo.antecedenciaKm) || 0;

    const dataAlerta = new Date(proximaData);
    dataAlerta.setDate(proximaData.getDate() - antecedenciaDias);

    const kmAlerta = m.proximoKm - antecedenciaKm;
    const kmAtual = getUltimoKm(m.veiculoId);

    const passouDataAlerta = HOJE >= dataAlerta;
    const passouKmAlerta = kmAtual >= kmAlerta;

    return passouDataAlerta || passouKmAlerta;
  });

  // Gera alertas na coleção firestore para alertas novos
  useEffect(() => {
    alertas.forEach(async (a) => {
      const proximaData = new Date(a.proximaData);
      const diasRestantes = Math.ceil(
        (proximaData - HOJE) / (1000 * 60 * 60 * 24)
      );
      const kmAtual = getUltimoKm(a.veiculoId);
      const kmRestante = a.proximoKm - kmAtual;

      const existe = alertasGerados.some(
        (ag) =>
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
            modeloId: a.modeloId || null,
            proximaData: a.proximaData,
            proximoKm: a.proximoKm,
            dataGerado: new Date().toISOString(),
            diasRestantes,
            kmRestante,
          });

          setAlertasGerados((prev) => [
            ...prev,
            {
              veiculoId: a.veiculoId,
              tipoManutencaoId: a.tipoManutencaoId,
              modeloId: a.modeloId || null,
              proximaData: a.proximaData,
              proximoKm: a.proximoKm,
            },
          ]);
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
    <main className={`container ${isDashboard ? "compacto" : ""}`}>
      <h1 className="title">Alertas de Manutenção</h1>
      {alertas.length === 0 ? (
        <p className="noAlerts">Nenhum alerta de manutenção no momento.</p>
      ) : (
        <div className="alertsGrid">
          {alertas.map((a) => {
            const veic = veiculos.find((v) => v.id === a.veiculoId) || {};
            const tipo =
              tiposManutencao.find((t) => t.id === a.tipoManutencaoId) || {};

            const proximaData = new Date(a.proximaData);
            const diasRestantes = Math.ceil(
              (proximaData - HOJE) / (1000 * 60 * 60 * 24)
            );
            const kmAtual = getUltimoKm(a.veiculoId);
            const kmRestante = a.proximoKm - kmAtual;

            return (
              <article
                key={a.id}
                className="card"
                onClick={() => navigate("/maintenance")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") navigate("/maintenance");
                }}
              >
                <h2 className="cardHeader">
                  🚗 {veic.placa || "Desconhecido"} - {veic.modelo || "-"}
                </h2>
                <p className="cardText">
                  <strong>Manutenção:</strong> {tipo.nome || "Desconhecida"}
                </p>
                <p className="cardText">
                  <strong>Próxima Data:</strong> {formatarDataBR(a.proximaData)}{" "}
                  <span className="dangerText">
                    ({diasRestantes} dias)
                  </span>
                </p>
                <p className="cardText">
                  <strong>Próximo KM:</strong> {a.proximoKm}{" "}
                  <span className="dangerText">(faltam {kmRestante} km)</span>
                </p>
                <p className="cardText">
                  <strong>KM Atual</strong> 
                  <span className="dangerText">({kmAtual} km)</span>
                </p>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
