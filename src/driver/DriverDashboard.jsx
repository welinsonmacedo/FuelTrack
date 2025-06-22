import React, { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext"
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

export default function DriverDashboard() {
  const { user } = useUser();
  const [viagens, setViagens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.tipo !== "motorista") return;

    async function fetchViagens() {
      const q = query(collection(db, "viagens"), where("motoristaId", "==", user.uid));
      const snapshot = await getDocs(q);
      const dados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setViagens(dados);
      setLoading(false);
    }

    fetchViagens();
  }, [user]);

  if (!user || user.tipo !== "motorista") {
    return <p>Acesso negado. Apenas motoristas podem acessar essa página.</p>;
  }

  if (loading) return <p>Carregando viagens...</p>;

  return (
    <div>
      <h1>Bem-vindo, {user.nome || "Motorista"}</h1>
      <h2>Suas viagens</h2>
      <ul>
        {viagens.map((v) => (
          <li key={v.id}>
            {v.destino} - {v.dataInicio} até {v.dataFim} - Média: {v.mediaConsumo} km/l
          </li>
        ))}
      </ul>
      {/* Aqui você pode criar componentes para adicionar/ler cupom */}
    </div>
  );
}
