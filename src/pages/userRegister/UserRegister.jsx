import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, addDoc, updateDoc, collection } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { secondaryAuth } from "../../services/firebase";

export default function UserRegister() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("padrao");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");

    try {
      // Cria o usuário no Firebase Auth (secondaryAuth)
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, senha);
      const userId = userCredential.user.uid;

      // Cria o documento na coleção 'usuarios'
      await setDoc(doc(db, "usuarios", userId), {
        nome,
        email,
        tipo,
        criadoEm: new Date(),
      });

      if (tipo === "motorista") {
        // Cria o documento motorista vinculado ao userId
        const motoristaRef = await addDoc(collection(db, "motoristas"), {
          userId,
          nome,
          email,
          criadoEm: new Date(),
        });

        // Atualiza o usuário com o motoristaId para vínculo
        await updateDoc(doc(db, "usuarios", userId), {
          motoristaId: motoristaRef.id,
        });

        // Navega para a tela de cadastro de motorista, enviando dados
        navigate("/driverregister", { state: { userId, nome, email, motoristaId: motoristaRef.id } });
        return;
      }

      // Se não for motorista, limpa o formulário e mostra mensagem de sucesso
      setMensagem("Usuário cadastrado com sucesso!");
      setNome("");
      setEmail("");
      setSenha("");
      setTipo("padrao");
    } catch (err) {
      console.error(err);
      setErro("Erro ao cadastrar usuário. Verifique os dados e tente novamente.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Novo Usuário</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={styles.input}
          />
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            style={styles.input}
          >
            <option value="padrao">Usuário Padrão</option>
            <option value="admin">Administrador</option>
            <option value="motorista">Motorista</option>
          </select>
          <button type="submit" style={styles.button}>
            Cadastrar Usuário
          </button>
          {mensagem && <p style={{ color: "green", marginTop: 10 }}>{mensagem}</p>}
          {erro && <p style={{ color: "red", marginTop: 10 }}>{erro}</p>}
        </form>
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
