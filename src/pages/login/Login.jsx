import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);

const handleLogin = async (e) => {
  e.preventDefault();
  setErro("");

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    // Redireciona via React Router (mais seguro)
    window.location.replace("/dashboard");
  } catch (error) {
    console.error("Erro no login:", error.code);
    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      setErro("Usuário ou senha inválidos.");
    } else if (error.code === "auth/invalid-email") {
      setErro("Formato de e-mail inválido.");
    } else {
      setErro("Erro ao fazer login. Tente novamente.");
    }
  }
};


  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="logo.png" alt="FuelTrackPro Logo" style={styles.logo} />
        <h2 style={styles.title}>Login</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <div style={styles.passwordContainer}>
            <input
              type={senhaVisivel ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={styles.input}
            />
            <span
              onClick={() => setSenhaVisivel(!senhaVisivel)}
              style={styles.eyeIcon}
            >
              {senhaVisivel ? "🙈" : "👁️"}
            </span>
          </div>
          <button type="submit" style={styles.button}>
            Entrar
          </button>
        </form>
        {erro && <p style={styles.error}>{erro}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#ffffff",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  },
  logo: {
    width: "120px",
    marginBottom: "20px",
  },
  title: {
    color: "#2c3e50",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    marginBottom: "15px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
  },
  button: {
    padding: "12px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  error: {
    color: "red",
    marginTop: "10px",
    textAlign: "center",
  },
  passwordContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent:"center"
  },
  
  eyeIcon: {
    position: "absolute",
    right: "10px",
    bottom:"21px",
    cursor: "pointer",
    fontSize: "18px",
  }
  
};
