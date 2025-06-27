import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function FiltrosRelatorio({ onFiltroChange }) {
  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [filtros, setFiltros] = useState({
    motorista: "",
    veiculo: "",
    dataInicio: "",
    dataFim: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const motoristasSnap = await getDocs(collection(db, "motoristas"));
      const veiculosSnap = await getDocs(collection(db, "veiculos"));

      setMotoristas(motoristasSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setVeiculos(veiculosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchData();
  }, []);

  useEffect(() => {
    onFiltroChange(filtros);
  }, [filtros]);

  return (
    <>
      <style>{`
        .filtro-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }
        .filtro-field {
          display: flex;
          flex-direction: column;
        }
        .filtro-label {
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 6px;
          color: #374151;
        }
        .filtro-input, .filtro-select {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.95rem;
          background-color: #ffffff;
          color: #1f2937;
          transition: border 0.2s ease;
        }
        .filtro-input:focus, .filtro-select:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
        }
      `}</style>

      <div className="filtro-container">
        <div className="filtro-field">
          <label className="filtro-label">Data Início</label>
          <input
            type="date"
            className="filtro-input"
            value={filtros.dataInicio}
            onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
          />
        </div>

        <div className="filtro-field">
          <label className="filtro-label">Data Fim</label>
          <input
            type="date"
            className="filtro-input"
            value={filtros.dataFim}
            onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
          />
        </div>

        <div className="filtro-field">
          <label className="filtro-label">Motorista</label>
          <select
            className="filtro-select"
            value={filtros.motorista}
            onChange={(e) => setFiltros({ ...filtros, motorista: e.target.value })}
          >
            <option value="">Todos</option>
            {motoristas.map((m) => (
              <option key={m.id} value={m.nome}>
                {m.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-field">
          <label className="filtro-label">Veículo</label>
          <select
            className="filtro-select"
            value={filtros.veiculo}
            onChange={(e) => setFiltros({ ...filtros, veiculo: e.target.value })}
          >
            <option value="">Todos</option>
            {veiculos.map((v) => (
              <option key={v.id} value={v.placa}>
                {v.placa}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
