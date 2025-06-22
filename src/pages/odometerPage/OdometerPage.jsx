import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function OdometroPage() {
  const [veiculos, setVeiculos] = useState([]);
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  // Estado para controle da expansão dos veículos (mostrar ou esconder os 3 últimos abastecimentos)
  const [expandido, setExpandido] = useState({}); // objeto { veiculoId: boolean }

  const navigate = useNavigate();

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

      // Buscar abastecimentos ordenados por data (asc)
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

  // Formatar data para BR
  const formatarDataBR = (data) => {
    if (!data) return "";
    if (data.toDate && typeof data.toDate === "function") data = data.toDate();
    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) return "";
    return dataObj.toLocaleDateString("pt-BR");
  };

  // Agrupar dados dos veículos com seus abastecimentos e último KM
  const veiculosComDados = veiculos.map((v) => {
    const abastecimentosDoVeiculo = abastecimentos.filter(
      (a) => a.caminhao === v.id
    );

    const ultimoKM =
      abastecimentosDoVeiculo.length > 0
        ? Math.max(...abastecimentosDoVeiculo.map((a) => a.kmAbastecimento || 0))
        : "Sem registros";

    return {
      ...v,
      abastecimentosDoVeiculo,
      ultimoKM,
    };
  });

  if (loading) return <p>Carregando dados...</p>;

  // Função para abrir/fechar expansão
  const toggleExpandir = (id) => {
    setExpandido((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Controle de Odômetros dos Veículos</h1>
      {veiculosComDados.map((v) => {
        // 3 últimos abastecimentos (do mais recente para o mais antigo)
        const ultimos3 = [...v.abastecimentosDoVeiculo]
          .sort((a, b) => {
            const dataA = a.dataHora.toDate ? a.dataHora.toDate() : new Date(a.dataHora);
            const dataB = b.dataHora.toDate ? b.dataHora.toDate() : new Date(b.dataHora);
            return dataB - dataA;
          })
          .slice(0, 3);

        const estaExpandido = !!expandido[v.id];

        return (
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

            <button
              onClick={() => toggleExpandir(v.id)}
              style={{
                marginBottom: 12,
                cursor: "pointer",
                backgroundColor: "#00BCD4",
                color: "white",
                border: "none",
                borderRadius: 5,
                padding: "6px 12px",
                fontSize: 14,
              }}
            >
              {estaExpandido ? "Ocultar histórico (3 últimos)" : "Mostrar histórico (3 últimos)"}
            </button>

            {estaExpandido && (
              <>
                {ultimos3.length === 0 ? (
                  <p>Sem abastecimentos registrados.</p>
                ) : isMobile ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {ultimos3.map((a) => (
                      <div
                        key={a.id}
                        style={{
                          border: "1px solid #ccc",
                          borderRadius: 6,
                          padding: 12,
                          backgroundColor: "#fff",
                        }}
                      >
                        <p>
                          <strong>Data:</strong> {formatarDataBR(a.dataHora)}
                        </p>
                        <p>
                          <strong>KM Abastecimento:</strong> {a.kmAbastecimento}
                        </p>
                        <p>
                          <strong>Litros:</strong> {a.litros}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      marginBottom: 12,
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={{ border: "1px solid #ccc", padding: 8 }}>Data</th>
                        <th style={{ border: "1px solid #ccc", padding: 8 }}>
                          KM Abastecimento
                        </th>
                        <th style={{ border: "1px solid #ccc", padding: 8 }}>Litros</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ultimos3.map((a) => (
                        <tr key={a.id}>
                          <td style={{ border: "1px solid #ccc", padding: 8 }}>
                            {formatarDataBR(a.dataHora)}
                          </td>
                          <td style={{ border: "1px solid #ccc", padding: 8 }}>
                            {a.kmAbastecimento}
                          </td>
                          <td style={{ border: "1px solid #ccc", padding: 8 }}>{a.litros}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <button
                  onClick={() => navigate(`/odometer-report/${v.id}`)}
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: 5,
                    padding: "8px 14px",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  Ver relatório completo
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
