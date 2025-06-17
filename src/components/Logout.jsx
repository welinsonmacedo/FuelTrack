import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    async function sair() {
      await signOut(auth); // encerra sessão
      navigate("/", { replace: true });
    }

    sair();
  }, [navigate]);

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2>Saindo...</h2>
      <p>Você está sendo desconectado.</p>
    </div>
  );
}
