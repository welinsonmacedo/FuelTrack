import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { formatCNPJ, validarCNPJ } from "../../components/CNPJInput";

const TIPOS_FORNECEDOR = [
  "Abastecimento",
  "Manutenção",
  "Prestador de Serviço",
  "Venda de Peças",
  "Outro",
];

export default function SupplierRegister() {
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (
      !razaoSocial ||
      !nomeFantasia ||
      !cnpj ||
      !endereco ||
      !telefone ||
      !tipo
    ) {
      return setErro("Todos os campos são obrigatórios.");
    }

    if (!validarCNPJ(cnpj)) {
      return setErro("CNPJ inválido.");
    }

    try {
      await addDoc(collection(db, "fornecedores"), {
        razaoSocial,
        nomeFantasia,
        cnpj,
        endereco,
        telefone,
        tipo,
      });
      setSucesso("Fornecedor cadastrado com sucesso!");
      // Resetar campos
      setRazaoSocial("");
      setNomeFantasia("");
      setCnpj("");
      setEndereco("");
      setTelefone("");
      setTipo("");
    } catch (error) {
      setErro("Erro ao cadastrar: " + error.message);
    }
  };

  const handleCNPJChange = (e) => {
    const valorFormatado = formatCNPJ(e.target.value);
    setCnpj(valorFormatado);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Cadastro de Fornecedor
        </h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label>Razão Social:</label>
            <input
              type="text"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div>
            <label>Nome Fantasia:</label>
            <input
              type="text"
              value={nomeFantasia}
              onChange={(e) => setNomeFantasia(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div>
            <label>CNPJ:</label>
            <input
              type="text"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={handleCNPJChange}
              maxLength={18}
              style={{
                ...styles.input,
                border: erro.includes("CNPJ") ? "2px solid red" : "1px solid #ccc",
              }}
            />
          </div>

          <div>
            <label>Endereço:</label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div>
            <label>Telefone:</label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
              placeholder="(00) 00000-0000"
              style={styles.input}
            />
          </div>

          <div>
            <label>Tipo:</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              required
              style={styles.input}
            >
              <option value="">Selecione o tipo</option>
              {TIPOS_FORNECEDOR.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" style={styles.button}>
            Cadastrar
          </button>
        </form>

        {erro && <p style={{ color: "red", marginTop: "10px" }}>{erro}</p>}
        {sucesso && <p style={{ color: "green", marginTop: "10px" }}>{sucesso}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    background: "#ecf0f1",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    width: "100%",
  },
  button: {
    padding: "12px",
    backgroundColor: "#2ecc71",
    color: "#fff",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
