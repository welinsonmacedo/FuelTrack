import admin from "firebase-admin";
import serviceAccount from "../serviceAccountKey.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Cidades usadas
const locais = [
  "Belo Horizonte",
  "Uberlândia",
  "São Paulo",
  "Rio de Janeiro",
  "Curitiba",
  "Porto Alegre",
  "Brasília",
  "Salvador",
  "Fortaleza",
  "Recife",
];

// Distâncias aproximadas entre cidades (km) — matriz simétrica
const distancias = {
  "Belo Horizonte": { "Uberlândia": 540, "São Paulo": 586, "Rio de Janeiro": 434, "Curitiba": 882, "Porto Alegre": 1446, "Brasília": 716, "Salvador": 1352, "Fortaleza": 2218, "Recife": 1887 },
  "Uberlândia": { "Belo Horizonte": 540, "São Paulo": 585, "Rio de Janeiro": 730, "Curitiba": 1040, "Porto Alegre": 1695, "Brasília": 830, "Salvador": 1535, "Fortaleza": 2360, "Recife": 2015 },
  "São Paulo": { "Belo Horizonte": 586, "Uberlândia": 585, "Rio de Janeiro": 429, "Curitiba": 408, "Porto Alegre": 1130, "Brasília": 1014, "Salvador": 1875, "Fortaleza": 2930, "Recife": 2594 },
  "Rio de Janeiro": { "Belo Horizonte": 434, "Uberlândia": 730, "São Paulo": 429, "Curitiba": 713, "Porto Alegre": 1354, "Brasília": 1160, "Salvador": 1640, "Fortaleza": 2700, "Recife": 2350 },
  "Curitiba": { "Belo Horizonte": 882, "Uberlândia": 1040, "São Paulo": 408, "Rio de Janeiro": 713, "Porto Alegre": 715, "Brasília": 1300, "Salvador": 2140, "Fortaleza": 3220, "Recife": 2870 },
  "Porto Alegre": { "Belo Horizonte": 1446, "Uberlândia": 1695, "São Paulo": 1130, "Rio de Janeiro": 1354, "Curitiba": 715, "Brasília": 1670, "Salvador": 2650, "Fortaleza": 3670, "Recife": 3320 },
  "Brasília": { "Belo Horizonte": 716, "Uberlândia": 830, "São Paulo": 1014, "Rio de Janeiro": 1160, "Curitiba": 1300, "Porto Alegre": 1670, "Salvador": 1380, "Fortaleza": 2300, "Recife": 2000 },
  "Salvador": { "Belo Horizonte": 1352, "Uberlândia": 1535, "São Paulo": 1875, "Rio de Janeiro": 1640, "Curitiba": 2140, "Porto Alegre": 2650, "Brasília": 1380, "Fortaleza": 1125, "Recife": 800 },
  "Fortaleza": { "Belo Horizonte": 2218, "Uberlândia": 2360, "São Paulo": 2930, "Rio de Janeiro": 2700, "Curitiba": 3220, "Porto Alegre": 3670, "Brasília": 2300, "Salvador": 1125, "Recife": 645 },
  "Recife": { "Belo Horizonte": 1887, "Uberlândia": 2015, "São Paulo": 2594, "Rio de Janeiro": 2350, "Curitiba": 2870, "Porto Alegre": 3320, "Brasília": 2000, "Salvador": 800, "Fortaleza": 645 },
};

const dieselPorMes = {
  "2025-01": 5.90,
  "2025-02": 6.10,
  "2025-03": 6.20,
  "2025-04": 6.00,
  "2025-05": 6.30,
  "2025-06": 6.40,
};

// Função para pegar distância entre 2 cidades com fallback
function getDistancia(origem, destino) {
  if (origem === destino) return 50; // distância mínima se mesmo local (exemplo)
  if (distancias[origem] && distancias[origem][destino]) return distancias[origem][destino];
  if (distancias[destino] && distancias[destino][origem]) return distancias[destino][origem];
  return 1000; // fallback
}

