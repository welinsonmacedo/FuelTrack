import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (!user) {
        navigate("/", { replace: true }); // redireciona para login ou home
      }
    });

    return unsubscribe; // limpa o listener ao desmontar
  }, [navigate]);

  if (loading) return <p>Carregando...</p>;

  // Se não tiver usuário (já redirecionou), mas evita renderizar vazio
  if (!user) return null;

  return children;
}
