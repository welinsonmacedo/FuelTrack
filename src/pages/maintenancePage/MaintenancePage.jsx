import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import {
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";

export default function MaintenancePage() {
  const [veiculos, setVeiculos] = useState([]);
  const [tiposManutencao, setTiposManutencao] = useState([]);
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);

  // Form
  const [veiculoId, setVeiculoId] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [dataRealizacao, setDataRealizacao] = useState("");
  const [kmRealizacao, setKmRealizacao] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    async function fetchData() {
      const veicSnap = await getDocs(collection(db, "veiculos"));
      setVeiculos(veicSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const tiposSnap = await getDocs(collection(db, "tiposManutencao"));
      setTiposManutencao(tiposSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const absSnap = await getDocs(collection(db, "abastecimentos"));
      setAbastecimentos(absSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const manSnap = await getDocs(collection(db, "manutencoes"));
      setManutencoes(manSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    fetchData();
  }, []);

  // Função para obter último KM de um veículo
  const getUltimoKm = (veiculoId) => {
    const absVeic = abastecimentos.filter(a => a.caminhao === veiculoId);
    if (absVeic.length === 0) return 0;
    return Math.max(...absVeic.map(a => a.kmAbastecimento || 0));
  };

  // Auto preencher KM ao escolher veículo
  useEffect(() => {
    if (veiculoId) {
      const km = getUltimoKm(veiculoId);
      setKmRealizacao(km);
    } else {
      setKmRealizacao("");
    }
  }, [veiculoId, abastecimentos]);

  // Salvar manutenção
  const salvar = async () => {
    if (!veiculoId || !tipoId || !dataRealizacao || !kmRealizacao) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const tipo = tiposManutencao.find(t => t.id === tipoId);
    if (!tipo) {
      alert("Tipo de manutenção inválido");
      return;
    }

    // Calcula próxima data e próximo km
    const proximaData = new Date(dataRealizacao);
    proximaData.setDate(proximaData.getDate() + tipo.periodicidadeDias);
    const proximoKm = Number(kmRealizacao) + tipo.periodicidadeKm;

    try {
      await addDoc(collection(db, "manutencoes"), {
        veiculoId,
        tipoManutencaoId: tipoId,
        dataRealizacao: new Date(dataRealizacao).toISOString(),
        kmRealizacao: Number(kmRealizacao),
        proximaData: proximaData.toISOString(),
        proximoKm,
        observacoes,
      });
      alert("Manutenção cadastrada com sucesso");
      setVeiculoId("");
      setTipoId("");
      setDataRealizacao("");
      setKmRealizacao("");
      setObservacoes("");

      // Atualizar lista
      const manSnap = await getDocs(collection(db, "manutencoes"));
      setManutencoes(manSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar manutenção");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Cadastro de Manutenção</h1>

      <div style={{ marginBottom: 20 }}>
        <select
          value={veiculoId}
          onChange={e => setVeiculoId(e.target.value)}
          style={{ marginRight: 10 }}
        >
          <option value="">Selecionar Veículo</option>
          {veiculos.map(v => (
            <option key={v.id} value={v.id}>
              {v.placa} - {v.modelo}
            </option>
          ))}
        </select>

        <select
          value={tipoId}
          onChange={e => setTipoId(e.target.value)}
          style={{ marginRight: 10 }}
        >
          <option value="">Selecionar Tipo de Manutenção</option>
          {tiposManutencao.map(t => (
           <option key={t.id} value={t.id}>
  {t.nome}
  {t.modelo && t.marca ? ` - (${t.marca} ${t.modelo})` : ""}
</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          type="date"
          value={dataRealizacao}
          onChange={e => setDataRealizacao(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <input
          type="number"
          value={kmRealizacao}
          onChange={e => setKmRealizacao(e.target.value)}
          placeholder="KM da manutenção"
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <textarea
          placeholder="Observações"
          value={observacoes}
          onChange={e => setObservacoes(e.target.value)}
          style={{ width: "100%", height: 80 }}
        />
      </div>

      <button onClick={salvar}>Salvar Manutenção</button>

      <h2 style={{ marginTop: 40 }}>Manutenções Cadastradas</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Veículo</th>
            <th>Tipo</th>
            <th>Data Realização</th>
            <th>KM Realização</th>
            <th>Próxima Data</th>
            <th>Próximo KM</th>
            <th>Observações</th>
          </tr>
        </thead>
        <tbody>
          {manutencoes.map(m => {
            const veic = veiculos.find(v => v.id === m.veiculoId) || {};
            const tipo = tiposManutencao.find(t => t.id === m.tipoManutencaoId) || {};
            return (
              <tr key={m.id}>
                <td>{veic.placa}</td>
                <td>{tipo.nome}</td>
                <td>{new Date(m.dataRealizacao).toLocaleDateString("pt-BR")}</td>
                <td>{m.kmRealizacao}</td>
                <td>{new Date(m.proximaData).toLocaleDateString("pt-BR")}</td>
                <td>{m.proximoKm}</td>
                <td>{m.observacoes}</td>
              </tr>
            );
          })}
          {manutencoes.length === 0 && (
            <tr>
              <td colSpan={7}>Nenhuma manutenção cadastrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