async function seed() {
  try {
    // 20 Motoristas fictícios
    const nomesMotoristas = [
      "João Silva", "Carlos Pereira", "Roberto Souza", "Lucas Oliveira", "Marcos Almeida",
      "Pedro Santos", "Fernando Lima", "Rafael Costa", "Thiago Rocha", "Bruno Martins",
      "Mariana Gomes", "Ana Clara", "Luiz Felipe", "Eduardo Nunes", "Patricia Mendes",
      "Sandra Dias", "Felipe Ribeiro", "Gustavo Cardoso", "Aline Moreira", "Isabela Pinto",
    ];

    const motoristas = [];
    for (let i = 0; i < nomesMotoristas.length; i++) {
      const nome = nomesMotoristas[i];
      const cpf = `000.000.000-${String(10 + i).padStart(2, "0")}`;
      const telefone = `(31) 9999-99${String(10 + i).padStart(2, "0")}`;
      const doc = await db.collection("motoristas").add({ nome, cpf, telefone });
      motoristas.push({ id: doc.id, nome });
    }
    console.log("Motoristas criados");

    // Veículos (vamos usar 20 também)
    const modelos = [
      "Scania R450", "Volvo FH", "Mercedes Actros", "Volkswagen Constellation",
      "Iveco Stralis", "Ford Cargo", "Renault Premium", "MAN TGX",
      "Daf XF", "Freightliner Cascadia", "Scania P360", "Volvo FM",
      "Mercedes Axor", "VW 24.280", "Iveco Tector", "Ford F-Max",
      "Renault Kerax", "MAN TGM", "Daf LF", "Freightliner M2",
    ];

    const placas = Array.from({length:20}, (_,i) => `ABC${String(1000+i)}`);

    const veiculos = [];
    for (let i = 0; i < modelos.length; i++) {
      const placa = placas[i];
      const modelo = modelos[i];
      const ano = 2015 + (i % 7);
      const cor = ["Vermelho", "Branco", "Azul", "Preto", "Cinza"][i % 5];
      const doc = await db.collection("veiculos").add({ placa, modelo, ano, cor });
      veiculos.push({ id: doc.id, placa, modelo });
    }
    console.log("Veículos criados");

    // Gerar viagens de jan a jun 2025
    const meses = ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06"];

    let viagemCount = 0;
    for (const mes of meses) {
      const [ano, mesNum] = mes.split("-").map(Number);

      for (const motorista of motoristas) {
        // gerar 13 viagens por motorista por mês
        for (let viagemIndex = 0; viagemIndex < 13; viagemIndex++) {
          // Escolher veiculo aleatório para motorista (pode variar)
          const veiculo = veiculos[(viagemCount + motorista.id.length + viagemIndex) % veiculos.length];

          // Escolher origem e destino diferentes (de modo variado)
          const origemIndex = (viagemCount + viagemIndex) % locais.length;
          const destinoIndex = (origemIndex + 3 + viagemIndex) % locais.length;

          const origem = locais[origemIndex];
          const destino = locais[destinoIndex];

          const distancia = getDistancia(origem, destino);

          // Km inicial começa em um valor base + incremento (exemplo)
          const kmInicialBase = 10000 + viagemCount * 150;
          const kmInicial = kmInicialBase + viagemIndex * 10;
          const kmFinal = kmInicial + distancia;

          // Média de consumo variando de 2.5 a 3.5 km/l
          const media = +(2.5 + Math.random()).toFixed(2);

          // Litros consumidos
          const litros = +(distancia / media).toFixed(2);

          // Preço do diesel do mês (com pequena variação aleatória +-0.1)
          const precoLitroBase = dieselPorMes[mes];
          const precoLitro = +(precoLitroBase + (Math.random() - 0.5) * 0.2).toFixed(2);

          const valorTotal = +(litros * precoLitro).toFixed(2);

          // Datas: distribuir viagens no mês a cada 2 dias (começa dia 1)
          const dia = 1 + viagemIndex * 2;
          const dataInicio = new Date(Date.UTC(ano, mesNum - 1, dia, 8, 0, 0));
          const dataFim = new Date(dataInicio.getTime() + 8 * 3600 * 1000);
          const dataAbastecimento = new Date(dataInicio.getTime() + 4 * 3600 * 1000);

          // Criar viagem
          const viagemRef = await db.collection("viagens").add({
            motorista: motorista.id,
            caminhao: veiculo.id,
            kmInicial,
            kmFinal,
            media,
            dataInicio,
            dataFim,
            origem,
            destino,
            tipoCarga: "Carga Geral",
            valorFrete: +(distancia * 5).toFixed(2),
            status: "finalizada",
          });

          // Criar abastecimento vinculado à viagem
          await db.collection("abastecimentos").add({
            dataHora: dataAbastecimento.toISOString().split("T")[0], // "YYYY-MM-DD"
            litros,
            precoLitro,
            valorTotal,
            categoria: "Diesel",
            caminhao: veiculo.id,
            motorista: motorista.id,
            kmAbastecimento: kmInicial,
            notaFiscal: `${1000 + viagemCount}`,
            viagemId: viagemRef.id,
            vinculoViagem: true,
            fornecedor: "IFkRqfhz8uQQiyVJeKAO",
            criadoEm: new Date(),
          });

          viagemCount++;
        }
      }
    }

    console.log("Motoristas, veículos, viagens e abastecimentos criados com dados realistas.");
  } catch (error) {
    console.error("Erro ao popular dados:", error);
  }
}

seed();
