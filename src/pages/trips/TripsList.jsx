import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,

} from "firebase/firestore";

import { db } from "../../services/firebase";

export default function ViagensList() {
  const [viagens, setViagens] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [caminhoes, setCaminhoes] = useState([]);
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viagemSelecionada, setViagemSelecionada] = useState(null);
  const [filtroMotorista, setFiltroMotorista] = useState("");
  const [filtroCaminhao, setFiltroCaminhao] = useState("");

  useEffect(() => {
    async function fetchMotoristas() {
      const snap = await getDocs(collection(db, "motoristas"));
      setMotoristas(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }
    fetchMotoristas();
  }, []);

  useEffect(() => {
    async function fetchCaminhoes() {
      const snap = await getDocs(collection(db, "veiculos"));
      setCaminhoes(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }
    fetchCaminhoes();
  }, []);

  useEffect(() => {
    async function fetchViagens() {
      setLoading(true);
      let q = collection(db, "viagens");
      const filtros = [];

      if (filtroMotorista)
        filtros.push(where("motorista", "==", filtroMotorista));
      if (filtroCaminhao) filtros.push(where("caminhao", "==", filtroCaminhao));

      if (filtros.length > 0) q = query(q, ...filtros);
      q = query(q, orderBy("dataInicio", "desc"));

      const snap = await getDocs(q);
      setViagens(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }

    if (motoristas.length > 0 && caminhoes.length > 0) {
      fetchViagens();
    }
  }, [motoristas, caminhoes, filtroMotorista, filtroCaminhao]);

  useEffect(() => {
    async function fetchAbastecimentos() {
      if (!viagemSelecionada) return;

      const q = query(
        collection(db, "abastecimentos"),
        where("viagemId", "==", viagemSelecionada.id)
      );
      const snap = await getDocs(q);
      setAbastecimentos(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    }

    fetchAbastecimentos();
  }, [viagemSelecionada]);

  const nomeMotorista = (id) => {
    if (!id) return "-";
    const m = motoristas.find((m) => String(m.id).trim() === String(id).trim());
    return m ? m.nome : id;
  };

  const infoCaminhao = (id) => {
    const c = caminhoes.find((c) => c.id === id);
    return c ? `${c.placa} - ${c.modelo}` : id;
  };

  const abrirModal = (viagem) => {
    setViagemSelecionada(viagem);
    setModalOpen(true);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setViagemSelecionada(null);
    setAbastecimentos([]);
  };

  const apagarViagem = async (id) => {
    if (window.confirm("Deseja apagar esta viagem?")) {
      await deleteDoc(doc(db, "viagens", id));
      setViagens((prev) => prev.filter((v) => v.id !== id));
      fecharModal();
    }
  };

  // Função para remover vínculo de abastecimento com a viagem
  const removerVinculo = async (abastecimentoId) => {
    if (
      !window.confirm("Deseja realmente remover o vínculo desse abastecimento?")
    ) {
      return;
    }

    try {
      const abastecimentoRef = doc(db, "abastecimentos", abastecimentoId);
      await updateDoc(abastecimentoRef, {
        vinculoViagem: false,
        viagemId: "",
      });

      // Atualiza a lista local removendo o abastecimento desvinculado
      setAbastecimentos((prev) => prev.filter((a) => a.id !== abastecimentoId));
      alert("Vínculo removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover vínculo:", error);
      alert("Erro ao remover vínculo. Tente novamente.");
    }
  };

  const formatarData = (data) => {
    try {
      return data?.toDate ? data.toDate().toLocaleDateString("pt-BR") : "-";
    } catch {
      return "-";
    }
  };

  const formatarDataHora = (data) => {
    try {
      return data?.toDate ? data.toDate().toLocaleString("pt-BR") : "-";
    } catch {
      return "-";
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Lista de Viagens</h1>

      <section style={styles.filters}>
        <select
          value={filtroMotorista}
          onChange={(e) => setFiltroMotorista(e.target.value)}
          style={styles.select}
        >
          <option value="">Filtrar por Motorista</option>
          {motoristas.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>

        <select
          value={filtroCaminhao}
          onChange={(e) => setFiltroCaminhao(e.target.value)}
          style={styles.select}
        >
          <option value="">Filtrar por Caminhão</option>
          {caminhoes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.placa} - {c.modelo}
            </option>
          ))}
        </select>
      </section>

      {loading ? (
        <p>Carregando viagens...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableTitle}>
              <th>Motorista</th>
              <th>Caminhão</th>
              <th>Data Início</th>
              <th>Data Fim</th>
              <th>Origem</th>
              <th>Destino</th>
              <th>Rota</th> {/* NOVO */}
            </tr>
          </thead>
          <tbody>
            {viagens.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  Nenhuma viagem encontrada.
                </td>
              </tr>
            ) : (
              viagens.map((v) => (
                <tr
                  key={v.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => abrirModal(v)}
                >
                  <td>{nomeMotorista(v.motorista)}</td>
                  <td>{infoCaminhao(v.caminhao)}</td>
                  <td>{formatarData(v.dataInicio)}</td>
                  <td>{formatarData(v.dataFim)}</td>
                  <td>{v.origem || "-"}</td>
                  <td>{v.destino || "-"}</td>
                  <td>{v.sigla || `${v.origem} → ${v.destino}`}</td>{" "}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {modalOpen && viagemSelecionada && (
        <div style={styles.modalOverlay} onClick={fecharModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 10 }}>🚚 Detalhes da Viagem</h2>
            <div style={{ marginBottom: 10 }}>
              <p>
                <strong>Motorista:</strong>{" "}
                {nomeMotorista(viagemSelecionada.motorista)}
              </p>
              <p>
                <strong>Caminhão:</strong>{" "}
                {infoCaminhao(viagemSelecionada.caminhao)}
              </p>
              <p>
                <strong>Data Início:</strong>{" "}
                {formatarData(viagemSelecionada.dataInicio)}
              </p>
              <p>
                <strong>Data Fim:</strong>{" "}
                {formatarData(viagemSelecionada.dataFim)}
              </p>

              <p>
                <strong>KM Inicial:</strong> {viagemSelecionada.kmInicial}
              </p>
              <p>
                <strong>KM Final:</strong> {viagemSelecionada.kmFinal}
              </p>
              <p>
                <strong>Origem:</strong> {viagemSelecionada.origem || "-"}
              </p>
              <p>
                <strong>Destino:</strong> {viagemSelecionada.destino || "-"}
              </p>
              <p>
                <strong>Rota:</strong>{" "}
                {viagemSelecionada.sigla ||
                  `${viagemSelecionada.origem} → ${viagemSelecionada.destino}`}
              </p>
              <p>
                <strong>Tipo de Carga:</strong>{" "}
                {viagemSelecionada.tipoCarga || "-"}
              </p>
              <p>
                <strong>Valor do Frete:</strong>{" "}
                {viagemSelecionada.valorFrete
                  ? `R$ ${viagemSelecionada.valorFrete.toFixed(2)}`
                  : "-"}
              </p>
              <p>
                <strong>Nota Fiscal:</strong>{" "}
                {viagemSelecionada.notaFiscal || "-"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {viagemSelecionada.status === "planejada"
                  ? "Planejada"
                  : viagemSelecionada.status === "em_andamento"
                  ? "Em Andamento"
                  : viagemSelecionada.status === "concluida"
                  ? "Concluída"
                  : "-"}
              </p>
              <p>
                <strong>Tipo de Viagem:</strong>{" "}
                {viagemSelecionada.tipoViagem === "ida"
                  ? "Ida"
                  : viagemSelecionada.tipoViagem === "volta"
                  ? "Volta"
                  : viagemSelecionada.tipoViagem === "ida_volta"
                  ? "Ida e Volta"
                  : "-"}
              </p>
              <p>
                <strong>Observações:</strong>{" "}
                {viagemSelecionada.observacoes || "Nenhuma"}
              </p>
            </div>

            <hr style={{ margin: "15px 0" }} />

            <h3 style={{ marginBottom: 5 }}>⛽ Abastecimentos da Viagem</h3>
            {abastecimentos.length === 0 ? (
              <p>Nenhum abastecimento registrado para essa viagem.</p>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "10px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f2f2f2" }}>
                    <th style={styles.cell}>Data/Hora</th>
                    <th style={styles.cell}>Litros</th>
                    <th style={styles.cell}>Preço (R$)</th>
                    <th style={styles.cell}>Total (R$)</th>
                    <th style={styles.cell}>KM</th>
                    <th style={styles.cell}>NF</th>
                    <th style={styles.cell}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {abastecimentos.map((a) => (
                    <tr key={a.id}>
                      <td style={styles.cell}>
                        {formatarDataHora(a.dataHora)}
                      </td>
                      <td style={styles.cell}>{a.litros ?? "-"}</td>
                      <td style={styles.cell}>
                        {a.precoLitro?.toFixed(2) ?? "-"}
                      </td>
                      <td style={styles.cell}>
                        {a.litros && a.precoLitro
                          ? `R$ ${(a.litros * a.precoLitro).toFixed(2)}`
                          : "-"}
                      </td>
                      <td style={styles.cell}>{a.km ?? "-"}</td>
                      <td style={styles.cell}>{a.nf || "-"}</td>
                      <td style={styles.cell}>
                        <button
                          style={styles.btnRemoveVinculo}
                          onClick={() => removerVinculo(a.id)}
                        >
                          Remover vínculo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <button style={styles.btnClose} onClick={fecharModal}>
              Fechar
            </button>
            <button
              style={{
                ...styles.btnClose,
                marginLeft: 10,
                backgroundColor: "#e53935",
              }}
              onClick={() => apagarViagem(viagemSelecionada.id)}
            >
              Apagar Viagem
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1080px",
    margin: "30px auto",
    padding: "0 20px",
    fontFamily: "'Segoe UI', sans-serif",
    color: "#000000",
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    fontWeight: 600,
    color: "#00BCD4",
  },
  filters: {
    display: "flex",
    gap: 15,
    marginBottom: 24,
  },
  select: {
    flex: 1,
    padding: "10px",
    fontSize: 16,
    borderRadius: 8,
    border: "1px solid #555",
    backgroundColor: "#ffffff",
    color: "#000000",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    overflow: "hidden",
    boxShadow: "0 0 12px rgba(0,0,0,0.3)",
    textAlign:"center"
  },
  tableTitle: {
    backgroundColor: "#00BCD4",
    color: "white",
    fontWeight: "600",
  },
  cell: {
    border: "1px solid #333",
    padding: "10px 8px",
    textAlign: "center",
    fontSize: 14,
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    padding: 25,
    borderRadius: 10,
    maxWidth: 700,
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 0 20px rgba(0,0,0,0.5)",
    color: "#f0f0f0",
  },
  btnClose: {
    padding: "10px 20px",
    fontSize: 16,
    cursor: "pointer",
    borderRadius: 6,
    border: "none",
    backgroundColor: "#00BCD4",
    color: "white",
    transition: "background 0.3s",
  },
  btnRemoveVinculo: {
    padding: "6px 12px",
    fontSize: 14,
    cursor: "pointer",
    borderRadius: 6,
    border: "none",
    backgroundColor: "#f44336",
    color: "white",
    transition: "background 0.3s",
  },
}