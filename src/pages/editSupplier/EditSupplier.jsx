import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useParams, useNavigate } from "react-router-dom";
import { formatCNPJ, validarCNPJ } from "../../components/CNPJInput";

export default function EditSupplier() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    async function fetchFornecedor() {
      try {
        const docRef = doc(db, "fornecedores", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setRazaoSocial(data.razaoSocial || "");
          setNomeFantasia(data.nomeFantasia || "");
          setCnpj(data.cnpj || "");
          setEndereco(data.endereco || "");
          setTelefone(data.telefone || "");
          setTipo(data.tipo || "");
        } else {
          setErro("Fornecedor não encontrado");
        }
      } catch (error) {
        setErro("Erro ao buscar fornecedor: " + error.message);
      }
    }
    fetchFornecedor();
  }, [id]);

  const handleCNPJChange = (e) => {
    const valorFormatado = formatCNPJ(e.target.value);
    setCnpj(valorFormatado);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!razaoSocial || !nomeFantasia || !cnpj || !endereco || !telefone || !tipo) {
      setErro("Todos os campos são obrigatórios.");
      return;
    }

    if (!validarCNPJ(cnpj)) {
      setErro("CNPJ inválido.");
      return;
    }

    try {
      const docRef = doc(db, "fornecedores", id);
      await updateDoc(docRef, {
        razaoSocial,
        nomeFantasia,
        cnpj,
        endereco,
        telefone,
        tipo,
      });
      setSucesso("Fornecedor atualizado com sucesso!");
      // Opcional: navegar de volta para lista ou detalhe
      setTimeout(() => navigate("/suppliers"), 1500);
    } catch (error) {
      setErro("Erro ao atualizar: " + error.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Editar Fornecedor</h2>
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
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
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
              <option value="Abastecimento">Abastecimento</option>
              <option value="Manutenção">Manutenção</option>
              <option value="Prestador de Serviço">Prestador de Serviço</option>
              <option value="Venda de Peças">Venda de Peças</option>
            </select>
          </div>

          <button type="submit" style={styles.button}>
            Salvar Alterações
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
    backgroundColor: "#2980b9",
    color: "#fff",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
