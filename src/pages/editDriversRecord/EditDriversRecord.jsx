/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../services/firebase"; // Storage adicionado

export default function EditDriversRecord() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [cnh, setCnh] = useState("");
  const [categoria, setCategoria] = useState("");
  const [dataEmissao, setDataEmissao] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [cpf, setCpf] = useState("");

  const [foto, setFoto] = useState(null);
  const [fotoURL, setFotoURL] = useState(""); // URL após upload

  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function fetchMotorista() {
      const docRef = doc(db, "motoristas", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNome(data.nome || "");
        setCnh(data.cnh || "");
        setCategoria(data.categoria || "");
        setDataEmissao(data.dataEmissao || "");
        setDataValidade(data.dataValidade || "");
        setCpf(data.cpf || "");
        setFotoURL(data.foto || "");
        setCep(data.endereco?.cep || "");
        setRua(data.endereco?.rua || "");
        setNumero(data.endereco?.numero || "");
        setBairro(data.endereco?.bairro || "");
        setCidade(data.endereco?.cidade || "");
        setEstado(data.endereco?.estado || "");
        setTelefone(data.telefone || "");
        setWhatsapp(data.whatsapp || "");
        setEmail(data.email || "");
      } else {
        alert("Motorista não encontrado.");
        navigate("/motoristas");
      }
    }
    fetchMotorista();
  }, [id, navigate]);

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

  const handleUpload = async () => {
    if (!foto) return fotoURL; // Se não mudou a foto, mantém a antiga
    const fotoRef = ref(storage, `motoristas/${id}_${foto.name}`);
    await uploadBytes(fotoRef, foto);
    const url = await getDownloadURL(fotoRef);
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fotoFinal = await handleUpload();

      const docRef = doc(db, "motoristas", id);
      await updateDoc(docRef, {
        nome,
        cnh,
        categoria,
        dataEmissao,
        dataValidade,
        cpf,
        foto: fotoFinal,
        endereco: { rua, numero, bairro, cidade, estado, cep },
        telefone,
        whatsapp,
        email,
      });

      alert("Motorista atualizado com sucesso!");
      navigate("/drivers");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar motorista.");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Editar Motorista</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} style={styles.input} />
        <input placeholder="CNH" value={cnh} onChange={(e) => setCnh(e.target.value)} style={styles.input} />
        <input placeholder="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} style={styles.input} />
        <input type="date" value={dataEmissao} onChange={(e) => setDataEmissao(e.target.value)} style={styles.input} />
        <input type="date" value={dataValidade} onChange={(e) => setDataValidade(e.target.value)} style={styles.input} />
        <input placeholder="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} style={styles.input} />

        <input placeholder="CEP" value={cep} onChange={(e) => {
          setCep(e.target.value);
          if (e.target.value.length === 8) buscarEndereco(e.target.value);
        }} style={styles.input} />

        <input placeholder="Rua" value={rua} onChange={(e) => setRua(e.target.value)} style={styles.input} />
        <input placeholder="Número" value={numero} onChange={(e) => setNumero(e.target.value)} style={styles.input} />
        <input placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} style={styles.input} />
        <input placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} style={styles.input} />
        <input placeholder="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} style={styles.input} />
        <input placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} style={styles.input} />
        <input placeholder="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} style={styles.input} />
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />

        <label>Foto do Motorista:</label>
        <input type="file" onChange={(e) => setFoto(e.target.files[0])} style={styles.input} />
        {fotoURL && (
          <img src={fotoURL} alt="Foto atual" style={{ width: "120px", borderRadius: "8px" }} />
        )}

        <button type="submit" style={styles.button}>Salvar</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    maxWidth: "500px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  button: {
    backgroundColor: "#3498db",
    color: "#fff",
    padding: "12px",
    borderRadius: "5px",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
  },
};
