import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useTheme } from "../contexts/ThemeContext";
import "./UserProfile.css";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const { darkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (loggedUser) => {
      if (loggedUser) {
        setUser(loggedUser);
        try {
          const userRef = doc(db, "usuarios", loggedUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          } else {
            console.warn("Documento de usuário não encontrado.");
          }
        } catch (error) {
          console.error("Erro ao buscar dados do Firestore:", error);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  if (!user) {
    return (
      <div className={`user-profile ${darkMode ? "dark" : "light"}`}>
        <div className="loading">Carregando usuário...</div>
      </div>
    );
  }

  return (
    <div className={`user-profile ${darkMode ? "dark" : "light"}`}>
      <div className="profile-card" role="region" aria-label="Perfil do usuário">
        <h2 className="profile-title">Perfil do Usuário</h2>
        <div className="profile-info">
          <p>
            <strong>Nome:</strong> {userData?.nome || "Não informado"}
          </p>
          <p>
            <strong>Tipo:</strong> {userData?.tipo || "Não informado"}
          </p>
          <p>
            <strong>E-mail:</strong> {user.email}
          </p>
        </div>

        <div className="actions">
          <button onClick={toggleTheme} className="btn theme-toggle">
            Alternar para {darkMode ? "Claro" : "Escuro"}
          </button>

          <button onClick={handleLogout} className="btn logout">
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
