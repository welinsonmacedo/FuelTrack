 
import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import { db } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function DashboardDuo() {
  const [mediaFrota, setMediaFrota] = useState(0);
  const [gastoMes, setGastoMes] = useState(0);
  const [topMotoristas, setTopMotoristas] = useState([]);
  const [topCaminhoes, setTopCaminhoes] = useState([]);
  const [consumoMensal, setConsumoMensal] = useState([]);
  const [gastosCategoria, setGastosCategoria] = useState({});
  const [placasCaminhoes, setPlacasCaminhoes] = useState({});
  const [modeloCaminhoes, setModeloCaminhoes] = useState({});

  useEffect(() => {
    async function carregarDados() {
      const viagensSnap = await getDocs(collection(db, "viagens"));
      const abastecimentosSnap = await getDocs(collection(db, "abastecimentos"));
      const motoristasSnap = await getDocs(collection(db, "motoristas"));
      const caminhoesSnap = await getDocs(collection(db, "veiculos"));

      const nomesMotoristas = {};
      motoristasSnap.forEach((doc) => {
        const m = doc.data();
        nomesMotoristas[doc.id] = m.nome;
      });

      const placasTemp = {};
      const modelosTemp = {};
      caminhoesSnap.forEach((doc) => {
        const c = doc.data();
        placasTemp[doc.id] = c.placa;
        modelosTemp[doc.id] = c.modelo;
      });
      setPlacasCaminhoes(placasTemp);
      setModeloCaminhoes(modelosTemp);

      let totalGasto = 0;
      let totalKM = 0;
      let totalLitros = 0;
      let consumoPorMotorista = {};
      let consumoPorCaminhao = {};
      let consumoPorMes = {};
      let gastosPorCategoria = {};

      abastecimentosSnap.forEach((doc) => {
        const a = doc.data();
        totalGasto += a.valorTotal ?? 0;
        totalLitros += a.litros ?? 0;

        if (a.categoria) {
          gastosPorCategoria[a.categoria] =
            (gastosPorCategoria[a.categoria] || 0) + a.valorTotal;
        }

        const mes = new Date(a.data).toLocaleDateString("pt-BR", {
          month: "short",
          year: "numeric",
        });
        consumoPorMes[mes] = (consumoPorMes[mes] || 0) + a.litros;
      });

      viagensSnap.forEach((v) => {
        const d = v.data();
        if (d.kmFinal && d.kmInicial) totalKM += d.kmFinal - d.kmInicial;

        if (d.motorista) {
          consumoPorMotorista[d.motorista] =
            (consumoPorMotorista[d.motorista] || 0) + (d.media ?? 0);
        }

        if (d.caminhao) {
          consumoPorCaminhao[d.caminhao] =
            (consumoPorCaminhao[d.caminhao] || 0) + (d.media ?? 0);
        }
      });

      const mediaGeral = totalKM / totalLitros;

      const motoristasOrdenados = Object.entries(consumoPorMotorista)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id, media]) => [nomesMotoristas[id] || id, media]);

      const caminhoesOrdenados = Object.entries(consumoPorCaminhao)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 3);

      setMediaFrota(mediaGeral.toFixed(2));
      setGastoMes(totalGasto.toFixed(2));
      setTopMotoristas(motoristasOrdenados);
      setTopCaminhoes(caminhoesOrdenados);
      setConsumoMensal(consumoPorMes);
      setGastosCategoria(gastosPorCategoria);
    }

    carregarDados();
  }, []);

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <h2 className="text-xl font-bold">🚛 Média da Frota</h2>
        <p className="text-3xl mt-2">{mediaFrota} km/L</p>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">💰 Total Gasto no Mês</h2>
        <p className="text-3xl mt-2">R$ {gastoMes}</p>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">🏁 Top 3 Motoristas</h2>
        {topMotoristas.map(([nome, media], i) => (
          <p key={i}>
            {i + 1}. {nome} - {media.toFixed(2)} km/L
          </p>
        ))}
      </Card>

      <Card>
        <h2 className="text-xl font-bold">🚚 Top 3 Caminhões (maior consumo)</h2>
        {topCaminhoes.map(([id, media], i) => (
          <p key={i}>
            {i + 1}. {placasCaminhoes[id] || id} - {modeloCaminhoes[id] || "Modelo desconhecido"} -{" "}
            {media.toFixed(2)} km/L
          </p>
        ))}
      </Card>

      {/* GRÁFICOS */}
      <div className="md:col-span-2 p-4 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold mb-2">📈 Consumo Mensal</h2>
        <Line
          data={{
            labels: Object.keys(consumoMensal),
            datasets: [
              {
                label: "Litros",
                data: Object.values(consumoMensal),
                borderColor: "rgb(75, 192, 192)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
              },
            ],
          }}
        />
      </div>

      <div className="md:col-span-2 p-4 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold mb-2">🥧 Gastos por Categoria</h2>
        <Pie
          data={{
            labels: Object.keys(gastosCategoria),
            datasets: [
              {
                data: Object.values(gastosCategoria),
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
