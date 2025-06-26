/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Card from "../../components/Card";
import { db } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./style.css";

// Função auxiliar para converter datas do Firestore
const parseFirestoreDate = (date) => {
  if (!date) return null;
  if (date instanceof Date) return date;
  if (date.toDate) return date.toDate();
  return new Date(date);
};

export default function DashboardDuo() {
  const [mesAno, setMesAno] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [mediaFrota, setMediaFrota] = useState(0);
  const [gastoTotal, setGastoTotal] = useState(0);
  const [topMotoristas, setTopMotoristas] = useState([]);
  const [pioresMotoristas, setPioresMotoristas] = useState([]);
  const [topCaminhoes, setTopCaminhoes] = useState([]);
  const [pioresCaminhoes, setPioresCaminhoes] = useState([]);
  const [motoristaMaisAtivo, setMotoristaMaisAtivo] = useState("N/A");
  const [caminhaoMaisUtilizado, setCaminhaoMaisUtilizado] = useState("N/A");
  const [nomesMotoristas, setNomesMotoristas] = useState({});
  const [placasCaminhoes, setPlacasCaminhoes] = useState({});

  // Função para buscar e processar dados com filtro
  async function carregarDados(start, end) {
    setLoading(true);
    setError(null);

    try {
      const [viagensSnap, abastecimentosSnap, motoristasSnap, caminhoesSnap] =
        await Promise.all([
          getDocs(collection(db, "viagens")),
          getDocs(collection(db, "abastecimentos")),
          getDocs(collection(db, "motoristas")),
          getDocs(collection(db, "veiculos")),
        ]);

      // Mapear nomes de motoristas
      const nomes = {};
      motoristasSnap.forEach((doc) => (nomes[doc.id] = doc.data().nome));
      setNomesMotoristas(nomes);

      // Mapear placas de caminhões
      const placas = {};
      caminhoesSnap.forEach((doc) => {
        placas[doc.id] = doc.data().placa;
      });
      setPlacasCaminhoes(placas);

      let totalGasto = 0;
      let totalLitros = 0;
      let totalKM = 0;

      let kmPorMotorista = {};
      let litrosPorMotorista = {};
      let kmPorCaminhao = {};
      let litrosPorCaminhao = {};
      let usoMotorista = {};
      let usoCaminhao = {};

      // Processar abastecimentos
      abastecimentosSnap.forEach((doc) => {
        const a = doc.data();
        const dataAbastecimento = parseFirestoreDate(a.data);
        
        // Verificar filtro de data
        if (start && end) {
          if (!dataAbastecimento || dataAbastecimento < start || dataAbastecimento > end) {
            return;
          }
        }

        // Somar valores (garantindo que são números)
        const valor = Number(a.valorTotal) || 0;
        const litros = Number(a.litros) || 0;

        totalGasto += valor;
        totalLitros += litros;

        if (a.motorista) {
          litrosPorMotorista[a.motorista] = (litrosPorMotorista[a.motorista] || 0) + litros;
        }
        if (a.caminhao) {
          litrosPorCaminhao[a.caminhao] = (litrosPorCaminhao[a.caminhao] || 0) + litros;
        }
      });

      // Processar viagens
      viagensSnap.forEach((doc) => {
        const v = doc.data();
        const dataViagem = parseFirestoreDate(v.dataInicio || v.createdAt);
        
        // Verificar filtro de data
        if (start && end) {
          if (!dataViagem || dataViagem < start || dataViagem > end) {
            return;
          }
        }

        // Calcular KM (garantindo que são números)
        const kmInicial = Number(v.kmInicial) || 0;
        const kmFinal = Number(v.kmFinal) || 0;
        
        if (kmFinal > kmInicial) {
          const km = kmFinal - kmInicial;
          totalKM += km;

          if (v.motorista) {
            usoMotorista[v.motorista] = (usoMotorista[v.motorista] || 0) + 1;
            kmPorMotorista[v.motorista] = (kmPorMotorista[v.motorista] || 0) + km;
          }
          if (v.caminhao) {
            usoCaminhao[v.caminhao] = (usoCaminhao[v.caminhao] || 0) + 1;
            kmPorCaminhao[v.caminhao] = (kmPorCaminhao[v.caminhao] || 0) + km;
          }
        }
      });

      // Calcular médias
      const mediaGeral = totalLitros > 0 ? totalKM / totalLitros : 0;
      setMediaFrota(mediaGeral);
      setGastoTotal(totalGasto);

      // Calcular consumo por motorista
      const consumoMotorista = {};
      for (const motorista in kmPorMotorista) {
        const km = kmPorMotorista[motorista] || 0;
        const litros = litrosPorMotorista[motorista] || 0;
        consumoMotorista[motorista] = litros > 0 ? km / litros : 0;
      }

      // Calcular consumo por caminhão
      const consumoCaminhao = {};
      for (const caminhao in kmPorCaminhao) {
        const km = kmPorCaminhao[caminhao] || 0;
        const litros = litrosPorCaminhao[caminhao] || 0;
        consumoCaminhao[caminhao] = litros > 0 ? km / litros : 0;
      }

      // Função para ordenar resultados
      const ordenar = (obj, crescente = false) =>
        Object.entries(obj)
          .filter(([_, value]) => value > 0)
          .sort((a, b) => (crescente ? a[1] - b[1] : b[1] - a[1]));

      // Top 3 motoristas
      setTopMotoristas(
        ordenar(consumoMotorista)
          .slice(0, 3)
          .map(([id, media]) => [nomes[id] || id, media])
      );

      // Piores 3 motoristas
      setPioresMotoristas(
        ordenar(consumoMotorista, true)
          .slice(0, 3)
          .map(([id, media]) => [nomes[id] || id, media])
      );

      // Top 3 caminhões
      setTopCaminhoes(
        ordenar(consumoCaminhao)
          .slice(0, 3)
          .map(([id, media]) => [placas[id] || id, media])
      );

      // Piores 3 caminhões
      setPioresCaminhoes(
        ordenar(consumoCaminhao, true)
          .slice(0, 3)
          .map(([id, media]) => [placas[id] || id, media])
      );

      // Motorista mais ativo
      const maisAtivo = ordenar(usoMotorista)[0]?.[0] || "N/A";
      setMotoristaMaisAtivo(nomes[maisAtivo] || maisAtivo);

      // Caminhão mais utilizado
      const maisUsado = ordenar(usoCaminhao)[0]?.[0] || "N/A";
      setCaminhaoMaisUtilizado(placas[maisUsado] || maisUsado);

    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados(null, null);
  }, []);

  // Aplicar filtro por mês/ano
  function aplicarFiltro() {
    if (!mesAno) {
      setStartDate(null);
      setEndDate(null);
      carregarDados(null, null);
      return;
    }

    const start = new Date(mesAno.getFullYear(), mesAno.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(mesAno.getFullYear(), mesAno.getMonth() + 1, 0, 23, 59, 59, 999);

    setStartDate(start);
    setEndDate(end);
    carregarDados(start, end);
  }

  // Funções de formatação
  const formatarDecimal = (valor) =>
    new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor || 0);

  const formatarDinheiro = (valor) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(valor || 0);

  // Exportar para PDF
  function exportarPDF() {
    if (topMotoristas.length === 0 && topCaminhoes.length === 0) {
      alert("Nenhum dado disponível para exportar");
      return;
    }

    const doc = new jsPDF();
    const dateRange = startDate
      ? `Período: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
      : "Período: Todos os dados";

    // Cabeçalho
    doc.setFontSize(18);
    doc.text("Relatório de Consumo - FuelTrack", 14, 20);
    doc.setFontSize(10);
    doc.text(dateRange, 14, 28);

    let startY = 40;

    // Dados gerais
    doc.setFontSize(12);
    doc.text(`Média da Frota: ${formatarDecimal(mediaFrota)} km/L`, 14, startY);
    doc.text(`Gasto Total: ${formatarDinheiro(gastoTotal)}`, 14, startY + 8);
    doc.text(`Motorista Mais Ativo: ${motoristaMaisAtivo}`, 14, startY + 16);
    doc.text(`Caminhão Mais Utilizado: ${caminhaoMaisUtilizado}`, 14, startY + 24);

    startY += 40;

    // Função para criar tabelas
    function montarTabela(titulo, col1, col2, dados) {
      if (dados.length === 0) return;

      doc.setFontSize(14);
      doc.text(titulo, 14, startY);
      startY += 6;

      autoTable(doc, {
        startY,
        head: [[col1, col2]],
        body: dados,
        theme: "striped",
        headStyles: { fillColor: [37, 99, 235] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 10 },
        didDrawPage: (data) => {
          startY = data.cursor.y + 10;
        },
      });
    }

    // Tabelas de motoristas e caminhões
    montarTabela(
      "Top 3 Motoristas",
      "Motorista",
      "Média (km/L)",
      topMotoristas.map(([nome, media]) => [nome, formatarDecimal(media)])
    );

    montarTabela(
      "Piores 3 Motoristas",
      "Motorista",
      "Média (km/L)",
      pioresMotoristas.map(([nome, media]) => [nome, formatarDecimal(media)])
    );

    montarTabela(
      "Top 3 Caminhões",
      "Placa",
      "Média (km/L)",
      topCaminhoes.map(([id, media]) => [
        placasCaminhoes[id] || id,
        formatarDecimal(media),
      ])
    );

    montarTabela(
      "Piores 3 Caminhões",
      "Placa",
      "Média (km/L)",
      pioresCaminhoes.map(([id, media]) => [
        placasCaminhoes[id] || id,
        formatarDecimal(media),
      ])
    );

    // Salvar PDF
    doc.save(`relatorio-fueltrack-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  return (
    <div className="dashboard-container">
      <div className="filtros-container">
        <div className="filtro-item">
          <label>Mês e Ano</label>
          <DatePicker
            selected={mesAno}
            onChange={(date) => setMesAno(date)}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            placeholderText="Selecione mês/ano"
            className="datepicker"
            maxDate={new Date()}
          />
        </div>

        <button 
          onClick={aplicarFiltro} 
          className="btn-pesquisar"
          disabled={loading}
        >
          {loading ? "⏳ Carregando..." : "🔍 Pesquisar"}
        </button>

        <button 
          onClick={exportarPDF} 
          className="btn-exportar"
          disabled={loading || topMotoristas.length === 0}
        >
          📄 Exportar PDF
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="cards-grid">
        <Card title="🚛 Média da Frota">
          <p className="card-number-blue">{formatarDecimal(mediaFrota)} km/L</p>
          {startDate && (
            <p className="card-periodo">
              Período: {startDate.toLocaleDateString()} a {endDate.toLocaleDateString()}
            </p>
          )}
        </Card>

        <Card title="💰 Gasto Total">
          <p className="card-number-rose">{formatarDinheiro(gastoTotal)}</p>
          {startDate && (
            <p className="card-periodo">
              Período: {startDate.toLocaleDateString()} a {endDate.toLocaleDateString()}
            </p>
          )}
        </Card>

        <Card title="👨‍🔧 Motorista Mais Ativo">
          <p className="card-text">{motoristaMaisAtivo}</p>
          {startDate && (
            <p className="card-periodo">
              Período: {startDate.toLocaleDateString()} a {endDate.toLocaleDateString()}
            </p>
          )}
        </Card>

        <Card title="🚚 Veículo Mais Utilizado">
          <p className="card-text">{caminhaoMaisUtilizado}</p>
          {startDate && (
            <p className="card-periodo">
              Período: {startDate.toLocaleDateString()} a {endDate.toLocaleDateString()}
            </p>
          )}
        </Card>

        <Card title="🏁 Top 3 Motoristas">
          {topMotoristas.length > 0 ? (
            topMotoristas.map(([nome, media], i) => (
              <p key={i} className="card-text-small">
                {i + 1}. {nome} — {formatarDecimal(media)} km/L
              </p>
            ))
          ) : (
            <p className="card-text-small">Nenhum dado disponível</p>
          )}
          {startDate && (
            <p className="card-periodo">
              Período: {startDate.toLocaleDateString()} a {endDate.toLocaleDateString()}
            </p>
          )}
        </Card>

        <Card title="📉 Piores 3 Motoristas">
          {pioresMotoristas.length > 0 ? (
            pioresMotoristas.map(([nome, media], i) => (
              <p key={i} className="card-text-small">
                {i + 1}. {nome} — {formatarDecimal(media)} km/L
              </p>
            ))
          ) : (
            <p className="card-text-small">Nenhum dado disponível</p>
          )}
          {startDate && (
            <p className="card-periodo">
              Período: {startDate.toLocaleDateString()} a {endDate.toLocaleDateString()}
            </p>
          )}
        </Card>

        <Card title="⚙️ Top 3 Caminhões">
          {topCaminhoes.length > 0 ? (
            topCaminhoes.map(([id, media], i) => (
              <p key={i} className="card-text-small">
                {i + 1}. {placasCaminhoes[id] || id} — {formatarDecimal(media)} km/L
              </p>
            ))
          ) : (
            <p className="card-text-small">Nenhum dado disponível</p>
          )}
          {startDate && (
            <p className="card-periodo">
              Período: {startDate.toLocaleDateString()} a {endDate.toLocaleDateString()}
            </p>
          )}
        </Card>

        <Card title="🔻 Piores 3 Caminhões">
          {pioresCaminhoes.length > 0 ? (
            pioresCaminhoes.map(([id, media], i) => (
              <p key={i} className="card-text-small">
                {i + 1}. {placasCaminhoes[id] || id} — {formatarDecimal(media)} km/L
              </p>
            ))
          ) : (
            <p className="card-text-small">Nenhum dado disponível</p>
          )}
          {startDate && (
            <p className="card-periodo">
              Período: {startDate.toLocaleDateString()} a {endDate.toLocaleDateString()}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}