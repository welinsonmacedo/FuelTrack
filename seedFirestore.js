import admin from "firebase-admin";
import serviceAccount from "../serviceAccountKey.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seed() {
  try {
    // Motoristas fictícios
    const nomesMotoristas = [
      "João Silva",
      "Carlos Pereira",
      "Roberto Souza",
      "Lucas Oliveira",
      "Marcos Almeida",
      "Pedro Santos",
      "Fernando Lima",
      "Rafael Costa",
      "Thiago Rocha",
      "Bruno Martins",
    ];

    const motoristas = [];
    for (let i = 0; i < nomesMotoristas.length; i++) {
      const nome = nomesMotoristas[i];
      const cpf = `000.000.000-1${i}`;
      const telefone = `(31) 9999-99${String(10 + i).padStart(2, "0")}`;
      const doc = await db.collection("motoristas").add({ nome, cpf, telefone });
      motoristas.push({ id: doc.id, nome });
    }
    console.log("Motoristas criados");

    // Veículos (caminhões)
    const modelos = [
      "Scania R450",
      "Volvo FH",
      "Mercedes Actros",
      "Volkswagen Constellation",
      "Iveco Stralis",
      "Ford Cargo",
      "Renault Premium",
      "MAN TGX",
      "Daf XF",
      "Freightliner Cascadia",
    ];
    const placas = [
      "ABC1234",
      "DEF5678",
      "GHI9012",
      "JKL3456",
      "MNO7890",
      "PQR2345",
      "STU6789",
      "VWX0123",
      "YZA4567",
      "BCD8901",
    ];

    const veiculos = [];
    for (let i = 0; i < modelos.length; i++) {
      const placa = placas[i];
      const modelo = modelos[i];
      const ano = 2017 + (i % 5);
      const cor = ["Vermelho", "Branco", "Azul", "Preto", "Cinza"][i % 5];
      const doc = await db.collection("veiculos").add({ placa, modelo, ano, cor });
      veiculos.push({ id: doc.id, placa, modelo });
    }
    console.log("Veículos criados");

    // Locais para origem e destino
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

    let viagemCount = 0;
    const meses = ["2025-05", "2025-06"];

    for (const mes of meses) {
      for (let dia = 1; dia <= 28; dia += 3) {
        for (let i = 0; i < 5; i++) {
          const motorista = motoristas[(viagemCount + i) % motoristas.length];
          const veiculo = veiculos[(viagemCount + i) % veiculos.length];

          const origem = locais[(viagemCount + i) % locais.length];
          const destino = locais[(viagemCount + i + 3) % locais.length]; // variar destino

          const kmInicial = 10000 + viagemCount * 100 + i * 10;
          const distancia = 100 + Math.floor(Math.random() * 200);
          const kmFinal = kmInicial + distancia;

          const media = +(2.5 + Math.random() * 1.5).toFixed(2);
          const litros = +(distancia / media).toFixed(2);
          const valorTotal = +(litros * 6).toFixed(2);

          const dataInicio = new Date(`${mes}-${String(dia).padStart(2, "0")}T08:00:00Z`);
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
            precoLitro: 6,
            valorTotal,
            categoria: "Diesel",
            caminhao: veiculo.id,
            motorista: motorista.id,
            kmAbastecimento: kmInicial, // mesmo do kmInicial da viagem
            notaFiscal: `${100 + viagemCount}`,
            viagemId: viagemRef.id,
            vinculoViagem: true,
            fornecedor: "IFkRqfhz8uQQiyVJeKAO",
            criadoEm: new Date(),
          });

          viagemCount++;
        }
      }
    }

    console.log("Viagens e abastecimentos criados com vínculo correto.");
  } catch (error) {
    console.error("Erro ao popular dados:", error);
  }
}

seed();
