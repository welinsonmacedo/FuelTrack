import React, { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

export default function Logout() {
  useEffect(() => {
    async function doLogout() {
      await signOut(auth);
      localStorage.clear();
      window.location.href = "/login"; // recarrega e limpa histórico
    }
    doLogout();
  }, []);

  return <p>Saindo...</p>;
}
