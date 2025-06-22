import React, { useState } from "react";
import "./TopDropdownMenu.css";
import { useUser } from "../contexts/UserContext"; // <== Importa o contexto

export default function TopNavbar({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser(); // <== Obtém o usuário logado

  const menuItems =
    user?.tipo === "motorista"
      ? [
          { label: "Inicio", path: "/driverdashboard" },
           { label: "Teste qr code", path: "/qr-code-cupon" },
          { label: "Logout", path: "/logout" },
        ]
      : // Apenas logout para motorista
        [
          { label: "Home", path: "/dashboard" },
          { label: "Relatórios", path: "/report" },
          { label: "Abastecimentos", path: "/supplyAndTravelList" },
          { label: "Viagens", path: "/tripsList" },
          { label: "Motoristas", path: "/drivers" },
          { label: "Veículos", path: "/vehicles" },
          { label: "Fornecedores", path: "/suppliersList" },
          { label: "Alertas", path: "/alertsmaintenance" },
          { label: "Gestor", path: "/generalRegistration" },
          { label: "User", path: "/userprofile" },
          { label: "Logout", path: "/logout" },
        ];

  const handleNavigate = (path) => {
    onNavigate(path);
    setIsOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <h2 className="logo logomobile">FuelTrackPro</h2>

        <button
          className="hamburger"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <div className={`bar ${isOpen ? "bar1" : ""}`} />
          <div className={`bar ${isOpen ? "bar2" : ""}`} />
          <div className={`bar ${isOpen ? "bar3" : ""}`} />
        </button>

        <nav className={`nav-links ${isOpen ? "open" : ""}`}>
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="nav-item"
              onClick={() => handleNavigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
