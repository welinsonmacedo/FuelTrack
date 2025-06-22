/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import "./style.css"
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import ConfirmMaintenanceDoneModal from "./ConfirmMaintenanceModal";
import PrintOSModal from "./PrintOSModal.jsx";
import Button from "../../components/Button";
import ActionMenu from "./ActionMenu";
import "./style.css";

export default function MaintenancePage() {
  const [veiculos, setVeiculos] = useState([]);
  const [tiposManutencao, setTiposManutencao] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  const [editId, setEditId] = useState(null);
  const [veiculoId, setVeiculoId] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [dataRealizacao, setDataRealizacao] = useState("");
  const [kmRealizacao, setKmRealizacao] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);
  const [manutencaoSelecionada, setManutencaoSelecionada] = useState(null);
  const [modalPrintOpen, setModalPrintOpen] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    const veicSnap = await getDocs(collection(db, "veiculos"));
    setVeiculos(veicSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

    const tiposSnap = await getDocs(collection(db, "tiposManutencao"));
    setTiposManutencao(tiposSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

    const manSnap = await getDocs(collection(db, "manutencoes"));
    setManutencoes(manSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

    const fornSnap = await getDocs(collection(db, "fornecedores"));
    setFornecedores(fornSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  useEffect(() => {
    if (!veiculoId) {
      setKmRealizacao("");
      return;
    }
    async function fetchUltimoKm() {
      const absSnap = await getDocs(collection(db, "abastecimentos"));
      const absVeic = absSnap.docs
        .map((d) => d.data())
        .filter((a) => a.caminhao === veiculoId);
      if (absVeic.length === 0) return setKmRealizacao("");
      const maxKm = Math.max(...absVeic.map((a) => a.kmAbastecimento || 0));
      setKmRealizacao(maxKm);
    }
    fetchUltimoKm();
  }, [veiculoId]);

  const salvar = async () => {
    if (!veiculoId || !tipoId || !dataRealizacao || !kmRealizacao) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const tipo = tiposManutencao.find((t) => t.id === tipoId);
    const veiculo = veiculos.find((v) => v.id === veiculoId);

    if (!tipo || !veiculo) {
      alert("Tipo ou veículo inválido");
      return;
    }

    const proximaData = new Date(dataRealizacao);
    proximaData.setDate(proximaData.getDate() + tipo.periodicidadeDias);
    const proximoKm = Number(kmRealizacao) + tipo.periodicidadeKm;

    const dados = {
      veiculoId,
      modelo: veiculo.modelo || "",
      marca: veiculo.marca || "",
      tipoManutencaoId: tipoId,
      dataRealizacao: new Date(dataRealizacao).toISOString(),
      kmRealizacao: Number(kmRealizacao),
      proximaData: proximaData.toISOString(),
      proximoKm,
      observacoes,
    };

    try {
      if (editId) {
        await updateDoc(doc(db, "manutencoes", editId), dados);
        alert("Manutenção atualizada com sucesso");
      } else {
        await addDoc(collection(db, "manutencoes"), dados);
        alert("Manutenção cadastrada com sucesso");
      }

      limparForm();
      fetchAllData();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar manutenção");
    }
  };

  const limparForm = () => {
    setEditId(null);
    setVeiculoId("");
    setTipoId("");
    setDataRealizacao("");
    setKmRealizacao("");
    setObservacoes("");
  };

  const editarManutencao = (m) => {
    setEditId(m.id);
    setVeiculoId(m.veiculoId);
    setTipoId(m.tipoManutencaoId);
    setDataRealizacao(m.dataRealizacao.split("T")[0]);
    setKmRealizacao(m.kmRealizacao);
    setObservacoes(m.observacoes || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const abrirModalImprimir = (m) => {
    setManutencaoSelecionada(m);
    setModalPrintOpen(true);
  };

  const abrirModalConfirm = (m) => {
    setManutencaoSelecionada(m);
    setModalConfirmOpen(true);
  };

  const confirmarServicoFeito = async ({
    oficinaId,
    dataExecucao,
    kmExecucao,
  }) => {
    if (!manutencaoSelecionada) return;

    try {
      await updateDoc(doc(db, "manutencoes", manutencaoSelecionada.id), {
        oficinaId,
        dataExecucao: new Date(dataExecucao).toISOString(),
        kmExecucao: Number(kmExecucao),
        feita: true,
        dataConfirmacao: new Date().toISOString(),
      });
      alert("Serviço confirmado com sucesso!");
      setModalConfirmOpen(false);
      fetchAllData();
    } catch (error) {
      console.error(error);
      alert("Erro ao confirmar serviço");
    }
  };

  return (
    <div className="container">
      <div className="form">
        <select
          value={veiculoId}
          onChange={(e) => setVeiculoId(e.target.value)}
          className="select"
        >
          <option value="">Selecionar Veículo</option>
          {veiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.placa} - {v.modelo}
            </option>
          ))}
        </select>

        <select
          value={tipoId}
          onChange={(e) => setTipoId(e.target.value)}
          className="select"
        >
          <option value="">Selecionar Tipo de Manutenção</option>
          {tiposManutencao.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome} - {t.modelo}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dataRealizacao}
          onChange={(e) => setDataRealizacao(e.target.value)}
          className="input"
        />
        <input
          type="number"
          placeholder="KM da manutenção"
          value={kmRealizacao}
          onChange={(e) => setKmRealizacao(e.target.value)}
          className="input"
        />
        <textarea
          placeholder="Observações"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="textarea"
        />

        <div className="buttons">
          <Button onClick={salvar} className="saveBtn">
            {editId ? "Atualizar" : "Salvar"}
          </Button>
          {editId && (
            <Button
              onClick={limparForm}
              variant="secondary"
              className="cancelBtn"
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {/* Desktop - tabela */}
      <div className="tableWrapper">
        <table className="table desktop-table">
          <thead>
            <tr>
              <th>Veículo</th>
              <th>Tipo</th>
              <th>Data Realização</th>
              <th>KM Realização</th>
              <th>Próxima Data</th>
              <th>Próximo KM</th>
              <th>Status Serviço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {manutencoes.map((m) => {
              const veic = veiculos.find((v) => v.id === m.veiculoId) || {};
              const tipo =
                tiposManutencao.find((t) => t.id === m.tipoManutencaoId) || {};
              const oficina =
                fornecedores.find((f) => f.id === m.oficinaId) || null;

              return (
                <tr key={m.id}>
                  <td>{veic.placa}</td>
                  <td>{tipo.nome}</td>
                  <td>
                    {new Date(m.dataRealizacao).toLocaleDateString("pt-BR")}
                  </td>
                  <td>{m.kmRealizacao}</td>
                  <td>{new Date(m.proximaData).toLocaleDateString("pt-BR")}</td>
                  <td>{m.proximoKm}</td>

                  <td>
                    {m.feita ? (
                      <span className="status status-realizado">
                        ✅ Realizado
                      </span>
                    ) : (
                      <span className="status status-pendente">
                        ⏳ Pendente
                      </span>
                    )}
                  </td>
                  <td className="actionsCell">
                    <ActionMenu
                      onEditar={() => editarManutencao(m)}
                      onConfirmar={() => abrirModalConfirm(m)}
                      onImprimir={() => abrirModalImprimir(m)}
                    />
                  </td>
                </tr>
              );
            })}
            {manutencoes.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center" }}>
                  Nenhuma manutenção cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile - cards */}
      <div className="cardContainer mobile-cards">
        {manutencoes.map((m) => {
          const veic = veiculos.find((v) => v.id === m.veiculoId) || {};
          const tipo =
            tiposManutencao.find((t) => t.id === m.tipoManutencaoId) || {};
          const oficina =
            fornecedores.find((f) => f.id === m.oficinaId) || null;
          return (
            <div key={m.id} className="card">
              <div className="cardRow">
                <span className="cardLabel">Veículo: </span>
                {veic.placa} - {veic.modelo}
              </div>
              <div className="cardRow">
                <span className="cardLabel">Tipo: </span>
                {tipo.nome}
              </div>
              <div className="cardRow">
                <span className="cardLabel">Data Realização: </span>
                {new Date(m.dataRealizacao).toLocaleDateString("pt-BR")}
              </div>
              <div className="cardRow">
                <span className="cardLabel">KM Realização: </span>
                {m.kmRealizacao}
              </div>
              <div className="cardRow">
                <span className="cardLabel">Próxima Data: </span>
                {new Date(m.proximaData).toLocaleDateString("pt-BR")}
              </div>
              <div className="cardRow">
                <span className="cardLabel">Próximo KM: </span>
                {m.proximoKm}
              </div>
              <div className="cardRow">
                <span className="cardLabel">Observações: </span>
                {m.observacoes}
              </div>
              <div className="cardRow">
                <span className="cardLabel">Status Serviço: </span>
                {m.feita
                  ? `Feita (${
                      oficina?.nome ||
                      oficina?.razaoSocial ||
                      "Oficina não informada"
                    })`
                  : "Pendente"}
              </div>

              <div className="cardActions">
                <Button variant="warning" onClick={() => editarManutencao(m)}>
                  Editar
                </Button>
                <Button variant="primary" onClick={() => abrirModalConfirm(m)}>
                  Confirmar
                </Button>
                <Button variant="success" onClick={() => abrirModalImprimir(m)}>
                  OS
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmMaintenanceDoneModal
        isOpen={modalConfirmOpen}
        onClose={() => setModalConfirmOpen(false)}
        fornecedores={fornecedores}
        manutencao={manutencaoSelecionada}
        onConfirm={confirmarServicoFeito}
      />
      <PrintOSModal
        isOpen={modalPrintOpen}
        onClose={() => setModalPrintOpen(false)}
        manutencao={manutencaoSelecionada}
        veiculo={veiculos.find(
          (v) => v.id === manutencaoSelecionada?.veiculoId
        )}
        tipo={tiposManutencao.find(
          (t) => t.id === manutencaoSelecionada?.tipoManutencaoId
        )}
        oficina={fornecedores.find(
          (f) => f.id === manutencaoSelecionada?.oficinaId
        )}
      />
    </div>
  );
}
