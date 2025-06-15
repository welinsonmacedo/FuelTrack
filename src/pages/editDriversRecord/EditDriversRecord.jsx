/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function EditDriversRecord() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [cnh, setCnh] = useState("");
  const [categoria, setCategoria] = useState("");
  const [dataEmissao, setDataEmissao] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [cpf, setCpf] = useState("");

  useEffect(() => {
    async function fetchMotorista() {
      const docRef = doc(db, "motoristas", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNome(data.nome);
        setCnh(data.cnh);
        setCategoria(data.categoria);
        setDataEmissao(data.dataEmissao);
        setDataValidade(data.dataValidade);
        setCpf(data.cpf);
      } else {
        alert("Motorista não encontrado.");
        navigate("/motoristas");
      }
    }
    fetchMotorista();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "motoristas", id);
      await updateDoc(docRef, {
        nome,
        cnh,
        categoria,
        dataEmissao,
        dataValidade,
        cpf,
      });
      alert("Motorista atualizado com sucesso!");
      navigate("/drivers");
    } catch (error) {
      alert("Erro ao atualizar motorista.");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Editar Motorista</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} style={styles.input} />
        <input type="text" placeholder="CNH" value={cnh} onChange={(e) => setCnh(e.target.value)} style={styles.input} />
        <input type="text" placeholder="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} style={styles.input} />
        <input type="date" placeholder="Data de Emissão" value={dataEmissao} onChange={(e) => setDataEmissao(e.target.value)} style={styles.input} />
        <input type="date" placeholder="Data de Validade" value={dataValidade} onChange={(e) => setDataValidade(e.target.value)} style={styles.input} />
        <input type="text" placeholder="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} style={styles.input} />
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
