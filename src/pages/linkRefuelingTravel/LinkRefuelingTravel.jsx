/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

export default function LinkRefuelingTravel() {
  const [viagens, setViagens] = useState([]);
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [caminhoes, setCaminhoes] = useState([]);
  const [motoristas, setMotoristas] = useState([]);

  const [viagemIdSelecionada, setViagemIdSelecionada] = useState("");
  const [abastecimentoIdSelecionado, setAbastecimentoIdSelecionado] = useState("");

  const [loading, setLoading] = useState(false);

  // Função para formatar data para formato BR
 const formatarDataBR = (data) => {
  if (!data) return "";
  
  // Se for Timestamp Firestore, converte para Date
  if (data.toDate && typeof data.toDate === "function") {
    data = data.toDate();
  }
  
  const dataObj = new Date(data);
  if (isNaN(dataObj.getTime())) return ""; // evita Invalid Date
  
  return dataObj.toLocaleDateString("pt-BR");
};

  useEffect(() => {
    const fetchData = async () => {
      // Buscar caminhões
      const caminhoesSnap = await getDocs(collection(db, "veiculos"));
      const caminhoesData = caminhoesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCaminhoes(caminhoesData);

      // Buscar motoristas
      const motoristasSnap = await getDocs(collection(db, "motoristas"));
      const motoristasData = motoristasSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMotoristas(motoristasData);

      // Buscar viagens
      const viagensSnap = await getDocs(collection(db, "viagens"));
      const viagensComPlaca = viagensSnap.docs.map((doc) => {
        const viagemData = doc.data();
        const caminhaoRelacionado = caminhoesData.find(
          (c) => c.id === viagemData.caminhao
        );

        return {
          id: doc.id,
          ...viagemData,
          placa: caminhaoRelacionado?.placa || "Placa não encontrada",
        };
      });
      setViagens(viagensComPlaca);

      // Buscar abastecimentos sem vínculo
      const q = query(
        collection(db, "abastecimentos"),
        where("vinculoViagem", "==", false)
      );
      const abastecimentosSnap = await getDocs(q);

      // Enriquecer abastecimentos com nome motorista e placa caminhão
      const abastecimentosData = abastecimentosSnap.docs.map((doc) => {
        const ab = doc.data();

        const motoristaRelacionado = motoristasData.find(
          (m) => m.id === ab.motorista
        );
        const caminhaoRelacionado = caminhoesData.find(
          (c) => c.id === ab.caminhao
        );

        return {
          id: doc.id,
          ...ab,
          nomeMotorista: motoristaRelacionado?.nome || "Motorista não encontrado",
          placaCaminhao: caminhaoRelacionado?.placa || "Placa não encontrada",
        };
      });

      setAbastecimentos(abastecimentosData);
    };

    fetchData();
  }, []);

  // Função para vincular abastecimento à viagem
  const vincular = async () => {
    if (!viagemIdSelecionada || !abastecimentoIdSelecionado) {
      alert("Selecione uma viagem e um abastecimento para vincular.");
      return;
    }

    setLoading(true);

    try {
      const abastecimentoRef = doc(db, "abastecimentos", abastecimentoIdSelecionado);

      await updateDoc(abastecimentoRef, {
        vinculoViagem: true,
        viagemId: viagemIdSelecionada,
      });

      alert("Abastecimento vinculado com sucesso!");

      // Atualizar lista de abastecimentos (remover o vinculado)
      setAbastecimentos((prev) =>
        prev.filter((a) => a.id !== abastecimentoIdSelecionado)
      );

      // Resetar seleção
      setAbastecimentoIdSelecionado("");
      setViagemIdSelecionada("");
    } catch (error) {
      console.error("Erro ao vincular:", error);
      alert("Erro ao vincular. Tente novamente.");
    }

    setLoading(false);
  };

  const styles = {
    container: {
      padding: "20px",
      fontFamily: "Arial, sans-serif",
      maxWidth: "500px",
      margin: "0 auto",
      backgroundColor: "#ecf0f1",
      borderRadius: "8px",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    },
    title: {
      fontSize: "24px",
      marginBottom: "20px",
      color: "#2c3e50",
      textAlign: "center",
    },
    select: {
      width: "100%",
      padding: "10px",
      fontSize: "16px",
      marginBottom: "20px",
      borderRadius: "5px",
      border: "1px solid #ccc",
    },
    button: {
      backgroundColor: "#27ae60",
      color: "#fff",
      border: "none",
      padding: "12px",
      fontSize: "16px",
      borderRadius: "5px",
      cursor: "pointer",
      width: "100%",
      opacity: loading ? 0.7 : 1,
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Vincular Abastecimento à Viagem</h1>

      <label>Selecionar Viagem</label>
      <select
        style={styles.select}
        value={viagemIdSelecionada}
        onChange={(e) => setViagemIdSelecionada(e.target.value)}
      >
        <option value="">-- Escolha uma viagem --</option>
        {viagens.map((v) => (
          <option key={v.id} value={v.id}>
            {v.placa} - {formatarDataBR(v.dataInicio)}
          </option>
        ))}
      </select>

      <label>Selecionar Abastecimento (sem vínculo)</label>
      <select
        style={styles.select}
        value={abastecimentoIdSelecionado}
        onChange={(e) => setAbastecimentoIdSelecionado(e.target.value)}
      >
        <option value="">-- Escolha um abastecimento --</option>
        {abastecimentos.map((a) => (
          <option key={a.id} value={a.id}>
             {a.nomeMotorista} - {a.placaCaminhao} - {a.litros},LTS - {formatarDataBR(a.dataHora)}
          </option>
        ))}
      </select>

      <button onClick={vincular} disabled={loading} style={styles.button}>
        {loading ? "Vinculando..." : "Vincular"}
      </button>
    </div>
  );
}
