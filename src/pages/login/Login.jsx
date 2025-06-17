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
    backgroundColor: "#f7f9fc",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px 35px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
    boxSizing: "border-box",
  },
  logo: {
    width: "130px",
    marginBottom: "25px",
    userSelect: "none",
  },
  title: {
    color: "#34495e",
    marginBottom: "25px",
    fontWeight: "600",
    fontSize: "1.8rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    boxSizing: "border-box",
  },
  passwordContainer: {
    position: "relative",
    width: "100%",
    marginBottom: "20px",
    boxSizing: "border-box",
  },
  input: {
    width: "100%",
    padding: "14px 45px 14px 15px", // paddingRight grande pra dar espaço pro olho
    border: "1.8px solid #d1d9e6",
    borderRadius: "8px",
    fontSize: "16px",
    color: "#34495e",
    outline: "none",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
    boxSizing: "border-box", // ESSENCIAL pra input respeitar o width 100%
    marginTop:"10px"
  },
  eyeIcon: {
    position: "absolute",
    right: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "20px",
    color: "#7f8c8d",
    userSelect: "none",
    transition: "color 0.3s ease",
  },
  button: {
    padding: "14px",
    backgroundColor: "#2980b9",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "18px",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(41, 128, 185, 0.4)",
    transition: "background-color 0.3s ease, box-shadow 0.3s ease",
    userSelect: "none",
    width: "100%",
  },
  error: {
    color: "#e74c3c",
    marginTop: "18px",
    fontWeight: "600",
  },
};
