import React, { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

export default function TypesMaintenancePage() {
  const [tipos, setTipos] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState("");

  const [nome, setNome] = useState("");
  const [periodicidadeKm, setPeriodicidadeKm] = useState("");
  const [periodicidadeDias, setPeriodicidadeDias] = useState("");
  const [descricao, setDescricao] = useState("");

  const fetchTipos = async () => {
    const snap = await getDocs(collection(db, "tiposManutencao"));
    setTipos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchVeiculos = async () => {
    const snap = await getDocs(collection(db, "veiculos"));
    setVeiculos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchTipos();
    fetchVeiculos();
  }, []);

  const salvar = async () => {
    if (!nome || !periodicidadeKm || !periodicidadeDias) {
      alert("Preencha os campos obrigatórios");
      return;
    }

    const veiculoData = veiculos.find(v => v.id === veiculoSelecionado);

    await addDoc(collection(db, "tiposManutencao"), {
      nome,
      periodicidadeKm: Number(periodicidadeKm),
      periodicidadeDias: Number(periodicidadeDias),
      descricao,
      veiculoId: veiculoSelecionado || null,
      modelo: veiculoData?.modelo || "",
      marca: veiculoData?.marca || "",
    });

    alert("Tipo salvo com sucesso");
    setNome("");
    setPeriodicidadeKm("");
    setPeriodicidadeDias("");
    setDescricao("");
    setVeiculoSelecionado("");
    fetchTipos();
  };

  const excluir = async (id) => {
    if (window.confirm("Deseja realmente excluir este tipo?")) {
      await deleteDoc(doc(db, "tiposManutencao", id));
      fetchTipos();
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Tipos de Manutenção</h1>
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <input
          placeholder="Periodicidade Km"
          type="number"
          value={periodicidadeKm}
          onChange={e => setPeriodicidadeKm(e.target.value)}
          style={{ marginRight: 10, width: 130 }}
        />
        <input
          placeholder="Periodicidade Dias"
          type="number"
          value={periodicidadeDias}
          onChange={e => setPeriodicidadeDias(e.target.value)}
          style={{ marginRight: 10, width: 130 }}
        />
        <select
          value={veiculoSelecionado}
          onChange={e => setVeiculoSelecionado(e.target.value)}
          style={{ marginRight: 10 }}
        >
          <option value="">(Opcional) Modelo/Marca</option>
          {veiculos.map(v => (
            <option key={v.id} value={v.id}>
              {v.marca} - {v.modelo}
            </option>
          ))}
        </select>
        <input
          placeholder="Descrição (opcional)"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          style={{ width: 300, marginRight: 10 }}
        />
        <button onClick={salvar}>Salvar</button>
      </div>

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Km</th>
            <th>Dias</th>
            <th>Modelo</th>
            <th>Marca</th>
            <th>Descrição</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {tipos.map(t => (
            <tr key={t.id}>
              <td>{t.nome}</td>
              <td>{t.periodicidadeKm}</td>
              <td>{t.periodicidadeDias}</td>
              <td>{t.modelo || "-"}</td>
              <td>{t.marca || "-"}</td>
              <td>{t.descricao || "-"}</td>
              <td>
                <button onClick={() => excluir(t.id)} style={{ color: "red" }}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
          {tipos.length === 0 && (
            <tr>
              <td colSpan={7}>Nenhum tipo cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
