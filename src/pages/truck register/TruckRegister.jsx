import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, storage } from "../../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function TruckRegister() {
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [marca, setMarca] = useState("");
  const [ano, setAno] = useState("");
  const [capacidadeTanque, setCapacidadeTanque] = useState("");
  const [vencimentoLicenciamento, setVencimentoLicenciamento] = useState("");
  const [status, setStatus] = useState("Disponível");
  const [documento, setDocumento] = useState(null);
  const [renavam, setRenavam] = useState("");
  const [chassi, setChassi] = useState("");
  const [numeroCRLV, setNumeroCRLV] = useState("");
  const [loading, setLoading] = useState(false);

  const validarPlaca = (placa) => {
    const placaFormatada = placa.trim().toUpperCase();
    const regex = /^[A-Z]{3}[0-9]{4}$|^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
    return regex.test(placaFormatada);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !placa || !modelo || !marca || !ano || !capacidadeTanque ||
      !vencimentoLicenciamento || !renavam || !chassi || !numeroCRLV
    ) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    if (!validarPlaca(placa)) {
      alert("Placa inválida. Use o formato ABC1234 ou ABC1D23.");
      return;
    }

    setLoading(true);

    try {
      let documentoUrl = "";
      if (documento) {
        const storageRef = ref(storage, `documentosVeiculos/${placa}_${documento.name}`);
        await uploadBytes(storageRef, documento);
        documentoUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "veiculos"), {
        placa: placa.trim().toUpperCase(),
        modelo: modelo.trim(),
        marca: marca.trim(),
        ano: Number(ano),
        capacidadeTanque: Number(capacidadeTanque),
        vencimentoLicenciamento,
        status,
        documentoUrl,
        renavam: renavam.trim(),
        chassi: chassi.trim(),
        numeroCRLV: numeroCRLV.trim(),
        historicoManutencao: [],
        criadoEm: new Date(),
      });

      alert("Caminhão cadastrado com sucesso!");

      // Resetar campos
      setPlaca("");
      setModelo("");
      setMarca("");
      setAno("");
      setCapacidadeTanque("");
      setVencimentoLicenciamento("");
      setStatus("Disponível");
      setDocumento(null);
      setRenavam("");
      setChassi("");
      setNumeroCRLV("");
    } catch (error) {
      console.error("Erro ao cadastrar caminhão:", error);
      alert("Erro ao cadastrar caminhão, tente novamente.");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <h1 style={styles.title}>Cadastro de Veículo</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label>Placa</label>
          <input
            value={placa}
            onChange={(e) => setPlaca(e.target.value.toUpperCase())}
            style={styles.input}
            disabled={loading}
          />

          <label>Modelo</label>
          <input
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            style={styles.input}
            disabled={loading}
          />

          <label>Marca</label>
          <input
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            style={styles.input}
            disabled={loading}
          />

          <label>Ano</label>
          <input
            type="number"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            style={styles.input}
            disabled={loading}
          />

          <label>Capacidade do Tanque (Litros)</label>
          <input
            type="number"
            value={capacidadeTanque}
            onChange={(e) => setCapacidadeTanque(e.target.value)}
            style={styles.input}
            disabled={loading}
          />

          <label>Vencimento do Licenciamento</label>
          <input
            type="date"
            value={vencimentoLicenciamento}
            onChange={(e) => setVencimentoLicenciamento(e.target.value)}
            style={styles.input}
            disabled={loading}
          />

          <label>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={styles.input}
            disabled={loading}
          >
            <option value="Disponível">Disponível</option>
            <option value="Em Manutenção">Em Manutenção</option>
            <option value="Em Viagem">Em Viagem</option>
          </select>

          <label>RENAVAM</label>
          <input
            value={renavam}
            onChange={(e) => setRenavam(e.target.value)}
            style={styles.input}
            disabled={loading}
          />

          <label>Chassi</label>
          <input
            value={chassi}
            onChange={(e) => setChassi(e.target.value)}
            style={styles.input}
            disabled={loading}
          />

          <label>Número do CRLV</label>
          <input
            value={numeroCRLV}
            onChange={(e) => setNumeroCRLV(e.target.value)}
            style={styles.input}
            disabled={loading}
          />

          <label>Documento (PDF ou imagem)</label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setDocumento(e.target.files[0])}
            style={styles.input}
            disabled={loading}
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Caminhão"}
          </button>
        </form>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: "40px",
    backgroundColor: "#f4f6f8",
    minHeight: "100vh",
  },
  main: {
    padding: "40px",
    backgroundColor: "#ecf0f1",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "10px",
    maxWidth: "500px",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "14px",
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
