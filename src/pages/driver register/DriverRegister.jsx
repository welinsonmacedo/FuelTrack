import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function DriverRegister() {
  const [nome, setNome] = useState("");
  const [cnh, setCnh] = useState("");
  const [categoria, setCategoria] = useState("");
  const [dataEmissao, setDataEmissao] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [cpf, setCpf] = useState("");

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
  };

  const validarCNH = (cnh) => {
    const apenasNumeros = cnh.replace(/\D/g, '');
    return apenasNumeros.length === 11;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarCPF(cpf)) {
      alert("CPF inválido. Verifique e tente novamente.");
      return;
    }

    if (!validarCNH(cnh)) {
      alert("CNH inválida. Deve conter 11 números.");
      return;
    }

    await addDoc(collection(db, "motoristas"), {
      nome,
      cnh,
      categoria,
      dataEmissao,
      dataValidade,
      cpf,
      createdAt: new Date(),
    });

    alert("Motorista cadastrado com sucesso!");
    setNome("");
    setCnh("");
    setCategoria("");
    setDataEmissao("");
    setDataValidade("");
    setCpf("");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <main style={{ padding: "40px", flex: 1 }}>
        <h1 style={styles.title}>Cadastro de Motorista</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={styles.input}
            required
          />
          <input
            placeholder="CNH"
            value={cnh}
            onChange={(e) => setCnh(e.target.value)}
            style={styles.input}
            required
          />
          <input
            placeholder="Categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="date"
            placeholder="Data Emissão"
            value={dataEmissao}
            onChange={(e) => setDataEmissao(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="date"
            placeholder="Data Validade"
            value={dataValidade}
            onChange={(e) => setDataValidade(e.target.value)}
            style={styles.input}
            required
          />
          <input
            placeholder="CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            style={styles.input}
            required
          />
          <button style={styles.button} type="submit">
            Salvar
          </button>
        </form>
      </main>
    </div>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    maxWidth: "400px",
  },
  input: { padding: "10px", border: "1px solid #ccc", borderRadius: "5px" },
  button: {
    backgroundColor: "#3498db",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
  },
  title: {
    fontSize: "20px",
  },
  menuItem: {
    backgroundColor: "transparent",
    border: "none",
    color: "#ecf0f1",
    padding: "10px",
    textAlign: "left",
    cursor: "pointer",
    borderRadius: "5px",
    transition: "background-color 0.2s",
  },
};
