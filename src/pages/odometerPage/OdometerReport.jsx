import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";

export default function OdometerReport() {
  const { veiculoId } = useParams();
  const navigate = useNavigate();

  const [veiculo, setVeiculo] = useState(null);
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchDados() {
      setLoading(true);

      // Busca veículo pelo ID
      const veiculoDoc = await getDoc(doc(db, "veiculos", veiculoId));
      if (veiculoDoc.exists()) {
        setVeiculo({ id: veiculoDoc.id, ...veiculoDoc.data() });
      } else {
        setVeiculo(null);
      }

      // Busca abastecimentos relacionados ao veículo ordenados por data desc (mais recentes primeiro)
      const q = query(
        collection(db, "abastecimentos"),
        where("caminhao", "==", veiculoId),
        orderBy("dataHora", "desc")
      );
      const snap = await getDocs(q);
      const lista = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAbastecimentos(lista);

      setLoading(false);
    }

    fetchDados();
  }, [veiculoId]);

  // Função para formatar data BR
  const formatarDataBR = (data) => {
    if (!data) return "";
    if (data.toDate && typeof data.toDate === "function") data = data.toDate();
    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) return "";
    return dataObj.toLocaleDateString("pt-BR") + " " + dataObj.toLocaleTimeString("pt-BR");
  };

  if (loading) return <p>Carregando relatório...</p>;

  if (!veiculo) return <p>Veículo não encontrado.</p>;

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Relatório Completo de Abastecimentos</h1>
      <h2>
        {veiculo.placa} - {veiculo.modelo || ""}
      </h2>

      {abastecimentos.length === 0 ? (
        <p>Sem abastecimentos registrados para este veículo.</p>
      ) : isMobile ? (
        // Layout mobile: cards empilhados
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
          {abastecimentos.map((a) => {
            const precoLitro = Number(a.precoLitro) || 0;
            const valorTotal = precoLitro * (a.litros || 0);

            return (
              <div
                key={a.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  padding: 12,
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
              >
                <p><strong>Data e Hora:</strong> {formatarDataBR(a.dataHora)}</p>
                <p><strong>KM Abastecimento:</strong> {a.kmAbastecimento}</p>
                <p><strong>Litros:</strong> {a.litros}</p>
                <p><strong>Preço por Litro:</strong> R$ {precoLitro.toFixed(2)}</p>
                <p><strong>Valor Total:</strong> R$ {valorTotal.toFixed(2)}</p>
              </div>
            );
          })}
        </div>
      ) : (
        // Layout desktop: tabela normal
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 20,
            backgroundColor: "#fff",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#00BCD4", color: "#fff" }}>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Data e Hora</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>KM Abastecimento</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Litros</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Preço por Litro</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Valor Total</th>
            </tr>
          </thead>
          <tbody>
            {abastecimentos.map((a) => {
              const precoLitro = Number(a.precoLitro) || 0;
              const valorTotal = precoLitro * (a.litros || 0);

              return (
                <tr key={a.id}>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{formatarDataBR(a.dataHora)}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{a.kmAbastecimento}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{a.litros}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>R$ {precoLitro.toFixed(2)}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>R$ {valorTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <button
        onClick={() => navigate("/odometerpage")}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          fontSize: 16,
          cursor: "pointer",
          borderRadius: 6,
          border: "none",
          backgroundColor: "#00BCD4",
          color: "white",
        }}
      >
        Voltar
      </button>
    </div>
  );
}
