import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

export default function Sidebar({ aberto, onToggle, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail("");
      }
    });

    return () => unsubscribe(); // limpa o listener ao desmontar
  }, []);

  const menuItems = [
    { label: "Lançar", path: "/register" },
    { label: "Motoristas", path: "/drivers" },
    { label: "Veículos", path: "/vehicles" },
    { label: "Abastecimentos", path: "/supplyAndTravelList" },
    { label: "Viagens", path: "/tripsList" },
    { label: "Relatórios", path: "/report" },
    { label: "Fornecedores", path: "/suppliersList" },
    { label: "Cadastros", path: "/generalRegistration" },
    { label: "Logout", path: "/logout" }, // Corrigido path
  ];

  function handleNavigate(path) {
    onNavigate(path);
    setIsOpen(false);
  }

  return (
    <>
      <button
        className="hamburger"
        onClick={onToggle}
        aria-label="Toggle menu"
      >
        <div
          className="bar"
          style={{ transform: isOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }}
        />
        <div className="bar" style={{ opacity: isOpen ? 0 : 1 }} />
        <div
          className="bar"
          style={{ transform: isOpen ? "rotate(-45deg) translate(6px, -6px)" : "none" }}
        />
      </button>

      <aside className={`sidebar ${aberto ? "open" : ""}`}>
        <h2 className="logo">FuelTrackPro</h2>
        <nav className="menu">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="menu-item"
              onClick={() => handleNavigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        
        {/* Rodapé com e-mail */}
        <div className="sidebar-footer">
          <p style={{ fontSize: "0.85rem", color: "#bdc3c7",paddingTop: "10vw",}}>
            {userEmail}
          </p>
        </div>
      </aside>

      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
}
