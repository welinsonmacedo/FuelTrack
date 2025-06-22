import React, { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function TypesMaintenancePage() {
  const [tipos, setTipos] = useState([]);
  const [veiculos, setVeiculos] = useState([]);

  const [modeloSelecionado, setModeloSelecionado] = useState("");
  const [marcaSelecionada, setMarcaSelecionada] = useState("");

  const [nome, setNome] = useState("");
  const [periodicidadeKm, setPeriodicidadeKm] = useState("");
  const [periodicidadeDias, setPeriodicidadeDias] = useState("");
  const [descricao, setDescricao] = useState("");

  const [antecedenciaKm, setAntecedenciaKm] = useState("");
  const [antecedenciaDias, setAntecedenciaDias] = useState("");

  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const snapTipos = await getDocs(collection(db, "tiposManutencao"));
      setTipos(snapTipos.docs.map((d) => ({ id: d.id, ...d.data() })));

      const snapVeiculos = await getDocs(collection(db, "veiculos"));
      setVeiculos(snapVeiculos.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetch();
  }, []);

  const salvar = async () => {
    if (!nome || !periodicidadeKm || !periodicidadeDias || !modeloSelecionado || !marcaSelecionada) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const tipo = {
      nome,
      descricao,
      modelo: modeloSelecionado,
      marca: marcaSelecionada,
      periodicidadeKm: Number(periodicidadeKm),
      periodicidadeDias: Number(periodicidadeDias),
      antecedenciaKm: Number(antecedenciaKm) || 0,
      antecedenciaDias: Number(antecedenciaDias) || 0,
    };

    if (editandoId) {
      await updateDoc(doc(db, "tiposManutencao", editandoId), tipo);
      alert("Tipo de manutenção atualizado!");
    } else {
      await addDoc(collection(db, "tiposManutencao"), tipo);
      alert("Tipo de manutenção salvo!");
    }

    limparFormulario();
    const snapTipos = await getDocs(collection(db, "tiposManutencao"));
    setTipos(snapTipos.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const limparFormulario = () => {
    setNome("");
    setDescricao("");
    setModeloSelecionado("");
    setMarcaSelecionada("");
    setPeriodicidadeKm("");
    setPeriodicidadeDias("");
    setAntecedenciaKm("");
    setAntecedenciaDias("");
    setEditandoId(null);
  };

  const editarTipo = (tipo) => {
    setNome(tipo.nome);
    setDescricao(tipo.descricao || "");
    setModeloSelecionado(tipo.modelo || "");
    setMarcaSelecionada(tipo.marca || "");
    setPeriodicidadeKm(tipo.periodicidadeKm || "");
    setPeriodicidadeDias(tipo.periodicidadeDias || "");
    setAntecedenciaKm(tipo.antecedenciaKm || "");
    setAntecedenciaDias(tipo.antecedenciaDias || "");
    setEditandoId(tipo.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const excluir = async (id) => {
    if (window.confirm("Deseja excluir este tipo de manutenção?")) {
      await deleteDoc(doc(db, "tiposManutencao", id));
      const snapTipos = await getDocs(collection(db, "tiposManutencao"));
      setTipos(snapTipos.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
  };

  const modelosUnicos = [...new Set(veiculos.map((v) => v.modelo))];
  const marcasUnicas = [...new Set(veiculos.map((v) => v.marca))];

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>Tipos de Manutenção</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        <select value={modeloSelecionado} onChange={(e) => setModeloSelecionado(e.target.value)}>
          <option value="">Modelo</option>
          {modelosUnicos.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select value={marcaSelecionada} onChange={(e) => setMarcaSelecionada(e.target.value)}>
          <option value="">Marca</option>
          {marcasUnicas.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input type="number" placeholder="Periodicidade Km" value={periodicidadeKm} onChange={(e) => setPeriodicidadeKm(e.target.value)} />
        <input type="number" placeholder="Periodicidade Dias" value={periodicidadeDias} onChange={(e) => setPeriodicidadeDias(e.target.value)} />
        <input type="number" placeholder="Antecedência Km" value={antecedenciaKm} onChange={(e) => setAntecedenciaKm(e.target.value)} />
        <input type="number" placeholder="Antecedência Dias" value={antecedenciaDias} onChange={(e) => setAntecedenciaDias(e.target.value)} />
        <button onClick={salvar}>{editandoId ? "Atualizar" : "Salvar"}</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Modelo</th>
            <th>Marca</th>
            <th>Km</th>
            <th>Dias</th>
            <th>Antecedência Km</th>
            <th>Antecedência Dias</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {tipos.map((t) => (
            <tr key={t.id}>
              <td>{t.nome}</td>
              <td>{t.modelo}</td>
              <td>{t.marca}</td>
              <td>{t.periodicidadeKm}</td>
              <td>{t.periodicidadeDias}</td>
              <td>{t.antecedenciaKm}</td>
              <td>{t.antecedenciaDias}</td>
              <td>
                <button onClick={() => editarTipo(t)}>Editar</button>
                <button onClick={() => excluir(t.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
