import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function OdometroPage() {
  const [veiculos, setVeiculos] = useState([]);
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchDados = async () => {
      setLoading(true);

      // Buscar veículos
      const veiculosSnap = await getDocs(collection(db, "veiculos"));
      const veiculosData = veiculosSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVeiculos(veiculosData);

      // Buscar abastecimentos ordenados por data (opcional)
      const abastecimentosSnap = await getDocs(
        query(collection(db, "abastecimentos"), orderBy("dataHora", "asc"))
      );
      const abastecimentosData = abastecimentosSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAbastecimentos(abastecimentosData);

      setLoading(false);
    };

    fetchDados();
  }, []);

  // Função para formatar data BR
  const formatarDataBR = (data) => {
    if (!data) return "";
    if (data.toDate && typeof data.toDate === "function") data = data.toDate();
    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) return "";
    return dataObj.toLocaleDateString("pt-BR");
  };

  // Para cada veículo, obter abastecimentos relacionados e o último KM registrado
  const veiculosComDados = veiculos.map((v) => {
    const abastecimentosDoVeiculo = abastecimentos.filter(
      (a) => a.caminhao === v.id
    );

    // Último KM (maior kmAbastecimento)
    const ultimoKM =
      abastecimentosDoVeiculo.length > 0
        ? Math.max(
            ...abastecimentosDoVeiculo.map((a) => a.kmAbastecimento || 0)
          )
        : "Sem registros";

    return {
      ...v,
      abastecimentosDoVeiculo,
      ultimoKM,
    };
  });

  if (loading) return <p>Carregando dados...</p>;

  return (
  <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
    <h1>Controle de Odômetros dos Veículos</h1>
    {veiculosComDados.map((v) => (
      <div
        key={v.id}
        style={{
          marginBottom: 30,
          padding: 15,
          border: "1px solid #ccc",
          borderRadius: 8,
          backgroundColor: "#f9f9f9",
        }}
      >
        <h2>
          {v.placa} - {v.modelo || ""}
        </h2>
        <p>
          <strong>Último odômetro registrado:</strong> {v.ultimoKM}
        </p>
        <h3>Histórico de abastecimentos:</h3>

        {v.abastecimentosDoVeiculo.length === 0 ? (
          <p>Sem abastecimentos registrados.</p>
        ) : isMobile ? (
          // Layout mobile: cards empilhados
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {v.abastecimentosDoVeiculo.map((a) => (
              <div
                key={a.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  padding: 12,
                  backgroundColor: "#fff",
                }}
              >
                <p><strong>Data:</strong> {formatarDataBR(a.dataHora)}</p>
                <p><strong>KM Abastecimento:</strong> {a.kmAbastecimento}</p>
                <p><strong>Litros:</strong> {a.litros}</p>
              </div>
            ))}
          </div>
        ) : (
          // Layout desktop: tabela normal
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Data</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>KM Abastecimento</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Litros</th>
              </tr>
            </thead>
            <tbody>
              {v.abastecimentosDoVeiculo.map((a) => (
                <tr key={a.id}>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{formatarDataBR(a.dataHora)}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{a.kmAbastecimento}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{a.litros}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    ))}
  </div>
)}