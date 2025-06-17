import { useState } from "react";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
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
      await setPersistence(auth, browserLocalPersistence); // persistência
      await signInWithEmailAndPassword(auth, email, senha);
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
        <h2 style={styles.title}>Entrar no sistema</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <div style={styles.passwordContainer}>
            <input
              type={senhaVisivel ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={styles.input}
              required
              minLength={6}
            />
            <span
              onClick={() => setSenhaVisivel(!senhaVisivel)}
              style={styles.eyeIcon}
              role="button"
              aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSenhaVisivel(!senhaVisivel);
              }}
            >
              {senhaVisivel ? "🙈" : "👁️"}
            </span>
          </div>

          <button type="submit" style={styles.button}>Entrar</button>
        </form>

        {erro && <p style={styles.error}>{erro}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#f0f2f5",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    backgroundColor: "#fff",
    padding: "45px 35px",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "380px",
    textAlign: "center",
    boxSizing: "border-box",
  },
  logo: {
    width: "120px",
    marginBottom: "20px",
    userSelect: "none",
  },
  title: {
    color: "#2c3e50",
    marginBottom: "25px",
    fontWeight: "600",
    fontSize: "1.5rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px", // espaçamento entre campos
  },
  passwordContainer: {
    position: "relative",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    paddingRight: "45px",
    border: "1.6px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
    boxSizing: "border-box",
    transition: "border 0.3s ease",
  },
  eyeIcon: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "18px",
    color: "#888",
    userSelect: "none",
  },
  button: {
    padding: "12px",
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s ease, box-shadow 0.2s ease",
  },
  error: {
    color: "#e74c3c",
    marginTop: "16px",
    fontWeight: "600",
    fontSize: "14px",
  },
};
