/* eslint-disable no-unused-vars */
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, storage } from "../../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function DriverRegister() {
  const [nome, setNome] = useState("");
  const [cnh, setCnh] = useState("");
  const [categoria, setCategoria] = useState("");
  const [dataEmissao, setDataEmissao] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [cpf, setCpf] = useState("");
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null); // <-- nova prévia
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  const buscarEndereco = async (cep) => {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setRua(data.logradouro || "");
        setBairro(data.bairro || "");
        setCidade(data.localidade || "");
        setEstado(data.uf || "");
      }
    } catch (error) {
      alert("Erro ao buscar CEP");
    }
  };

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

  const uploadFoto = async () => {
    if (!foto) return "";
    const storageRef = ref(storage, `motoristas/${Date.now()}_${foto.name}`);
    await uploadBytes(storageRef, foto);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarCPF(cpf)) {
      alert("CPF inválido.");
      return;
    }

    if (!validarCNH(cnh)) {
      alert("CNH inválida.");
      return;
    }

    const urlFoto = await uploadFoto();

    await addDoc(collection(db, "motoristas"), {
      nome,
      cnh,
      categoria,
      dataEmissao,
      dataValidade,
      cpf,
      endereco: { rua, numero, bairro, cidade, estado, cep },
      telefone,
      whatsapp,
      email,
      foto: urlFoto,
      createdAt: new Date(),
    });

    alert("Motorista cadastrado com sucesso!");

    // Reset
    setNome(""); setCnh(""); setCategoria(""); setDataEmissao(""); setDataValidade("");
    setCpf(""); setCep(""); setRua(""); setNumero(""); setBairro(""); setCidade("");
    setEstado(""); setTelefone(""); setWhatsapp(""); setEmail(""); setFoto(null); setPreviewFoto(null);
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    setFoto(file);
    setPreviewFoto(URL.createObjectURL(file));
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <main style={{ padding: "40px", flex: 1 }}>
        <h1 style={styles.title}>Cadastro de Motorista</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} style={styles.input} required />
          <input placeholder="CNH" value={cnh} onChange={(e) => setCnh(e.target.value)} style={styles.input} required />
          <input placeholder="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} style={styles.input} required />
          <input type="date" value={dataEmissao} onChange={(e) => setDataEmissao(e.target.value)} style={styles.input} required />
          <input type="date" value={dataValidade} onChange={(e) => setDataValidade(e.target.value)} style={styles.input} required />
          <input placeholder="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} style={styles.input} required />

          <input type="file" onChange={handleFotoChange} style={styles.input} />
          {previewFoto && (
            <img src={previewFoto} alt="Prévia da foto" style={{ width: "150px", borderRadius: "8px" }} />
          )}

          <input placeholder="CEP" value={cep} onChange={(e) => {
            setCep(e.target.value);
            if (e.target.value.length === 8) buscarEndereco(e.target.value);
          }} style={styles.input} required />
          <input placeholder="Rua" value={rua} onChange={(e) => setRua(e.target.value)} style={styles.input} required />
          <input placeholder="Número" value={numero} onChange={(e) => setNumero(e.target.value)} style={styles.input} required />
          <input placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} style={styles.input} required />
          <input placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} style={styles.input} required />
          <input placeholder="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} style={styles.input} required />
          <input placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} style={styles.input} />
          <input placeholder="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} style={styles.input} />
          <input placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />

          <button style={styles.button} type="submit">Salvar</button>
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
    maxWidth: "500px",
  },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px"
  },
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
};
