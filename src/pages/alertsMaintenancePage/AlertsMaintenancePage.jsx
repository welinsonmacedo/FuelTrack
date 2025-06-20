import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function AlertsMaintenancePage() {
  const [manutencoes, setManutencoes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [tiposManutencao, setTiposManutencao] = useState([]);
  const [abastecimentos, setAbastecimentos] = useState([]);

  const DIAS_ALERTA = 10; // dias antes da data de manutenção para alertar
  const KM_ALERTA = 500; // km antes do próximo km para alertar

  useEffect(() => {
    async function fetchData() {
      const manSnap = await getDocs(collection(db, "manutencoes"));
      setManutencoes(manSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const veicSnap = await getDocs(collection(db, "veiculos"));
      setVeiculos(veicSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const tiposSnap = await getDocs(collection(db, "tiposManutencao"));
      setTiposManutencao(tiposSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const absSnap = await getDocs(collection(db, "abastecimentos"));
      setAbastecimentos(absSnap.docs.map(d => ({ id: d.id, ...d.data() })));
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

  const formatarDataBR = (data) => {
    if (!data) return "";
    const d = new Date(data);
    return d.toLocaleDateString("pt-BR");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Alertas de Manutenção</h1>
      {alertas.length === 0 && <p>Sem alertas de manutenção no momento.</p>}
      {alertas.map(a => {
        const veic = veiculos.find(v => v.id === a.veiculoId) || {};
        const tipo = tiposManutencao.find(t => t.id === a.tipoManutencaoId) || {};

        const proximaData = new Date(a.proximaData);
        const diasRestantes = Math.ceil((proximaData - HOJE) / (1000 * 60 * 60 * 24));
        const kmAtual = getUltimoKm(a.veiculoId);
        const kmRestante = a.proximoKm - kmAtual;

        return (
          <div key={a.id} style={{ border: "1px solid red", padding: 10, marginBottom: 10, borderRadius: 6 }}>
            <p><strong>Veículo:</strong> {veic.placa} - {veic.modelo}</p>
            <p><strong>Manutenção:</strong> {tipo.nome}</p>
            <p><strong>Próxima Data:</strong> {formatarDataBR(a.proximaData)} ({diasRestantes} dias restantes)</p>
            <p><strong>Próximo KM:</strong> {a.proximoKm} (faltam {kmRestante} km)</p>
          </div>
        );
      })}
    </div>
  );
}
