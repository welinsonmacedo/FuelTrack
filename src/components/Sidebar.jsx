import React, { useState } from "react";
import "./Sidebar.css";

export default function Sidebar({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "Lançar", path: "/register" },
    { label: "Motoristas", path: "/drivers" },
    { label: "Veículos", path: "/vehicles" },
    { label: "Abastecimentos", path: "/supplyAndTravelList" },
    { label: "Relatórios", path: "/report" },
    { label: "Cadastros", path: "/userregister" },
    { label: "Configurações", path: "/" },
  ];

  function handleNavigate(path) {
    onNavigate(path);
    setIsOpen(false);
  }

  return (
    <>
      <button
        className="hamburger"
        onClick={() => setIsOpen(!isOpen)}
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

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
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
      </aside>

      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
}
