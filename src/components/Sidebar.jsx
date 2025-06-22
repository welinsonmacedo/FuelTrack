import React, { useState } from "react";
import "./TopDropdownMenu.css";
import { useUser } from "../contexts/UserContext";

export default function TopNavbar({ onNavigate }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useUser();

  const motoristaMenu = [
    { label: "Inicio", path: "/driverdashboard" },
    { label: "Teste qr code", path: "/qr-code-cupon" },
    { label: "Logout", path: "/logout" },
  ];

  const adminMenu = [
    {
      label: "Relatórios",
      items: [
        { label: "Geral", path: "/generalreport" },
        { label: "Abastecimentos", path: "/supplyAndTravelList" },
        { label: "Viagens", path: "/tripsList" },
        { label: "Alertas", path: "/alertsmaintenance" },
      ],
    },
    {
      label: "Consultas",
      items: [
        { label: "Motoristas", path: "/drivers" },
        { label: "Veículos", path: "/vehicles" },
        { label: "Fornecedores", path: "/suppliersList" },
      ],
    },
    {
      label: "Operacional",
      items: [
        { label: "Manutênção", path: "/maintenance" },
        { label: "Odomêtro", path: "/odometerpage" },
        { label: "CheckList", path: "/checklist" },
        { label: "Vincular Abastecimentos", path: "/linkRefuelingTravel" },
      ],
    },
    {
      label: "Cadastros",
      items: [
        { label: "Viagens", path: "/travelRegistration" },
        { label: "Abastecimentos", path: "/supplyRegistration" },
        { label: "Motoristas", path: "/drivers/driverregister" },
        { label: "Veiculos", path: "/truckregister" },
        { label: "Fornecedores", path: "/supplierRegister" },
        { label: "Rotas", path: "/routeregistration" },
        { label: "Tipos de manutênção", path: "/typesmaintenance" },
      ],
    },
    {
      label: "Gestor",
      items: [
       
         { label: "Cadastro Empresa", path: "/companyregistration" },
          { label: "Controle de usuários", path: "/adminusermanager" },
          { label: "App motoristas", path: "/driverdashboard" },
        { label: "User", path: "/userprofile" },
      ],
    },
  ];

  const handleNavigate = (path) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (label) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  // Mobile toggle menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
    setOpenDropdown(null);
  };

  // Render menu para motorista
  if (user?.tipo === "motorista") {
    return (
      <header className="navbar">
        <div className="navbar-container">
          <h2 className="logo">FuelTrackPro</h2>

          <button
            className="hamburger"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <div className={`bar ${mobileMenuOpen ? "bar1" : ""}`} />
            <div className={`bar ${mobileMenuOpen ? "bar2" : ""}`} />
            <div className={`bar ${mobileMenuOpen ? "bar3" : ""}`} />
          </button>

          <nav className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
            {motoristaMenu.map((item) => (
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

  // Render menu para admin
  return (
    <header className="navbar">
      <div className="navbar-container">
        <h2 className="logo">FuelTrackPro</h2>

        <button
          className="hamburger"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <div className={`bar ${mobileMenuOpen ? "bar1" : ""}`} />
          <div className={`bar ${mobileMenuOpen ? "bar2" : ""}`} />
          <div className={`bar ${mobileMenuOpen ? "bar3" : ""}`} />
        </button>

        <nav className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
          {adminMenu.map((menu) => (
            <div
              key={menu.label}
              className="nav-dropdown"
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className="nav-item dropdown-toggle"
                onClick={() => toggleDropdown(menu.label)}
                onMouseEnter={() =>
                  !mobileMenuOpen && setOpenDropdown(menu.label)
                }
                type="button"
                aria-haspopup="true"
                aria-expanded={openDropdown === menu.label}
              >
                {menu.label}{" "}
                <span className="arrow">
                  {openDropdown === menu.label ? "▲" : "▼"}
                </span>
              </button>

              <div
                className={`dropdown-menu ${
                  openDropdown === menu.label ? "show" : ""
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {menu.items.map((subItem) => (
                  <button
                    key={subItem.label}
                    className="dropdown-item"
                    onClick={() => handleNavigate(subItem.path)}
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            className="nav-item logout"
            onClick={() => handleNavigate("/logout")}
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
